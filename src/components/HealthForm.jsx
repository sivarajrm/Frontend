import React, { useState } from "react";

function HealthForm({ onSubmit }) {
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

  const [formData, setFormData] = useState(initialState);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
    localStorage.setItem("healthFormFilled", true);
  };

  return (
    <div style={container}>
      <div style={formWrapper}>
        
        {/* Optional Title */}
        <h3 style={title}>Submit Health Data</h3>

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
                  placeholder={field === "height" ? "Format: 5.8 (ft.inches)" : ""}
                  style={inputStyle}
                  type="text"
                />
              )}
            </div>
          ))}

          <button type="submit" style={submitBtn}>
            Submit
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
  background: "#ffffff",
  padding: "30px 15px",
};

const formWrapper = {
  width: "100%",
  maxWidth: "650px",
  backgroundColor: "white",
  padding: "35px",
  borderRadius: "18px",
  boxShadow: "0px 6px 20px rgba(0,0,0,0.08)",
  boxSizing: "border-box",
};

/* Responsive grid */
const formGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
};

const title = {
  textAlign: "center",
  marginBottom: "25px",
  fontSize: "22px",
  fontWeight: "600",
  color: "#333",
};

const inputGroup = {
  display: "flex",
  flexDirection: "column",
};

const label = {
  fontWeight: "600",
  marginBottom: "6px",
  fontSize: "14px",
};

const inputStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "15px",
  width: "100%",
};

const submitBtn = {
  gridColumn: "span 2",
  width: "100%",
  marginTop: "30px",
  padding: "14px",
  fontSize: "18px",
  fontWeight: "600",
  background: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

/* --------- RESPONSIVE FIX -------- */
if (window.innerWidth < 768) {
  formGrid.gridTemplateColumns = "1fr";
}




export default HealthForm;
