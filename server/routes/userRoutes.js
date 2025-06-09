const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

console.log("Loading userRoutes.js");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profile-pictures");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// Get user profile
router.get("/profile", auth, async (req, res) => {
  console.log("GET /api/users/profile route hit.");
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate({
        path: 'studentDetails.enrolledCourses.course',
        model: 'Course',
        select: 'title description thumbnail price category level' // Select relevant fields
      });

    if (!user) {
      console.log("User not found in /profile route for ID:", req.user.id);
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User profile fetched successfully for ID:", user._id);
    console.log("Enrolled courses after population:", user.studentDetails?.enrolledCourses.map(e => ({ courseId: e.course?._id, courseTitle: e.course?.title })));
    res.json(user);
  } catch (err) {
    console.error("Error in /profile route:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      profilePicture,
      bio,
      studentDetails,
      instructorDetails,
    } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already taken" });
    }

    // Validate phone number format if provided
    if (phoneNumber) {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return res.status(400).json({ message: "Invalid phone number format" });
      }
    }

    // Validate student details if provided
    if (studentDetails) {
      if (studentDetails.skillLevel && !["beginner", "intermediate", "advanced"].includes(studentDetails.skillLevel)) {
        return res.status(400).json({ message: "Invalid skill level" });
      }

      if (studentDetails.learningGoals && !Array.isArray(studentDetails.learningGoals)) {
        return res.status(400).json({ message: "Learning goals must be an array" });
      }
    }

    // Validate instructor details if provided
    if (instructorDetails) {
      if (instructorDetails.yearsOfExperience && isNaN(instructorDetails.yearsOfExperience)) {
        return res.status(400).json({ message: "Years of experience must be a number" });
      }

      if (instructorDetails.areasOfExpertise && !Array.isArray(instructorDetails.areasOfExpertise)) {
        return res.status(400).json({ message: "Areas of expertise must be an array" });
      }

      if (instructorDetails.certifications && !Array.isArray(instructorDetails.certifications)) {
        return res.status(400).json({ message: "Certifications must be an array" });
      }

      // Validate each certification
      if (instructorDetails.certifications) {
        for (const cert of instructorDetails.certifications) {
          if (!cert.name || !cert.issuer) {
            return res.status(400).json({ message: "Certification name and issuer are required" });
          }
          if (cert.date && isNaN(Date.parse(cert.date))) {
            return res.status(400).json({ message: "Invalid certification date" });
          }
          if (cert.url && !cert.url.startsWith("http")) {
            return res.status(400).json({ message: "Invalid certification URL" });
          }
        }
      }
    }

    // Update user profile
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update basic information
    user.name = name;
    user.email = email;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.profilePicture = profilePicture || user.profilePicture;
    user.bio = bio || user.bio;

    // Update role-specific details
    if (user.accountType === "student" && studentDetails) {
      user.studentDetails = {
        ...user.studentDetails,
        ...studentDetails,
      };
    } else if (user.accountType === "instructor" && instructorDetails) {
      user.instructorDetails = {
        ...user.instructorDetails,
        ...instructorDetails,
      };
    }

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(user._id).select("-password");
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user account
router.delete("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.remove();
    res.json({ message: "User account deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Upload profile picture
router.post("/profile/picture", auth, upload.single("profilePicture"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update profile picture URL
    user.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
    await user.save();

    res.json({ profilePicture: user.profilePicture });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ message: "Error uploading profile picture" });
  }
});

module.exports = router; 