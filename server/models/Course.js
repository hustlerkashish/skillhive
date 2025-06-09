const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  isPreview: {
    type: Boolean,
    default: false
  },
  playbackStats: {
    totalViews: {
      type: Number,
      default: 0
    },
    averageWatchTime: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    }
  }
});

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  lectures: [lectureSchema]
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        "programming",
        "design",
        "business",
        "marketing",
        "music",
        "photography",
        "other",
      ],
    },
    level: {
      type: String,
      required: [true, 'Level is required'],
      enum: ["beginner", "intermediate", "advanced"],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, 'Instructor is required'],
      validate: {
        validator: async function(v) {
          const User = mongoose.model('User');
          const user = await User.findById(v);
          return user && user.accountType === 'instructor';
        },
        message: 'Instructor must be a valid instructor account'
      }
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    sections: [sectionSchema],
    enrolledStudents: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
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
      },
    ],
    totalStudents: {
      type: Number,
      default: 0,
    },
    totalLectures: {
      type: Number,
      default: 0,
    },
    totalDuration: {
      type: Number, // in minutes
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
  }
);

// Add index for instructor field for better query performance
courseSchema.index({ instructor: 1 });

// Calculate total lectures and duration before saving
courseSchema.pre("save", function (next) {
  this.totalLectures = this.sections.reduce(
    (total, section) => total + section.lectures.length,
    0
  );
  this.totalDuration = this.sections.reduce(
    (total, section) =>
      total +
      section.lectures.reduce(
        (sectionTotal, lecture) => sectionTotal + lecture.duration,
        0
      ),
    0
  );
  next();
});

// Add indexes for frequently queried fields
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ isFeatured: 1 });

// Method to update lecture playback stats
courseSchema.methods.updateLectureStats = async function(sectionIndex, lectureIndex, watchTime) {
  const lecture = this.sections[sectionIndex].lectures[lectureIndex];
  if (!lecture) return;

  lecture.playbackStats.totalViews += 1;
  lecture.playbackStats.averageWatchTime = 
    (lecture.playbackStats.averageWatchTime * (lecture.playbackStats.totalViews - 1) + watchTime) / 
    lecture.playbackStats.totalViews;
  
  // Update completion rate if watch time is more than 90% of the lecture duration
  if (watchTime >= lecture.duration * 0.9) {
    lecture.playbackStats.completionRate = 
      (lecture.playbackStats.completionRate * (lecture.playbackStats.totalViews - 1) + 1) / 
      lecture.playbackStats.totalViews;
  }

  await this.save();
};

module.exports = mongoose.model("Course", courseSchema); 