import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { addComments, addRecipe, deleteComments, listRecipe } from "../controllers/recipe.controller.js";
import upload from "../middleware/multer.js";

const recipeRouter = express.Router();

recipeRouter.post("/", upload.single("image"), (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({message: err.message});
    } else if (err) {
        return res.status(500).json({message: "Unexpected error during file upload"});
    }
    next();
}, authMiddleware, addRecipe);
recipeRouter.get("/recipe", listRecipe);
recipeRouter.post("/:id/comments", authMiddleware, addComments);
recipeRouter.delete("/:id/comments/:commentId", authMiddleware, deleteComments);

export default recipeRouter;