import { api } from "./api";
export interface Review {
  id: string;
  bookId: string;
  user: { id: string; name: string; };
  rating: number; // 1..5
  comment?: string;
  createdAt: string;
}
export async function getReviews(bookId: string) {
  const { data } = await api.get(`/books/${bookId}/reviews`);
  return data as Review[];
}
export async function upsertReview(bookId: string, payload: { rating: number; comment?: string }) {
  // server may choose POST or PUT; using PUT as idempotent
  const { data } = await api.put(`/books/${bookId}/reviews/me`, payload);
  return data as Review;
}

export async function submitReview(payload: { bookId: number; star: number; comment: string }) {
  const { data } = await api.post("/reviews", payload);
  return data;
}