import mongoose from "mongoose";

export const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    }
    catch{
        console.log("MongoDB connection error");
        process.exit(1);
    }
};