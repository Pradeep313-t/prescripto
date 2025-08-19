// test-db.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import doctorModel from "./models/doctorModel.js";

dotenv.config();

const testConnection = async () => {
  try {
    console.log("🔧 Testing MongoDB connection...");
    console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Set" : "Not set");
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("✅ MongoDB connected successfully");
    
    // Test creating a simple document
    const testDoctor = new doctorModel({
      name: "Test Doctor",
      email: "test@example.com",
      password: "hashedpassword",
      image: "https://example.com/image.jpg",
      speciality: "General physician",
      degree: "MBBS",
      experience: "5 years",
      about: "Test doctor",
      fees: 500,
      address: { addressLine: "Test Address" },
      date: Date.now(),
    });
    
    const saved = await testDoctor.save();
    console.log("✅ Test doctor saved:", saved._id);
    
    // Clean up - delete the test document
    await doctorModel.findByIdAndDelete(saved._id);
    console.log("✅ Test doctor deleted");
    
    await mongoose.disconnect();
    console.log("✅ MongoDB disconnected");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Error stack:", error.stack);
  }
};

testConnection();
