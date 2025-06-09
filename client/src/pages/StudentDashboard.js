import React, { useState, useEffect } from 'react';
import { getUserProfile } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

function StudentDashboard() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await getUserProfile();
        setUserData(response.data);
      } catch (err) {
        console.error("Error fetching student profile:", err);
        setError("Failed to load student dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Loading student dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-red-600 text-center">Error: {error}</div>
      </div>
    );
  }

  if (!userData || userData.accountType !== "student") {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <p className="text-gray-600 text-center">Please log in as a student to view this dashboard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome, {userData.name}!</h1>

        {/* Student Details Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Skill Level:</strong> {userData.studentDetails?.skillLevel || 'N/A'}</p>
            <p><strong>Learning Goals:</strong> {userData.studentDetails?.learningGoals?.join(', ') || 'None set'}</p>
            <p><strong>Enrollment Number:</strong> {userData.studentDetails?.enrollmentNumber || 'N/A'}</p>
          </div>
          <Link
            to="/student/profile"
            className="mt-6 inline-block bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View/Edit Profile
          </Link>
        </div>

        {/* Enrolled Courses Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Enrolled Courses</h2>
          {userData.studentDetails?.enrolledCourses && userData.studentDetails.enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userData.studentDetails.enrolledCourses.map((enrollment) => {
                console.log("Current enrollment object:", enrollment);
                if (!enrollment.course || typeof enrollment.course !== 'object' || !enrollment.course._id) {
                  console.warn("Invalid or missing course data in enrollment:", enrollment);
                  return null;
                }
                return (
                  <div key={enrollment.course._id} className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    {enrollment.course.thumbnail && (
                      <img
                        src={enrollment.course.thumbnail}
                        alt={enrollment.course.title || 'Course Thumbnail'}
                        className="w-full h-32 object-cover rounded-md mb-4"
                      />
                    )}
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{enrollment.course.title || 'Unknown Course'}</h3>
                    <p className="text-gray-600 text-sm mb-3">{enrollment.course.description || 'No description available.'}</p>
                    <p className="text-gray-700 mb-1">
                      <strong>Progress:</strong> {enrollment.progress || 0}%
                    </p>
                    <p className="text-gray-700 mb-1">
                      <strong>Watch Time:</strong> {enrollment.watchTime ? `${(enrollment.watchTime / 60).toFixed(0)} minutes` : '0 minutes'}
                    </p>
                    <p className="text-gray-700 mb-3">
                      <strong>Last Accessed:</strong> {new Date(enrollment.lastAccessed).toLocaleDateString()}
                    </p>
                    <Link
                      to={`/courses/${enrollment.course._id}`}
                      className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Continue Learning
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet.</p>
              <Link
                to="/courses"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
              >
                Browse Courses
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard; 