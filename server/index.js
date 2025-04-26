/* eslint-disable no-unused-vars */

import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import { connectDB } from "./config/db.config.js";



dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 5500;

app.listen(port, () => {
    connectDB();
    console.log(`Server is running on port ${port}`);
});


