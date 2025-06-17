import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getCourse, enrollInCourse } from "../api";
import { useAuth } from "../contexts/AuthContext";
import ReactPlayer from "react-player";
import { toast } from "react-toastify";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: "",
  });
  const [hoveredRating, setHoveredRating] = useState(0);

  const fetchCourse = useCallback(async () => {
    if (!id) {
      setError("Course ID is missing. Please navigate from the course list.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getCourse(id);
      setCourse(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch course details. Please try again later.");
      console.error("Error fetching course:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const handleEnroll = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setEnrolling(true);
    setEnrollmentError(null);

    try {
      await enrollInCourse(id);
      // After successful enrollment, refresh course data or redirect
      // For now, let's redirect to student dashboard with a message
      navigate("/student/dashboard", { state: { message: "Successfully enrolled in course!" } });
    } catch (err) {
      console.error("Error enrolling in course:", err);
      setEnrollmentError(err.response?.data?.message || "Failed to enroll in course. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  // Check if the current user is a student and is already enrolled
  const isStudentEnrolled = user && user.accountType === 'student' && course?.enrolledStudents.some(s => {
    console.log("Checking enrollment for course ID:", id, ", User ID:", user._id, ", Enrolled Student ID:", s.student);
    return s.student === user._id;
  });

  const handleLectureClick = (sectionIndex, lectureIndex) => {
    if (isStudentEnrolled || course.sections[sectionIndex].lectures[lectureIndex].isPreview) {
      setSelectedLecture({ sectionIndex, lectureIndex });
    } else {
      setError("Please enroll in the course to view this lecture.");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to submit a review");
      navigate("/login");
      return;
    }

    if (!isStudentEnrolled) {
      toast.error("You must be enrolled in the course to submit a review");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/courses/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(reviewForm),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      const updatedCourse = await response.json();
      setCourse(updatedCourse);
      setReviewForm({ rating: 0, comment: "" });
      toast.success("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Course Not Found</h2>
          <p className="text-gray-600">The course you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden md:flex">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full md:w-1/2 h-64 object-cover"
        />
        <div className="p-6 md:w-1/2">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{course.title}</h1>
          <p className="text-gray-600 text-lg mb-4">{course.description}</p>
          <div className="flex items-center text-gray-700 mb-4">
            <span className="font-semibold">Instructor:</span>
            <span className="ml-2">{course.instructor?.name}</span>
          </div>
          <div className="flex items-center text-gray-700 mb-4">
            <span className="font-semibold">Price:</span>
            <span className="ml-2 text-xl text-blue-600 font-bold">${course.price}</span>
          </div>
          <div className="text-gray-700 mb-4">
            <span className="font-semibold">Category:</span>
            <span className="ml-2">{course.category}</span>
          </div>
          <div className="text-gray-700 mb-6">
            <span className="font-semibold">Level:</span>
            <span className="ml-2">{course.level}</span>
          </div>

          {user && user.accountType === 'student' && !isStudentEnrolled && (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enrolling ? 'Enrolling...' : 'Enroll Now'}
            </button>
          )}

          {user && user.accountType === 'student' && isStudentEnrolled && (
            <p className="text-green-600 font-semibold text-center mt-4">You are already enrolled in this course!</p>
          )}

          {user && user.accountType === 'instructor' && course.instructor?._id === user._id && (
            <p className="text-blue-600 font-semibold text-center mt-4">You are the instructor of this course.</p>
          )}

          {!user && (
            <p className="text-gray-600 text-center mt-4">
              <Link to="/login" className="text-blue-600 hover:underline">Log in</Link> to enroll or view course details.
            </p>
          )}

          {enrollmentError && (
            <div className="text-red-600 text-center mt-4">{enrollmentError}</div>
          )}
        </div>
      </div>

      {/* Course Sections and Lectures */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Course Content</h2>
        {selectedLecture && (
          <div className="mb-8 aspect-video bg-black rounded-lg overflow-hidden">
            <ReactPlayer
              url={course.sections[selectedLecture.sectionIndex].lectures[selectedLecture.lectureIndex].videoUrl}
              controls={true}
              width="100%"
              height="100%"
              playing={true}
            />
            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">
              {course.sections[selectedLecture.sectionIndex].lectures[selectedLecture.lectureIndex].title}
            </h3>
            <p className="text-gray-600 mb-4">
              {course.sections[selectedLecture.sectionIndex].lectures[selectedLecture.lectureIndex].description}
            </p>
          </div>
        )}

        {course.sections.length > 0 ? (
          course.sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6 p-4 border rounded-lg shadow-sm bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-700 mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.lectures.map((lecture, lectureIndex) => (
                  <li
                    key={lectureIndex}
                    className={`flex items-center text-gray-700 p-2 rounded-md cursor-pointer ${
                      selectedLecture?.sectionIndex === sectionIndex &&
                      selectedLecture?.lectureIndex === lectureIndex
                        ? 'bg-blue-100 text-blue-800'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleLectureClick(sectionIndex, lectureIndex)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    {lecture.title} ({lecture.duration} min)
                    {lecture.isPreview && (
                      <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Preview</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No course content available yet.</p>
        )}
      </div>

      {/* Course Reviews */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Reviews</h2>
        
        {/* Review Form */}
        {user && isStudentEnrolled && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Write a Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="text-2xl focus:outline-none"
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                    >
                      {star <= (hoveredRating || reviewForm.rating) ? "★" : "☆"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Comment
                </label>
                <textarea
                  id="comment"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  required
                  placeholder="Share your experience with this course..."
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Submit Review
              </button>
            </form>
          </div>
        )}

        {/* Reviews List */}
        {course.reviews.length > 0 ? (
          <div className="space-y-4">
            {course.reviews.map((review, reviewIndex) => (
              <div key={reviewIndex} className="p-4 border rounded-lg shadow-sm bg-white">
                <div className="flex items-center mb-2">
                  <img
                    src={review.user?.profilePicture || "https://via.placeholder.com/40"}
                    alt={review.user?.name || "User"}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{review.user?.name || "Anonymous User"}</p>
                    <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-yellow-500 mb-2">
                  {"★".repeat(review.rating)}{Array(5 - review.rating).fill("☆").join("")}
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No reviews yet. Be the first to review this course!</p>
        )}
      </div>
    </div>
  );
};

export default CourseDetail; 