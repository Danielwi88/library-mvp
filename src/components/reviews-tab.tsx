import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getUserReviews, deleteReview } from '@/services/reviews';
import { myLoans, type Loan } from '@/services/loans';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';
import dayjs from 'dayjs';
import CoverImage from '@/components/cover-image';


interface Review {
  id: number;
  bookId: number;
  userId: number;
  star: number;
  comment: string;
  createdAt: string;
  book: {
    id: number;
    title: string;
    author: { id: number; name: string };
    category: string;
    coverImage: string;
  };
}


interface ReviewsResponse {
  success: boolean;
  message: string;
  data: {
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

const EMPTY_REVIEWS: Review[] = [];


const Stars = ({ value }: { value: number }) => {
  const count = Math.max(0, Math.min(5, value || 0));
  return (
    <div className='flex items-center gap-1'>
      {Array.from({ length: 5 }).map((_, i) => (
        <img
          key={i}
          src='/star.svg'
          alt={i < count ? 'star filled' : 'star'}
          className={`size-6 select-none ${
            i < count ? 'opacity-100' : 'opacity-30'
          }`}
          draggable={false}
        />
      ))}
    </div>
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export function ReviewsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage] = useState(1);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const queryClient = useQueryClient();

  const returnBookMutation = useMutation({
    mutationFn: async (loanId: number) => {
      const { data } = await api.patch(`/loans/${loanId}/return`);
      return data;
    },
    onSuccess: () => {
      toast.success("Book successfully returned");
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      setReturnModalOpen(false);
      setSelectedLoan(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) ?? "Failed to return book");
    }
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      return await deleteReview(reviewId);
    },
    onSuccess: () => {
      toast.success("Review deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setDeleteModalOpen(false);
      setSelectedReview(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) ?? "Failed to delete review");
    }
  });

  // Fetch reviews and loans
  const { data, isLoading, error } = useQuery<ReviewsResponse>({
    queryKey: ['reviews', currentPage],
    queryFn: () => getUserReviews(currentPage),
  });

  const { data: loansData } = useQuery({
    queryKey: ['loans'],
    queryFn: myLoans
  });

  const reviews = data?.data?.reviews ?? EMPTY_REVIEWS;

  
  const filteredReviews = useMemo(() => {
    let filtered = reviews;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.book.title.toLowerCase().includes(q) ||
          r.book.author?.name?.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q) ||
          (r.book.category || '').toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [reviews, searchTerm]);

