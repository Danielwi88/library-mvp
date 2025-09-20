import axios from "axios";
import { store } from "@/store";
import { logout } from "@/features/auth/authSlice";

const DEFAULT_BASE = "https://belibraryformentee-production.up.railway.app";
const base = (import.meta.env.VITE_API_BASE as string | undefined) ?? DEFAULT_BASE;

export const api = axios.create({
  baseURL: `${base}/api`,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(err);
  }
);
