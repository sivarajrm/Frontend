import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import Plot from "react-plotly.js";
import "../styles/analysis.css";

export default function Analysis({ sidebarOpen }) {
  const { instance } = useMsal();
  const [records, setRecords] = useState([]);

  // Fetch user-specific records
  useEffect(() => {
    const account = instance.getActiveAccount();
    if (!account) {
      console.warn("No active MSAL account found");
      return;
    }

    const userId = account.localAccountId;

    fetch(`http://127.0.0.1:8000/api/all-records/${userId}`)
      .then((res) => res.json())
      .then((data) => setRecords(data))
      .catch((err) => console.error("Error loading analysis:", err));
  }, [instance]);

  if (!records.length)
    return <p style={{ textAlign: "center", marginTop: "50px" }}>No health data found. Please submit your health form.</p>;

  // Extract chart data
  const dates = records.map((r) =>
    new Date(r.created_at).toLocaleDateString()
  );
  const bpSys = records.map((r) => r.bloodPressureSys);
  const bpDia = records.map((r) => r.bloodPressureDia);
  const heartRate = records.map((r) => r.heartRate);
  const sleep = records.map((r) => r.sleepHours);

  return (
    <div className={`analysis-container ${sidebarOpen ? "shifted" : "full"}`}>

      <h1>Health Progress Analysis</h1>
      <p className="subtitle">Hover over charts for insights</p>

      <div className="chart-grid">

        {/* BLOOD PRESSURE TREND */}
        <div className="chart-card">
          <h3>Blood Pressure Trend</h3>
          <Plot
            data={[
              {
                x: dates,
                y: bpSys,
                type: "scatter",
                mode: "lines+markers",
                name: "Systolic",
              },
              {
                x: dates,
                y: bpDia,
                type: "scatter",
                mode: "lines+markers",
                name: "Diastolic",
              },
            ]}
            layout={{
              hovermode: "closest",
              paper_bgcolor: "white",
              plot_bgcolor: "white",
            }}
            className="chart"
          />
          <p className="desc">
            Shows variation in BP readings over time. Larger swings may indicate stress or cardiovascular strain.
          </p>
        </div>

        {/* HEART RATE BAR CHART */}
        <div className="chart-card">
          <h3>Heart Rate Comparison</h3>
          <Plot
            data={[
              { x: dates, y: heartRate, type: "bar", name: "Heart Rate" },
            ]}
            layout={{
              hovermode: "closest",
              paper_bgcolor: "white",
              plot_bgcolor: "white",
            }}
            className="chart"
          />
          <p className="desc">
            Tracks your heart rate patterns to highlight good fitness or stress levels.
          </p>
        </div>

        {/* SLEEP PIE CHART */}
        <div className="chart-card">
          <h3>Sleep Balance Overview</h3>
          <Plot
            data={[
              {
                values: sleep,
                labels: dates,
                type: "pie",
                hoverinfo: "label+percent",
                textinfo: "value",
              },
            ]}
            layout={{
              paper_bgcolor: "white",
              plot_bgcolor: "white",
            }}
            className="chart"
          />
          <p className="desc">
            Visualizes your sleep duration distribution across all logged days.
          </p>
        </div>

      </div>
    </div>
  );
}
