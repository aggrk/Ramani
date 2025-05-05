import mongoose from "mongoose";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE;
const PORT = 8000;

mongoose.connect(DB).then(() => console.log("Connected!"));

app.listen(PORT, () => console.log(`Listening on port:${PORT}`));
