const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  accountType: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    required: [true, 'Account type is required']
  },
  // Common fields
  profilePicture: {
    type: String,
    default: ''
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  // Student specific fields
  studentDetails: {
    collegeName: {
      type: String,
      default: ''
    },
    course: {
      type: String,
      default: ''
    },
    semester: {
      type: String,
      default: null
    },
    enrollmentNumber: {
      type: String,
      default: ''
    },
    learningGoals: [String],
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    enrolledCourses: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        completedLectures: [
          {
            type: mongoose.Schema.Types.ObjectId,
          },
        ],
        watchTime: {
          type: Number, // in seconds or minutes, depending on your tracking granularity
          default: 0,
          min: 0,
        },
        lastAccessed: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    completedCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }],
    certificates: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        issuedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ]
  },
  // Instructor specific fields
  instructorDetails: {
    title: {
      type: String,
      trim: true
    },
    yearsOfExperience: {
      type: Number,
      min: 0
    },
    areasOfExpertise: [String],
    certifications: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      issuer: {
        type: String,
        required: true,
        trim: true
      },
      date: {
        type: Date
      },
      url: {
        type: String,
        trim: true
      }
    }],
    teachingStyle: {
      type: String,
      trim: true
    },
    availability: {
      type: String,
      trim: true
    },
    courses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    totalStudents: {
      type: Number,
      default: 0
    },
    totalLectures: {
      type: Number,
      default: 0
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified("password")) {
      console.log("Password not modified, skipping hash");
      return next();
    }

    console.log("Hashing password for user:", {
      email: this.email,
      isNew: this.isNew,
      modifiedFields: this.modifiedPaths(),
      passwordLength: this.password.length
    });

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    console.log("Password hashed successfully:", {
      email: this.email,
      hashedPasswordLength: this.password.length,
      isHashed: this.password.startsWith('$2')
    });
    next();
  } catch (error) {
    console.error("Error hashing password:", error);
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    console.log("Comparing password for user:", {
      email: this.email,
      userId: this._id,
      hashedPasswordLength: this.password.length,
      isHashed: this.password.startsWith('$2')
    });
    
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    
    console.log("Password comparison result:", {
      email: this.email,
      isMatch,
      candidatePasswordLength: candidatePassword.length
    });
    
    return isMatch;
  } catch (error) {
    console.error("Error comparing password:", error);
    throw error;
  }
};

// Update the updatedAt timestamp before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes for frequently queried fields
userSchema.index({ email: 1 });
userSchema.index({ accountType: 1 });
userSchema.index({"studentDetails.enrolledCourses.course": 1});
userSchema.index({"instructorDetails.courses": 1});

