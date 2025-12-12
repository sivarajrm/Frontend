import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import "../styles/insights.css";

export default function Insights({ sidebarOpen }) {
  const { instance } = useMsal();
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const account = instance.getActiveAccount();
    if (!account) {
      console.warn("No active user found");
      return;
    }

    const userId = account.localAccountId;

    fetch(`http://127.0.0.1:8000/api/latest-insight/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setInsight(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Insight fetch error:", err);
        setLoading(false);
      });
  }, [instance]);

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading insights...</p>;
  }

  if (!insight || insight.message === "No insights yet") {
    return <p style={{ textAlign: "center" }}>No AI insights available yet.</p>;
  }

  // Convert comma-separated strings to array safely
  const toList = (value) =>
    typeof value === "string"
      ? value.split(/[,|\n|-]/).filter((x) => x.trim() !== "")
      : [];

  return (
    <div className={`insight-container ${sidebarOpen ? "shifted" : "full"}`}>
      <h1>AI Health Insights</h1>
      <p className="subtitle">Personalized recommendations based on your health data</p>

      <div className="insight-wrapper">

        {/* Summary */}
        <div className="insight-card">
          <h3>Summary</h3>
          <p>{insight.summary}</p>
        </div>

        {/* Risk Level */}
        <div className="insight-card">
          <h3>Risk Level</h3>
          <p className={`risk ${insight.risk_level?.toLowerCase()}`}>
            {insight.risk_level}
          </p>
        </div>

        {/* Diet */}
        <div className="insight-card">
          <h3>Recommended Diet</h3>
          <ul>
            {toList(insight.diet).map((item, i) => (
              <li key={i}>{item.trim()}</li>
            ))}
          </ul>
        </div>

        {/* Fitness */}
        <div className="insight-card">
          <h3>Fitness Guidance</h3>
          <ul>
            {toList(insight.fitness).map((item, i) => (
              <li key={i}>{item.trim()}</li>
            ))}
          </ul>
        </div>

        {/* Goals */}
        <div className="insight-card">
          <h3>Health Goals</h3>
          <ul>
            {toList(insight.goals).map((item, i) => (
              <li key={i}>{item.trim()}</li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
