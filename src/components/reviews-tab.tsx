import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getUserReviews } from '@/services/reviews';
import { myLoans, type Loan } from '@/services/loans';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';
import dayjs from 'dayjs';

// Types
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

// Small helpers --------------------------------------------------------------
const Stars = ({ value }: { value: number }) => {
  const count = Math.max(0, Math.min(5, value || 0));
  return (
    <div className='flex items-center gap-1'>
      {Array.from({ length: 5 }).map((_, i) => (
        <img
          key={i}
          src='/star.svg'
          alt={i < count ? 'star filled' : 'star'}
          className={`h-5 w-5 select-none ${
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
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3'>(
    'all'
  );
  const [currentPage] = useState(1);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
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

  // Filter reviews based on search term
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

    if (ratingFilter === '5') {
      filtered = filtered.filter((r) => r.star === 5);
    } else if (ratingFilter === '4') {
      filtered = filtered.filter((r) => r.star === 4);
    } else if (ratingFilter === '3') {
      filtered = filtered.filter((r) => r.star <= 3);
    }

    return filtered;
  }, [reviews, searchTerm, ratingFilter]);

  return (
    <section className='space-y-6'>
      <div className='font-bold text-xl text-neutral-950 dark:text-foreground'>
        Reviews
      </div>

      <div className='mb-4 sm:mb-6'>
        <Input
          placeholder='Search reviews'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full rounded-full'
        />
      </div>

      <div className='flex flex-wrap gap-2 sm:gap-3'>
        {([
          { key: 'all', label: 'All' },
          { key: '5', label: '5 Stars' },
          { key: '4', label: '4 Stars' },
          { key: '3', label: '3 Stars & below' },
        ] satisfies { key: 'all' | '5' | '4' | '3'; label: string }[]).map(
          (filter) => (
            <button
              key={filter.key}
              className={`px-4 py-1 rounded-full text-sm ${
                ratingFilter === filter.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-background border'
              }`}
              onClick={() => setRatingFilter(filter.key)}
            >
              {filter.label}
            </button>
          )
        )}
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

              
              <div className='flex flex-col sm:flex-row gap-4 mt-4 text-neutral-950 dark:text-foreground'>
                <div 
                  className={correspondingLoan ? 'cursor-pointer hover:opacity-80' : ''}
                  onClick={correspondingLoan ? handleReturnClick : undefined}
                >
                  <img
                    src={review.book.coverImage || '/avatarfall.png'}
                    alt={review.book.title}
                    className='w-[92px] h-[138px] aspect-[2/3] object-cover rounded-lg border border-neutral-200 dark:border-neutral-800'
                  />
                </div>

                <div className='flex-1'>
                  <span 
                    className={`inline-block rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 text-neutral-950 px-2 py-1 text-[11px] font-bold ${correspondingLoan ? 'cursor-pointer hover:opacity-80' : ''}`}
                    onClick={correspondingLoan ? handleReturnClick : undefined}
                  >
                    {review.book.category || 'Category'}
                  </span>
                  <div 
                    className={`mt-2 text-md sm:text-lg font-bold text-neutral-950 dark:text-foreground ${correspondingLoan ? 'cursor-pointer hover:opacity-80' : ''}`}
                    onClick={correspondingLoan ? handleReturnClick : undefined}
                  >
                    {review.book.title}
                  </div>
                  <div className='text-sm sm:text-md mt-1 text-neutral-600 dark:text-neutral-400 font-medium'>
                    {review.book.author?.name || 'Unknown Author'}
                  </div>
                  <p className='text-sm sm:text-base mt-4 leading-6 text-neutral-950 dark:text-foreground'>
                    {review.comment}
                  </p>
                </div>
                
              </div>
              <div className='border-t mt-4 sm:mt-5 border-neutral-200 dark:border-border' />


              <div className='flex items-center gap-2 mt-4 sm:mt-5'>
                  <span>Rating:</span>
                  <Stars value={review.star} />
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
          {selectedLoan && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <img
                  src={selectedLoan.book.coverImage || '/avatarfall.png'}
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
    </section>
  );
}
