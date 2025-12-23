// import { useEffect, useState } from "react";
// import { useMsal } from "@azure/msal-react";
// import Plot from "react-plotly.js";
// import "../styles/analysis.css";

// export default function Analysis({ sidebarOpen }) {
//   const { instance } = useMsal();
//   const [records, setRecords] = useState([]);

//   // Fetch user-specific records
//   useEffect(() => {
//     const account = instance.getActiveAccount();
//     if (!account) {
//       console.warn("No active MSAL account found");
//       return;
//     }

//     const userId = account.localAccountId;

//     fetch(`http://127.0.0.1:8000/api/all-records/${userId}`)
//       .then((res) => res.json())
//       .then((data) => setRecords(data))
//       .catch((err) => console.error("Error loading analysis:", err));
//   }, [instance]);

//   if (!records.length)
//     return <p style={{ textAlign: "center", marginTop: "50px" }}>No health data found. Please submit your health form.</p>;

//   // Extract chart data
//   const dates = records.map((r) =>
//     new Date(r.created_at).toLocaleDateString()
//   );
//   const bpSys = records.map((r) => r.bloodPressureSys);
//   const bpDia = records.map((r) => r.bloodPressureDia);
//   const heartRate = records.map((r) => r.heartRate);
//   const sleep = records.map((r) => r.sleepHours);

//   return (
//     <div className={`analysis-container ${sidebarOpen ? "shifted" : "full"}`}>

//       <h1>Health Progress Analysis</h1>
//       <p className="subtitle">Hover over charts for insights</p>

//       <div className="chart-grid">

//         {/* BLOOD PRESSURE TREND */}
//         <div className="chart-card">
//           <h3>Blood Pressure Trend</h3>
//           <Plot
//             data={[
//               {
//                 x: dates,
//                 y: bpSys,
//                 type: "scatter",
//                 mode: "lines+markers",
//                 name: "Systolic",
//               },
//               {
//                 x: dates,
//                 y: bpDia,
//                 type: "scatter",
//                 mode: "lines+markers",
//                 name: "Diastolic",
//               },
//             ]}
//             layout={{
//               hovermode: "closest",
//               paper_bgcolor: "white",
//               plot_bgcolor: "white",
//             }}
//             className="chart"
//           />
//           <p className="desc">
//             Shows variation in BP readings over time. Larger swings may indicate stress or cardiovascular strain.
//           </p>
//         </div>

//         {/* HEART RATE BAR CHART */}
       
// <div className="chart-card">
//   <h3>Heart Rate Trend</h3>

//   <Plot
//     data={[
//       {
//         x: dates,
//         y: heartRate,
//         type: "scatter",
//         mode: "lines+markers",
//         name: "Heart Rate (bpm)",
//         line: {
//           color: "#2563eb",
//           width: 3,
//           shape: "spline",
//         },
//         marker: {
//           size: 6,
//           color: "#1d4ed8",
//         },
//         fill: "tozeroy",
//         fillcolor: "rgba(37,99,235,0.15)",
//       },
//     ]}
//     layout={{
//       hovermode: "x unified",
//       paper_bgcolor: "white",
//       plot_bgcolor: "white",

//       yaxis: {
//         title: "Heart Rate (bpm)",
//         range: [60, 100],
//         dtick: 10,
//         zeroline: false,
//       },

//       shapes: [
//         {
//           type: "rect",
//           xref: "paper",
//           yref: "y",
//           x0: 0,
//           x1: 1,
//           y0: 60,
//           y1: 100,
//           fillcolor: "rgba(34,197,94,0.08)",
//           line: { width: 0 },
//         },
//       ],

//       xaxis: {
//         title: "Date",
//         showgrid: false,
//       },
//     }}
//     className="chart"
//   />

//   <p className="desc">
//     Shows heart rate trend over time to identify stress levels and fitness improvement.
//   </p>
// </div>


