import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { connectDB } from "./config/db.config.js";
import authRoute from "./routes/auth.route.js";
import postRoute from "./routes/post.route.js";
import followRoute from "./routes/follow.route.js";
import notificationRoute from "./routes/notifications.route.js";
import setupSocket from "./socket/socket.js";

dotenv.config();

const app = express();
const server = createServer(app);

// Initialize socket.io
const io = setupSocket(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files
app.use('/Uploads', express.static('Uploads'));

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoute);
app.use('/api/posts', postRoute);
app.use('/api/follow', followRoute);
app.use('/api/notifications', notificationRoute);

// Connect to database
connectDB();

const PORT = process.env.PORT || 5500;

// Use server.listen instead of app.listen for socket.io
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


