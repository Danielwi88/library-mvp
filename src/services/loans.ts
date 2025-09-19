import { api } from "./api";
export interface Loan {
  id: string;
  book: { id: string; title: string; coverUrl?: string | null };
  status: "BORROWED" | "RETURNED" | "OVERDUE";
  dueDate: string;
  createdAt: string;
}

export async function checkout(payload: { items: { bookId: string; qty: number }[] }) {
  const { data } = await api.post("/loans/checkout", payload);
  return data as { loanIds: string[] };
}
export async function myLoans() {
  const { data } = await api.get("/loans/me");
  return data as Loan[];
}
export async function adminLoans(params?: { status?: string }) {
  const { data } = await api.get("/admin/loans", { params });
  return data as Loan[];
}