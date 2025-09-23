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
  const { data } = await api.get(`/books`, { params: { authorId } });
  const books = data?.data?.books ?? [];
  return {
    author: books[0]?.author || { id: authorId, name: 'Unknown Author' },
    items: books.map((b: any) => ({
      id: String(b.id),
      title: String(b.title ?? ""),
      author: { id: String(b.author?.id ?? ""), name: String(b.author?.name ?? "Unknown") },
      coverUrl: b.coverImage ?? null,
      rating: Number.isFinite(b.rating) ? Number(b.rating) : 0
    }))
  };
}