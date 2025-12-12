import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import "../styles/sidebar.css";

export default function Sidebar({ open }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { instance } = useMsal();

  const links = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Profile", path: "/profile" },
    { name: "AI Insights", path: "/insights" },
    { name: "Analysis", path: "/analysis" },
    { name: "AI Chatbot", path: "/chatbot" },
  ];

  // ----------------- LOGOUT HANDLER -----------------
  const handleLogout = () => {
    instance.logoutPopup().then(() => {
      localStorage.clear();
      sessionStorage.clear();
      navigate("/login");
    });
  };

  return (
    <div className={`sidebar ${open ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <h2>Health+</h2>
      </div>

      <ul className="menu">
        {links.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={location.pathname === item.path ? "active" : ""}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>

      {/* ---------------- Logout Button at Bottom ---------------- */}
      <button
        onClick={handleLogout}
        className="logout-btn"
        style={{
          marginTop: "auto",
          marginBottom: "20px",
          width: "85%",
          padding: "12px",
          background: "#ff4d4d",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "600",
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        Logout
      </button>
    </div>
  );
}
