import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";

export default function CourseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail: "",
    price: "",
    category: "programming",
    level: "beginner",
    sections: [{ title: "", lectures: [{ title: "", description: "", videoUrl: "", duration: "" }] }],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCourse = useCallback(async () => {
    if (!isEditing) return; // Don't fetch if creating new course
    
    try {
      const { data } = await api.get(`/courses/${id}`);
      setFormData(data);
    } catch (err) {
      setError("Failed to load course");
      console.error(err);
    }
  }, [id, isEditing]);

  useEffect(() => {
    if (isEditing) {
      fetchCourse();
    }
  }, [isEditing, fetchCourse]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSectionChange = (sectionIndex, field, value) => {
    setFormData((prev) => {
      const newSections = [...prev.sections];
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        [field]: value,
      };
      return { ...prev, sections: newSections };
    });
  };

  const handleLectureChange = (sectionIndex, lectureIndex, field, value) => {
    setFormData((prev) => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].lectures[lectureIndex] = {
        ...newSections[sectionIndex].lectures[lectureIndex],
        [field]: value,
      };
      return { ...prev, sections: newSections };
    });
  };

  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        { title: "", lectures: [{ title: "", description: "", videoUrl: "", duration: "" }] },
      ],
    }));
  };

  const removeSection = (sectionIndex) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, index) => index !== sectionIndex),
    }));
  };

  const addLecture = (sectionIndex) => {
    setFormData((prev) => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].lectures.push({
        title: "",
        description: "",
        videoUrl: "",
        duration: "",
      });
      return { ...prev, sections: newSections };
    });
  };

  const removeLecture = (sectionIndex, lectureIndex) => {
    setFormData((prev) => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].lectures = newSections[sectionIndex].lectures.filter(
        (_, index) => index !== lectureIndex
      );
      return { ...prev, sections: newSections };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isEditing) {
        await api.put(`/courses/${id}`, formData);
      } else {
        await api.post("/courses", formData);
      }
      navigate("/instructor/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save course");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? "Edit Course" : "Create New Course"}
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Course Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">
                Thumbnail URL
              </label>
              <input
                type="url"
                id="thumbnail"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter a URL for your course thumbnail image. Recommended size: 400x200 pixels.
                If no image is provided, a default image will be used.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price ($)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="programming">Programming</option>
                  <option value="design">Design</option>
                  <option value="business">Business</option>
                  <option value="marketing">Marketing</option>
                  <option value="music">Music</option>
                  <option value="photography">Photography</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                  Level
                </label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Course Content</h3>
              <button
                type="button"
                onClick={addSection}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Section
              </button>
            </div>

            {formData.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-900">Section {sectionIndex + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeSection(sectionIndex)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove Section
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Section Title</label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleSectionChange(sectionIndex, "title", e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-4">
                  {section.lectures.map((lecture, lectureIndex) => (
                    <div key={lectureIndex} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium text-gray-900">
                          Lecture {lectureIndex + 1}
                        </h5>
                        <button
                          type="button"
                          onClick={() => removeLecture(sectionIndex, lectureIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove Lecture
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                          type="text"
                          value={lecture.title}
                          onChange={(e) =>
                            handleLectureChange(sectionIndex, lectureIndex, "title", e.target.value)
                          }
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          value={lecture.description}
                          onChange={(e) =>
                            handleLectureChange(
                              sectionIndex,
                              lectureIndex,
                              "description",
                              e.target.value
                            )
                          }
                          required
                          rows={2}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Video URL</label>
                        <input
                          type="url"
                          value={lecture.videoUrl}
                          onChange={(e) =>
                            handleLectureChange(sectionIndex, lectureIndex, "videoUrl", e.target.value)
                          }
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          value={lecture.duration}
                          onChange={(e) =>
                            handleLectureChange(
                              sectionIndex,
                              lectureIndex,
                              "duration",
                              e.target.value
                            )
                          }
                          required
                          min="1"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addLecture(sectionIndex)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    Add Lecture
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/instructor/dashboard")}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? "Saving..." : isEditing ? "Update Course" : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 