import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login, register, getUserProfile } from "../api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const { data } = await getUserProfile();
          setUser(data);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const handleLogin = async (email, password) => {
    try {
      console.log("Attempting login for:", email);
      const response = await login({ email, password });
      const { user, token } = response.data;
      
      console.log("Login successful, storing data");
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      
      console.log("Redirecting to dashboard");
      // Redirect to appropriate dashboard based on account type
      const redirectPath = user.accountType === 'instructor' ? '/instructor/dashboard' : '/student/dashboard';
      navigate(redirectPath, { 
        state: { message: "Welcome back to SkillHive!" }
      });
      
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || "Login failed";
      const errorDetails = error.response?.data?.details;
      
      return {
        success: false,
        error: errorMessage,
        details: errorDetails
      };
    }
  };

  const handleSignup = async (userData) => {
    try {
      const response = await register(userData);
      const { user, token } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      
      // Redirect to appropriate dashboard based on account type
      const redirectPath = user.accountType === 'instructor' ? '/instructor/dashboard' : '/student/dashboard';
      navigate(redirectPath, { 
        state: { message: "Account created successfully! Welcome to SkillHive." }
      });
      
      return { success: true };
    } catch (error) {
      console.error("Signup error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Signup failed",
      };
    }
  };

  const handleLogout = () => {
    // Clear local storage and state
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    // Force full page reload to clear all React state and redirect to login
    window.location.href = "/login"; 
  };

  const value = {
    user,
    loading,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 