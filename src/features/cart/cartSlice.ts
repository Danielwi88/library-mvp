import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CartItem } from "./types";

interface CartState { items: CartItem[]; }
const initial: CartState = { items: [] };

const slice = createSlice({
  name: "cart",
  initialState: initial,
  reducers: {
    add(state, action: PayloadAction<Omit<CartItem, "qty"> & { qty?: number }>) {
      const { bookId, title, coverUrl, qty = 1 } = action.payload;
      const found = state.items.find(i => i.bookId === bookId);
      if (found) found.qty += qty; else state.items.push({ bookId, title, coverUrl, qty });
    },
    remove(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.bookId !== action.payload);
    },
    clear(state) { state.items = []; }
  }
});
export const { add, remove, clear } = slice.actions;
export default slice.reducer;
