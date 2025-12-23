import { useMsal } from "@azure/msal-react";
import { Navigate } from "react-router-dom";
import { isAdmin } from "../utils/isAdmin";
 
export default function AdminRoute({ children }) {
  const { instance, accounts, inProgress } = useMsal();
 
  if (inProgress !== "none") return null; // 🔑 critical
 
  const account = instance.getActiveAccount() || accounts[0];
 
  if (!account || !isAdmin(account.username)) {
    return <Navigate to="/dashboard" />;
  }
 
  return children;
}