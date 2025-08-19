import validator from 'validator';
import bcrypt from 'bcryptjs';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import {v2 as cloudinary} from 'cloudinary';
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import razorpay from 'razorpay';



// Api to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing Details' });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'enter a valid email' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not configured in environment");
      return res.status(500).json({ success: false, message: "Server configuration error" });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'User with this email already exists. Please login instead.' 
      });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    // Debug token generation
    console.log("🔐 Register token generated:", {
        userId: user._id,
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 20) + "..."
    });
    
    res.json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Error registering user:", error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      // Duplicate key error (email already exists)
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists. Please login instead.',
        error: 'Email already registered'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Failed to register user",
      error: error.message,
    });
  }
}

// API for user login
const loginUser = async (req, res) => {
    try {
        
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Missing Details' });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: 'Enter a valid email' });
        }

        // Check if JWT_SECRET is configured
        if (!process.env.JWT_SECRET) {
          console.error("JWT_SECRET not configured in environment");
          return res.status(500).json({ success: false, message: "Server configuration error" });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
            
            // Debug token generation
            console.log("🔐 Login token generated:", {
                userId: user._id,
                tokenLength: token.length,
                tokenPrefix: token.substring(0, 20) + "..."
            });
            
            return res.status(200).json({ 
                success: true, 
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        

        

    } catch (error) {
        console.error("Error logging in user:", error);
        return res.status(500).json({
        success: false,
        message: "Failed to login user",
        error: error.message,
        });
    }
}

// api to get user details
const getProfile = async (req, res) => {
  try {
    
    const userId = req.user.userId
    const user = await userModel.findById(userId).select('-password')

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    res.json({success: true, userData: user})

  } catch (error) {
    console.error("Error getting user profile:", error);
        return res.status(500).json({
        success: false,
        message: "Failed to get user profile",
        error: error.message,
        });
  }
}
// APi to get user details
const updateProfile = async (req, res) => {
  try {
    console.log("📝 Update Profile Request Body:", req.body);
    console.log("📁 Update Profile Files:", req.files);
    
    // Get userId from the authenticated user (from token)
    const userId = req.user.userId;
    const { name, email, phone, address, dob, gender } = req.body;
    const imageFile = req.file;
    
    // Debug: Log what we received
    console.log("🔍 Received data:", {
      userId,
      name,
      email,
      phone,
      address,
      dob,
      gender,
      hasImageFile: !!imageFile
    });
    
    // Check if user is authenticated
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }
    
    // Build update data object with only the fields that are provided
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (dob !== undefined) updateData.dob = dob;
    if (gender !== undefined) updateData.gender = gender;
    
    // Handle address if provided
    if (address !== undefined) {
      console.log("🏠 Processing address field:", address);
      let parsedAddress = address;
      
      if (typeof address === 'string') {
        try {
          parsedAddress = JSON.parse(address);
          console.log("✅ Address parsed successfully:", parsedAddress);
        } catch (parseError) {
          console.error("❌ Failed to parse address:", parseError);
          parsedAddress = { lin1: "", lin2: "" };
        }
      }
      
      // Validate address structure
      if (parsedAddress && typeof parsedAddress === 'object') {
        // Ensure address has the required structure
        if (!parsedAddress.lin1) parsedAddress.lin1 = "";
        if (!parsedAddress.lin2) parsedAddress.lin2 = "";
        
        updateData.address = parsedAddress;
        console.log("✅ Address added to update data:", parsedAddress);
      } else {
        console.log("⚠️ Invalid address format, using default");
        updateData.address = { lin1: "", lin2: "" };
      }
    } else {
      console.log("ℹ️ No address field provided");
    }
    
    // Check if we have any data to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No valid fields provided for update' 
      });
    }
    
    console.log("📤 Updating user with data:", updateData);
    
    // Update user profile
    const updatedUser = await userModel.findByIdAndUpdate(
      userId, 
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Handle image upload if present
    if (imageFile) {
      try {
        console.log("🖼️ Processing image upload...");
        
        // Check if Cloudinary is configured
        if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_SECRET_KEY) {
          console.error("❌ Cloudinary not configured - skipping image upload");
          return res.status(500).json({
            success: false,
            message: 'Image upload failed: Cloudinary not configured on server',
            error: 'Cloudinary configuration missing'
          });
        }
        
        // Upload image to cloudinary
        const uploadResult = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: 'image'
        });
        
        const imageUrl = uploadResult.secure_url;
        console.log("✅ Image uploaded to Cloudinary:", imageUrl);
        
        // Update user with image URL
        await userModel.findByIdAndUpdate(userId, {
          image: imageUrl
        });
        
      } catch (imageError) {
        console.error("❌ Image upload failed:", imageError);
        return res.status(500).json({
          success: false,
          message: 'Profile updated but image upload failed',
          error: imageError.message
        });
      }
    }
    
    console.log("✅ Profile updated successfully");
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error("❌ Error updating user profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user profile",
      error: error.message,
    });
  }
}

// Check if user exists
const checkUserExists = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email parameter is required' 
      });
    }
    
    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email' 
      });
    }
    
    const user = await userModel.findOne({ email }).select('-password');
    
    if (user) {
      return res.status(200).json({
        success: true,
        exists: true,
        message: 'User with this email already exists',
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } else {
      return res.status(200).json({
        success: true,
        exists: false,
        message: 'Email is available for registration'
      });
    }
    
  } catch (error) {
    console.error("Error checking user existence:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check user existence",
      error: error.message,
    });
  }
}

