import { useQuery } from '@tanstack/react-query';
import { myLoans, type Loan } from '@/services/loans';
import { Button } from '@/components/ui/button';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CoverImage from '@/components/cover-image';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileTab } from '@/components/profile-tab';
import { ReviewsTab } from '@/components/reviews-tab';
import { ReviewModal } from '@/components/review-modal';

export default function Loans() {
  const [searchParams] = useSearchParams();
  const loansQuery = useQuery({ queryKey: ['loans'], queryFn: myLoans });

  // Get tab from URL params, default to profile
  const tabFromUrl = searchParams.get('tab') || 'profile';
  const [currentTab, setCurrentTab] = useState(tabFromUrl);

  // filters & search
  const [activeTab, setActiveTab] = useState<
    'all' | 'active' | 'returned' | 'overdue'
  >('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const tab = searchParams.get('tab') || 'profile';
    setCurrentTab(tab);
  }, [searchParams]);

  // client-side filter
  const filteredLoans = ((loans: Loan[] | undefined) => {
    if (!loans) return [];

    let filtered = [...loans];

    // Apply status filter
    if (activeTab === 'active') {
      filtered = filtered.filter((loan) => loan.status === 'BORROWED');
    } else if (activeTab === 'returned') {
      filtered = filtered.filter((loan) => loan.status === 'RETURNED');
    } else if (activeTab === 'overdue') {
      filtered = filtered.filter((loan) => loan.status === 'OVERDUE');
    }

    // Apply search filter
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
        return 'text-blue-600';
      case 'RETURNED':
        return 'text-green-600';
      case 'OVERDUE':
        return 'text-red-600';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD MMMM YYYY');
  };

  // No longer needed as this is moved to ProfileTab component

  return (
    <>
      <h1 className='mx-auto max-w-[1000px] px-4 sm:px-0 text-display-xs sm:text-display-lg leading-[38px] font-bold mb-4 sm:mb-8'>
        My Profile
      </h1>
      <div className='mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-0'>
        <div className='mb-6'>
          <Tabs
            value={currentTab}
            onValueChange={setCurrentTab}
            className='w-full'
          >
            <TabsList className='grid w-[557px] grid-cols-3 mb-6 h-[56px]'>
              <TabsTrigger value='profile' className='h-10'>
                Profile
              </TabsTrigger>
              <TabsTrigger value='borrowed' className='h-10 active:bg-white rounded-xl'>Borrowed List</TabsTrigger>
              <TabsTrigger value='reviews'>Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value='profile'>
              <ProfileTab />
            </TabsContent>

            <TabsContent value='reviews'>
              <ReviewsTab />
            </TabsContent>

            <TabsContent value='borrowed' className='space-y-6'>
              <div className='font-bold text-xl text-neutral-950 dark:text-foreground'>
                Borrowed List
              </div>

              <div className='mb-4'>
                <Input
                  placeholder='Search book'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className='w-full'
                />
              </div>

              <div className='flex space-x-2 mb-4'>
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
                {filteredLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className='rounded-2xl border border-neutral-300 dark:border-border bg-white dark:bg-background p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]'
                  >
                    <div className='flex justify-between items-center mb-2'>
                      <div className='text-sm font-medium'>
                        Status:{' '}
                        <span className={getStatusClass(loan.status)}>
                          {loan.status === 'BORROWED'
                            ? 'Active'
                            : loan.status === 'RETURNED'
                            ? 'Returned'
                            : 'Overdue'}
                        </span>
                      </div>
                      <div className='text-sm'>
                        Due Date:{' '}
                        <span className='text-red-500 font-medium'>
                          {formatDate(loan.dueAt)}
                        </span>
                      </div>
                    </div>

                    <div className='flex gap-4'>
                      <CoverImage
                        src={loan.book.coverImage}
                        alt={loan.book.title}
                        className='w-16 h-24 object-cover rounded'
                      />
                      <div className='flex-1'>
                        <span className='text-sm inline-block rounded border border-neutral-300 bg-neutral-50 text-neutral-950 px-2 py-1 text-[11px] font-semibold'>
                          Category
                        </span>
                        <div className='mt-2 text-md sm:text-lg font-bold text-neutral-950 dark:text-foreground'>
                          {loan.book.title}
                        </div>
                        <div className='text-sm text-neutral-950 sm:text-neutral-500 font-medium'>
                          Author name
                        </div>
                        <div className='text-sm'>
                          {dayjs(loan.borrowedAt).format('DD MMM YYYY')} ·
                          Duration: 3 Days
                        </div>
                      </div>
                      <div className='flex items-end'>

                        <ReviewModal loan={loan} />
                      </div>
                    </div>
                  </div>
                ))}

                {filteredLoans.length > 3 && (
                  <div className='flex justify-center'>
                    <Button variant='outline' className='w-full max-w-xs'>
                      Load More
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value='reviews' className='space-y-4'>
              <h1 className='text-xl font-semibold'>Reviews</h1>
              <p className='text-gray-500'>
                You haven't written any reviews yet.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
