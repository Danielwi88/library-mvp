import { api } from "./api";

export interface AdminOverview {
  totals: { users: number; books: number };
  loans: { active: number; overdue: number };
  topBorrowed: Array<{
    id: number | string;
    title: string;
    borrowCount: number;
    rating: number;
    availableCopies: number;
    totalCopies: number;
    author?: { id?: number | string; name?: string };
    category?: { id?: number | string; name?: string };
    coverUrl?: string | null; // if backend adds it later
  }>;
  generatedAt?: string;
}

export interface OverdueLoan {
  id: number;
  userId: number;
  bookId: number;
  status: string;
  borrowedAt: string;
  dueAt: string;
  returnedAt: string | null;
  user?: {
    id?: number;
    name?: string;
    email?: string;
  } | null;
  book: {
    id: number;
    title: string;
    coverUrl?: string | null;
    coverImage?: string | null;
    author?: {
      id?: number;
      name?: string;
    } | null;
  };
}

export interface PaginatedLoansMeta {
  totalItems?: number;
  total?: number;
  totalPages?: number;
  page?: number;
  limit?: number;
  perPage?: number;
}

export interface OverdueLoansResponse {
  overdue: OverdueLoan[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface MyLoansResponse {
  loans: OverdueLoan[];
  pagination?: PaginatedLoansMeta | null;
}

export async function getOverdueLoans(page = 1, limit = 20): Promise<OverdueLoansResponse> {
  const { data } = await api.get(`/admin/loans/overdue?page=${page}&limit=${limit}`);
  return data.data as OverdueLoansResponse;
}

export async function getActiveLoans(page = 1, limit = 20) {
  const { data } = await api.get(`/admin/loans/active?page=${page}&limit=${limit}`);
  return data.data;
}

export async function getMyLoans(options: { page?: number; limit?: number; status?: string } = {}): Promise<MyLoansResponse> {
  const { page = 1, limit = 20, status } = options;
  const params: Record<string, number | string> = { page, limit };
  if (status) params.status = status;

  const { data } = await api.get("/me/loans", { params });
  const raw = data?.data ?? {};
  const loans = Array.isArray(raw.loans) ? (raw.loans as OverdueLoan[]) : [];
  const pagination = (raw.pagination ?? raw.meta ?? raw.pageInfo ?? null) as PaginatedLoansMeta | null;

  if (pagination && !pagination.totalItems && typeof raw.total === "number") {
    pagination.totalItems = raw.total;
  }

  return { loans, pagination };
}

export async function getUsers() {
  const data = await getOverdueLoans(1, 20);
  const loans = data?.overdue || [];
  
  const usersMap = new Map();
  loans.forEach((loan: OverdueLoan) => {
    const user = loan.user;
    if (!user?.id) return;
    if (!usersMap.has(user.id)) {
      usersMap.set(user.id, {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.id === 1 ? 'ADMIN' : 'USER',
        createdAt: loan.borrowedAt
      });
    }
  });
  
  return {
    items: Array.from(usersMap.values()),
    total: usersMap.size
  };
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const { data } = await api.get("/admin/overview");
  const d = data?.data ?? {} as Record<string, unknown>;

  type RemoteTopBorrowed = {
    id?: number | string;
    title?: string;
    borrowCount?: number;
    rating?: number;
    availableCopies?: number;
    totalCopies?: number;
    author?: { id?: number | string; name?: string };
    category?: { id?: number | string; name?: string };
    coverImage?: string | null;
    coverUrl?: string | null;
  };

  const rawTop = (d as { topBorrowed?: RemoteTopBorrowed[] }).topBorrowed ?? [];
  const map = rawTop.map((b: RemoteTopBorrowed) => ({
    id: (b.id ?? "") as string | number,
    title: String(b.title ?? ""),
    borrowCount: Number(b.borrowCount ?? 0),
    rating: Number(b.rating ?? 0),
    availableCopies: Number(b.availableCopies ?? 0),
    totalCopies: Number(b.totalCopies ?? 0),
    author: b.author,
    category: b.category,
    coverUrl: b.coverImage ?? b.coverUrl ?? null,
  }));
  return {
    totals: { users: Number(d?.totals?.users ?? 0), books: Number(d?.totals?.books ?? 0) },
    loans: { active: Number(d?.loans?.active ?? 0), overdue: Number(d?.loans?.overdue ?? 0) },
    topBorrowed: map,
    generatedAt: (d as { generatedAt?: string }).generatedAt,
  };
}