// API to book an appointment
const bookAppointment = async (req, res) => {
  try {
    const userId = req.user.userId; // Get userId from authenticated user
    const { docId, slotDate, slotTime } = req.body; 

    if (!docId || !slotDate || !slotTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: docId, slotDate, slotTime' 
      });
    }

    const docData = await doctorModel.findById(docId).select('-password');
    if (!docData) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    
    if (!docData.available) {
      return res.status(400).json({ success: false, message: 'Doctor is not available' });
    } 

    let slots_booked = docData.slots_booked || {};
    
    // checking for slots availability 
    if (slots_booked[slotDate]) {
      if(slots_booked[slotDate].includes(slotTime)) {
        return res.status(400).json({ success: false, message: 'Slot not available' });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [slotTime];
    }

    const userData = await userModel.findById(userId).select('-password');
    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const docDataForAppointment = { ...docData.toObject() };
    delete docDataForAppointment.slots_booked;
    
    console.log('🔍 Saving appointment with doctor data:');
    console.log('  - Original docData.address:', docData.address);
    console.log('  - docDataForAppointment.address:', docDataForAppointment.address);

    const appointmentData = {
      userId,
      docId,
      slotDate,
      slotTime,
      userData,
      docData: docDataForAppointment,
      amount: docData.fees,
      date: Date.now()
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // Save new slots data in doctor data
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    
    res.json({ success: true, message: 'Appointment booked successfully' });

  } catch (error) {
    console.error("Error booking appointment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to book appointment",
      error: error.message,
    });
  }
}

// 
const listAppointments = async (req, res) => {
  try {
    console.log('🔍 listAppointments called');
    console.log('👤 req.user:', req.user);
    
    const userId = req.user.userId; // Get userId from authenticated user
    console.log('🆔 userId:', userId);
    
    // Test database connection and model
    console.log('🗄️ appointmentModel:', appointmentModel);
    console.log('🗄️ appointmentModel name:', appointmentModel.modelName);
    
    // Check if collection exists
    const collections = await appointmentModel.db.db.listCollections().toArray();
    console.log('🗄️ Available collections:', collections.map(c => c.name));
    
    const appointments = await appointmentModel.find({userId})
    console.log('📋 Found appointments:', appointments);
    
    // Filter out cancelled appointments
    const activeAppointments = appointments.filter(appointment => appointment.status !== 'cancelled');
    console.log('📋 Active appointments (excluding cancelled):', activeAppointments);
    
    // Debug: Check the structure of the first appointment
    if (activeAppointments.length > 0) {
      console.log('🔍 First active appointment structure:');
      console.log('  - docData:', activeAppointments[0].docData);
      console.log('  - docData.address:', activeAppointments[0].docData?.address);
      console.log('  - docData.address.line1:', activeAppointments[0].docData?.address?.line1);
      console.log('  - docData.address.line2:', activeAppointments[0].docData?.address?.line2);
    }

    res.json({
      success: true,
      appointments: activeAppointments
    })

  } catch (error) {
    console.error("Error listing appointments:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Failed to list appointments",
      error: error.message,
    });
  }
}

// Cancel an appointment
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    appointment.status = "cancelled";
    await appointment.save();

    // Helper function to remove a booked slot from a doctor's record
const removeBookedSlot = async (doctorId, slotDate, slotTime) => {
  const doctor = await doctorModel.findById(doctorId);
  if (doctor && doctor.slots_booked && doctor.slots_booked[slotDate]) {
    doctor.slots_booked[slotDate] = doctor.slots_booked[slotDate].filter(time => time !== slotTime);
    if (doctor.slots_booked[slotDate].length === 0) {
      delete doctor.slots_booked[slotDate];
    }
    await doctor.save();
    return true;
  }
  return false;
};

// Example usage inside cancelAppointment or deleteAppointment
await removeBookedSlot(appointment.docId, appointment.slotDate, appointment.slotTime);

    res.json({ success: true, message: "Appointment cancelled" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error cancelling appointment" });
  }
};

// Delete an appointment (removes from DB and frees slot)
const deleteAppointment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID is required'
      });
    }

    // Find the appointment and verify it belongs to the user
    const appointment = await appointmentModel.findOne({
      _id: appointmentId,
      userId: userId
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or you are not authorized to delete it'
      });
    }

    // Remove the slot from doctor's booked slots
    const doctor = await doctorModel.findById(appointment.docId);
    if (doctor && doctor.slots_booked) {
      const slotDate = appointment.slotDate;
      const slotTime = appointment.slotTime;
      if (doctor.slots_booked[slotDate]) {
        doctor.slots_booked[slotDate] = doctor.slots_booked[slotDate].filter(
          time => time !== slotTime
        );
        if (doctor.slots_booked[slotDate].length === 0) {
          delete doctor.slots_booked[slotDate];
        }
        await doctor.save();
      }
    }

    // Delete the appointment from DB
    await appointmentModel.deleteOne({ _id: appointmentId });

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });

  } catch (error) {
    console.error("Error deleting appointment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete appointment",
      error: error.message,
    });
  }
} 

const payAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) {
      return res.status(400).json({ success: false, message: "Appointment ID is required" });
    }
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    appointment.status = "paid";
    await appointment.save();
    res.json({ success: true, message: "Appointment marked as paid" });
  } catch (error) {
    console.error("Pay Appointment Error:", error); // Log error for debugging
    res.status(500).json({ success: false, message: "Error marking appointment as paid" });
  }
};


export { registerUser, loginUser, getProfile, updateProfile, checkUserExists, bookAppointment, listAppointments, cancelAppointment, deleteAppointment, payAppointment };