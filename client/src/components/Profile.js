import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile as updateUserApiProfile, uploadProfilePicture } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    profilePicture: '',
    bio: '',
    // Student specific fields
    collegeName: '',
    course: '',
    semester: '',
    enrollmentNumber: '',
    learningGoals: [],
    skillLevel: 'beginner',
    // Instructor specific fields
    title: '',
    yearsOfExperience: '',
    areasOfExpertise: [],
    certifications: [],
    teachingStyle: '',
    availability: '',
  });
  const [newGoal, setNewGoal] = useState('');
  const [newExpertise, setNewExpertise] = useState('');
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuer: '',
    date: '',
    url: '',
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await getUserProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        profilePicture: data.profilePicture || '',
        bio: data.bio || '',
        collegeName: data.studentDetails?.collegeName || '',
        course: data.studentDetails?.course || '',
        semester: data.studentDetails?.semester || '',
        enrollmentNumber: data.studentDetails?.enrollmentNumber || '',
        learningGoals: data.studentDetails?.learningGoals || [],
        skillLevel: data.studentDetails?.skillLevel || 'beginner',
        title: data.instructorDetails?.title || '',
        yearsOfExperience: data.instructorDetails?.yearsOfExperience || '',
        areasOfExpertise: data.instructorDetails?.areasOfExpertise || [],
        certifications: data.instructorDetails?.certifications || [],
        teachingStyle: data.instructorDetails?.teachingStyle || '',
        availability: data.instructorDetails?.availability || '',
      });
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayItemAdd = (field, value, setValue) => {
    if (!value.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], value.trim()],
    }));
    setValue('');
  };

  const handleArrayItemRemove = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleCertificationAdd = () => {
    if (!newCertification.name || !newCertification.issuer) return;
    setFormData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, { ...newCertification }],
    }));
    setNewCertification({
      name: '',
      issuer: '',
      date: '',
      url: '',
    });
  };

  const handleCertificationRemove = (index) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const profileData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        profilePicture: formData.profilePicture,
        bio: formData.bio,
      };

      if (profile.accountType === "student") {
        profileData.studentDetails = {
          collegeName: formData.collegeName,
          course: formData.course,
          semester: formData.semester,
          enrollmentNumber: formData.enrollmentNumber,
          learningGoals: formData.learningGoals,
          skillLevel: formData.skillLevel,
        };
      } else if (profile.accountType === "instructor") {
        profileData.instructorDetails = {
          title: formData.title,
          yearsOfExperience: formData.yearsOfExperience,
          areasOfExpertise: formData.areasOfExpertise,
          certifications: formData.certifications,
          teachingStyle: formData.teachingStyle,
          availability: formData.availability,
        };
      }

      const { data } = await updateUserApiProfile(profileData);
      setProfile(data);
      updateUserProfile(data);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const { data } = await uploadProfilePicture(formData);
      setFormData(prev => ({
        ...prev,
        profilePicture: data.profilePicture
      }));
      
      updateUserProfile({
        ...user,
        profilePicture: data.profilePicture
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Profile Not Found</h2>
          <p className="text-gray-600">Please log in to view your profile.</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={profile.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-2xl text-gray-500">
                      {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                    </span>
                  </div>
                )}
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                    {uploadingPhoto ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </label>
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{profile.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{profile.accountType}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              {profile.accountType === "instructor" && (
                <button
                  onClick={() => navigate("/instructor/courses/create")}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Create Course
                </button>
              )}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700">
            {error}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            {/* Common Fields */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Basic Information</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">
                    Profile Picture URL
                  </label>
                  <input
                    type="url"
                    id="profilePicture"
                    name="profilePicture"
                    value={formData.profilePicture}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Student Specific Fields */}
            {profile.accountType === "student" && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Student Information</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="collegeName" className="block text-sm font-medium text-gray-700">
                      College Name
                    </label>
                    <input
                      type="text"
                      id="collegeName"
                      name="collegeName"
                      value={formData.collegeName}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                      Course
                    </label>
                    <input
                      type="text"
                      id="course"
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
                      Semester
                    </label>
                    <input
                      type="text"
                      id="semester"
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="enrollmentNumber" className="block text-sm font-medium text-gray-700">
                      Enrollment Number
                    </label>
                    <input
                      type="text"
                      id="enrollmentNumber"
                      name="enrollmentNumber"
                      value={formData.enrollmentNumber}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="skillLevel" className="block text-sm font-medium text-gray-700">
                    Skill Level
                  </label>
                  <select
                    id="skillLevel"
                    name="skillLevel"
                    value={formData.skillLevel}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Learning Goals</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <input
                      type="text"
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      placeholder="Add a learning goal"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleArrayItemAdd("learningGoals", newGoal, setNewGoal)}
                      className="px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.learningGoals.map((goal, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {goal}
                        <button
                          type="button"
                          onClick={() => handleArrayItemRemove("learningGoals", index)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Instructor Specific Fields */}
            {profile.accountType === "instructor" && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Instructor Information</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      id="yearsOfExperience"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      min="0"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Areas of Expertise</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <input
                      type="text"
                      value={newExpertise}
                      onChange={(e) => setNewExpertise(e.target.value)}
                      placeholder="Add an area of expertise"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleArrayItemAdd("areasOfExpertise", newExpertise, setNewExpertise)}
                      className="px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.areasOfExpertise.map((expertise, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {expertise}
                        <button
                          type="button"
                          onClick={() => handleArrayItemRemove("areasOfExpertise", index)}
                          className="ml-1 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Certifications</label>
                  <div className="mt-1 space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <input
                        type="text"
                        value={newCertification.name}
                        onChange={(e) =>
                          setNewCertification((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="Certification Name"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={newCertification.issuer}
                        onChange={(e) =>
                          setNewCertification((prev) => ({ ...prev, issuer: e.target.value }))
                        }
                        placeholder="Issuing Organization"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <input
                        type="date"
                        value={newCertification.date}
                        onChange={(e) =>
                          setNewCertification((prev) => ({ ...prev, date: e.target.value }))
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <input
                        type="url"
                        value={newCertification.url}
                        onChange={(e) =>
                          setNewCertification((prev) => ({ ...prev, url: e.target.value }))
                        }
                        placeholder="Certificate URL"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleCertificationAdd}
                      className="px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Add Certification
                    </button>
                  </div>
                  <div className="mt-4 space-y-2">
                    {formData.certifications.map((cert, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="font-medium">{cert.name}</p>
                          <p className="text-sm text-gray-500">
                            {cert.issuer} • {new Date(cert.date).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCertificationRemove(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="teachingStyle" className="block text-sm font-medium text-gray-700">
                    Teaching Style
                  </label>
                  <textarea
                    id="teachingStyle"
                    name="teachingStyle"
                    value={formData.teachingStyle}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                    Availability
                  </label>
                  <textarea
                    id="availability"
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 sm:p-6 space-y-6">
            {/* View Mode */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Basic Information</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="mt-1 text-sm text-gray-900">{profile.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
                </div>
                {profile.phoneNumber && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone Number</p>
                    <p className="mt-1 text-sm text-gray-900">{profile.phoneNumber}</p>
                  </div>
                )}
              </div>
              {profile.bio && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Bio</p>
                  <p className="mt-1 text-sm text-gray-900">{profile.bio}</p>
                </div>
              )}
            </div>

            {/* Student View */}
            {profile.accountType === "student" && profile.studentDetails && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Student Information</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {profile.studentDetails.collegeName && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">College</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {profile.studentDetails.collegeName}
                      </p>
                    </div>
                  )}
                  {profile.studentDetails.course && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Course</p>
                      <p className="mt-1 text-sm text-gray-900">{profile.studentDetails.course}</p>
                    </div>
                  )}
                  {profile.studentDetails.semester && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Semester</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {profile.studentDetails.semester}
                      </p>
                    </div>
                  )}
                  {profile.studentDetails.enrollmentNumber && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Enrollment Number</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {profile.studentDetails.enrollmentNumber}
                      </p>
                    </div>
                  )}
                </div>

                {profile.studentDetails.learningGoals?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Learning Goals</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile.studentDetails.learningGoals.map((goal, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.studentDetails.skillLevel && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Skill Level</p>
                    <p className="mt-1 text-sm text-gray-900 capitalize">
                      {profile.studentDetails.skillLevel}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Instructor View */}
            {profile.accountType === "instructor" && profile.instructorDetails && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Instructor Information</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {profile.instructorDetails.title && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Title</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {profile.instructorDetails.title}
                      </p>
                    </div>
                  )}
                  {profile.instructorDetails.yearsOfExperience && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Years of Experience</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {profile.instructorDetails.yearsOfExperience}
                      </p>
                    </div>
                  )}
                </div>

                {profile.instructorDetails.areasOfExpertise?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Areas of Expertise</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile.instructorDetails.areasOfExpertise.map((expertise, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {expertise}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.instructorDetails.certifications?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Certifications</p>
                    <div className="mt-2 space-y-2">
                      {profile.instructorDetails.certifications.map((cert, index) => (
                        <div key={index} className="text-sm">
                          <p className="font-medium text-gray-900">{cert.name}</p>
                          <p className="text-gray-500">
                            {cert.issuer} • {new Date(cert.date).toLocaleDateString()}
                          </p>
                          {cert.url && (
                            <a
                              href={cert.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              View Certificate
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {profile.instructorDetails.teachingStyle && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Teaching Style</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {profile.instructorDetails.teachingStyle}
                    </p>
                  </div>
                )}

                {profile.instructorDetails.availability && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Availability</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {profile.instructorDetails.availability}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 