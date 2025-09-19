import { configureStore } from "@reduxjs/toolkit";
import auth from "@/features/auth/authSlice";
import cart from "@/features/cart/cartSlice";
import ui from "@/features/ui/uiSlice";

export const store = configureStore({
  reducer: { auth, cart, ui },
  middleware: (g) => g({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;