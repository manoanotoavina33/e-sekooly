import { useAuthStore } from "@/hooks/useAuthStore";
import { Navigate, Outlet } from "react-router-dom";

export function ProtectedRoute() {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
