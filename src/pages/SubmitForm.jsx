// // src/pages/SubmitForm.jsx
// import { useMsal } from "@azure/msal-react";
// import { useNavigate, useLocation } from "react-router-dom";
// import HealthForm from "../components/HealthForm";
// import { useState } from "react";

// export default function SubmitForm() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { instance } = useMsal();

//   // ----------------------------- EDIT MODE -----------------------------
//   const editMode = location.state?.editMode || false;
//   const previousData = location.state?.latestForm || null;

//   // For debugging
//   console.log("📝 Edit Mode:", editMode);
//   console.log("📦 Previous Data:", previousData);

//   // ----------------------------- FORM SUBMIT -----------------------------
//   const handleSubmit = async (formData) => {
//     try {
//       // --------------------- CHECK LOGIN SESSION ---------------------
//       const account = instance.getActiveAccount();
//       if (!account) {
//         alert("Login session expired. Please login again.");
//         navigate("/login");
//         return;
//       }

//       const userId = account.localAccountId;
//       localStorage.setItem("user_id", userId);

//       // --------------------- CLEAN + FORMAT DATA ---------------------
//       const cleanData = {};

//       Object.keys(formData).forEach((key) => {
//         let value = formData[key];

//         // Fix height input (remove "ft", "inches", letters)
//         if (key === "height") {
//           value = value.toString().replace(/[^\d.]/g, ""); // keep numbers + dot
//         }

//         // Convert numeric values to numbers
//         cleanData[key] = isNaN(value) ? value : Number(value);
//       });

//       console.log("📤 Sending Clean Data →", cleanData);

//       // --------------------- SEND TO BACKEND ---------------------
//       const res = await fetch("http://127.0.0.1:8000/api/submit-health-data", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "x-user-id": userId, // Required by backend
//         },
//         body: JSON.stringify(cleanData),
//       });

//       let data = {};
//       try {
//         data = await res.json();
//       } catch {
//         data = { error: "Invalid response from server" };
//       }

//       // --------------------- HANDLE RESPONSE ---------------------
//       if (!res.ok) {
//         const errorMessage =
//           data.error || data.detail || data.message || JSON.stringify(data);
//         alert("❌ Error submitting data\n\n" + errorMessage);
//         return;
//       }

//       // Mark health form as completed (for redirect logic)
//       localStorage.setItem("healthFormFilled", "true");

//       // Redirect to dashboard after success
//       navigate("/dashboard");

//     } catch (err) {
//       alert("❌ Error submitting data\n\n" + err.message);
//       console.error("Submit error:", err);
//     }
//   };

//   return (
//     <div>
//       {/* Pass previous data to HealthForm ONLY if editing */}
//       <HealthForm 
//         onSubmit={handleSubmit} 
//         previousData={editMode ? previousData : null} 
//       />
//     </div>
//   );
// }


// src/pages/SubmitForm.jsx
import { useMsal } from "@azure/msal-react";
import { useNavigate, useLocation } from "react-router-dom";
import HealthForm from "../components/HealthForm";

export default function SubmitForm({ onSubmit }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { instance } = useMsal();

  const editMode = location.state?.editMode || false;
  const previousData = location.state?.latestForm || null;

  const handleSubmit = async (formData) => {
    const account = instance.getActiveAccount();
    if (!account) {
      alert("Login session expired. Please login again.");
      navigate("/login");
      return;
    }

    const userId = account.localAccountId;
    localStorage.setItem("user_id", userId);

    // ---------- CLEAN DATA ----------
    const cleanData = {};
    Object.keys(formData).forEach((key) => {
      let value = formData[key];

      if (key === "height") {
        value = value.toString().replace(/[^\d.]/g, "");
      }

      cleanData[key] = isNaN(value) ? value : Number(value);
    });

    // 🔥 PASS DATA TO APP.JS (loader works here)
    await onSubmit(cleanData, userId);
  };

  return (
    <HealthForm
      onSubmit={handleSubmit}
      previousData={editMode ? previousData : null}
    />
  );
}
