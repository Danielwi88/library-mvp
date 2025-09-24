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
  const query: Record<string, unknown> = {};
  if (params?.page) query.page = params.page;
  if (params?.limit) query.limit = params.limit;
  
  if (params?.q) query.q = params.q;

  const { data } = await api.get("/books", { params: query });

  const apiBooks = (data?.data?.books ?? []) as RemoteBook[];
  const books = apiBooks.map((b) => ({
    id: String(b.id),
    title: String(b.title ?? ""),
    author: { id: String(b.author?.id ?? ""), name: String(b.author?.name ?? "Unknown") },
    coverUrl: b.coverImage ?? null,
    rating: Number.isFinite(b.rating) ? Number(b.rating) : 0,
    stock: Number.isFinite(b.availableCopies) ? Number(b.availableCopies) : 0,
    categories: b.category ? [{ id: String(b.category.id), name: String(b.category.name) }] : [],
    description: b.description ?? undefined,
  })) as Book[];

  const pag = data?.data?.pagination ?? {};
  return {
    items: books,
    total: Number(pag.total ?? books.length),
    page: Number(pag.page ?? params?.page ?? 1),
    limit: Number(pag.limit ?? params?.limit ?? books.length),
  } as { items: Book[]; total: number; page: number; limit: number };
}

export interface BookDetail extends Book {
  totalCopies?: number;
  borrowCount?: number;
  reviewCount?: number;
  isbn?: string;
  publishedYear?: number;
}

// Server payload types (minimal, based on current API)
type RemoteId = number | string | undefined;
interface RemoteAuthor { id?: RemoteId; name?: string }
interface RemoteCategory { id?: RemoteId; name?: string }
interface RemoteReview { id?: RemoteId; star?: number; comment?: string | null; createdAt?: string; user?: { id?: RemoteId; name?: string } }
interface RemoteBook {
  id?: RemoteId;
  title?: string;
  description?: string | null;
  coverImage?: string | null;
  rating?: number | null;
  availableCopies?: number | null;
  totalCopies?: number | null;
  borrowCount?: number | null;
  reviewCount?: number | null;
  author?: RemoteAuthor;
  category?: RemoteCategory;
  reviews?: RemoteReview[];
  isbn?: string | number | null;
  publishedYear?: string | number | null;
}

export async function fetchBookDetail(id: string): Promise<{ book: BookDetail; reviews: import('./reviews').Review[] }>
{
  const { data } = await api.get(`/books/${id}`);
  const b: RemoteBook = data?.data ?? {};
  const mapped: BookDetail = {
    id: String(b.id ?? id),
    title: String(b.title ?? ""),
    author: { id: String(b.author?.id ?? ""), name: String(b.author?.name ?? "Unknown") },
    coverUrl: b.coverImage ?? null,
    rating: Number.isFinite(b.rating) ? Number(b.rating) : 0,
    stock: Number.isFinite(b.availableCopies) ? Number(b.availableCopies) : 0,
    categories: b.category ? [{ id: String(b.category.id), name: String(b.category.name) }] : [],
    description: b.description ?? undefined,
    totalCopies: Number(b.totalCopies ?? 0),
    borrowCount: Number(b.borrowCount ?? 0),
    reviewCount: Number(b.reviewCount ?? 0),
    isbn: typeof b.isbn === "string" || typeof b.isbn === "number" ? String(b.isbn) : undefined,
    publishedYear: (() => {
      if (typeof b.publishedYear === "number") return b.publishedYear;
      if (typeof b.publishedYear === "string") {
        const parsed = Number(b.publishedYear);
        return Number.isNaN(parsed) ? undefined : parsed;
      }
      return undefined;
    })(),
  };

  const reviews = Array.isArray(b.reviews)
    ? (b.reviews as RemoteReview[]).map((r) => ({
        id: String(r.id),
        bookId: String(b.id ?? id),
        user: { id: String(r.user?.id ?? ""), name: String(r.user?.name ?? "User") },
        rating: Number(r.star ?? 0),
        comment: r.comment ?? undefined,
        createdAt: String(r.createdAt ?? new Date().toISOString()),
      }))
    : [];

  return { book: mapped, reviews };
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
  const { data } = await api.post("/books", payload);
  return data;
}
