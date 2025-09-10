import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const ProtectDashboardRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) throw new Error("No token");

      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        throw new Error("Token expired");
      }
    } catch (error) {
      navigate("/dashboard-panel-admin/xyz/login");
    }
  }, [navigate]);

  return children;
};
