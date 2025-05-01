/* eslint-disable no-unused-vars */

import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.config.js";
import authRoute from "./routes/auth.route.js";
import postRoute from "./routes/post.route.js";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Routes
app.use('/api/auth', authRoute);
app.use('/api/post', postRoute);

const port = process.env.PORT || 5500;

app.listen(port, () => {
    connectDB();
    console.log(`Server is running on port ${port}`);
});


