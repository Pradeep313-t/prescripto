// check-env.js
import dotenv from "dotenv";

dotenv.config();

const requiredVars = [
  'MONGODB_URI',
  'CLOUDINARY_NAME',
  'CLOUDINARY_API_KEY', 
  'CLOUDINARY_SECRET_KEY',
  'JWT_SECRET',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD'
];

console.log("🔧 Checking environment variables...\n");

let allSet = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: Set`);
  } else {
    console.log(`❌ ${varName}: Not set`);
    allSet = false;
  }
});

console.log("\n" + "=".repeat(50));

if (allSet) {
  console.log("✅ All required environment variables are set!");
} else {
  console.log("❌ Some environment variables are missing!");
  console.log("\nPlease create a .env file in the backend directory with:");
  console.log("=".repeat(50));
  requiredVars.forEach(varName => {
    console.log(`${varName}=your_${varName.toLowerCase()}_value`);
  });
  console.log("=".repeat(50));
}

console.log("\n🔧 Additional checks:");
console.log("- MONGODB_URI format should be: mongodb+srv://username:password@cluster.mongodb.net/database");
console.log("- CLOUDINARY credentials can be found in your Cloudinary dashboard");
console.log("- JWT_SECRET can be any random string for security");
console.log("- ADMIN_EMAIL and ADMIN_PASSWORD are used for admin login");
