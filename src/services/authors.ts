import { api } from "./api";

export interface Author {
  id: number;
  name: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

export async function createAuthor(payload: { name: string; bio: string }) {
  const { data } = await api.post("/authors", payload);
  return data.data as Author;
}

export async function fetchAuthorBooks(authorId: string) {
  const { data } = await api.get(`/authors/${authorId}/books`);
  return data;
}