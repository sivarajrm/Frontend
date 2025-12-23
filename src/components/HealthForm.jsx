import React, { useState, useEffect } from "react";

function HealthForm({ onSubmit, previousData }) {

  // ---------- INITIAL STATE (supports Edit Mode) ----------
  const initialState = {
    age: "",
    gender: "",
    height: "",
    weight: "",
    bloodPressureSys: "",
    bloodPressureDia: "",
    heartRate: "",
    sleepHours: "",
    waterIntake: "",
    workoutMinutes: "",
  };

  // If previousData is provided → prefill the form
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (previousData) {
      setFormData({
        age: previousData.age || "",
        gender: previousData.gender || "",
        height: previousData.height || "",
        weight: previousData.weight || "",
        bloodPressureSys: previousData.bloodPressureSys || "",
        bloodPressureDia: previousData.bloodPressureDia || "",
        heartRate: previousData.heartRate || "",
        sleepHours: previousData.sleepHours || "",
        waterIntake: previousData.waterIntake || "",
        workoutMinutes: previousData.workoutMinutes || "",
      });
    }
  }, [previousData]);

  // ---------- FIELD LABELS ----------
  const customLabels = {
    sleepHours: "Sleep (hours/day)",
    waterIntake: "Water Intake (liters/day)",
    workoutMinutes: "Workout (minutes/day)",
    bloodPressureSys: "BP Systolic",
    bloodPressureDia: "BP Diastolic",
  };

  const formatLabel = (field) =>
    customLabels[field] ||
    field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

  // ---------- INPUT HANDLER ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ---------- SUBMIT HANDLER ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
    localStorage.setItem("healthFormFilled", true);
  };

  return (
    <div style={container}>
      <div style={formWrapper}>
        
        {/* Page Title */}
        <h3 style={title}>
          {previousData ? "Edit Health Data" : "Submit Health Data"}
        </h3>

        <form onSubmit={handleSubmit} style={formGrid}>
          {Object.keys(initialState).map((field) => (
            <div key={field} style={inputGroup}>
              <label style={label}>{formatLabel(field)}</label>

              {field === "gender" ? (
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                >
                  <option value="">-- Select Gender --</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <input
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required
                  placeholder={
                    field === "height" ? "Format: 5.8 (ft.inches)" : ""
                  }
                  style={inputStyle}
                  type="text"
                />
              )}
            </div>
          ))}

          <button type="submit" style={submitBtn}>
            {previousData ? "Update" : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------- UI Styles ---------- */

const container = {
  width: "100%",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "30px 15px",
};

/* 🔥 GLASS CARD */
const formWrapper = {
  width: "100%",
  maxWidth: "650px",
  padding: "35px",
  borderRadius: "18px",
  boxSizing: "border-box",

  background: "rgba(255, 255, 255, 0.82)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",

  border: "1px solid rgba(255, 255, 255, 0.4)",
  boxShadow: "0 18px 40px rgba(0, 0, 0, 0.18)"
};

const title = {
  textAlign: "center",
  marginBottom: "25px",
  fontSize: "22px",
  fontWeight: "700",
  color: "#111827",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
};

const inputGroup = {
  display: "flex",
  flexDirection: "column",
};

const label = {
  fontWeight: "600",
  marginBottom: "6px",
  fontSize: "14px",
  color: "#374151",
};

/* INPUT */
const inputStyle = {
  padding: "11px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(0,0,0,0.15)",
  fontSize: "15px",
  background: "rgba(255,255,255,0.9)",
  outline: "none",
};

/* 🔥 PREMIUM BUTTON */
const submitBtn = {
  gridColumn: "span 2",
  width: "100%",
  marginTop: "30px",
  padding: "14px",
  fontSize: "17px",
  fontWeight: "600",

  background: "linear-gradient(135deg, #1f2937, #020617)",
  color: "#e5e7eb",

  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "12px",
  cursor: "pointer",

  transition: "all 0.3s ease",
};

/* Hover Effect */
submitBtn["&:hover"] = {
  transform: "translateY(-1px)",
  boxShadow: "0 10px 25px rgba(0,0,0,0.25)"
};

/* --------- RESPONSIVE FIX -------- */
if (window.innerWidth < 768) {
  formGrid.gridTemplateColumns = "1fr";
}



export default HealthForm;
