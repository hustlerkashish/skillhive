const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const Course = require("./models/Course");
const User = require("./models/User");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads", "profile-pictures");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Log non-sensitive env vars
console.log("Environment configuration:", {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  hasMongoUri: !!process.env.MONGODB_URI,
  hasJwtSecret: !!process.env.JWT_SECRET,
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connected successfully");
  console.log("MongoDB connection details:", {
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name
  });
  seedDummyData();
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", {
    message: err.message,
    code: err.code,
    name: err.name
  });
  process.exit(1);
});

// MongoDB connection events
mongoose.connection.on('error', err => console.error('MongoDB connection error:', err));
mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected'));

// Dummy data seeding
async function seedDummyData() {
  try {
    const courseCount = await Course.countDocuments();
    const userCount = await User.countDocuments();

    if (courseCount === 0 || userCount === 0) {
      console.log("Seeding dummy data...");

      let student = await User.findOne({ email: "test@example.com" });
      if (!student) {
        student = new User({
          name: "Test Student",
          email: "test@example.com",
          password: "password123",
          accountType: "student",
          studentDetails: {
            skillLevel: "beginner",
            learningGoals: ["Web Development", "React"]
          }
        });
        await student.save();
        console.log("Test student created.");
      }

      let instructor = await User.findOne({ email: "instructor@example.com" });
      if (!instructor) {
        instructor = new User({
          name: "Demo Instructor",
          email: "instructor@example.com",
          password: "password123",
          accountType: "instructor",
          instructorDetails: {
            title: "Senior Developer",
            yearsOfExperience: 5,
            areasOfExpertise: ["Web Development", "React", "Node.js"],
            teachingStyle: "Practical",
            availability: "Weekends",
            certifications: [],
          },
        });
        await instructor.save();
        console.log("Dummy instructor created.");
      }

      const dummyCourses = [
        {
          title: "Introduction to React",
          description: "Learn the basics of React.js for building modern web applications.",
          thumbnail: "https://via.placeholder.com/400x200?text=React+Course",
          price: 49.99,
          category: "programming",
          level: "beginner",
          instructor: instructor._id,
          isPublished: true,
          isFeatured: true,
          sections: [
            {
              title: "Getting Started",
              lectures: [
                { title: "What is React?", description: "Intro", videoUrl: "https://www.youtube.com/embed/videoseries?list=PL4cUxeGkcWxihETXpEsYh_pcRm5JNS_Rk", duration: 10, isPreview: true },
                { title: "Setting up Environment", description: "Setup", videoUrl: "https://www.youtube.com/embed/videoseries?list=PL4cUxeGkcWxihETXpEsYh_pcRm5JNS_Rk", duration: 15 },
              ],
            },
            {
              title: "Components and Props",
              lectures: [
                { title: "Functional Components", description: "Func", videoUrl: "https://www.youtube.com/embed/videoseries?list=PL4cUxeGkcWxihETXpEsYh_pcRm5JNS_Rk", duration: 20 },
                { title: "Props in React", description: "Props", videoUrl: "https://www.youtube.com/embed/videoseries?list=PL4cUxeGkcWxihETXpEsYh_pcRm5JNS_Rk", duration: 18 },
              ],
            },
          ],
        },
        {
          title: "Advanced Node.js",
          description: "Deep dive into Node.js, Express, and MongoDB for backend development.",
          thumbnail: "https://via.placeholder.com/400x200?text=Node.js+Course",
          price: 79.99,
          category: "programming",
          level: "advanced",
          instructor: instructor._id,
          isPublished: true,
          isFeatured: true,
          sections: [
            {
              title: "API Design",
              lectures: [
                { title: "RESTful APIs", description: "REST", videoUrl: "https://www.youtube.com/embed/videoseries?list=PL4cUxeGkcWxihETXpEsYh_pcRm5JNS_Rk", duration: 25 },
                { title: "Authentication with JWT", description: "JWT", videoUrl: "https://www.youtube.com/embed/videoseries?list=PL4cUxeGkcWxihETXpEsYh_pcRm5JNS_Rk", duration: 30 },
              ],
            },
          ],
        },
        {
          title: "UI/UX Design Principles",
          description: "Master the fundamentals of user interface and user experience design.",
          thumbnail: "https://via.placeholder.com/400x200?text=UI/UX+Design",
          price: 59.99,
          category: "design",
          level: "intermediate",
          instructor: instructor._id,
          isPublished: true,
          isFeatured: false,
          sections: [
            {
              title: "Usability Heuristics",
              lectures: [
                { title: "Jakob Nielsen's 10 Heuristics", description: "Heuristics", videoUrl: "https://www.youtube.com/embed/videoseries?list=PL4cUxeGkcWxihETXpEsYh_pcRm5JNS_Rk", duration: 20 },
              ],
            },
          ],
        },
      ];

      for (const courseData of dummyCourses) {
        const existingCourse = await Course.findOne({ title: courseData.title });
        if (!existingCourse) {
          const course = new Course(courseData);
          await course.save();
          console.log(`Course '${course.title}' seeded.`);
        }
      }

      console.log("Dummy data seeding complete.");
    } else {
      console.log("Database already contains data, skipping seeding.");
    }
  } catch (error) {
    console.error("Error seeding dummy data:", error);
  }
}

// Routes
console.log("Registering API routes...");
const authRoutes = require("./routes/authRoutes");
console.log("Auth routes required.");
app.use("/api/auth", authRoutes);
console.log("Auth routes mounted at /api/auth.");

const userRoutes = require("./routes/userRoutes");
console.log("User routes required.");
app.use("/api/users", userRoutes);
console.log("User routes mounted at /api/users.");

const courseRoutes = require("./routes/courseRoutes");
console.log("Course routes required.");
app.use("/api/courses", courseRoutes);
console.log("Course routes mounted at /api/courses.");

const orderRoutes = require("./routes/orderRoutes");
console.log("Order routes required.");
app.use("/api/orders", orderRoutes);
console.log("Order routes mounted at /api/orders.");

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", {
    message: err.message,
    stack: err.stack,
    name: err.name
  });

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
