import { useIsAuthenticated } from "@azure/msal-react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isAuth = useIsAuthenticated();
  return isAuth ? children : <Navigate to="/login" />;
}
