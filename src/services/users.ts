import { api } from "./api";
import type { User } from "@/features/auth/types";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function unwrapAuthResponse(raw: unknown): { token: string; user: User } {
  let inner: Record<string, unknown> = {};
  if (isRecord(raw) && "data" in raw && isRecord((raw as { data?: unknown }).data)) {
    inner = (raw as { data?: unknown }).data as Record<string, unknown>;
  } else if (isRecord(raw)) {
    inner = raw as Record<string, unknown>;
  }

  const tokenCandidate = (inner["token"] ?? inner["accessToken"] ?? inner["jwt"]) as unknown;
  const token = typeof tokenCandidate === "string" ? tokenCandidate : "";

  const userCandidate = (inner["user"] ?? inner["profile"]) as unknown;
  const user = (isRecord(userCandidate) ? (userCandidate as unknown as User) : ({ id: "", name: "", email: "", role: "user" as const }));

  return { token, user };
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: {
    profile: {
      id: number;
      name: string;
      email: string;
      role: string;
      createdAt: string;
    };
    loanStats: {
      borrowed: number;
      late: number;
      returned: number;
      total: number;
    };
    reviewsCount: number;
  };
}

export async function login(payload: { email: string; password: string }) {
  const { data } = await api.post("/auth/login", payload);
  const parsed = unwrapAuthResponse(data);
  return parsed;
}

export async function getMyProfile() {
  const { data } = await api.get<ProfileResponse>("/me");
  return data;
}

export async function register(payload: { name: string; email: string; phone?: string; password: string }) {
  const { data } = await api.post("/auth/register", payload);
  const parsed = unwrapAuthResponse(data);
  return parsed;
}
export async function updateProfile(p: Partial<Pick<User, "name" | "phone">>) {
  const { data } = await api.patch("/users/me", p);
  return data as User;
}
export async function adminUsers(params?: { q?: string; page?: number }) {
  const { data } = await api.get("/admin/users", { params });
  return data as { items: User[]; total: number };
}
