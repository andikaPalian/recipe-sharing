import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import fs from "fs/promises";
import path from "path";
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from "url";
import Chef from "../models/chef.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const registerChef = async (req, res) => {
    try {
        const {name, email, password} = req.body;
        if (!name?.trim() || !email?.trim() || !password?.trim()) {
            return res.status(400).json({message: "All fields are required"});
        };

        const existingChef = await Chef.findOne({email: email.toLowerCase().trim()});
        if (existingChef) {
            return res.status(400).json({message: "Chef already exists"})
        };

        if (typeof name !== "string" || name.trim().length < 3 || name.trim(). length > 20) {
            return res.status(400).json({message: "Invalid name format. Name should be between 3 and 20 characters."});
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({message: "Invalid email format"});
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({message: "Invalid password format. Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."});
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const chef = new Chef({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword
        });

        await chef.save();
        const response = chef.toObject();
        delete response.password;
        res.status(201).json({
            message: "Chef registered successfully",
            data: response
        });
    } catch (error) {
        console.error("Error during chef registration:", error);
        return res.status(500).json({
            mesage: "Internal server error",
            error: error.message || "An unexpected error occurred",
        });
    }
}

const loginChef = async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email?.trim() || !password?.trim()) {
            return res.status(400).json({message: "All fields are required"});
        }

        const chef = await Chef.findOne({email: email.toLowerCase().trim()});
        if (!chef) {
            return res.status(404).json({message: "Chef not found"});
        }

        const isMatch = await bcrypt.compare(password, chef.password);
        if (isMatch) {
            const token = jwt.sign({
                id: chef._id,
            }, process.env.JWT_SECRET, {expiresIn: "1d"});
            chef.password = undefined;
            return res.status(200).json({
                message: "Chef logged in successfully",
                data: {
                    token,
                    chef,
                },
            });
        } else {
            return res.status(401).json({message: "Invalid credentials"})
        }
    } catch (error) {
        console.error("Error during chef login:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message || "An unexpected error occurred",
        });
    }
}

const uploadProfilePicture = async (req, res) => {
    try {
        const chefId = req.chef.chefId;
        if (!chefId) {
            return res.status(400).json({message: "Invalid chef ID"});
        }
        
        if (!req.file || req.file.length === 0) {
            return res.status(400).json({message: "No file uploaded"});
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({message: "Invalid file type. Only JPEG, PNG, and JPG files are allowed."});
        }

        // Upload ke Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "profile-pictures",
            use_filename: true,
            unique_filename: true,
        });

        // Hapus file lokal setelah upload le cloudinary
        await fs.unlink(req.file.path);

        const filePath = path.join(__dirname, "../uploads/profile-pictures", req.file.filename);
        if (!fs.existsSync(filePath)) {
            return res.status(500).json({message: "File upload failed, please try again"})
        }

        
        const chef = await Chef.findByIdAndUpdate(
            chefId,
            {
                profilePicture: result.secure_url,
                cloudinary_id: result.public_id,
            },
            {new: true}
        );
        if (!chef) {
            // Jika chef tidak ditemukan, hapus gambar dari Cloudinary
            await cloudinary.uploader.destroy(result.public_id)
            return res.status(404).json({message: "Chef not found"});
        }

        res.status(200).json({
            message: "profile picture uplaoaded successfully",
            data: {
                profilePicture: chef.profilePicture,
                cloudinary_id: chef.cloudinary_id,
            }
        });
    } catch (error) {
        console.error("Error during chef profile picture upload:", error);

        // Hapus file lokal jika masih ada
        if (req.file && req.file.path) {
            try {
                await fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error("Error deleting local file:", unlinkError);
            }
        }

        return res.status(500).json({
            message: "Internal server error",
            error: error.message || "An unexpected error occurred",
        });
    }
}

const editBio = async (req, res) => {
    try {
        const chefId = req.chef.chefId;
        const {bio} = req.body;

        if (!chefId) {
            return res.status(400).json({message: "Invalid chef ID"});
        }

        const chef = await Chef.findById(chefId);
        if (!chef) {
            return res.status(404).json({message: "Chef not found"})
        }

        if (bio !== undefined) {
            if (bio.trim() === "") {
                chef.bio = "";
            }else if (typeof bio !== "string") {
                return res.status(400).json({message: "Invalid Bio format. Bio should be a string."});
            } else {
                chef.bio = validator.escape(bio.trim());
            }
        }

        await chef.save();
        res.status(200).json({
            message: "Bio updated successfully",
            bio: chef.bio,
        });
    } catch (error) {
        console.error("Error during chef bio update:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message || "An unexpected error occurred",
        });
    }
}

export {registerChef, loginChef, uploadProfilePicture, editBio};