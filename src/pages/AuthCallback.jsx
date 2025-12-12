// AuthCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { msalInstance } from "../auth/msalConfig";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    msalInstance.handleRedirectPromise().then(response => {
      const account = response?.account || msalInstance.getAllAccounts()?.[0];
      if (account) {
        msalInstance.setActiveAccount(account);
        // persist a minimal marker (optional)
        localStorage.setItem("user_id", account.localAccountId);
        navigate("/health-form");
      } else {
        navigate("/login");
      }
    });
  }, [navigate]);

  return <p style={{textAlign:"center"}}>Signing in...</p>;
}
