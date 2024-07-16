import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Importa jwtDecode como una importación nombrada

const ProtectedRoute = ({ children }) => {
  const session = JSON.parse(sessionStorage.getItem("session"));

  if (!session) {
    return <Navigate to="/login" />;
  }
  const token = session.token;

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    if (decodedToken.exp < currentTime) {
      sessionStorage.removeItem("session");
      return <Navigate to="/login" />;
    }
  } catch (error) {
    console.error("Invalid token:", error);
    sessionStorage.removeItem("session");
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
