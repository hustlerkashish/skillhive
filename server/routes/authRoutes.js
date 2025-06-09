const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const auth = require("../middleware/auth");

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, accountType } = req.body;
    console.log("Signup attempt - Request body:", { 
      name, 
      email, 
      accountType,
      password: password ? "***" : "undefined",
      bodyKeys: Object.keys(req.body)
    });

    // Validate request body
    if (!name || !email || !password || !accountType) {
      console.log("Missing required fields:", { 
        name: !!name, 
        email: !!email, 
        password: !!password,
        accountType: !!accountType
      });
      return res.status(400).json({ 
        message: "All fields are required",
        details: {
          name: !name ? "Name is required" : null,
          email: !email ? "Email is required" : null,
          password: !password ? "Password is required" : null,
          accountType: !accountType ? "Account type is required" : null
        }
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log("User already exists:", email);
      return res.status(400).json({ 
        message: "User already exists",
        details: {
          email: "An account with this email already exists"
        }
      });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      accountType,
    });

    // Save user (password will be hashed by the pre-save middleware)
    await user.save();
    console.log("User created successfully:", {
      id: user._id,
      email: user.email,
      accountType: user.accountType,
      hasPassword: !!user.password,
      passwordLength: user.password.length
    });

    // Create JWT token
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      user: userResponse,
      token,
    });
  } catch (err) {
    console.error("Signup error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
      env: {
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasMongoUri: !!process.env.MONGODB_URI,
        nodeEnv: process.env.NODE_ENV
      }
    });
    res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt - Request body:", { 
      email,
      password: password ? "***" : "undefined",
      bodyKeys: Object.keys(req.body)
    });

    // Validate request body
    if (!email || !password) {
      console.log("Missing credentials:", { 
        hasEmail: !!email, 
        hasPassword: !!password 
      });
      return res.status(400).json({ 
        message: "Email and password are required",
        details: {
          email: !email ? "Email is required" : null,
          password: !password ? "Password is required" : null
        }
      });
    }

    // Find user
    const user = await User.findOne({ email });
    console.log("User lookup result:", {
      found: !!user,
      email,
      userId: user?._id,
      accountType: user?.accountType
    });

    if (!user) {
      console.log("User not found:", email);
      return res.status(400).json({ 
        message: "Invalid credentials",
        details: {
          email: "No account found with this email"
        }
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    console.log("Password verification:", {
      email,
      isMatch,
      userId: user._id
    });

    if (!isMatch) {
      console.log("Invalid password for user:", email);
      return res.status(400).json({ 
        message: "Invalid credentials",
        details: {
          password: "Incorrect password"
        }
      });
    }

    // Create JWT token
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log("Login successful:", {
      userId: user._id,
      email: user.email,
      accountType: user.accountType
    });

    res.json({
      user: userResponse,
      token,
    });
  } catch (err) {
    console.error("Login error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
      env: {
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasMongoUri: !!process.env.MONGODB_URI,
        nodeEnv: process.env.NODE_ENV
      }
    });
    res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post("/logout", auth, async (req, res) => {
  try {
    // Update last login timestamp
    await User.findByIdAndUpdate(req.user.userId, {
      lastLogin: new Date(),
    });

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        message: "No account found with this email",
        details: {
          email: "No account found with this email"
        }
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // In a real application, you would send an email here
    // For development, we'll just return the token
    res.json({ 
      message: "Password reset token generated",
      resetToken // Remove this in production
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired reset token",
        details: {
          token: "Invalid or expired reset token"
        }
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router; 