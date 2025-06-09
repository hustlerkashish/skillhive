const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Auth middleware: Decoded JWT userId:", decoded.userId);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select("-password");
    console.log("Auth middleware: User found from DB:", user ? `ID: ${user._id}, Account Type: ${user.accountType}` : "None");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Add user to request object
    req.user = user;
    console.log("Auth middleware: req.user set. User ID:", req.user._id, "Account Type:", req.user.accountType);
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Token has expired",
        code: "TOKEN_EXPIRED"
      });
    }
    
    res.status(401).json({ 
      message: "Token is not valid",
      code: "INVALID_TOKEN"
    });
  }
}; 