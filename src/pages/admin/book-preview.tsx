import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { fetchBookDetail } from "@/services/books";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share } from "lucide-react";



export default function BookPreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["book-detail", id],
    queryFn: () => fetchBookDetail(id!),
    enabled: !!id
  });

  if (isLoading) return <p>Loading...</p>;
  if (error || !data) return <p className="text-red-500">Failed to load book</p>;

  const { book } = data;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate("/admin")} className="p-1 hover:bg-gray-100 rounded">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-xl font-semibold">Preview Book</h1>
      </div>

      <div className="flex gap-8">
        {/* Book Cover */}
        <div className="flex-shrink-0">
          {book.coverUrl ? (
            <img 
              src={book.coverUrl} 
              alt={book.title}
              className="w-80 h-auto object-cover rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-80 h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">No Cover Available</span>
            </div>
          )}
        </div>

        {/* Book Details */}
        <div className="flex-1 space-y-6">
          <div>
            <div className="text-sm text-gray-600 mb-2">{book.categories?.[0]?.name || 'Uncategorized'}</div>
            <h2 className="text-3xl font-bold mb-2">{book.title}</h2>
            <div className="text-lg text-gray-700 mb-4">{book.author?.name || "Unknown Author"}</div>
            
            <div className="flex items-center gap-1 mb-6">
              <span className="text-yellow-400 text-xl">★</span>
              <span className="text-lg font-semibold">{book.rating}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-bold">{book.totalCopies || 0}</div>
              <div className="text-sm text-gray-600">Total Copies</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{book.reviewCount || 0}</div>
              <div className="text-sm text-gray-600">Reviews</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{book.borrowCount || 0}</div>
              <div className="text-sm text-gray-600">Times Borrowed</div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {book.description || "No description available."}
            </p>
          </div>

          {/* Book Info */}
          <div className="space-y-2">
            <div className="flex gap-4">
              <span className="font-medium">ISBN:</span>
              <span className="text-gray-700">{String((book as unknown as { isbn?: string | number }).isbn ?? "N/A")}</span>
            </div>
            <div className="flex gap-4">
              <span className="font-medium">Published Year:</span>
              <span className="text-gray-700">{String((book as unknown as { publishedYear?: string | number }).publishedYear ?? "N/A")}</span>
            </div>
            <div className="flex gap-4">
              <span className="font-medium">Available Copies:</span>
              <span className="text-gray-700">{book.stock || 0}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1">
              Add to Cart
            </Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
              Borrow Book
            </Button>
            <Button variant="outline" size="icon">
              <Share className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}