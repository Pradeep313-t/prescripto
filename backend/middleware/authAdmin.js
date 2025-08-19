// middleware/authAdmin.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

const authAdmin = (req, res, next) => {
  try {
    // Check for Authorization header with Bearer token
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const aTokenHeader = req.headers.atoken || req.headers.aToken || req.headers["a-token"];
    
    let token = null;

    // First try Authorization header with Bearer format
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    } 
    // Fallback to custom headers
    else if (aTokenHeader) {
      const parts = aTokenHeader.split(" ");
      if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
        token = parts[1];
      } else if (parts.length === 1) {
        token = parts[0];
      }
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized. Missing token" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        const msg =
          err.name === "TokenExpiredError"
            ? "Token expired. Login again"
            : "Invalid token. Login again";
        return res.status(401).json({ success: false, message: msg });
      }
      if (!decoded || decoded.role !== "admin") {
        return res
          .status(403)
          .json({ success: false, message: "Forbidden: admin only" });
      }
      req.admin = decoded;
      next();
    });
  } catch (error) {
    console.error("authAdmin error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error in auth" });
  }
};

export default authAdmin;

