import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
    const mongoUrl = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/talenttrack_ats";

    try {
        await mongoose.connect(mongoUrl, {
            serverSelectionTimeoutMS: 4000,
        });
        console.log(`MongoDB connected successfully to ${mongoUrl.replace(/\/\/([^:]+):([^@]+)@/, '//*:**@')}`);
    } catch (error) {
        console.warn("\n========================================================");
        console.warn("⚠️  MongoDB connection warning:");
        console.warn(`   Unable to connect to MongoDB at ${mongoUrl}`);
        console.warn(`   Error: ${error.message}`);
        console.warn("   To run with persistent data, start your local MongoDB service:");
        console.warn("   mongod --dbpath <data_dir> or configure MONGODB_URL in server/.env");
        console.warn("========================================================\n");
    }
};

export default connectDB;