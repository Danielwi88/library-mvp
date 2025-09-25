import PaginationBar from "@/components/pagination-bar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/errors";
import { api } from "@/services/api";
import { fetchBooks } from "@/services/books";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, SearchIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AdminBookList() {
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
      <div className="flex flex-col justify-start items-start gap-4 sm:gap-6">
        <h1 className="text-display-xs sm:text-display-sm font-bold text-neutral-950 dark:text-foreground">Book List</h1>
        <Button className="bg-primary-300  rounded-full w-full sm:w-[240px] h-12 text-md font-bold text-neutral-25" onClick={() => navigate('/admin/add-book')}>Add Book</Button>
      </div>
      
      <div className="relative mt-6">
        <Input
          placeholder="Search book"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xl rounded-full px-10 h-12"
        />
        <SearchIcon className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-5 text-neutral-600' />
      </div>
      
      <div className="flex space-x-2 mb-4 sm:mb-6 mt-6 overflow-auto dark:text-background">
        {["All", "Available", "Borrowed", "Returned", "Damaged"].map((filter) => (
          <button
            key={filter}
            className={`px-4 py-1 h-10 sm:text-md font-bold rounded-full text-sm ${
              activeFilter === filter ? "bg-primary-100 text-primary-300 border-primary-300 border"  : "bg-gray-100"
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
          <div className="space-y-6">
            {books.map((book) => (
              <div key={book.id} className="rounded-2xl bg-white dark:bg-background p-5 shadow-custom">
                <div className="flex gap-4">
                  {book.coverUrl ? (
                    <img 
                      src={book.coverUrl} 
                      alt={book.title}
                      className="w-[92px] h-[138px] aspect-2/3 object-cover rounded"
                    />
                  ) : (
                    <div className="w-[92px] h-[138px] bg-gray-200 rounded flex items-center justify-center text-xs">
                      No Cover
                    </div>
                  )}
                  <div className="flex-1">
                    <span className="text-sm inline-block rounded border border-neutral-300 bg-neutral-50 text-neutral-950 px-2 py-1 text-[11px] font-bold">
                      {book.categories[0]?.name || 'Uncategorized'}
                    </span>
                    <div className="mt-2 text-sm sm:text-lg font-bold text-neutral-950 dark:text-foreground">
                      {book.title}
                    </div>
                    <div className="text-sm sm:text-md mt-1 text-neutral-950 sm:text-neutral-500 font-medium">
                      {book.author?.name || 'Unknown Author'}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm sm:text-md font-bold">{book.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {/* Desktop buttons */}
                    <div className="hidden sm:flex gap-2 ">
                      <Button 
                        variant="outline2" 
                        size="sm"
                        onClick={() => navigate(`/admin/book/${book.id}`)}
                        className="rounded-full h-12 w-[95px] font-bold sm:text-md"
                      >
                        Preview
                      </Button>
                      <Button 
                        variant="outline2" 
                        size="sm"
                        onClick={() => navigate(`/admin/book/${book.id}/edit`)}
                        className="rounded-full h-12 w-[95px] font-bold sm:text-md"
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteClick({ id: Number(book.id), title: book.title })}
                        className="rounded-full h-12 w-[95px] font-bold sm:text-md"
                      >
                        Delete
                      </Button>
                    </div>
                    
                    {/* Mobile dropdown */}
                    <div className="sm:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-2">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => navigate(`/admin/book/${book.id}`)}>
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/admin/book/${book.id}/edit`)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick({ id: Number(book.id), title: book.title })}
                            className="text-red-600"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
