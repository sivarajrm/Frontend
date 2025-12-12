import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../auth/msalConfig";
import "../styles/login.css";

export default function Login() {
  const { instance } = useMsal();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // STEP 1 — Microsoft Login
      const response = await instance.loginPopup(loginRequest);
      const account = response.account;
      instance.setActiveAccount(account);

      // Store user_id in localStorage
      localStorage.setItem("user_id", account.localAccountId);

      // STEP 2 — Check user in backend
      const res = await fetch("http://127.0.0.1:8000/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          azure_id: account.localAccountId,
          name: account.name,
          email: account.username,
          profile_pic: ""
        })
      });

      const data = await res.json();

      // STEP 3 — Redirect based on "exists"
      if (data.exists) {
        localStorage.setItem("healthFormFilled", "true");
        navigate("/dashboard"); // existing user → dashboard
      } else {
        navigate("/health-form"); // new user → health form
      }
    } catch (error) {
      if (error.errorCode !== "user_cancelled") {
        console.error("Login error:", error);
      }
    }
  };

  return (
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
