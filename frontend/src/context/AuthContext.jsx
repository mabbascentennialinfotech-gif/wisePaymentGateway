import React, { createContext, useState, useContext, useEffect } from "react";
import {
  login as loginApi,
  register as registerApi,
  getMe,
} from "../services/authApi";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await getMe();
      if (response.success) {
        setUser(response.data);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Error loading user:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await loginApi(email, password);
      if (response.success) {
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        toast.success("Login successful!");
        return true;
      } else {
        toast.error(response.error || "Login failed");
        return false;
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Login failed");
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await registerApi(name, email, password);
      if (response.success) {
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        toast.success("Registration successful!");
        return true;
      } else {
        toast.error(response.error || "Registration failed");
        return false;
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Registration failed");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.success("Logged out");
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
