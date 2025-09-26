import AdminBookList from "@/pages/admin/admin-book-list";
import AdminUserList from "@/pages/admin/admin-user-list";
import PaginationBar from "@/components/pagination-bar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getErrorMessage } from "@/lib/errors";
import { getAdminOverview, getMyLoans, getOverdueLoans, type MyLoansResponse, type OverdueLoan, type OverdueLoansResponse } from "@/services/admin";
import { api } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { SearchIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import CoverImage from "@/components/cover-image";


export default function AdminDashboard() {
  return (
    <div className=" mx-auto">
      <Tabs defaultValue="borrowed" className="w-full ">
        <TabsList className="grid w-full grid-cols-3 mb-6 h-14 max-w-[744px]">
          <TabsTrigger value="borrowed">Borrowed List</TabsTrigger>
          <TabsTrigger value="user">User</TabsTrigger>
          <TabsTrigger value="books">Book List</TabsTrigger>
        </TabsList>
        
        <TabsContent value="borrowed">
          <BorrowedListTab />
        </TabsContent>
        
        <TabsContent value="user">
          <AdminUserList />
        </TabsContent>
        
        <TabsContent value="books">
          <AdminBookList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OverviewTab() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: getAdminOverview
  });

  if (isLoading) return <p>Loading overview...</p>;
  if (isError || !data) return <p>Failed to load overview data.</p>;

  const { totals, loans, topBorrowed, generatedAt } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Overview</h1>
        {generatedAt ? (
          <p className="text-sm text-gray-500">
            Last updated {dayjs(generatedAt).format("DD MMM YYYY, HH:mm")}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-semibold">{totals.users}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Total Books</p>
          <p className="text-2xl font-semibold">{totals.books}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Active Loans</p>
          <p className="text-2xl font-semibold">{loans.active}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Overdue Loans</p>
          <p className="text-2xl font-semibold">{loans.overdue}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Top Borrowed Books</h2>
          <p className="text-sm text-gray-500">Most borrowed titles in the selected period</p>
        </div>
        <div className="overflow-hidden rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Borrowed</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Rating</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Available / Total</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Author</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
              </tr>
            </thead>
            <tbody>
              {topBorrowed.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No data available
                  </td>
                </tr>
              ) : (
                topBorrowed.map((book) => (
                  <tr key={book.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{book.title}</td>
                    <td className="px-4 py-3">{book.borrowCount}</td>
                    <td className="px-4 py-3">{book.rating.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {book.availableCopies} / {book.totalCopies}
                    </td>
                    <td className="px-4 py-3">{book.author?.name ?? "-"}</td>
                    <td className="px-4 py-3">{book.category?.name ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BorrowedListTab() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<OverdueLoan | null>(null);
  const pageSize = 10;
  const queryClient = useQueryClient();

  useEffect(() => {
    setPage(1);
  }, [activeFilter]);

  const { data, isLoading } = useQuery<OverdueLoansResponse | MyLoansResponse>({
    queryKey: ["admin-loans", page, activeFilter],
    queryFn: () => {
      if (activeFilter === "Overdue") {
        return getOverdueLoans(page, pageSize);
      }

      const statusMap: Record<string, string | undefined> = {
        All: undefined,
        Active: "BORROWED",
        Returned: "RETURNED",
      };
      const statusParam = statusMap[activeFilter] ?? undefined;
      return getMyLoans({ page, limit: pageSize, status: statusParam });
    },
    enabled: activeFilter !== "Overview"
  });

  const returnBookMutation = useMutation({
    mutationFn: async (loanId: number) => {
      const { data } = await api.patch(`/admin/loans/${loanId}`, {
        status: "RETURNED"
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Book successfully returned");
      queryClient.invalidateQueries({ queryKey: ["admin-loans"] });
      setReturnModalOpen(false);
      setSelectedLoan(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) ?? "Failed to return book");
    }
  });

  const loans = useMemo<OverdueLoan[]>(() => {
    if (!data) return [];
    if ("overdue" in data) return data.overdue ?? [];
    if ("loans" in data) return data.loans ?? [];
    return [];
  }, [data]);

  const filteredLoans = useMemo(() => {
    if (!search) return loans;
    const query = search.toLowerCase();
    return loans.filter((loan) => loan.book.title.toLowerCase().includes(query));
  }, [loans, search]);

  const totalItems = useMemo(() => {
    if (!data) return loans.length;
    if ("total" in data && typeof data.total === "number") return data.total;
    if ("pagination" in data && data.pagination) {
      const meta = data.pagination;
      if (typeof meta?.totalItems === "number") return meta.totalItems;
      if (typeof meta?.total === "number") return meta.total;
      if (typeof meta?.totalPages === "number") {
        const size = meta.limit ?? meta.perPage ?? pageSize;
        return meta.totalPages * size;
      }
    }
    return loans.length;
  }, [data, loans, pageSize]);

  const statusClassMap: Record<string, string> = {
    BORROWED: "text-green-600",
    RETURNED: "text-primary-300",
    OVERDUE: "text-red-500",
  };

  const formatStatus = (status?: string | null) => {
    if (!status) return "Unknown";
    const lower = status.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  const renderLoanCard = (loan: OverdueLoan) => {
    const coverSrc = loan.book.coverUrl ?? loan.book.coverImage ?? null;
    const borrowerName = loan.user?.name ?? "Current User";
    const status = loan.status ?? "";
    const statusClass = statusClassMap[status] ?? "text-gray-600";
    const statusLabel = formatStatus(status);
    const dueLabel = loan.dueAt ? dayjs(loan.dueAt).format("DD MMMM YYYY") : "N/A";
    const dueLabelShort = loan.dueAt ? dayjs(loan.dueAt).format("DD MMM YYYY") : "N/A";
    const dueClass = status === "OVERDUE" ? "text-red-500" : "text-gray-700";
    const borrowedLabel = loan.borrowedAt ? dayjs(loan.borrowedAt).format("DD MMM YYYY") : "Unknown";

    return (
      <div 
        key={loan.id}
        className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => {
          setSelectedLoan(loan);
          setReturnModalOpen(true);
        }}
      >
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <CoverImage
              src={coverSrc}
              alt={loan.book.title}
              index={loan.id}
              className="w-16 h-20 object-cover rounded"
            />
            <div>
              <div className="font-medium">{loan.book.title}</div>
              <div className="text-sm text-gray-500">{loan.book.author?.name ?? "Unknown Author"}</div>
              <div className="text-sm text-gray-500">
                Borrowed {borrowedLabel} - Due {dueLabelShort}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Borrower</div>
            <div className="font-medium">{borrowerName}</div>
            <div className="text-sm">
              Status: <span className={statusClass}>{statusLabel}</span>
            </div>
            <div className="text-sm">
              Due Date: <span className={dueClass}>{dueLabel}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading && activeFilter !== "Overview") return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Borrowed List</h1>
      <div className="flex space-x-2 ">
        {["All", "Active", "Returned", "Overdue", "Overview"].map((filter) => (
          <button
            key={filter}
            className={`px-4 h-10 py-1 rounded-full text-sm ${
              activeFilter === filter ? "bg-primary-300 text-white" : "bg-gray-100"
            }`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
      
      {activeFilter === "Overview" ? (
        <OverviewTab />
      ) : (
        <>
          <div className="relative">
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-lg px-10 rounded-full h-11 sm:h-12"
            />
            <SearchIcon className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5  text-neutral-600' />
          </div>
          <div className="space-y-4">
            {filteredLoans.map(renderLoanCard)}
          </div>
          
          <PaginationBar
            page={page}
            pageSize={pageSize}
            total={totalItems}
            onPageChange={setPage}
            className="mt-6"
          />
        </>
      )}
      
      <Dialog open={returnModalOpen} onOpenChange={setReturnModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Return Book</DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Confirm marking the selected loan as returned.
        </DialogDescription>
        {selectedLoan && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <CoverImage
                  src={selectedLoan.book.coverUrl ?? selectedLoan.book.coverImage ?? null}
                  alt={selectedLoan.book.title}
                  index={selectedLoan.id}
                  className="w-16 h-20 object-cover rounded"
                />
                <div>
                  <div className="font-medium">{selectedLoan.book.title}</div>
                  <div className="text-sm text-gray-500">{selectedLoan.book.author?.name ?? "Unknown Author"}</div>
                  <div className="text-sm text-gray-500">Borrowed by: {selectedLoan.user?.name ?? "Current User"}</div>
                  <div className="text-sm text-gray-500">
                    Due: {dayjs(selectedLoan.dueAt).format("DD MMMM YYYY")}
                  </div>
                </div>
              </div>
              <p>Mark this book as returned?</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setReturnModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => returnBookMutation.mutate(selectedLoan.id)}
                  disabled={returnBookMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {returnBookMutation.isPending ? "Processing..." : "Mark as Returned"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
