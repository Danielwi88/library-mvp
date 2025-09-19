import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "./types";

interface AuthState {
  token: string | null;
  user: User | null;
}

function getInitialAuthState(): AuthState {
  try {
    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");
    let user: User | null = null;
    if (rawUser) {
      try {
        user = JSON.parse(rawUser) as User;
      } catch {
        // Clean up corrupted value and continue with null
        localStorage.removeItem("user");
        user = null;
      }
    }
    return { token, user };
  } catch {
    // localStorage might be unavailable; fall back gracefully
    return { token: null, user: null };
  }
}

const initial: AuthState = getInitialAuthState();

const slice = createSlice({
  name: "auth",
  initialState: initial,
  reducers: {
    setAuth(state, action: PayloadAction<{ token: string; user: User }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }
});

export const { setAuth, updateUser, logout } = slice.actions;
export default slice.reducer;
