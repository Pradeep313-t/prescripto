// test-add-doctor.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import doctorModel from "./models/doctorModel.js";
import bcrypt from "bcrypt";

dotenv.config();

const testAddDoctor = async () => {
  try {
    console.log("🔧 Adding multiple doctors to database...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("testpassword123", salt);
    
    const doctors = [
      {
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@example.com",
        password: hashedPassword,
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
        speciality: "Gynecologist",
        degree: "MBBS, MD (Gynecology)",
        experience: "8 years",
        about: "Experienced gynecologist specializing in women's health and reproductive medicine.",
        available: true,
        fees: 600,
        address: {
          addressLine: "456 Women's Health Center",
          addressLine2: "Medical Plaza"
        },
        date: Date.now(),
        slots_booked: {}
      },
      {
        name: "Dr. Michael Chen",
        email: "michael.chen@example.com",
        password: hashedPassword,
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
        speciality: "Dermatologist",
        degree: "MBBS, MD (Dermatology)",
        experience: "12 years",
        about: "Board-certified dermatologist with expertise in skin conditions and cosmetic procedures.",
        available: true,
        fees: 800,
        address: {
          addressLine: "789 Skin Care Clinic",
          addressLine2: "Dermatology Center"
        },
        date: Date.now(),
        slots_booked: {}
      },
      {
        name: "Dr. Emily Rodriguez",
        email: "emily.rodriguez@example.com",
        password: hashedPassword,
        image: "https://images.unsplash.com/photo-1594824475544-9e6f2b5c0c8b?w=400&h=400&fit=crop&crop=face",
        speciality: "Pediatricians",
        degree: "MBBS, MD (Pediatrics)",
        experience: "6 years",
        about: "Caring pediatrician dedicated to children's health and development.",
        available: true,
        fees: 500,
        address: {
          addressLine: "321 Children's Hospital",
          addressLine2: "Pediatric Wing"
        },
        date: Date.now(),
        slots_booked: {}
      },
      {
        name: "Dr. Robert Wilson",
        email: "robert.wilson@example.com",
        password: hashedPassword,
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
        speciality: "Neurologist",
        degree: "MBBS, MD (Neurology)",
        experience: "15 years",
        about: "Specialized neurologist treating complex neurological disorders and conditions.",
        available: true,
        fees: 1000,
        address: {
          addressLine: "654 Neurology Institute",
          addressLine2: "Brain Research Center"
        },
        date: Date.now(),
        slots_booked: {}
      },
      {
        name: "Dr. Lisa Thompson",
        email: "lisa.thompson@example.com",
        password: hashedPassword,
        image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face",
        speciality: "Gastroenterologist",
        degree: "MBBS, MD (Gastroenterology)",
        experience: "10 years",
        about: "Expert gastroenterologist specializing in digestive system disorders.",
        available: true,
        fees: 750,
        address: {
          addressLine: "987 Digestive Health Center",
          addressLine2: "Gastroenterology Clinic"
        },
        date: Date.now(),
        slots_booked: {}
      }
    ];
    
    console.log(`\n📝 Adding ${doctors.length} doctors to database...`);
    
    for (let i = 0; i < doctors.length; i++) {
      const doctor = doctors[i];
      console.log(`\n👨‍⚕️ Adding doctor ${i + 1}: ${doctor.name} (${doctor.speciality})`);
      
      // Save to database
      const newDoctor = new doctorModel(doctor);
      const savedDoctor = await newDoctor.save();
      
      console.log(`✅ ${doctor.name} saved successfully! ID: ${savedDoctor._id}`);
    }
    
    // Fetch and display all doctors
    const allDoctors = await doctorModel.find().select('-password');
    console.log(`\n📋 Total doctors in database: ${allDoctors.length}`);
    
    await mongoose.disconnect();
    console.log("✅ MongoDB disconnected");
    
    console.log("\n🎯 Summary:");
    console.log("- Multiple doctors added to MongoDB Atlas");
    console.log("- Collection name: 'doctors'");
    console.log("- Frontend can now fetch and display these doctors");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
};

testAddDoctor();
