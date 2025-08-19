// server.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import adminRouter from "./routes/adminRouter.js";
import doctorRouter from "./routes/doctorRoute.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import userRouter from "./routes/userRouter.js";

dotenv.config();
const app = express();

// CORS
app.use((req, res, next) => {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, token, Token, aToken, AToken");
    res.header("Access-Control-Max-Age", "86400"); // 24 hours
    res.status(200).end();
    return;
  }

  // Handle regular requests
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, token, Token, aToken, AToken"
  );
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
    console.error("❌ MongoDB URI:", process.env.MONGODB_URI ? "Set" : "Not set");
    console.log("⚠️  Server will continue without MongoDB connection");
    console.log("💡 Make sure MongoDB is running or update MONGODB_URI in .env");
  });

// Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

console.log("🔧 Environment check:");
console.log("- MONGODB_URI:", process.env.MONGODB_URI ? "Set" : "Not set");
console.log("- CLOUDINARY_NAME:", process.env.CLOUDINARY_NAME ? "Set" : "Not set");
console.log("- CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "Set" : "Not set");
console.log("- CLOUDINARY_SECRET_KEY:", process.env.CLOUDINARY_SECRET_KEY ? "Set" : "Not set");
console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "Set" : "Not set");
console.log("- ADMIN_EMAIL:", process.env.ADMIN_EMAIL ? "Set" : "Not set");
console.log("- ADMIN_PASSWORD:", process.env.ADMIN_PASSWORD ? "Set" : "Not set");

// Test endpoint
app.get("/", (req, res) => {
  res.json({ message: "Backend server is running!", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);

// Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.stack);
  
  // Handle multer errors specifically
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected field. Please check your form data.' });
    }
    return res.status(400).json({ error: err.message });
  }
  
  res.status(500).json({ error: err.message || "Server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

