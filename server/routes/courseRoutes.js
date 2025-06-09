const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const User = require("../models/User");

console.log("Loading courseRoutes.js");

// Get featured courses
router.get("/featured", async (req, res) => {
  try {
    const featuredCourses = await Course.find({ isFeatured: true })
      .populate("instructor", "name profilePicture title")
      .limit(6)
      .sort({ createdAt: -1 });

    res.json(featuredCourses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get instructor's courses (specific route - place before /:id)
router.get("/instructor", auth, async (req, res) => {
  try {
    console.log("GET /courses/instructor route hit");
    console.log("User ID:", req.user._id);
    console.log("User Account Type:", req.user.accountType);

    if (req.user.accountType !== "instructor") {
      console.log("Access denied: User is not an instructor");
      return res.status(403).json({ message: "Access denied. Instructor only." });
    }

    const courses = await Course.find({ instructor: req.user._id })
      .populate("instructor", "name email")
      .sort({ createdAt: -1 });

    console.log(`Found ${courses.length} courses for instructor`);
    res.json(courses);
  } catch (error) {
    console.error("Error in GET /courses/instructor:", error);
    res.status(500).json({ 
      message: "Error fetching instructor courses",
      error: error.message 
    });
  }
});

// Get instructor analytics (specific route - place before /:id)
router.get("/instructor/analytics", auth, async (req, res) => {
  try {
    console.log("GET /courses/instructor/analytics route hit");
    console.log("User ID:", req.user._id);

    if (req.user.accountType !== "instructor") {
      console.log("Access denied: User is not an instructor");
      return res.status(403).json({ message: "Access denied. Instructor only." });
    }

    // Get all courses for this instructor
    const courses = await Course.find({ instructor: req.user._id });
    console.log(`Found ${courses.length} courses for analytics`);

    // Calculate analytics
    const analytics = {
      totalStudents: 0,
      totalRevenue: 0,
      averageRating: 0,
      totalCourses: courses.length,
    };

    // For each course, get enrolled students and calculate metrics
    for (const course of courses) {
      const enrolledStudents = await User.countDocuments({
        "studentDetails.enrolledCourses.course": course._id
      });
      
      analytics.totalStudents += enrolledStudents;
      analytics.totalRevenue += enrolledStudents * course.price;
      
      if (course.rating) {
        analytics.averageRating += course.rating;
      }
    }

    // Calculate average rating
    if (courses.length > 0) {
      analytics.averageRating = analytics.averageRating / courses.length;
    }

    console.log("Analytics calculated:", analytics);
    res.json(analytics);
  } catch (error) {
    console.error("Error in GET /courses/instructor/analytics:", error);
    res.status(500).json({ 
      message: "Error fetching instructor analytics",
      error: error.message 
    });
  }
});

// Get all courses
router.get("/", async (req, res) => {
  try {
    const { search, category, level } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (level) {
      query.level = level;
    }

    const courses = await Course.find(query)
      .populate("instructor", "name profilePicture title")
      .sort({ createdAt: -1 });

    console.log("Courses fetched from DB for CourseList:", courses.map(c => ({ id: c._id, title: c.title })));
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get course by ID (general route - place after specific routes)
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name profilePicture title bio")
      .populate("reviews.user", "name profilePicture");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get analytics for a specific course (instructor only)
router.get("/:id/analytics", auth, async (req, res) => {
  try {
    const courseId = req.params.id;
    console.log(`GET /courses/${courseId}/analytics route hit.`);

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      console.log("Invalid course ID format:", courseId);
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      console.log("Course not found for analytics:", courseId);
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
      console.log("Unauthorized access to course analytics. User:", req.user._id, "Course Instructor:", course.instructor);
      return res.status(403).json({ message: "Access denied. Not the course instructor." });
    }

    // Calculate analytics for this specific course
    const totalEnrolledStudents = course.enrolledStudents.length;
    const totalLectures = course.totalLectures;
    const totalDuration = course.totalDuration; // in minutes

    let totalWatchTime = 0;
    let totalLectureViews = 0;

    course.sections.forEach(section => {
      section.lectures.forEach(lecture => {
        totalLectureViews += lecture.playbackStats.totalViews;
        totalWatchTime += lecture.playbackStats.averageWatchTime * lecture.playbackStats.totalViews; // Assuming average watch time is per view
      });
    });

    // Calculate average watch time across all lectures (for this course)
    const overallAverageWatchTime = totalLectureViews > 0 ? (totalWatchTime / totalLectureViews) : 0;

    // Calculate completion rate (example: based on students who completed at least one lecture)
    // This is a simplified metric, a more complex one would involve tracking individual lecture completion
    const studentsWithProgress = new Set();
    course.enrolledStudents.forEach(enrollment => {
      if (enrollment.progress > 0) {
        studentsWithProgress.add(enrollment.student.toString());
      }
    });
    const completionRate = totalEnrolledStudents > 0 ? (studentsWithProgress.size / totalEnrolledStudents) * 100 : 0;

    res.json({
      totalEnrolledStudents,
      totalLectures,
      totalDuration,
      totalLectureViews,
      overallAverageWatchTime,
      completionRate,
      courseTitle: course.title,
      courseThumbnail: course.thumbnail,
    });

  } catch (err) {
    console.error("Error in GET /courses/:id/analytics:", err);
    res.status(500).json({ 
      message: "Server error fetching course analytics",
      error: err.message 
    });
  }
});

// Create course (instructor only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.accountType !== "instructor") {
      return res.status(403).json({ message: "Only instructors can create courses" });
    }

    const course = new Course({
      ...req.body,
      instructor: req.user._id,
    });

    await course.save();
    res.status(201).json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update course (instructor only)
router.put("/:id", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedCourse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete course (instructor only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await course.remove();
    res.json({ message: "Course removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add review to course
router.post("/:id/reviews", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const { rating, comment } = req.body;

    const review = {
      user: req.user._id,
      rating,
      comment,
    };

    course.reviews.push(review);

    // Update course rating
    const totalRating = course.reviews.reduce((acc, review) => acc + review.rating, 0);
    course.rating = totalRating / course.reviews.length;

    await course.save();
    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Enroll in a course (student only)
router.post("/:id/enroll", auth, async (req, res) => {
  try {
    // Check if user is a student
    if (req.user.accountType !== "student") {
      return res.status(403).json({ message: "Only students can enroll in courses" });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if student is already enrolled
    const isEnrolled = course.enrolledStudents.some(
      (enrollment) => enrollment.student.toString() === req.user._id.toString()
    );

    if (isEnrolled) {
      return res.status(400).json({ message: "Student is already enrolled in this course" });
    }

    // --- Simulate Payment Process ---
    // In a real application, you would integrate with a payment gateway (e.g., Stripe, PayPal)
    // This would involve creating a charge, handling webhooks, etc.
    const paymentSuccessful = true; // Placeholder for successful payment
    if (!paymentSuccessful) {
      return res.status(402).json({ message: "Payment failed. Please try again." });
    }
    // --- End Simulate Payment Process ---

    // Enroll the student in the course
    course.enrolledStudents.push({ student: req.user._id });
    course.totalStudents = (course.totalStudents || 0) + 1; // Increment totalStudents
    await course.save();

    // Add the course to the student's enrolledCourses array in User model
    const user = await User.findById(req.user._id);
    if (user && user.accountType === "student") {
      user.studentDetails.enrolledCourses.push({ 
        course: course._id,
        progress: 0,       // Initialize progress
        watchTime: 0,      // Initialize watchTime
        completedLectures: [], // Initialize completedLectures
        lastAccessed: new Date(), // Initialize lastAccessed
      });
      await user.save();
    }

    res.status(200).json({ message: "Successfully enrolled in course", courseId: course._id });
  } catch (err) {
    console.error("Error enrolling in course:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Track lecture progress
router.post("/:courseId/lectures/:lectureId/progress", auth, async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const { watchTime } = req.body;

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Find the user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the enrollment
    const enrollment = user.studentDetails.enrolledCourses.find(
      (e) => e.course.toString() === courseId
    );
    if (!enrollment) {
      return res.status(404).json({ message: "Not enrolled in this course" });
    }

    // Update progress
    if (!enrollment.progress.completedLectures.includes(lectureId)) {
      enrollment.progress.completedLectures.push(lectureId);
    }
    enrollment.progress.watchTime += watchTime || 0;
    enrollment.progress.lastAccessed = new Date();

    await user.save();

    res.json({
      message: "Progress updated successfully",
      progress: enrollment.progress,
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({ message: "Error updating progress" });
  }
});

// Get course progress
router.get("/:courseId/progress", auth, async (req, res) => {
  try {
    const { courseId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const enrollment = user.studentDetails.enrolledCourses.find(
      (e) => e.course.toString() === courseId
    );
    if (!enrollment) {
      return res.status(404).json({ message: "Not enrolled in this course" });
    }

    res.json({
      progress: enrollment.progress,
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ message: "Error fetching progress" });
  }
});

// Track video playback progress
router.post('/:courseId/sections/:sectionIndex/lectures/:lectureIndex/progress', auth, async (req, res) => {
  try {
    const { courseId, sectionIndex, lectureIndex } = req.params;
    const { watchTime } = req.body;

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled
    const isEnrolled = course.enrolledStudents.some(
      (enrollment) => enrollment.student.toString() === req.user._id.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({ message: 'You must be enrolled to track progress' });
    }

    // Update lecture stats
    await course.updateLectureStats(parseInt(sectionIndex), parseInt(lectureIndex), watchTime);

    // Update user's course progress
    const user = await User.findById(req.user._id);
    const enrollment = user.studentDetails.enrolledCourses.find(
      (e) => e.course.toString() === courseId
    );

    if (enrollment) {
      const lectureId = course.sections[sectionIndex].lectures[lectureIndex]._id;
      if (!enrollment.completedLectures.includes(lectureId)) {
        enrollment.completedLectures.push(lectureId);
      }
      enrollment.watchTime = (enrollment.watchTime || 0) + watchTime;
      enrollment.lastAccessed = new Date();

      // Calculate overall progress
      const totalLectures = course.sections.reduce((acc, section) => acc + section.lectures.length, 0);
      enrollment.progress = (enrollment.completedLectures.length / totalLectures) * 100;

      await user.save();
    }

    res.json({
      message: 'Progress updated successfully',
      progress: enrollment.progress,
      watchTime: enrollment.watchTime
    });
  } catch (error) {
    console.error('Error updating video progress:', error);
    res.status(500).json({ message: 'Error updating progress' });
  }
});

// Get lecture playback stats (for instructors)
router.get('/:courseId/sections/:sectionIndex/lectures/:lectureIndex/stats', auth, async (req, res) => {
  try {
    const { courseId, sectionIndex, lectureIndex } = req.params;

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the instructor can view these stats' });
    }

    const lecture = course.sections[sectionIndex].lectures[lectureIndex];
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    res.json({
      stats: lecture.playbackStats
    });
  } catch (error) {
    console.error('Error fetching lecture stats:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

module.exports = router;
