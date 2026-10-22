
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import auditRoutes from "./routes/auditRoutes.js";
import approvalRoutes from "./routes/approvalRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin:["http://localhost:5173",
        "http://localhost:5175",
        "http://localhost:5174",
    ],
  })
);

app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "SocietyOps API is running.",
  });
});

// Backend home route
app.get("/", (req, res) => {
  res.send("SocietyOps AI Backend is running!");
});

// API routes
app.use("/api/approvals", approvalRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/auth", authRoutes);
// Connect MongoDB and start server
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully.");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
