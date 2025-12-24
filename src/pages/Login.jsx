import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../auth/msalConfig";
import "../styles/login.css";

export default function Login() {
  const { instance } = useMsal();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await instance.loginPopup(loginRequest);
      const account = response.account;
      instance.setActiveAccount(account);

      localStorage.setItem("user_id", account.localAccountId);

      const res = await fetch("https://backend-health-system.onrender.com/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          azure_id: account.localAccountId,
          name: account.name,
          email: account.username,
          profile_pic: "",
        }),
      });

      const data = await res.json();

      if (data.exists) {
        localStorage.setItem("healthFormFilled", "true");
        navigate("/dashboard");
      } else {
        navigate("/health-form");
      }
    } catch (error) {
      if (error.errorCode !== "user_cancelled") {
        console.error("Login error:", error);
      }
    }
  };

  return (
    /* ✅ THIS WRAPPER WAS MISSING */
    <div className="login-container">
      <div className="login-box">
        <img src="/logo.png" alt="Agilisium Logo" className="logo" />
        <h2 className="title">Personalized Health System</h2>
        <button className="ms-login-btn" onClick={handleLogin}>
          Sign in with Microsoft
        </button>
      </div>
    </div>
  );
}
