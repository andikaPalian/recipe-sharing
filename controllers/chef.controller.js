import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import Chef from "../models/chef.model.js";

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

export {registerChef, loginChef};