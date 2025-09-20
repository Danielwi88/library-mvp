import { api } from "./api";

export interface Category { id: string; name: string }

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get("/categories");
  const cats = (data?.data?.categories ?? []) as Array<{ id?: number | string; name?: string }>;
  return cats.map((c) => ({ id: String(c.id ?? ""), name: String(c.name ?? "") }));
}

