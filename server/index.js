import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

// Initialize environment
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Database connection
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(cookieParser());

// Static files for uploaded resumes
app.use('/uploads', express.static(path.resolve('uploads')));

// Import routes
import jobRoutes from "./routes/jobRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import recruiterRoutes from "./routes/recruiterRoutes.js";
import fileUploadRoute from "./routes/fileUploadRoute.js";
import Auth from "./routes/Auth.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import atsScoreRoute from "./routes/atsScoreRoute.js";

// Mount routes
app.use("/jobs", jobRoutes);
app.use("/users", userRoutes);
app.use("/application", applicationRoutes);
app.use("/recruiter", recruiterRoutes);
app.use("/", fileUploadRoute);
app.use("/auth", Auth);

// TalentTrack ATS enhanced routes
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api", atsScoreRoute);

// Base status and health endpoints
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        app: "TalentTrack ATS Backend",
        version: "1.0.0",
        timestamp: new Date().toISOString()
    });
});

app.get("/", (req, res) => {
    res.json({
        message: "TalentTrack ATS Backend API",
        version: "1.0.0",
        docs: "/api/dashboard/metrics, /api/candidates, /jobs/all-jobs"
    });
});

import { startPythonService } from "./services/pythonServiceManager.js";

// Start the server
app.listen(port, () => {
    console.log(`TalentTrack ATS Server is running on port ${port}`);
    // Automatically start Python ATS microservice
    startPythonService();
});

export default app;
