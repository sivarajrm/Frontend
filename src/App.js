
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
import BackgroundVideo from "./components/BackgroundVideo";

// 🔥 GLOBAL LOADER
import GlobalLoader from "./components/GlobalLoader";
import useRouteLoader from "./hooks/useRouteLoader";

import AdminRoute from "./routes/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";


import "./styles/App.css";

// Initialize Builder.io
builder.init(process.env.REACT_APP_BUILDER_PUBLIC_KEY);

// ---------------- INTERNAL WRAPPER ----------------
function AppWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useIsAuthenticated();

  const { loading: routeLoading, progress } = useRouteLoader();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

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
    fetch("http://127.0.0.1:8000/api/test").catch(() =>
      console.warn("⚠ Backend offline")
    );
  }, []);

  // ==========================================================
  // 🔥 FORM SUBMIT HANDLER (CONNECTED TO LOADER)
  // ==========================================================
  const sendFormToBackend = async (cleanData, userId) => {
    setFormLoading(true);

    try {
      await fetch("http://127.0.0.1:8000/api/submit-health-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify(cleanData),
      });

      localStorage.setItem("healthFormFilled", "true");

      // 🔥 LET LOADER RENDER
      setTimeout(() => {
        navigate("/dashboard");
        setFormLoading(false);
      }, 1200);

    } catch (err) {
      setFormLoading(false);
      alert("❌ Error submitting data");
    }
  };

  

  return (
    <>
      {/* 🔥 GLOBAL ROUTE LOADER */}
      {(routeLoading || formLoading) && (
        <GlobalLoader progress={progress} />
      )}

      {/* ---------------- LAYOUT ---------------- */}
      <div
        className={`layout ${sidebarOpen ? "sidebar-open" : ""} ${
          isLoginPage ? "login-layout" : ""
        }`}
      >
        {/* Sidebar */}
        {isAuthenticated && !isLoginPage && !isHealthForm && (
          // <Sidebar open={sidebarOpen} />
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        )}

        {/* ---------------- MAIN CONTENT ---------------- */}
        <main
          className="app-content"
          style={{
            display: isHealthForm ? "flex" : "block",
            justifyContent: isHealthForm ? "center" : "flex-start",
          }}
        >
         <Routes>
  {/* ---------------- PUBLIC ---------------- */}
  <Route path="/login" element={<Login />} />
  <Route path="/auth/callback" element={<AuthCallback />} />

  {/* ---------------- PRIVATE ---------------- */}
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

  

  {/* ---------------- ADMIN (STEP-6) ---------------- */}
  <Route
    path="/admin"
    element={
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    }
  />

  {/* ---------------- FALLBACK ---------------- */}
  <Route path="*" element={<Login />} />
</Routes>
        </main>
      </div>

      {/* 🔥 FLOATING CHATBOT */}
      {isAuthenticated && <ChatBot embedded />}

      {/* Builder.io pages */}
      <BuilderComponent model="page" />
    </>
  );
}

// ---------------- ROOT APP ----------------
export default function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <Router>
        {/* 🎥 BACKGROUND VIDEO */}
        <BackgroundVideo />

        <AppWrapper />
      </Router>
    </MsalProvider>
  );
}
