import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import "../styles/insights.css";

export default function Insights({ sidebarOpen }) {
  const { instance } = useMsal();
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const account = instance.getActiveAccount();
    if (!account) return;

    const userId = account.localAccountId;

    fetch(`http://127.0.0.1:8000/api/latest-insight/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setInsight(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [instance]);

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading insights...</p>;
  }

  if (!insight || insight.message === "No insights yet") {
    return <p style={{ textAlign: "center" }}>No AI insights available yet.</p>;
  }

  /* 🔥 CLEAN + CONVERT TO BULLET POINTS */
  const toPoints = (text) => {
    if (!text) return [];

    return text
      .replace(/\*\*(.*?)\*\*/g, "$1")   // remove **bold**
      .replace(/[-•]/g, "")               // remove bullets/dashes
      .replace(/\n+/g, " ")               // remove line breaks
      .replace(/\s+/g, " ")               // normalize spaces
      .split(". ")                        // split sentences
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  };

  /* 🔹 Reusable Bullet Renderer */
  const BulletList = ({ text }) => {
    const points = toPoints(text);
    return (
      <ul className="insight-points">
        {points.map((p, i) => (
          <li key={i}>{p.endsWith(".") ? p : p + "."}</li>
        ))}
      </ul>
    );
  };

  return (
    <div className={`insight-container ${sidebarOpen ? "shifted" : "full"}`}>
      <h1>AI Health Insights</h1>
      <p className="subtitle">
        Personalized recommendations based on your health data
      </p>

      <div className="insight-wrapper">

        {/* Summary */}
        <div className="insight-card">
          <h3>Summary</h3>
          <BulletList text={insight.summary} />
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
          <BulletList text={insight.diet} />
        </div>

        {/* Fitness */}
        <div className="insight-card">
          <h3>Fitness Guidance</h3>
          <BulletList text={insight.fitness} />
        </div>

        {/* Goals */}
        <div className="insight-card">
          <h3>Health Goals</h3>
          <BulletList text={insight.goals} />
        </div>

      </div>
    </div>
  );
}
