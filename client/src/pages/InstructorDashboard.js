import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import {
  getInstructorCourses,
  getInstructorAnalytics,
  deleteCourse,
  updateCourse,
} from "../api";
import { toast } from "react-toastify";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [coursesResponse, analyticsResponse] = await Promise.all([
          getInstructorCourses(),
          getInstructorAnalytics()
        ]);

        console.log("Fetched Courses Data:", coursesResponse.data);
        console.log("Fetched Analytics Data:", analyticsResponse.data);

        setCourses(coursesResponse.data);
        setAnalytics(analyticsResponse.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await deleteCourse(courseId);
        setCourses(courses.filter((course) => course._id !== courseId));
      } catch (err) {
        setError("Failed to delete course");
        console.error("Error deleting course:", err);
      }
    }
  };

  const handlePublishToggle = async (courseId, currentStatus) => {
    try {
      await updateCourse(courseId, { isPublished: !currentStatus });
      setCourses(
        courses.map((course) =>
          course._id === courseId
            ? { ...course, isPublished: !currentStatus }
            : course
        )
      );
    } catch (err) {
      setError("Failed to update course status");
      console.error("Error updating course status:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
          <Link
            to="/instructor/courses/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Course
          </Link>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Total Students</h3>
            <p className="text-3xl font-bold text-blue-600">{analytics.totalStudents}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">${analytics.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Average Rating</h3>
            <p className="text-3xl font-bold text-yellow-600">{analytics.averageRating.toFixed(1)}</p>
          </div>
        </div>

        {/* Courses List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Courses</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course._id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{course.description}</p>
                      <div className="mt-2 flex items-center space-x-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {course.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {course.enrolledStudents?.length || 0} students enrolled
                        </span>
                        <span className="text-sm text-gray-500">
                          ${course.price}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Link
                        to={`/instructor/courses/${course._id}/edit`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/instructor/courses/${course._id}/analytics`}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        Analytics
                      </Link>
                      <button
                        onClick={() => handleDeleteCourse(course._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handlePublishToggle(course._id, course.isPublished)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          course.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {course.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">You haven't created any courses yet.</p>
                <Link
                  to="/instructor/courses/create"
                  className="mt-4 inline-block text-blue-600 hover:text-blue-800"
                >
                  Create your first course
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard; 