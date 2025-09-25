import { api } from "./api";
import type { Role, User } from "@/features/auth/types";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isRole(v: unknown): v is Role {
  return v === "USER" || v === "ADMIN";
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
  const user = (isRecord(userCandidate) ? (userCandidate as unknown as User) : ({ id: "", name: "", email: "", role: "USER" as const }));

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
interface UpdateProfileResponse {
  message?: string;
  data?: {
    profile?: {
      id?: number | string;
      name?: string;
      email?: string;
      phone?: string | null;
      role?: string;
    };
  };
}

export async function updateProfile(p: Partial<Pick<User, "name" | "phone">>) {
  const { data } = await api.patch<UpdateProfileResponse>("/me", p);

  const profile = isRecord(data?.data) && isRecord((data.data as Record<string, unknown>).profile)
    ? ((data.data as Record<string, unknown>).profile as Record<string, unknown>)
    : null;

  const changes: Partial<User> = {};

  if (profile) {
    if (typeof profile.id === "number" || typeof profile.id === "string") {
      changes.id = String(profile.id);
    }
    if (typeof profile.name === "string") {
      changes.name = profile.name;
    }
    if (typeof profile.email === "string") {
      changes.email = profile.email;
    }
    if (profile.phone === null || typeof profile.phone === "string") {
      changes.phone = profile.phone ?? null;
    }
    if (isRole(profile.role)) {
      changes.role = profile.role;
    }
  }

  const message = typeof data?.message === "string" ? data.message : "Profile updated";

  return { changes, message };
}
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export async function adminUsers(params?: { q?: string; page?: number }) {
  const { data } = await api.get("/admin/users", { params });
  return data as { items: AdminUser[]; total: number };
}
