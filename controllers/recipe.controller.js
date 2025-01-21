import Recipe from "../models/recipe.model.js";

const addRecipe = async (req, res) => {
    try {
        const chefId = req.chef.chefId;
        const {title, description, ingredients, steps} = req.body;

        if (!chefId) {
            return res.status(400).json({message: "Invalid chef ID"});
        }

        if (!title || !description || !ingredients || !steps) {
            return res.status(400).json({message: "All fields are required"});
        }

        const recipe = new Recipe({
            chef: chefId,
            title,
            description,
            ingredients,
            steps,
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