// test-login.js
import dotenv from "dotenv";
import https from "https";
import http from "http";

dotenv.config();

const makeRequest = (url, data) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

const testLogin = async () => {
  try {
    console.log("🔧 Testing admin login...");
    console.log("Backend URL:", process.env.BACKEND_URL || "http://localhost:4000");
    console.log("ADMIN_EMAIL:", process.env.ADMIN_EMAIL ? "Set" : "Not set");
    console.log("ADMIN_PASSWORD:", process.env.ADMIN_PASSWORD ? "Set" : "Not set");
    
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      console.error("❌ ADMIN_EMAIL or ADMIN_PASSWORD not set in environment variables");
      console.log("Please add these to your .env file:");
      console.log("ADMIN_EMAIL=your_admin_email@example.com");
      console.log("ADMIN_PASSWORD=your_admin_password");
      return;
    }
    
    const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
    
    const response = await makeRequest(`${backendUrl}/api/admin/login`, {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD
    });
    
    if (response.status === 200) {
      console.log("✅ Login successful!");
      console.log("Response:", response.data);
      
      if (response.data.token) {
        console.log("✅ Token received:", response.data.token.substring(0, 20) + "...");
      }
    } else {
      console.error("❌ Login failed with status:", response.status);
      console.error("Response:", response.data);
    }
    
  } catch (error) {
    console.error("❌ Login failed:", error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error("❌ Connection refused - Make sure your backend server is running on port 4000");
    }
  }
};

testLogin();
