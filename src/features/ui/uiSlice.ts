import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
interface UIState {
  search: string;
  categoryIds: string[];
}
const initial: UIState = { search: "", categoryIds: [] };

const slice = createSlice({
  name: "ui",
  initialState: initial,
  reducers: {
    setSearch(s, a: PayloadAction<string>) { s.search = a.payload; },
    toggleCategory(s, a: PayloadAction<string>) {
      s.categoryIds = s.categoryIds.includes(a.payload)
        ? s.categoryIds.filter(id => id !== a.payload)
        : [...s.categoryIds, a.payload];
    },
    setCategories(s, a: PayloadAction<string[]>) { s.categoryIds = a.payload; }
  }
});
export const { setSearch, toggleCategory, setCategories } = slice.actions;
export default slice.reducer;
