import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getErrorMessage } from "@/lib/errors";
import { getAdminOverview, getOverdueLoans, getUsers, type OverdueLoan } from "@/services/admin";
import { api } from "@/services/api";
import { fetchBooks } from "@/services/books";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PaginationBar from "@/components/pagination-bar";


export default function AdminDashboard() {
  return (
    <div className=" mx-auto">
      <Tabs defaultValue="overview" className="w-full ">
        <TabsList className="grid w-full grid-cols-4 mb-6 h-14 max-w-[744px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="borrowed">Borrowed List</TabsTrigger>
          <TabsTrigger value="user">User</TabsTrigger>
          <TabsTrigger value="books">Book List</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>
        
        <TabsContent value="borrowed">
          <BorrowedListTab />
        </TabsContent>
        
        <TabsContent value="user">
          <UserTab />
        </TabsContent>
        
        <TabsContent value="books">
          <BookListTab />
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
  
  const { data, isLoading } = useQuery({
    queryKey: ["admin-overdue-loans", page, activeFilter],
    queryFn: () => getOverdueLoans(page, pageSize),
    enabled: activeFilter === "Overdue"
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
      queryClient.invalidateQueries({ queryKey: ["admin-overdue-loans"] });
      setReturnModalOpen(false);
      setSelectedLoan(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) ?? "Failed to return book");
    }
  });

  if (isLoading && activeFilter === "Overdue") return <p>Loading...</p>;
  
  const loans = activeFilter === "Overdue" ? (data?.overdue || []) : [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Borrowed List</h1>
      <div className="relative">

      <Input
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-lg px-10 rounded-full h-11 sm:h-12"
      />
      <SearchIcon className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5  text-neutral-600' />
      
      </div>
      <div className="flex space-x-2">
        {["All", "Active", "Returned", "Overdue"].map((filter) => (
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

function UserTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page],
    queryFn: () => getUsers()
  });
  
  const users = data?.items || [];
  const filteredUsers = users.filter(user => 
    search === "" || 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">User</h1>
      <div className="relative">

      <Input
        placeholder="Search user"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-lg px-10 rounded-full h-11 sm:h-12"
      />
      <SearchIcon className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5  text-neutral-600' />
      </div>

      {isLoading ? (
        <p>Loading users...</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">No</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Created at</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.createdAt ? dayjs(user.createdAt).format("DD MMM YYYY, HH:mm") : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      <PaginationBar
        page={page}
        pageSize={pageSize}
        total={filteredUsers.length}
        onPageChange={setPage}
        className="mt-6"
      />
    </div>
  );
}

function BookListTab() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<{ id: number; title: string } | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const { data, isLoading } = useQuery({
    queryKey: ["admin-books", search, page],
    queryFn: () => fetchBooks({ q: search, page, limit: pageSize })
  });
  
  const deleteBookMutation = useMutation({
    mutationFn: async (bookId: number) => {
      const { data } = await api.delete(`/books/${bookId}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Book deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-books"] });
      setDeleteModalOpen(false);
      setBookToDelete(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) ?? "Failed to delete book");
    }
  });
  
  const books = data?.items || [];
  
  const handleDeleteClick = (book: { id: number; title: string }) => {
    setBookToDelete(book);
    setDeleteModalOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (bookToDelete) {
      deleteBookMutation.mutate(bookToDelete.id);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Book List</h1>
        <Button className="bg-blue-600" onClick={() => navigate('/admin/add-book')}>Add Book</Button>
      </div>
      <div className="relative">

      <Input
        placeholder="Search book"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-lg px-10 rounded-full h-11 sm:h-12"
      />
      <SearchIcon className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5  text-neutral-600' />
      </div>
      
      <div className="flex space-x-2">
        {["All", "Available", "Borrowed"].map((filter) => (
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
      
      {isLoading ? (
        <p>Loading books...</p>
      ) : (
        <>
          <div className="space-y-4">
            {books.map((book) => (
              <div key={book.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    {book.coverUrl ? (
                      <img 
                        src={book.coverUrl} 
                        alt={book.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center text-xs">
                        No Cover
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{book.title}</div>
                      <div className="text-sm text-gray-500">{book.author?.name}</div>
                      <div className="text-sm text-gray-500">{book.categories[0]?.name || 'Uncategorized'}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/admin/edit-book/${book.id}`)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteClick({ id: Number(book.id), title: book.title })}
                    >
                      Delete
                    </Button>
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
      
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Book</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete "{bookToDelete?.title}"? This action cannot be undone.</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={deleteBookMutation.isPending}
            >
              {deleteBookMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

}
