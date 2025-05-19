import mongoose from "mongoose";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import Site from "../models/sitesModel.js";

dotenv.config({ path: "./config.env" });
const DB = process.env.DATABASE;

mongoose.connect(DB).then(() => console.log("DB connection successful!"));

const sites = readFileSync("./data/sites.json", "utf-8");

const importData = async () => {
  try {
    await Site.create(JSON.parse(sites));
    console.log("Data successfully loaded!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Site.deleteMany();
    console.log("Data successfully deleted!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
