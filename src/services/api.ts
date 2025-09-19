import axios from "axios";
import { store } from "@/store";
import { logout } from "@/features/auth/authSlice";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE + "/api",
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