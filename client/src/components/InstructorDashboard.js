import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInstructorCourses, getInstructorAnalytics } from '../services/api';

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, analyticsRes] = await Promise.all([
        getInstructorCourses(),
        getInstructorAnalytics(),
      ]);
      setCourses(coursesRes.data);
      setAnalytics(analyticsRes.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      
      // Handle specific error cases
      if (err.response?.status === 403) {
        setError("Access denied. You must be an instructor to view this page.");
        // Redirect to home page after a delay
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else if (err.response?.status === 401) {
        setError("Please log in to access this page.");
        // Redirect to login page after a delay
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError("Failed to fetch dashboard data. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default InstructorDashboard; 