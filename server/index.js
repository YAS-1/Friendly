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
import messageRoute from "./routes/message.route.js";
import searchRoute from "./routes/search.route.js";
import passwordResetRoute from "./routes/passwordReset.routes.js";
import setupSocket from "./socket/socket.js";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const app = express();
const server = createServer(app);

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize socket.io
const io = setupSocket(server);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://friendly-sable.vercel.app', 'http://localhost:5173']
    : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoute);
app.use('/api/posts', postRoute);
app.use('/api/follow', followRoute);
app.use('/api/notifications', notificationRoute);
app.use('/api/messages', messageRoute);
app.use('/api/search', searchRoute);
app.use('/api/password-reset', passwordResetRoute);

// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, "../client/dist")));

// Fallback route for client-side routing
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

// Connect to database
connectDB();

const PORT = process.env.PORT || 5500;

// Use server.listen instead of app.listen for socket.io
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


