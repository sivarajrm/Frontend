import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";

export default function Profile({ sidebarOpen }) {
  const { instance } = useMsal();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [latestRecord, setLatestRecord] = useState(null);

  // ---------------- LOAD USER + HEALTH DATA ----------------
  useEffect(() => {
    const account = instance.getActiveAccount();
    if (!account) return;

    const userId = account.localAccountId;

    setUser({
      name: account.name,
      email: account.username,
      azureId: userId,
    });

    fetch(`http://127.0.0.1:8000/api/latest-health-record/${userId}`)
      .then((res) => res.json())
      .then((data) => setLatestRecord(data))
      .catch((err) => console.error("Profile fetch error:", err));
  }, [instance]);

  // ---------------- DOWNLOAD PDF REPORT ----------------
  const downloadReport = async () => {
    try {
      const account = instance.getActiveAccount();
      if (!account) {
        alert("Login required");
        return;
      }

      const userId = account.localAccountId;

      const res = await fetch(
        `http://127.0.0.1:8000/api/generate-report-pdf/${userId}`
      );

      if (!res.ok) {
        alert("Failed to generate report");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "Medical_Health_Report.pdf";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Error downloading report");
    }
  };

  // ---------------- DELETE ACCOUNT ----------------
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "⚠ Are you sure? Your account and all health data will be permanently deleted."
    );
    if (!confirmDelete) return;

    const account = instance.getActiveAccount();
    if (!account) return;

    const userId = account.localAccountId;

    await fetch(`http://127.0.0.1:8000/api/delete-account/${userId}`, {
      method: "DELETE",
    });

    await instance.logoutPopup();
    localStorage.clear();
    navigate("/login");
  };

  if (!user) return <p className="center-text">Loading Profile...</p>;

  return (
    <div className={`profile-container ${sidebarOpen ? "shifted" : ""}`}>
      <h1 className="profile-title">User Profile</h1>
      <p className="profile-subtitle">
        Your personal information & health preferences
      </p>

      <div className="profile-card">
        <div className="info-row">
          <span className="info-label">Name</span>
          <span className="info-value">{user.name}</span>
        </div>

        <div className="info-row">
          <span className="info-label">Email</span>
          <span className="info-value email">{user.email}</span>
        </div>

        <div className="info-row">
          <span className="info-label">Age</span>
          <span className="info-value">
            {latestRecord?.age || "Not submitted"}
          </span>
        </div>

        <div className="info-row">
          <span className="info-label">Gender</span>
          <span className="info-value">
            {latestRecord?.gender || "Not submitted"}
          </span>
        </div>

        {/* -------- ACTION BUTTONS -------- */}
        <button
          className="edit-link"
          onClick={() =>
            navigate("/health-form", {
              state: { editMode: true, latestForm: latestRecord },
            })
          }
        >
          ✏️ Edit Health Form
        </button>

        <button className="download-btn" onClick={downloadReport}>
          📄 Download Medical Report
        </button>

        <button className="delete-btn" onClick={handleDelete}>
          ❌ Delete Account
        </button>
      </div>
    </div>
  );
}
