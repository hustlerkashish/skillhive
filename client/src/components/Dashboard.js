import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../api';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!user) {
          setLoading(false);
          return;
        }
        const response = await getUserProfile();
        setUserData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user data.");
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  if (!userData) {
    return <div className="text-gray-500">No user data found. Please log in.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {userData.name}!</p>
      <p>Email: {userData.email}</p>
      <p>Account Type: {userData.accountType}</p>
      {/* Add more dashboard content based on accountType */}
      {userData.accountType === "student" && (
        <div>
          <h2 className="text-xl font-semibold mt-4">Student Details</h2>
          <p>Skill Level: {userData.studentDetails?.skillLevel}</p>
          <p>Learning Goals: {userData.studentDetails?.learningGoals.join(", ")}</p>
          {/* Display enrolled courses here */}
          <h3 className="text-lg font-semibold mt-4">Enrolled Courses</h3>
          {userData.studentDetails?.enrolledCourses.length > 0 ? (
            <ul>
              {userData.studentDetails.enrolledCourses.map((enrollment) => (
                <li key={enrollment.course._id} className="mt-2 p-2 border rounded">
                  <p className="font-medium">{enrollment.course.title}</p>
                  <p className="text-sm text-gray-600">Progress: {enrollment.progress}%</p>
                  <p className="text-sm text-gray-600">Last Accessed: {new Date(enrollment.lastAccessed).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>You are not enrolled in any courses yet.</p>
          )}
        </div>
      )}

      {userData.accountType === "instructor" && (
        <div>
          <h2 className="text-xl font-semibold mt-4">Instructor Details</h2>
          <p>Title: {userData.instructorDetails?.title}</p>
          <p>Years of Experience: {userData.instructorDetails?.yearsOfExperience}</p>
          <p>Areas of Expertise: {userData.instructorDetails?.areasOfExpertise.join(", ")}</p>
          {/* Add link to instructor dashboard */}
          <button 
            onClick={() => navigate('/instructor/dashboard')}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Instructor Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 