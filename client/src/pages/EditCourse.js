import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCourse, updateCourse } from "../api";
import { toast } from "react-toastify";

const EditCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    level: "beginner",
    thumbnail: "",
    sections: [
      {
        title: "",
        lectures: [
          {
            title: "",
            description: "",
            videoUrl: "",
            duration: "",
            isPreview: false,
          },
        ],
      },
    ],
  });

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const data = await getCourse(id);
      setFormData({
        ...data,
        price: data.price.toString(),
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching course:", error);
      toast.error("Failed to load course");
      navigate("/instructor/dashboard");
    }
  };

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
        {
          title: "",
          lectures: [
            {
              title: "",
              description: "",
              videoUrl: "",
              duration: "",
              isPreview: false,
            },
          ],
        },
      ],
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
        isPreview: false,
      });
      return { ...prev, sections: newSections };
    });
  };

  const removeSection = (sectionIndex) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, index) => index !== sectionIndex),
    }));
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

    try {
      // Convert price to number
      const courseData = {
        ...formData,
        price: parseFloat(formData.price),
      };

      await updateCourse(id, courseData);
      toast.success("Course updated successfully!");
      navigate("/instructor/dashboard");
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error(error.response?.data?.message || "Failed to update course");
    } finally {
      setLoading(false);
    }
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
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Edit Course
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Course Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Level
                      </label>
                      <select
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Thumbnail URL
                    </label>
                    <input
                      type="url"
                      name="thumbnail"
                      value={formData.thumbnail}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Course Content */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">
                    Course Content
                  </h2>
                  <button
                    type="button"
                    onClick={addSection}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Add Section
                  </button>
                </div>

                {formData.sections.map((section, sectionIndex) => (
                  <div
                    key={sectionIndex}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-md font-medium text-gray-900">
                        Section {sectionIndex + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeSection(sectionIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove Section
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Section Title
                      </label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) =>
                          handleSectionChange(sectionIndex, "title", e.target.value)
                        }
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-4">
                      {section.lectures.map((lecture, lectureIndex) => (
                        <div
                          key={lectureIndex}
                          className="border rounded-lg p-4 space-y-4"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium text-gray-900">
                              Lecture {lectureIndex + 1}
                            </h4>
                            <button
                              type="button"
                              onClick={() =>
                                removeLecture(sectionIndex, lectureIndex)
                              }
                              className="text-red-600 hover:text-red-800"
                            >
                              Remove Lecture
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Lecture Title
                              </label>
                              <input
                                type="text"
                                value={lecture.title}
                                onChange={(e) =>
                                  handleLectureChange(
                                    sectionIndex,
                                    lectureIndex,
                                    "title",
                                    e.target.value
                                  )
                                }
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Description
                              </label>
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
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Video URL
                              </label>
                              <input
                                type="url"
                                value={lecture.videoUrl}
                                onChange={(e) =>
                                  handleLectureChange(
                                    sectionIndex,
                                    lectureIndex,
                                    "videoUrl",
                                    e.target.value
                                  )
                                }
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
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
                                  min="0"
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                              </div>

                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={lecture.isPreview}
                                  onChange={(e) =>
                                    handleLectureChange(
                                      sectionIndex,
                                      lectureIndex,
                                      "isPreview",
                                      e.target.checked
                                    )
                                  }
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                  Preview Lecture
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addLecture(sectionIndex)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Add Lecture
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate("/instructor/dashboard")}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCourse; 