import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import "../styles/dashboard.css";

export default function Dashboard({ sidebarOpen }) {
  const { instance } = useMsal();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   const account =
  instance.getActiveAccount() || instance.getAllAccounts()[0];

    if (!account) {
      console.warn("No active MSAL account found");
      return;
    }

    const userId = account.localAccountId;

    fetch(`http://127.0.0.1:8000/api/latest-health-record/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, [instance]);

  return (
    <div className={`dashboard-container ${sidebarOpen ? "shifted" : ""}`}>
      <h1>Health Overview</h1>
      <p className="subtitle">Latest recorded health metrics</p>

      {loading ? (
        <p>Loading...</p>
      ) : !data || data.message === "No records found" ? (
        <p>No health data found. Please submit your health form.</p>
      ) : (
        <div className="metrics-grid">

          <div className="metric-card">
            <h3>Blood Pressure</h3>
            <p>{data.bloodPressureSys}/{data.bloodPressureDia} mmHg</p>
          </div>

          <div className="metric-card">
            <h3>Heart Rate</h3>
            <p>{data.heartRate} bpm</p>
          </div>

          <div className="metric-card">
            <h3>Sleep Duration</h3>
            <p>{data.sleepHours} hrs</p>
          </div>

          <div className="metric-card">
            <h3>Water Intake</h3>
            <p>{data.waterIntake} L</p>
          </div>

          <div className="metric-card">
            <h3>Workout Time</h3>
            <p>{data.workoutMinutes} min</p>
          </div>

        </div>
      )}
    </div>
  );
}
