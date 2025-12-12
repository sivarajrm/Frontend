// ---------------- IMPORTS ----------------
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { MsalProvider, useIsAuthenticated } from "@azure/msal-react";
import { BuilderComponent, builder } from "@builder.io/react";

import { msalInstance } from "./auth/msalConfig";
import ProtectedRoute from "./auth/ProtectedRoute";
import AuthCallback from "./pages/AuthCallback";

import Login from "./pages/Login";
import SubmitForm from "./pages/SubmitForm";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
import Profile from "./pages/Profile";
import Analysis from "./pages/Analysis";
import ChatBot from "./pages/ChatBot";

import Sidebar from "./components/Sidebar";
import "./styles/App.css";

// Initialize Builder.io
builder.init(process.env.REACT_APP_BUILDER_PUBLIC_KEY);

// ---------------- INTERNAL WRAPPER ----------------
function AppWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useIsAuthenticated();

  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentPath = location.pathname;
  const isLoginPage = currentPath.startsWith("/login");
  const isHealthForm = currentPath === "/health-form";

  // ---------------- AUTO REDIRECT RULE ----------------
  useEffect(() => {
    if (isAuthenticated && currentPath === "/login") {
      const hasFormData = localStorage.getItem("healthFormFilled");
      navigate(hasFormData ? "/dashboard" : "/health-form");
    }
  }, [isAuthenticated, currentPath, navigate]);

  // ---------------- BACKEND CONNECTIVITY CHECK ----------------
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/test")
      .then((res) => res.json())
      .catch(() => console.warn("⚠ Backend offline"));
  }, []);

  // ---------------- FORM SUBMIT HANDLER ----------------
  const sendFormToBackend = async (formData) => {
    setLoading(true);
    try {
      await fetch("http://127.0.0.1:8000/api/submit-health-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      alert("✔ Form Submitted Successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("❌ Error sending data.");
    }
    setLoading(false);
  };

  return (
    <>
      {/* HEADER (hidden on login page) */}
      {isAuthenticated && !isLoginPage && (
        <header className="app-header">
          {!isHealthForm && (
            <button
              className="menu-button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
          )}

          <div className="header-right">
            <img
              src="/logo2.png"
              alt="Logo"
              className="header-small-logo"
            />
            <h2>Personalized Health System</h2>
          </div>
        </header>
      )}

      {/* MAIN PAGE LAYOUT */}
      <div
        className={`layout ${sidebarOpen ? "sidebar-open" : ""} ${
          isLoginPage ? "login-layout" : ""
        }`}
      >

        {/* Sidebar hidden on login & health form */}
        {isAuthenticated && !isLoginPage && !isHealthForm && (
          <Sidebar open={sidebarOpen} />
        )}

        {/* MAIN CONTENT */}
        <main
          className="app-content"
          style={{
            display: isHealthForm ? "flex" : "block",
            justifyContent: isHealthForm ? "center" : "flex-start",
          }}
        >
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Private Routes */}
            <Route
              path="/health-form"
              element={
                <ProtectedRoute>
                  <SubmitForm onSubmit={sendFormToBackend} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/insights"
              element={
                <ProtectedRoute>
                  <Insights />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/analysis"
              element={
                <ProtectedRoute>
                  <Analysis />
                </ProtectedRoute>
              }
            />

            <Route
              path="/chatbot"
              element={
                <ProtectedRoute>
                  <ChatBot />
                </ProtectedRoute>
              }
            />

            {/* fallback */}
            <Route path="*" element={<Login />} />
          </Routes>
        </main>
      </div>

      {/* Builder.io dynamic pages */}
      <BuilderComponent model="page" />

      {/* Loader */}
      {loading && (
        <p style={{ textAlign: "center", padding: "10px", color: "orange" }}>
          ⏳ Sending data...
        </p>
      )}
    </>
  );
}

// ---------------- ROOT APP ----------------
export default function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <Router>
        <AppWrapper />
      </Router>
    </MsalProvider>
  );
}