//         {/* SLEEP PIE CHART */}
//         <div className="chart-card">
//           <h3>Sleep Balance Overview</h3>
//           <Plot
//             data={[
//               {
//                 x: dates,
//                 y: sleep,
//                 type: "scatter",
//                 mode: "lines",
//                 fill: "tozeroy",
//                 name: "Sleep Hours",
//                 line: { color: "#4c72b0" },
//               },
//             ]}
//             layout={{
//               paper_bgcolor: "white",
//               plot_bgcolor: "white",
//               yaxis: {
//                 title: "Sleep (hours)",
//                 range: [0, 12],
//               },
//               shapes: [
//                 {
//                   type: "rect",
//                   xref: "paper",
//                   yref: "y",
//                   x0: 0,
//                   x1: 1,
//                   y0: 7,
//                   y1: 9,
//                   fillcolor: "rgba(0,200,0,0.1)",
//                   line: { width: 0 },
//                   },
//                 ],
//             }}
//             className="chart"
//           />
//           <p className="desc">
//             Visualizes your sleep duration distribution across all logged days.
//           </p>
//         </div>

//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import Plot from "react-plotly.js";
import "../styles/analysis.css";

export default function Analysis({ sidebarOpen }) {
  const { instance } = useMsal();
  const [records, setRecords] = useState([]);

  /* ================= FETCH DATA ================= */
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

  if (!records.length) {
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        No health data found. Please submit your health form.
      </p>
    );
  }

  /* ================= DATA ================= */
  const dates = records.map((r) =>
    new Date(r.created_at).toLocaleDateString()
  );
  const bpSys = records.map((r) => r.bloodPressureSys);
  const bpDia = records.map((r) => r.bloodPressureDia);
  const heartRate = records.map((r) => r.heartRate);
  const sleep = records.map((r) => r.sleepHours);

  /* 🔹 SHARED X-AXIS CONFIG (HIDES DATES) */
  const hiddenXAxis = {
    showticklabels: false,
    showgrid: false,
    zeroline: false,
    title: "",
  };

  return (
    <div className={`analysis-container ${sidebarOpen ? "shifted" : "full"}`}>
      <h1>Health Progress Analysis</h1>
      <p className="subtitle">Hover over charts for insights</p>

      <div className="chart-grid">

        {/* ================= BLOOD PRESSURE ================= */}
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
              xaxis: hiddenXAxis,
            }}
            className="chart"
          />
          <p className="desc">
            Shows variation in BP readings over time. Larger swings may indicate stress or cardiovascular strain.
          </p>
        </div>

        {/* ================= HEART RATE ================= */}
        <div className="chart-card">
          <h3>Heart Rate Trend</h3>
          <Plot
            data={[
              {
                x: dates,
                y: heartRate,
                type: "scatter",
                mode: "lines+markers",
                name: "Heart Rate (bpm)",
                line: {
                  color: "#2563eb",
                  width: 3,
                  shape: "spline",
                },
                marker: {
                  size: 6,
                  color: "#1d4ed8",
                },
                fill: "tozeroy",
                fillcolor: "rgba(37,99,235,0.15)",
              },
            ]}
            layout={{
              hovermode: "x unified",
              paper_bgcolor: "white",
              plot_bgcolor: "white",
              xaxis: hiddenXAxis,
              yaxis: {
                title: "Heart Rate (bpm)",
                range: [60, 100],
                dtick: 10,
                zeroline: false,
              },
              shapes: [
                {
                  type: "rect",
                  xref: "paper",
                  yref: "y",
                  x0: 0,
                  x1: 1,
                  y0: 60,
                  y1: 100,
                  fillcolor: "rgba(34,197,94,0.08)",
                  line: { width: 0 },
                },
              ],
            }}
            className="chart"
          />
          <p className="desc">
            Shows heart rate trend over time to identify stress levels and fitness improvement.
          </p>
        </div>

        {/* ================= SLEEP ================= */}
        <div className="chart-card">
          <h3>Sleep Balance Overview</h3>
          <Plot
            data={[
              {
                x: dates,
                y: sleep,
                type: "scatter",
                mode: "lines",
                fill: "tozeroy",
                name: "Sleep Hours",
                line: { color: "#4c72b0" },
              },
            ]}
            layout={{
              paper_bgcolor: "white",
              plot_bgcolor: "white",
              xaxis: hiddenXAxis,
              yaxis: {
                title: "Sleep (hours)",
                range: [0, 12],
              },
              shapes: [
                {
                  type: "rect",
                  xref: "paper",
                  yref: "y",
                  x0: 0,
                  x1: 1,
                  y0: 7,
                  y1: 9,
                  fillcolor: "rgba(0,200,0,0.1)",
                  line: { width: 0 },
                },
              ],
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

