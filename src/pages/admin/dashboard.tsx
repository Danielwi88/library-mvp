import AdminBookList from "@/pages/admin/admin-book-list";
import AdminUserList from "@/pages/admin/admin-user-list";
import PaginationBar from "@/components/pagination-bar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getErrorMessage } from "@/lib/errors";
import { getAdminOverview, getOverdueLoans, type OverdueLoan } from "@/services/admin";
import { api } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";


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
  const [activeFilter, setActiveFilter] = useState("Overview");
  const [page, setPage] = useState(1);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<OverdueLoan | null>(null);
  const pageSize = 10;
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ["admin-loans", page, activeFilter],
    queryFn: () => getOverdueLoans(page, pageSize),
    enabled: activeFilter === "All" || activeFilter === "Active" || activeFilter === "Overdue"
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

  if (isLoading && (activeFilter === "All" || activeFilter === "Active" || activeFilter === "Overdue")) return <p>Loading...</p>;
  
  const loans = data?.overdue || [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Borrowed List</h1>
      <div className="flex space-x-2">
        {["Overview", "All", "Active", "Returned", "Overdue"].map((filter) => (
          <button
            key={filter}
            className={`px-4 py-1 rounded-full text-sm ${
              activeFilter === filter ? "bg-blue-600 text-white" : "bg-gray-100"
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
            {loans.map((loan: OverdueLoan) => (
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
                    {loan.book.coverUrl ? (
                      <img 
                        src={loan.book.coverUrl} 
                        alt={loan.book.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center text-xs">
                        No Cover
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-gray-500">Category</div>
                      <div className="font-medium">{loan.book.title}</div>
                      <div className="text-sm text-gray-500">{loan.book.author.name}</div>
                      <div className="text-sm">
                        {dayjs(loan.borrowedAt).format("DD MMM YYYY")} · Duration: 3 Days
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">borrower's name</div>
                    <div className="font-medium">{loan.user.name}</div>
                    <div className="text-sm">
                      Status: <span className="text-green-600">Active</span>
                    </div>
                    <div className="text-sm">
                      Due Date: <span className="text-red-500">{dayjs(loan.dueAt).format("DD MMMM YYYY")}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <PaginationBar
            page={page}
            pageSize={pageSize}
            total={data?.total || 0}
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
          {selectedLoan && (
            <div className="space-y-4">
              <div className="flex gap-4">
                {selectedLoan.book.coverUrl ? (
                  <img 
                    src={selectedLoan.book.coverUrl} 
                    alt={selectedLoan.book.title}
                    className="w-16 h-20 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center text-xs">
                    No Cover
                  </div>
                )}
                <div>
                  <div className="font-medium">{selectedLoan.book.title}</div>
                  <div className="text-sm text-gray-500">{selectedLoan.book.author.name}</div>
                  <div className="text-sm text-gray-500">Borrowed by: {selectedLoan.user.name}</div>
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




