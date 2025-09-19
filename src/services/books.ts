import { api } from "./api";

export interface Book {
  id: string;
  title: string;
  author: { id: string; name: string };
  coverUrl?: string | null;
  rating: number;
  stock: number;
  categories: { id: string; name: string }[];
  description?: string;
}

export async function fetchBooks(params: { q?: string; categoryIds?: string[]; page?: number; limit?: number; }) {
  const { data } = await api.get("/books", { params });
  return data as { items: Book[]; total: number; page: number; limit: number; };
}
export async function fetchBook(id: string) {
  const { data } = await api.get(`/books/${id}`);
  return data as Book;
}
export async function fetchBooksByAuthor(authorId: string) {
  const { data } = await api.get(`/authors/${authorId}/books`);
  return data as Book[];
}

export async function adminCreateBook(payload: FormData | Record<string, unknown>) {
  // if uploading cover, prefer FormData
  const { data } = await api.post("/admin/books", payload);
  return data as Book;
}