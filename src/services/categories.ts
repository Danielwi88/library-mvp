import { api } from "./api";

export interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export async function createCategory(payload: { name: string }) {
  const { data } = await api.post("/categories", payload);
  return data.data as Category;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get("/categories");
  // Handle different possible response structures
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.categories)) return data.categories;
  return [];
}