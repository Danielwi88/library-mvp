import { api } from "./api";
import type { Book } from "./books";

export interface Author {
  id: string;
  name: string;
  bio?: string | null;
}

// Server payload shape for books under /authors/:id/books
// (kept minimal and optional to match backend variations)
type RawBook = {
  id?: string | number;
  title?: string | null;
  coverImage?: string | null;
  rating?: number | null;
  availableCopies?: number | null;
  totalCopies?: number | null;
  categoryId?: string | number | null;
  description?: string | null;
};

export async function fetchAuthorBooks(authorId: string): Promise<{ author: Author; items: Book[] }>{
  const base = String(api?.defaults?.baseURL ?? "");
  const prefix = /\/api\/?$/.test(base) ? "" : "/api";
  const { data } = await api.get(`${prefix}/authors/${authorId}/books`);
  const d = data?.data ?? {};
  const a = d.author ?? {};
  const author: Author = { id: String(a.id ?? authorId), name: String(a.name ?? "Unknown"), bio: a.bio ?? null };
  const items: Book[] = (d.books ?? []).map((b: RawBook) => ({
    id: String(b?.id ?? ""),
    title: String(b?.title ?? ""),
    author: { id: author.id, name: author.name },
    coverUrl: b?.coverImage ?? null,
    rating: typeof b?.rating === "number" && Number.isFinite(b.rating) ? b.rating : 0,
    stock: typeof b?.availableCopies === "number" && Number.isFinite(b.availableCopies)
      ? b.availableCopies
      : (typeof b?.totalCopies === "number" && Number.isFinite(b.totalCopies) ? b.totalCopies : 0),
    categories: b?.categoryId ? [{ id: String(b.categoryId), name: "" }] : [],
    description: b?.description ?? undefined,
  })) as Book[];
  return { author, items };
}
