import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOverdueLoans, type OverdueLoan } from "@/services/admin";
import { fetchBooks } from "@/services/books";
import { getUsers } from "@/services/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { api } from "@/services/api";
import dayjs from "dayjs";

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto">
      <Tabs defaultValue="borrowed" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="borrowed">Borrowed List</TabsTrigger>
          <TabsTrigger value="user">User</TabsTrigger>
          <TabsTrigger value="books">Book List</TabsTrigger>
        </TabsList>
        
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

function BorrowedListTab() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-overdue-loans"],
    queryFn: () => getOverdueLoans(1, 20)
  });

  if (isLoading) return <p>Loading...</p>;
  
  const loans = data?.overdue || [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Borrowed List</h1>
      
      <Input
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />
      
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
          <div key={loan.id} className="border rounded-lg p-4">
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
    </div>
  );
}

function UserTab() {
  const [search, setSearch] = useState("");
  
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
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
      
      <Input
        placeholder="Search user"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />
      
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
  
  const { data, isLoading } = useQuery({
    queryKey: ["admin-books", search],
    queryFn: () => fetchBooks({ q: search, page: 1, limit: 20 })
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
      
      <Input
        placeholder="Search book"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />
      
      <div className="flex space-x-2">
        {["All", "Available", "Borrowed", "Returned", "Damaged"].map((filter) => (
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
      
      {isLoading && <p>Loading...</p>}
      
      <div className="space-y-4">
        {books.map((book) => (
          <div key={book.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-center">
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
                  <div className="text-sm text-gray-500">{book.categories[0]?.name || 'Uncategorized'}</div>
                  <div className="font-medium">{book.title}</div>
                  <div className="text-sm text-gray-500">{book.author.name}</div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm">{book.rating}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate(`/admin/book/${book.id}`)}>Preview</Button>
                <Button variant="outline" onClick={() => navigate(`/admin/book/${book.id}/edit`)}>Edit</Button>
                <Button 
                  variant="outline" 
                  className="text-red-600"
                  onClick={() => handleDeleteClick({ id: Number(book.id), title: book.title })}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Once deleted, you won't be able to recover this data.
            </p>
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmDelete}
                disabled={deleteBookMutation.isPending}
                className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
              >
                {deleteBookMutation.isPending ? 'Deleting...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
