import "../styles/globalLoader.css";

export default function GlobalLoader() {
  return (
    <div className="loader-overlay">

      {/* 🔥 ECG HEARTBEAT */}
      <div className="ecg-wrapper">
        <svg viewBox="0 0 500 100" className="ecg">
          <polyline
            points="
              0,50 40,50 60,50
              80,20 100,80 120,50
              160,50 180,50
              200,20 220,80 240,50
              280,50 300,50
              320,20 340,80 360,50
              420,50 500,50
            "
            className="ecg-line"
          />
        </svg>
      </div>

      <p className="loader-text">Analyzing health data...</p>

    </div>
  );
}
