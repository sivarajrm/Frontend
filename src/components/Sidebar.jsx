import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { useState, useRef, useEffect } from "react";
import { isAdmin } from "../utils/isAdmin";


import "../styles/sidebar.css";

export default function Sidebar({ open, setOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { instance, accounts } = useMsal();

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // 🔐 Active user
  const user = accounts?.[0];
  const username = user?.name || "User";
  const userEmail = user?.username || "";

  // ✅ STEP-6 ADMIN CHECK
  const adminUser = isAdmin(userEmail);

  // Sidebar links (base)
  const links = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "/icons/dashboard.png",
    },
    {
      name: "AI Insights",
      path: "/insights",
      icon: "/icons/insights.png",
    },
    {
      name: "Analysis",
      path: "/analysis",
      icon: "/icons/analysis.png",
    },
  ];

  /* ---------- CLOSE PROFILE MENU ON OUTSIDE CLICK ---------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------- ACTION HANDLERS ---------- */

  const handleLogout = () => {
    instance.logoutRedirect();
  };

  const handleEditForm = () => {
    navigate("/health-form");
    setShowMenu(false);
  };

  const handleDownloadReport = () => {
    if (!user) {
      alert("Please login again");
      return;
    }

    const userId = user.localAccountId;
    window.open(
      `http://127.0.0.1:8000/api/generate-report-pdf/${userId}`,
      "_blank"
    );
    setShowMenu(false);
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete your account?"
    );
    if (!confirmDelete) return;

    try {
      await fetch(
        `http://127.0.0.1:8000/api/delete-account/${user.localAccountId}`,
        { method: "DELETE" }
      );
      instance.logoutRedirect();
    } catch {
      alert("Failed to delete account");
    }
  };

  return (
    <>
      {/* 🔥 SIDEBAR TOGGLE BUTTON */}
      <button
        className={`sidebar-toggle-btn ${open ? "open" : "closed"}`}
        onClick={() => setOpen((prev) => !prev)}
        title={open ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        {open ? "◀" : "▶"}
      </button>

      {/* 🔥 SIDEBAR */}
      <div className={`sidebar ${open ? "open" : "closed"}`}>
        
        {/* ---------- HEADER ---------- */}
        <div className="sidebar-header">
          <div className="sidebar-title">
            <img src="/logo2.png" alt="Logo" className="header-small-logo" />
            {open && <h4>Personalized Health System</h4>}
          </div>
        </div>

        {/* ---------- NAV LINKS ---------- */}
        <ul className="menu">
          {links.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={location.pathname === item.path ? "active" : ""}
              >
                <span className="menu-item-content">
                  <img src={item.icon} alt={item.name} className="menu-icon" />
                  {open && <span>{item.name}</span>}
                </span>
              </Link>
            </li>
          ))}

          {/* ✅ ADMIN PANEL (STEP-6) */}
          {adminUser && (
            <li>
              <Link
                to="/admin"
                className={location.pathname === "/admin" ? "active" : ""}
              >
                <span className="menu-item-content">
                  <img
                    src="/icons/admin.png"
                    alt="Admin"
                    className="menu-icon"
                  />
                  {open && <span>Admin Panel</span>}
                </span>
              </Link>
            </li>
          )}
        </ul>

        {/* ---------- USER FOOTER ---------- */}
        <div className="sidebar-user" ref={menuRef}>
          
          {/* PROFILE ACTION MENU */}
          <div className={`profile-actions ${showMenu ? "show" : ""}`}>
            <div onClick={handleEditForm}>
              <img src="/icons/edit.png" alt="Edit" />
              <span>Edit Form</span>
            </div>

            <div onClick={handleDownloadReport}>
              <img src="/icons/download.png" alt="Download" />
              <span>Download Report</span>
            </div>

            <div onClick={handleLogout}>
              <img src="/icons/logout.png" alt="Logout" />
              <span>Logout</span>
            </div>

            {/* <div className="danger" onClick={handleDeleteAccount}>
              <img src="/icons/delete.png" alt="Delete" />
              <span>Delete Account</span>
            </div> */}
          </div> 

          {/* USER ROW */}
          <div className="user-row">
            <button
              className="user-avatar-btn"
              onClick={() => setShowMenu((prev) => !prev)}
            >
              <img src="/user-avatar.png" alt="User" />
            </button>

            {open && (
              <div className="user-text">
                <div className="user-name">{username}</div>
                <div className="user-email">{userEmail}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


