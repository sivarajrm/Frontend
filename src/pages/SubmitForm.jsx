// src/pages/SubmitForm.jsx
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import HealthForm from "../components/HealthForm";

export default function SubmitForm() {
  const navigate = useNavigate();
  const { instance } = useMsal();

  const handleSubmit = async (formData) => {
    try {
      // Get logged-in user
      const account = instance.getActiveAccount();
      if (!account) {
        alert("Login session expired. Please login again.");
        navigate("/login");
        return;
      }

      const userId = account.localAccountId;
      localStorage.setItem("user_id", userId);

      // Send form data to backend
      const res = await fetch("http://127.0.0.1:8000/api/submit-health-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify(formData),
      });

      // Parse backend response
      const data = await res.json();

      if (!res.ok) {
        const errorMessage =
          data.error || data.detail || data.message || JSON.stringify(data);
        alert("❌ Error submitting data\n\n" + errorMessage);
        return;
      }

      // Success → Redirect
      localStorage.setItem("healthFormFilled", "true");
      navigate("/dashboard");
    } catch (err) {
      alert("❌ Error submitting data\n\n" + err.message);
      console.error("Submit error:", err);
    }
  };

  return (
    <div>
      <HealthForm onSubmit={handleSubmit} />
    </div>
  );
}
