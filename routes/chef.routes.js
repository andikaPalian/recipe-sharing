import express from "express";
import { loginChef, registerChef, uploadProfilePicture } from "../controllers/chef.controller.js";
import upload from "../middleware/multer.js";
import authMiddleware from "../middleware/authMiddleware.js";

const chefRouter = express.Router();

chefRouter.post("/register", registerChef);
chefRouter.post("/login", loginChef);
chefRouter.post("/uploadProfilePicture", upload.single("profilePicture"), (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({message: err.message});
    } else if (err) {
        return res.status(500).json({message: "Unexpected error during file upload"});
    }
    next();
}, authMiddleware, uploadProfilePicture);

export default chefRouter;