  return (
    <section className='space-y-6'>
      <div className='font-bold text-xl text-neutral-950 dark:text-foreground'>
        Reviews
      </div>

      <div className='mb-4 sm:mb-6 '>
        <Input
          placeholder='Search reviews'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='max-w-xl rounded-full h-11 sm:h-12'
        />
      </div>

      {isLoading && (
        <div className='flex justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-neutral-100' />
        </div>
      )}

      {error && !isLoading && (
        <div className='text-center py-8 text-red-500'>
          Failed to load reviews
        </div>
      )}

      {!isLoading && !error && filteredReviews.length === 0 && (
        <div className='text-center py-8 text-neutral-500'>
          No reviews found
        </div>
      )}

      {/* List */}
      {!isLoading && !error && filteredReviews.length > 0 && (
        <div className='space-y-6'>
          {filteredReviews.map((review) => {
            const correspondingLoan = loansData?.find(
              (loan: Loan) => loan.bookId === review.bookId && loan.status === 'BORROWED'
            );
            
            const handleReturnClick = () => {
              if (correspondingLoan) {
                setSelectedLoan(correspondingLoan);
                setReturnModalOpen(true);
              }
            };
            
            return (
            <div
              key={review.id}
              className='rounded-2xl bg-white dark:bg-background p-5 shadow-custom'
            >
              <div className='flex flex-col items-start justify-between gap-3 text-sm font-medium text-neutral-950 dark:text-foreground'>

                <div className='text-sm'>
                  Reviewed on:{' '}
                  <span className='text-neutral-950 dark:text-neutral-300 font-medium'>
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                
                
              </div>

              
              <div className='flex flex-col sm:flex-row gap-4 mt-4 text-neutral-950 dark:text-foreground sm:items-center sm:justify-between'>
                <div 
                  className={correspondingLoan ? 'cursor-pointer hover:opacity-80' : ''}
                  onClick={correspondingLoan ? handleReturnClick : undefined}
                >
                  <CoverImage
                    src={review.book.coverImage}
                    alt={review.book.title}
                    className='w-[92px] h-[138px] aspect-[2/3] object-cover rounded-lg border border-neutral-200 dark:border-neutral-800'
                  />
                </div>

                <div className='flex-1 flex flex-col justify-center gap-2'>
                  <span 
                    className={`max-w-[79px] text-center inline-block rounded-sm border border-neutral-300 dark:border-border bg-neutral-50 text-neutral-950 px-2 py-1 text-sm font-bold ${correspondingLoan ? 'cursor-pointer hover:opacity-80' : ''}`}
                    onClick={correspondingLoan ? handleReturnClick : undefined}
                  >
                    {review.book.category || 'Category'}
                  </span>
                  <div 
                    className={`text-md sm:text-lg font-bold text-neutral-950 dark:text-foreground ${correspondingLoan ? 'cursor-pointer hover:opacity-80' : ''}`}
                    onClick={correspondingLoan ? handleReturnClick : undefined}
                  >
                    {review.book.title}
                  </div>
                  <div className='text-sm sm:text-md text-neutral-600 dark:text-neutral-400 font-medium'>
                    {review.book.author?.name || 'Unknown Author'}
                  </div>
                  
                </div>
                
              </div>
              <div className='border-t mt-4 sm:mt-5 border-neutral-200 dark:border-border' />


              <div className='flex items-start gap-2 mt-4 sm:mt-5 flex-col justify-center'>
                <div className='flex items-center justify-between w-full'>
                  <Stars value={review.star} />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedReview(review);
                      setDeleteModalOpen(true);
                    }}
                    className="text-accent-red hover:text-red-500 hover:font-bold hover:bg-red-50 rounded-full px-6"
                  >
                    Delete
                  </Button>
                </div>
                <p className='text-sm sm:text-base mt-0 leading-6 text-neutral-950 dark:text-foreground'>
                  {review.comment}
                </p>
              </div>
            </div>
            );
          })}
        </div>
      )}

      <Dialog open={returnModalOpen} onOpenChange={setReturnModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Return Book</DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Review the borrowing details and confirm returning the selected book.
        </DialogDescription>
        {selectedLoan && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <CoverImage
                  src={selectedLoan.book.coverImage}
                  alt={selectedLoan.book.title}
                  className="w-16 h-20 object-cover rounded"
                />
                <div>
                  <div className="font-medium">{selectedLoan.book.title}</div>
                  <div className="text-sm text-gray-500">{selectedLoan.book.author.name}</div>
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

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Review</DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Confirm permanent deletion of the selected review entry.
        </DialogDescription>
        {selectedReview && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <CoverImage
                  src={selectedReview.book.coverImage}
                  alt={selectedReview.book.title}
                  className="w-16 h-20 object-cover rounded"
                />
                <div>
                  <div className="font-medium">{selectedReview.book.title}</div>
                  <div className="text-sm text-gray-500">{selectedReview.book.author?.name}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Stars value={selectedReview.star} />
                  </div>
                </div>
              </div>
              <p>Are you sure you want to delete this review? This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeleteModalOpen(false)} className='rounded-full'>
                  Cancel
                </Button>
                <Button 
                  onClick={() => deleteReviewMutation.mutate(selectedReview.id)}
                  disabled={deleteReviewMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 rounded-full"
                >
                  {deleteReviewMutation.isPending ? "Deleting..." : "Delete Review"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