// Pre-save middleware to handle data validation
userSchema.pre("save", function (next) {
  // Ensure arrays are initialized
  if (this.accountType === "student") {
    if (!this.studentDetails) this.studentDetails = {};
    if (!this.studentDetails.learningGoals) this.studentDetails.learningGoals = [];
    if (!this.studentDetails.enrolledCourses) this.studentDetails.enrolledCourses = [];
  } else if (this.accountType === "instructor") {
    if (!this.instructorDetails) this.instructorDetails = {};
    if (!this.instructorDetails.areasOfExpertise) this.instructorDetails.areasOfExpertise = [];
    if (!this.instructorDetails.certifications) this.instructorDetails.certifications = [];
    if (!this.instructorDetails.courses) this.instructorDetails.courses = [];
  }

  // Trim string fields
  if (this.name) this.name = this.name.trim();
  if (this.email) this.email = this.email.trim().toLowerCase();
  if (this.phoneNumber) this.phoneNumber = this.phoneNumber.trim();
  if (this.profilePicture) this.profilePicture = this.profilePicture.trim();
  if (this.bio) this.bio = this.bio.trim();

  // Trim student details
  if (this.studentDetails) {
    if (this.studentDetails.collegeName) this.studentDetails.collegeName = this.studentDetails.collegeName.trim();
    if (this.studentDetails.course) this.studentDetails.course = this.studentDetails.course.trim();
    if (this.studentDetails.semester) this.studentDetails.semester = this.studentDetails.semester.trim();
    if (this.studentDetails.enrollmentNumber) this.studentDetails.enrollmentNumber = this.studentDetails.enrollmentNumber.trim();
    if (this.studentDetails.learningGoals) {
      this.studentDetails.learningGoals = this.studentDetails.learningGoals.map(goal => goal.trim());
    }
  }

  // Trim instructor details
  if (this.instructorDetails) {
    if (this.instructorDetails.title) this.instructorDetails.title = this.instructorDetails.title.trim();
    if (this.instructorDetails.teachingStyle) this.instructorDetails.teachingStyle = this.instructorDetails.teachingStyle.trim();
    if (this.instructorDetails.availability) this.instructorDetails.availability = this.instructorDetails.availability.trim();
    if (this.instructorDetails.areasOfExpertise) {
      this.instructorDetails.areasOfExpertise = this.instructorDetails.areasOfExpertise.map(area => area.trim());
    }
    if (this.instructorDetails.certifications) {
      this.instructorDetails.certifications = this.instructorDetails.certifications.map(cert => ({
        ...cert,
        name: cert.name.trim(),
        issuer: cert.issuer.trim(),
        url: cert.url ? cert.url.trim() : undefined,
      }));
    }
  }

  next();
});

// Method to update student's course progress
userSchema.methods.updateCourseProgress = async function (courseId, lectureId, watchTime) {
  if (this.accountType !== "student") {
    throw new Error("Only students can update course progress");
  }

  const enrolledCourse = this.studentDetails.enrolledCourses.find(
    (course) => course.course.toString() === courseId.toString()
  );

  if (!enrolledCourse) {
    throw new Error("Student is not enrolled in this course");
  }

  // Update progress based on completed lectures (assuming 1 lecture = 1 unit of progress for simplicity)
  // This logic might need to be more sophisticated based on your course structure (e.g., total lectures, lecture weights)
  if (!enrolledCourse.completedLectures.includes(lectureId)) {
    enrolledCourse.completedLectures.push(lectureId);
  }
  
  // Basic progress calculation: percentage of completed lectures
  const course = await mongoose.model('Course').findById(courseId);
  if (course && course.totalLectures > 0) {
    enrolledCourse.progress = (enrolledCourse.completedLectures.length / course.totalLectures) * 100;
  }

  enrolledCourse.watchTime = (enrolledCourse.watchTime || 0) + (watchTime || 0);
  enrolledCourse.lastAccessed = new Date();

  await this.save();
};

// Method to add a course for instructor
userSchema.methods.addCourse = async function (courseId) {
  if (this.accountType !== "instructor") {
    throw new Error("Only instructors can add courses");
  }

  if (!this.instructorDetails.courses.includes(courseId)) {
    this.instructorDetails.courses.push(courseId);
    await this.save();
  }
};

// Method to remove a course for instructor
userSchema.methods.removeCourse = async function (courseId) {
  if (this.accountType !== "instructor") {
    throw new Error("Only instructors can remove courses");
  }

  this.instructorDetails.courses = this.instructorDetails.courses.filter(
    (id) => id.toString() !== courseId.toString()
  );
  await this.save();
};

// Method to update instructor rating
userSchema.methods.updateRating = async function (newRating) {
  if (this.accountType !== "instructor") {
    throw new Error("Only instructors can have ratings");
  }

  const currentTotal = this.instructorDetails.rating * this.instructorDetails.totalReviews;
  this.instructorDetails.totalReviews += 1;
  this.instructorDetails.rating = (currentTotal + newRating) / this.instructorDetails.totalReviews;

  await this.save();
};

module.exports = mongoose.model("User", userSchema);
