import Recipe from "../models/recipe.model.js";
import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const addRecipe = async (req, res) => {
    try {
        const chefId = req.chef.chefId;
        const {title, description, ingredients, steps, prepTime, cookTime, servings, category, tags} = req.body;

        if (!chefId) {
            return res.status(400).json({message: "Invalid chef ID"});
        }

        if (!title || !description || !ingredients || !steps ) {
            return res.status(400).json({message: "All fields are required"});
        }

        let parsedIngredients;
        try {
            parsedIngredients = JSON.parse(ingredients);
            if (!Array.isArray(parsedIngredients) || parsedIngredients.length === 0) {
                return res.status(400).json({message: "Ingredients must be a non-empty array"});
            }

            const validIngredients = parsedIngredients.every((ingredients) => typeof ingredients === "string" && ingredients.trim() !== "");
            if (!validIngredients) {
                return res.status(400).json({message: "Invalid ingredients format. Each ingredient should be a non-empty string."});
            }
        } catch (error) {
            console.error("Error parsing ingredients:", error);
            return res.status(400).json({message: "Invalid ingredients format. Please provide a valid JSON array of ingredients."});
        }

        let parsedSteps;
        try {
            parsedSteps = JSON.parse(steps);
            if (!Array.isArray(parsedSteps) || parsedSteps.length === 0) {
                return res.status(400).json({message: "steps must be a non-empty array"});
            }

            const validSteps = parsedSteps.every((step) => typeof step === "string" && step.trim() !== "");
            if (!validSteps) {
                return res.status(400).json({message: "Invalid steps format. Each steps should be a non-empty string."});
            }
        } catch (error) {
            console.error("Error parsing steps:", error);
            return res.status(400).json({message: "Invalid steps format. Please provide a valid JSON array of steps."});
        }

        if (prepTime !== undefined && prepTime !== null) {
            const prepTimeNumber = Number(prepTime)
            if (!Number.isFinite(prepTimeNumber) || prepTimeNumber < 0 || !Number.isInteger(prepTimeNumber)) {
                return res.status(400).json({message: "Invalid prep time format. Prep time should be a non-negative integer."});
            }
        }

        if (cookTime !== undefined && cookTime !== null) {
            const cookTimeNumber = Number(cookTime);
            if (!Number.isFinite(cookTimeNumber) || cookTimeNumber < 0 || !Number.isInteger(cookTimeNumber)) {
                return res.status(400).json({message: "Invalid cook time format. Cook time should be a non-negative integer."});
            }
        }

        if (servings !== undefined && servings !== null) {
            const servingsNumber = Number(servings);
            if (!Number.isFinite(servingsNumber) || servingsNumber < 0 || !Number.isInteger(servingsNumber)) {
                return res.status(400).json({message: "Invalid servings format. Servings should be a non-negative integer."});
            }
        }

        if (category !== undefined && category !== null) {
            if (typeof category !== "string" || category.trim().length === 0) {
                return res.status(400).json({message: "Invalid category format. Category should be a non-empty string."});
            }
        }

        if (tags !== undefined && tags !== null) {
            let tagsArray;
            if (typeof tags === 'string') {
                try {
                    tagsArray = JSON.parse(tags);
                } catch (error) {
                    console.error("Error parsing tags:", error);
                    return res.status(400).json({message: "Invalid tags format. Tags should be an array of strings."});
                }
            }
            if (!Array.isArray(tagsArray)) {
                return res.status(400).json({message: "Invalid tags format. Tags should be an array of strings."});
            }

            const isValidTag = tagsArray.every((tag) => typeof tag === "string" && tag.trim() !== "");
            if (!isValidTag) {
                return res.status(400).json({message: "Invalid tags format. Tags should be an array of non-empty strings."});
            }

            // Optional: Check if tags is empty
            // if (tags.length === 0) {
            //     return res.status(400).json({message: "tags should not be empty"});
            // }
        }

        if (!req.file || req.file.length === 0) {
            return res.status(400).json({message: "No file uploaded"});
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({message: "Invalid file type. Only JPEG, PNG, and JPG files are allowed."});
        }

        // Upload ke cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "image",
            use_filename: true,
            unique_filename: true,
        })

        // Hapus file lokal setelah upload ke cloudinary
        fs.promises.unlink(req.file.path);

        const filePath = path.join(__dirname, "../uploads/image", req.file.filename);
        if (!fs.existsSync(filePath)) {
            return res.status(500).json({message: "File upload failed, please try again"})
        }

        const recipe = new Recipe({
            author: chefId,
            title,
            description,
            ingredients,
            steps,
            image: result.secure_url,
            cloudinary_id: result.public_id,
            prepTime,
            cookTime,
            servings,
            category,
            tags,
        });
        await recipe.save();
        res.status(201).json({
            message: "Recipe added successfully",
            recipe: recipe,
        });
    } catch (error) {
        console.error("Error during add recipe:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message || "An unexpected error occurred",
        });
    }
}

export {addRecipe};