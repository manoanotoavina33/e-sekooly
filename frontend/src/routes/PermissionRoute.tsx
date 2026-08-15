import { useAuthStore } from "@/hooks/useAuthStore";
import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";

export function PermissionRoute({ permission, children }: { permission: string; children: ReactElement }) {
  const hasPermission = useAuthStore((s) => s.hasPermission);

  if (!hasPermission(permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
