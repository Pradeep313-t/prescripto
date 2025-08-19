// controllers/adminController.js
import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

// Admin login
export const loginAdmin = async (req, res) => {
  try {
    console.log("Login attempt:", { email: req.body.email, password: req.body.password ? "provided" : "missing" });
    console.log("Environment check - ADMIN_EMAIL:", process.env.ADMIN_EMAIL ? "Set" : "Not set");
    console.log("Environment check - ADMIN_PASSWORD:", process.env.ADMIN_PASSWORD ? "Set" : "Not set");
    
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const atoken = jwt.sign({ email, role: "admin" }, JWT_SECRET, {
        expiresIn: "1d",
      });
      console.log("Login successful for:", email);
      return res.json({ success: true, token: atoken });
    }
    
    console.log("Login failed - Invalid credentials for:", email);
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Add doctor
export const addDoctor = async (req, res) => {
  try {
    console.log("addDoctor called with body:", req.body);
    console.log("File:", req.file);
    console.log("Headers:", req.headers);
    console.log("Content-Type:", req.headers['content-type']);
    
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
      imageUrl,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res.status(400).json({ success: false, message: "Missing details" });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ success: false, message: "Password must be at least 8 chars" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let parsedAddress = address;
    if (typeof address === "string") {
      try {
        parsedAddress = JSON.parse(address);
        // Handle the frontend format: { line1: address1, line2: address2 }
        if (parsedAddress.line1) {
          parsedAddress = {
            addressLine: parsedAddress.line1,
            addressLine2: parsedAddress.line2 || ""
          };
        }
      } catch {
        parsedAddress = { addressLine: address };
      }
    }

    let finalImageUrl = imageUrl || null;
    if (req.file && req.file.path) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "prescripto/doctors",
        });
        finalImageUrl = uploadResult.secure_url;
        // Clean up the uploaded file
        const fs = await import('fs');
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to upload image to cloud storage" 
        });
      }
    }

    if (!finalImageUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor image is required" });
    }

    const doctorData = {
      name,
      email,
      image: finalImageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience: experience.toString(),
      about,
      fees: Number(fees),
      address: parsedAddress,
      date: Date.now(),
    };

    console.log("Creating doctor with data:", { ...doctorData, password: "[HIDDEN]" });
    
    const newDoctor = new doctorModel(doctorData);
    const savedDoctor = await newDoctor.save();
    
    console.log("Doctor saved successfully:", savedDoctor._id);

    return res
      .status(201)
      .json({
        success: true,
        message: "Doctor Added",
        doctor: { id: savedDoctor._id, name: savedDoctor.name, email: savedDoctor.email },
      });
  } catch (error) {
    console.error("addDoctor error:", error);
    console.error("Error stack:", error.stack);
    
    if (error.code === 11000 && error.keyValue?.email) {
      return res
        .status(409)
        .json({ success: false, message: "Doctor with this email already exists" });
    }
    
    // Check for MongoDB connection errors
    if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
      return res.status(500).json({ 
        success: false, 
        message: "Database connection error. Please try again." 
      });
    }
    
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all doctors
export const getAllDoctors = async (req, res) => {
  // API call to get doctors list for admin panel
  try {
    // Fetch all doctors, exclude password field for security
    const doctors = await doctorModel.find({}, '-password');
    // Optionally, you can sort or limit fields for admin panel display
    // const doctors = await doctorModel.find({}, '-password').sort({ date: -1 });
    // This is happening because the MongoDB connection is failing due to authentication issues.
    // The error "bad auth : authentication failed" means that the credentials (username/password)
    // provided in your MONGODB_URI are incorrect, missing, or the user does not have access to the database.
    //
    // To fix:
    // 1. Double-check your .env file for the correct MONGODB_URI, including username, password, and database name.
    // 2. Make sure the user exists in your MongoDB Atlas or local MongoDB and has the right permissions.
    // 3. If using special characters in your password, ensure they are URL-encoded in the URI.
    // 4. If you recently changed your password or user, update the URI accordingly.
    // 5. Test the connection string with a MongoDB client (like Compass) to verify it works.

    return res.status(200).json({
      success: true,
      message: "Doctors list fetched successfully",
      doctors,
    });
  } catch (error) {
    console.error("Error fetching doctors list for admin panel:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors list",
      error: error.message,
    });
  }
};

// Delete doctor
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required"
      });
    }

    console.log("Attempting to delete doctor with ID:", id);

    // Find the doctor first to get their image URL for Cloudinary cleanup
    const doctor = await doctorModel.findById(id);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    // Delete the doctor from database
    const deletedDoctor = await doctorModel.findByIdAndDelete(id);
    
    if (!deletedDoctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found or already deleted"
      });
    }

    // If doctor has an image, try to delete it from Cloudinary
    if (doctor.image && doctor.image.includes('cloudinary')) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = doctor.image.split('/');
        const publicId = urlParts[urlParts.length - 1].split('.')[0];
        const folder = 'prescripto/doctors';
        const fullPublicId = `${folder}/${publicId}`;
        
        await cloudinary.uploader.destroy(fullPublicId);
        console.log("Image deleted from Cloudinary:", fullPublicId);
      } catch (cloudinaryError) {
        console.error("Failed to delete image from Cloudinary:", cloudinaryError);
        // Don't fail the entire operation if Cloudinary deletion fails
      }
    }

    console.log("Doctor deleted successfully:", id);

    return res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
      deletedDoctor: {
        id: deletedDoctor._id,
        name: deletedDoctor.name,
        email: deletedDoctor.email
      }
    });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete doctor",
      error: error.message
    });
  }
};

// Update doctor availability
export const updateDoctorAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required"
      });
    }

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be a boolean value"
      });
    }

    console.log("Updating availability for doctor ID:", id, "to:", isAvailable);

    const updatedDoctor = await doctorModel.findByIdAndUpdate(
      id,
      { isAvailable },
      { new: true, select: '-password' }
    );
    
    if (!updatedDoctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    console.log("Doctor availability updated successfully:", id);

    return res.status(200).json({
      success: true,
      message: `Doctor is now ${isAvailable ? 'available' : 'not available'}`,
      doctor: {
        id: updatedDoctor._id,
        name: updatedDoctor.name,
        email: updatedDoctor.email,
        isAvailable: updatedDoctor.isAvailable
      }
    });
  } catch (error) {
    console.error("Error updating doctor availability:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update doctor availability",
      error: error.message
    });
  }
};

export const appointmentAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({})
    res.status(200).json({
      success: true,
      appointments
    })
  } catch (error) {
    console.error("Error updating doctor availability:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update doctor availability",
      error: error.message
    });
  }
}


