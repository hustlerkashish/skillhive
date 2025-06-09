import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfile, updateUserProfile } from "../api";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const StudentProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    skillLevel: "",
    learningGoals: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getUserProfile();
      setProfile(data);
      setFormData({
        name: data.name,
        skillLevel: data.studentDetails?.skillLevel || "",
        learningGoals: data.studentDetails?.learningGoals?.join(", ") || "",
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        ...formData,
        learningGoals: formData.learningGoals.split(",").map((goal) => goal.trim()),
      };
      await updateUserProfile(updatedData);
      await fetchProfile();
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const formatWatchTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const calculateCourseProgress = (course) => {
    const totalLectures = course.sections.reduce(
      (acc, section) => acc + section.lectures.length,
      0
    );
    const completedLectures = course.progress.completedLectures.length;
    return Math.round((completedLectures / totalLectures) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="px-4 py-5 sm:px-6 bg-indigo-600 text-white">
            <div className="flex items-center space-x-4">
              <img
                src={profile?.profilePicture || "https://via.placeholder.com/150"}
                alt="Profile"
                className="h-20 w-20 rounded-full border-4 border-white"
              />
              <div>
                <h3 className="text-2xl font-bold">{profile?.name}</h3>
                <p className="text-indigo-100">Student</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-4 py-5 sm:p-6">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Skill Level
                  </label>
                  <select
                    value={formData.skillLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, skillLevel: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select skill level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Learning Goals (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.learningGoals}
                    onChange={(e) =>
                      setFormData({ ...formData, learningGoals: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium text-gray-900">
                    Profile Information
                  </h4>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Edit Profile
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">Name</h5>
                    <p className="mt-1 text-sm text-gray-900">{profile?.name}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">Email</h5>
                    <p className="mt-1 text-sm text-gray-900">{profile?.email}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">
                      Skill Level
                    </h5>
                    <p className="mt-1 text-sm text-gray-900">
                      {profile?.studentDetails?.skillLevel || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500">
                      Learning Goals
                    </h5>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {profile?.studentDetails?.learningGoals?.map(
                        (goal, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {goal}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Enrolled Courses Section */}
                <div className="mt-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Enrolled Courses
                  </h4>
                  {profile?.studentDetails?.enrolledCourses?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {profile.studentDetails.enrolledCourses.map((enrollment) => (
                        <div
                          key={enrollment.course._id}
                          className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                          <img
                            src={enrollment.course.thumbnail}
                            alt={enrollment.course.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-4">
                            <h5 className="font-medium text-gray-900">
                              {enrollment.course.title}
                            </h5>
                            <div className="mt-2 space-y-2">
                              <div className="flex justify-between text-sm text-gray-500">
                                <span>Progress</span>
                                <span>{calculateCourseProgress(enrollment)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-indigo-600 h-2 rounded-full"
                                  style={{
                                    width: `${calculateCourseProgress(
                                      enrollment
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-sm text-gray-500">
                                <span>Watch Time</span>
                                <span>
                                  {formatWatchTime(enrollment.progress.watchTime)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm text-gray-500">
                                <span>Last Accessed</span>
                                <span>
                                  {new Date(
                                    enrollment.progress.lastAccessed
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Link
                              to={`/courses/${enrollment.course._id}`}
                              className="mt-4 block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                              Continue Learning
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        You haven't enrolled in any courses yet.
                      </p>
                      <Link
                        to="/courses"
                        className="mt-4 inline-block px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Browse Courses
                      </Link>
                    </div>
                  )}
                </div>

                {/* Certificates Section */}
                {profile?.studentDetails?.certificates?.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      Certificates
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {profile.studentDetails.certificates.map((certificate) => (
                        <div
                          key={certificate._id}
                          className="bg-white border rounded-lg p-4 shadow-sm"
                        >
                          <h5 className="font-medium text-gray-900">
                            {certificate.course.title}
                          </h5>
                          <p className="text-sm text-gray-500 mt-1">
                            Issued on{" "}
                            {new Date(certificate.issuedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile; 