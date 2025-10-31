// src/routes/PrivateRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function PrivateRoute({ allowedRoles }) {
  const { user, isLoggedIn, loading } = useContext(AuthContext);

  if (loading) {
    return <p>Chargement...</p>; // Optionnel : écran de chargement
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
