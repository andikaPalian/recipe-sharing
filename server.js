import express from "express";
import cors from "cors";
import "dotenv/config";
import database from "./config/db.js";

const app = express();
const port = process.env.PORT;
database()

app.use(cors());
app.use(express.json());

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});