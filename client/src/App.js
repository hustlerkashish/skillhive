import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./components/Profile";
import CourseList from "./pages/CourseList";
import CourseDetail from "./pages/CourseDetail";
import CourseForm from "./components/CourseForm";
import InstructorDashboard from "./pages/InstructorDashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CreateCourse from "./pages/CreateCourse";
import EditCourse from "./pages/EditCourse";
import CourseAnalytics from "./pages/CourseAnalytics";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StudentDashboard from "./pages/StudentDashboard";
import StudentProfile from "./pages/StudentProfile";

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Signup />} />
            <Route path="courses" element={<CourseList />} />
            <Route path="courses/:id" element={<CourseDetail />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route
              path="profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="student/dashboard"
              element={
                <PrivateRoute accountType="student">
                  <StudentDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="student/profile"
              element={
                <PrivateRoute accountType="student">
                  <StudentProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="instructor/dashboard"
              element={
                <PrivateRoute accountType="instructor">
                  <InstructorDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="instructor/courses/create"
              element={
                <PrivateRoute accountType="instructor">
                  <CreateCourse />
                </PrivateRoute>
              }
            />
            <Route
              path="instructor/courses/:id/edit"
              element={
                <PrivateRoute accountType="instructor">
                  <EditCourse />
                </PrivateRoute>
              }
            />
            <Route
              path="instructor/courses/:id/analytics"
              element={
                <PrivateRoute accountType="instructor">
                  <CourseAnalytics />
                </PrivateRoute>
              }
            />
            <Route
              path="courses/create"
              element={
                <PrivateRoute>
                  <CourseForm />
                </PrivateRoute>
              }
            />
            <Route
              path="courses/:id/edit"
              element={
                <PrivateRoute>
                  <CourseForm />
                </PrivateRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
