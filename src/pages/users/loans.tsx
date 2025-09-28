import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { myLoans, type Loan } from '@/services/loans';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CoverImage from '@/components/cover-image';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileTab } from '@/components/profile-tab';
import { ReviewsTab } from '@/components/reviews-tab';
import { ReviewModal } from '@/components/review-modal';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

export default function Loans() {
  const [searchParams] = useSearchParams();
  const loansQuery = useQuery({ queryKey: ['loans'], queryFn: myLoans });
  const queryClient = useQueryClient();

  // Get tab from URL params, default to profile
  const tabFromUrl = searchParams.get('tab') || 'profile';
  const [currentTab, setCurrentTab] = useState(tabFromUrl);

  const [activeTab, setActiveTab] = useState<
    'all' | 'active' | 'returned' | 'overdue'
  >('all');
  const [search, setSearch] = useState('');
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const returnBookMutation = useMutation({
    mutationFn: async (loanId: number) => {
      const { data } = await api.patch(`/loans/${loanId}/return`);
      return data;
    },
    onSuccess: () => {
      toast.success('Book successfully returned');
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      setReturnModalOpen(false);
      setSelectedLoan(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) ?? 'Failed to return book');
    },
  });

  useEffect(() => {
    const tab = searchParams.get('tab') || 'profile';
    setCurrentTab(tab);
  }, [searchParams]);

  // client-side filter
  const filteredLoans = ((loans: Loan[] | undefined) => {
    if (!loans) return [];

    let filtered = [...loans];

    if (activeTab === 'active') {
      filtered = filtered.filter((loan) => loan.status === 'BORROWED');
    } else if (activeTab === 'returned') {
      filtered = filtered.filter((loan) => loan.status === 'RETURNED');
    } else if (activeTab === 'overdue') {
      filtered = filtered.filter((loan) => loan.status === 'OVERDUE');
    }

    if (search) {
      filtered = filtered.filter((loan) =>
        loan.book.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    return filtered;
  })(loansQuery.data);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'BORROWED':
        return 'text-accent-green bg-[#24A500]/5 p-2 rounded-[4px]';
      case 'RETURNED':
        return 'text-primary-300 bg-primary-100/5 p-2 rounded-[4px]';
      case 'OVERDUE':
        return 'text-red-600 bg-[#EE1D52]/5 p-2 rounded-[4px]';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD MMMM YYYY');
  };

  return (
    <>
      <h1 className='mx-auto max-w-[1000px] px-4 sm:px-0 text-display-xs sm:text-display-lg leading-[38px] font-bold mb-4 sm:mb-8'>
        My Profile
      </h1>
      <div className='mx-auto sm:max-w-[1000px] px-4 sm:px-6 lg:px-0'>
        <div className='mb-6 '>
          <Tabs
            value={currentTab}
            onValueChange={setCurrentTab}
            className='w-full'
          >
            <TabsList className='grid w-full max-w-[557px] grid-cols-3 mb-6 h-[56px]'>
              <TabsTrigger value='profile' className='h-10 '>
                Profile
              </TabsTrigger>
              <TabsTrigger
                value='borrowed'
                className='h-10 active:bg-white rounded-xl'
              >
                Borrowed List
              </TabsTrigger>
              <TabsTrigger value='reviews'>Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value='profile' className='w-full max-w-[557px]'>
              <ProfileTab />
            </TabsContent>

            <TabsContent value='reviews'>
              <ReviewsTab />
            </TabsContent>

            <TabsContent value='borrowed' className='space-y-6'>
              <div className='font-bold text-xl text-neutral-950 dark:text-foreground'>
                Borrowed List
              </div>

              <div className='mb-4sm:mb-6'>
                <Input
                  placeholder='Search book'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className='w-full rounded-full'
                />
              </div>

              <div className='flex space-x-2 mb-4 sm:mb-6'>
                <button
                  className={`px-4 py-1 rounded-full text-sm ${
                    activeTab === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-background border'
                  }`}
                  onClick={() => setActiveTab('all')}
                >
                  All
                </button>
                <button
                  className={`px-4 py-1 rounded-full text-sm ${
                    activeTab === 'active'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-background border'
                  }`}
                  onClick={() => setActiveTab('active')}
                >
                  Active
                </button>
                <button
                  className={`px-4 py-1 rounded-full text-sm ${
                    activeTab === 'returned'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-background border'
                  }`}
                  onClick={() => setActiveTab('returned')}
                >
                  Returned
                </button>
                <button
                  className={`px-4 py-1 rounded-full text-sm ${
                    activeTab === 'overdue'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-background border'
                  }`}
                  onClick={() => setActiveTab('overdue')}
                >
                  Overdue
                </button>
              </div>

              {loansQuery.isLoading && <p>Loading...</p>}
              {loansQuery.error && (
                <p className='text-red-500'>Failed to load</p>
              )}

              <div className='space-y-6'>
                {filteredLoans.map((loan) => {
                  const handleReturnClick = () => {
                    if (loan.status === 'BORROWED') {
                      setSelectedLoan(loan);
                      setReturnModalOpen(true);
                    }
                  };

                  return (
                    <div
                      key={loan.id}
                      className='rounded-2xl bg-white dark:bg-background p-5 shadow-custom '
                    >
                      <div className='flex justify-between items-center mb-2'>
                        <div className='text-sm font-medium'>
                          Status:{' '}
                          <span
                            className={`${getStatusClass(loan.status)} ${
                              loan.status === 'BORROWED'
                                ? 'cursor-pointer hover:opacity-80'
                                : ''
                            }`}
                            onClick={
                              loan.status === 'BORROWED'
                                ? handleReturnClick
                                : undefined
                            }
                          >
                            {loan.status === 'BORROWED'
                              ? 'Active'
                              : loan.status === 'RETURNED'
                              ? 'Returned'
                              : 'Overdue'}
                          </span>
                        </div>
                        <div className='text-sm'>
                          Due Date:{' '}
                          <span className='text-red-500 font-medium bg-[#EE1D52]/5 p-2 rounded-xs'>
                            {formatDate(loan.dueAt)}
                          </span>
                        </div>
                      </div>
                      <div className='border-t mt-4 sm:mt-5 border-neutral-200 w-full'></div>

                      <div className='flex flex-col sm:flex-row gap-4 mt-4 sm:mt-5'>
                        <div
                          className={
                            loan.status === 'BORROWED'
                              ? 'cursor-pointer hover:opacity-80'
                              : ''
                          }
                          onClick={
                            loan.status === 'BORROWED'
                              ? handleReturnClick
                              : undefined
                          }
                        >
                          <div className='flex gap-4'>
                            <CoverImage
                              src={loan.book.coverImage}
                              alt={loan.book.title}
                              className='w-[92px] h-[138px] aspect-2/3 object-cover'
                            />
                            <div className='flex-1'>
                              <span
                                className={`text-sm inline-block rounded-sm border border-neutral-300 bg-neutral-50 text-neutral-950 px-2 py-1  font-bold ${
                                  loan.status === 'BORROWED'
                                    ? 'cursor-pointer hover:opacity-80'
                                    : ''
                                }`}
                                onClick={
                                  loan.status === 'BORROWED'
                                    ? handleReturnClick
                                    : undefined
                                }
                              >
                                Category
                              </span>
                              {loan.status === 'BORROWED' ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div
                                      className='mt-2 text-md sm:text-lg font-bold text-neutral-950 dark:text-foreground cursor-pointer hover:opacity-80'
                                      onClick={handleReturnClick}
                                    >
                                      {loan.book.title}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Click to return book
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <div className='mt-2 text-md sm:text-lg font-bold text-neutral-950 dark:text-foreground'>
                                  {loan.book.title}
                                </div>
                              )}
                              <div className='text-sm sm:text-md mt-1  text-neutral-950 sm:text-neutral-500 font-medium'>
                                {(() => {
                                  const author = loan.book.author;
                                  if (typeof author === 'string') {
                                    return author;
                                  }
                                  return author?.name || 'Unknown Author';
                                })()}
                              </div>
                              <div className='text-sm sm:text-md font-bold mt-1'>
                                {dayjs(loan.borrowedAt).format('DD MMM YYYY')} ·
                                Duration: 3 Days
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className='flex items-center mt-6 sm:mt-0 sm:ml-auto'>
                          <ReviewModal loan={loan} />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredLoans.length > 3 && (
                  <div className='flex justify-center'>
                    <Button
                      variant='outline'
                      className='rounded-full w-full sm:text-md font-bold sm:w-[200px]  max-w-xs h-12'
                    >
                      Load More
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <Dialog open={returnModalOpen} onOpenChange={setReturnModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Return Book</DialogTitle>
                </DialogHeader>
                {selectedLoan && (
                  <div className='space-y-4'>
                    <div className='flex gap-4'>
                      <CoverImage
                        src={selectedLoan.book.coverImage}
                        alt={selectedLoan.book.title}
                        className='w-16 h-20 object-cover rounded'
                      />
                      <div>
                        <div className='font-medium'>
                          {selectedLoan.book.title}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {selectedLoan.book.author.name}
                        </div>
                        <div className='text-sm text-gray-500'>
                          Due:{' '}
                          {dayjs(selectedLoan.dueAt).format('DD MMMM YYYY')}
                        </div>
                      </div>
                    </div>
                    <p>Mark this book as returned?</p>
                    <div className='flex justify-end gap-2'>
                      <Button
                        variant='outline'
                        onClick={() => setReturnModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() =>
                          returnBookMutation.mutate(selectedLoan.id)
                        }
                        disabled={returnBookMutation.isPending}
                        className='bg-green-600 hover:bg-green-700'
                      >
                        {returnBookMutation.isPending
                          ? 'Processing...'
                          : 'Mark as Returned'}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <TabsContent value='reviews' className='space-y-4'>
              {/* <h1 className='text-xl font-semibold'>Reviews</h1>
              <p className='text-gray-500'>
                You haven't written any reviews yet.
              </p> */}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
