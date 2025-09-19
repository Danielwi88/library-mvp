import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { Role } from "@/features/auth/types";
import type { ReactNode } from "react";

export function RequireAuth({ children, role }: { children: ReactNode; role?: Role }) {
  const { token, user } = useSelector((s: RootState) => s.auth);
  if (!token || !user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}
