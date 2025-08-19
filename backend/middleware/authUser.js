// middleware/authUser.js
import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  try {
    let token = null;

    // Prefer Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } 
    // Fallback to custom token headers (case-insensitive)
    else if (req.headers.token) {
      token = req.headers.token;
    } else if (req.headers.Token) {
      token = req.headers.Token;
    } else if (req.headers["token"]) {
      token = req.headers["token"];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not Authorized. Missing token" });
    }

    // Get JWT_SECRET from environment inside the function
    const JWT_SECRET = process.env.JWT_SECRET;
    
    // JWT_SECRET must be set in environment
    if (!JWT_SECRET) {
      console.error("JWT_SECRET not found in environment variables");
      return res.status(500).json({ success: false, message: "JWT secret not configured on server" });
    }

    // Add debugging for token validation
    console.log("🔍 Token validation:", {
      tokenLength: token ? token.length : 0,
      tokenPrefix: token ? token.substring(0, 20) + "..." : "none",
      hasJWTSecret: !!JWT_SECRET
    });

    // Synchronous verify for better error handling
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log("✅ Token decoded successfully:", {
        userId: decoded.id,
        email: decoded.email,
        name: decoded.name
      });
    } catch (err) {
      console.error("❌ Token verification failed:", {
        error: err.name,
        message: err.message,
        token: token.substring(0, 20) + "..."
      });
      
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ success: false, message: "Token expired. Login again" });
      }
      return res.status(401).json({ success: false, message: "Invalid token. Login again" });
    }

    // Validate decoded token structure
    if (!decoded || !decoded.id) {
      console.error("❌ Invalid token structure:", decoded);
      return res.status(401).json({ success: false, message: "Invalid token structure" });
    }

    // Attach user info and userId to req.user
    req.user = {
      ...decoded,
      userId: decoded.id
    };
    
    console.log("✅ User authenticated:", req.user);
    next();
  } catch (error) {
    console.error("🔥 authUser error:", error);
    return res.status(500).json({ success: false, message: "Server error in auth" });
  }
};

export default authUser;
