import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCourseAnalytics } from '../api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  Title,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  Title,
  PointElement,
  LineElement
);

function CourseAnalytics() {
  const { id } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await getCourseAnalytics(id);
        setAnalytics(response.data);
      } catch (err) {
        console.error('Error fetching course analytics:', err);
        setError(err.response?.data?.message || 'Failed to load course analytics.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAnalytics();
    } else {
      setError('Course ID is missing.');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Loading course analytics...</p>
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

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <p className="text-gray-600 text-center">No analytics data available for this course.</p>
      </div>
    );
  }

  // Sample data for charts (replace with real data from analytics object)
  const studentEnrollmentData = {
    labels: ['Enrolled Students'],
    datasets: [{
      label: 'Number of Students',
      data: [analytics.totalEnrolledStudents],
      backgroundColor: ['rgba(59, 130, 246, 0.6)'], // blue-500
      borderColor: ['rgba(59, 130, 246, 1)'],
      borderWidth: 1,
    }],
  };

  const lectureViewsData = {
    labels: ['Total Views'],
    datasets: [{
      label: 'Total Lecture Views',
      data: [analytics.totalLectureViews],
      backgroundColor: ['rgba(16, 185, 129, 0.6)'], // green-500
      borderColor: ['rgba(16, 185, 129, 1)'],
      borderWidth: 1,
    }],
  };

  const completionRateData = {
    labels: ['Completed', 'In Progress'],
    datasets: [{
      data: [analytics.completionRate, 100 - analytics.completionRate],
      backgroundColor: ['rgba(251, 191, 36, 0.6)', 'rgba(209, 213, 219, 0.6)'], // yellow-500, gray-300
      borderColor: ['rgba(251, 191, 36, 1)', 'rgba(209, 213, 219, 1)'],
      borderWidth: 1,
    }],
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Course Analytics: {analytics.courseTitle}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-blue-800">Total Enrolled Students</h3>
            <p className="text-4xl font-bold text-blue-600 mt-2">{analytics.totalEnrolledStudents}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-green-800">Total Lectures</h3>
            <p className="text-4xl font-bold text-green-600 mt-2">{analytics.totalLectures}</p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-yellow-800">Total Duration (Minutes)</h3>
            <p className="text-4xl font-bold text-yellow-600 mt-2">{analytics.totalDuration.toFixed(0)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Student Enrollment</h3>
            <Bar data={studentEnrollmentData} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Lecture Views</h3>
            <Bar data={lectureViewsData} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Completion Rate</h3>
            <Doughnut data={completionRateData} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Average Watch Time (per view)</h3>
            <p className="text-4xl font-bold text-purple-600 mt-2">{analytics.overallAverageWatchTime.toFixed(1)} min</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseAnalytics; 