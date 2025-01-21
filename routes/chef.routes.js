import express from "express";
import { loginChef, registerChef } from "../controllers/chef.controller.js";

const chefRouter = express.Router();

chefRouter.post("/register", registerChef);
chefRouter.post("/login", loginChef);

export default chefRouter;