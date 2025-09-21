import { api } from "./api";
export interface Loan {
  id: number;
  userId: number;
  bookId: number;
  status: "BORROWED" | "RETURNED" | "OVERDUE";
  borrowedAt: string;
  dueAt: string;
  returnedAt: string | null;
  book: { 
    id: number; 
    title: string; 
    coverImage: string;
    author?: { name: string } 
  };
}

export interface LoansResponse {
  success: boolean;
  message: string;
  data: {
    loans: Loan[];
  };
}

export async function checkout(payload: { items: { bookId: string; qty: number }[] }) {
  const { data } = await api.post("/loans/checkout", payload);
  return data as { loanIds: string[] };
}

export async function borrowBook(payload: { bookId: string | number; days: number }) {
  const body = { bookId: typeof payload.bookId === 'string' ? Number(payload.bookId) : payload.bookId, days: payload.days };
  const { data } = await api.post("/loans", body);
  return data as { success?: boolean };
}

export async function myLoans() {
  const { data } = await api.get("/loans/my");
  return data?.data?.loans as Loan[] || [];
}
export async function adminLoans(params?: { status?: string }) {
  const { data } = await api.get("/admin/loans", { params });
  return data as Loan[];
}
