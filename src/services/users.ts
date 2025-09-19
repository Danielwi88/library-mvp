import { api } from "./api";
import type { User } from "@/features/auth/types";

export async function login(payload: { email: string; password: string }) {
  const { data } = await api.post("/auth/login", payload);
  // Expect { token, user }
  return data as { token: string; user: User };
}
export async function register(payload: { name: string; email: string; phone?: string; password: string }) {
  const { data } = await api.post("/auth/register", payload);
  return data as { token: string; user: User };
}
export async function updateProfile(p: Partial<Pick<User, "name" | "phone">>) {
  const { data } = await api.patch("/users/me", p);
  return data as User;
}
export async function adminUsers(params?: { q?: string; page?: number }) {
  const { data } = await api.get("/admin/users", { params });
  return data as { items: User[]; total: number };
}