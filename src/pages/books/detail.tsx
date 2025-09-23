import CoverImage from '@/components/cover-image';
import ProductCard from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { add } from '@/features/cart/cartSlice';
import { fetchBookDetail, fetchBooks } from '@/services/books';
import { upsertReview, type Review } from '@/services/reviews';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Share2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function BookDetail() {
  const { id = '' } = useParams();
  const qc = useQueryClient();
  const dispatch = useDispatch();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const detailQ = useQuery({
    queryKey: ['book-detail', id],
    queryFn: () => fetchBookDetail(id),
  });

  const reviewMutation = useMutation({
    mutationFn: (v: { rating: number; comment?: string }) =>
      upsertReview(id, v),
    // Optimistic: update list immediately
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: ['book-detail', id] });
      const previous = qc.getQueryData<{
        book: import('@/services/books').BookDetail;
        reviews: Review[];
      }>(['book-detail', id]);
      const me: Review = {
        id: 'optimistic',
        bookId: id,
        user: { id: 'me', name: 'You' },
        rating: v.rating,
        comment: v.comment,
        createdAt: new Date().toISOString(),
      };
      if (previous) {
        qc.setQueryData(['book-detail', id], {
          ...previous,
          reviews: [me, ...previous.reviews],
        });
      }
      return { previous };
    },
    onError: (_err, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(['book-detail', id], ctx.previous);
      toast.error('Failed to submit review');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['book-detail', id] });
      toast.success('Review submitted');
    },
  });

  const { register, handleSubmit, reset, watch } = useForm<{
    rating: number;
    comment?: string;
  }>({ defaultValues: { rating: 5 } });
  const relatedQ = useQuery({
    queryKey: ['related', id],
    queryFn: () => fetchBooks({ page: 1, limit: 6 }),
  });

  if (detailQ.isLoading) return <p>Loading...</p>;
  if (!detailQ.data) return <p>Not found</p>;
  const { book: b, reviews } = detailQ.data;

  return (
    <div className='mx-auto px-4 sm:px-6 lg:px-0 space-y-0 '>
      {/* Breadcrumb */}
      <div className='text-[11px] sm:text-xs text-neutral-500 flex items-center gap-1'>
        <Link to='/' className='hover:underline text-primary-300 text-sm font-semibold'>
          Home
        </Link>
        <span className='mx-1 text-neutral-400'>›</span>
        {b.categories?.[0] && (
          <>
            <span className='hover:underline text-primary-300 text-sm font-semibold'>{b.categories[0].name}</span>
            <span className='mx-1 text-neutral-400'>›</span>
          </>
        )}
        <span className='hover:underline text-neutral-950 text-sm font-semibold dark:text-foreground'>{b.title}</span>
      </div>

      {/* Top section card */}
      <div className=' bg-white dark:bg-background pt-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] mt-1'>
        <div className='flex flex-col md:flex-row gap-9 items-center md:items-start'>
          {/* Left: cover + metadata */}
          <div className='flex-shrink-0 mx-auto md:mx-0'>
            <button type='button' onClick={() => setIsSheetOpen(true)} className='block'>
              <CoverImage
                src={b.coverUrl}
                alt={b.title}
                index={0}
                className='w-[212px] sm:w-[260px] md:w-[321px] aspect-[321/482] object-cover border-8 border-neutral-200 cursor-pointer'
              />
            </button>
            {/* <div className='mt-3 text-xs inline-flex items-center gap-1 text-neutral-950'>
              <img src='/star.svg' className='w-3.5 h-3.5' />{' '}
              {b.rating.toFixed(1)}
            </div>
            <div className='mt-1 text-xs font-semibold text-neutral-800'>
              {b.author.name}
            </div> */}
          </div>

          {/* Right: title + stats + description + actions */}
          <div className='flex-1 space-y-0 mt-3 text-start md:text-left'>
            {b.categories?.[0] && (
              <div className='inline-block rounded border border-neutral-300 bg-neutral-25 text-neutral-800  px-3 py-0.5 text-sm font-bold'>
                {b.categories[0].name}
              </div>
            )}
            <h1 onClick={() => setIsSheetOpen(true)} className='mt-2 text-md sm:text-lg sm:text-display-sm font-bold text-neutral-950 dark:text-foreground cursor-pointer'>
              {b.title}
            </h1>
            <div className='mt-1 text-sm sm:text-md text-neutral-950 dark:text-foreground sm:text-neutral-700 font-medium'>
              {b.author.name}
            </div>
            <div className='mt-2 flex items-center gap-1 text-sm sm:text-md font-bold text-neutral-900'>
              <img src='/star.svg' className='w-6 h-6' />{' '}
              {b.rating.toFixed(1)}
            </div>
            <div className='grid w-full sm:max-w-[70%]  mx-auto md:mx-0 grid-cols-3 divide-x border-none border-neutral-300 dark:border-border mt-0 sm:mt-[6px] dark:text-foreground'>
              <div className='pt-3 sm:pt-4 text-start'>
                <div className='text-lg sm:text-display-xs font-bold text-neutral-950 dark:text-foreground'>
                  {b.totalCopies ?? 0}
                </div>
                <div className='text-sm sm:text-md font-medium text-neutral-950 dark:text-foreground mt-1'>Page</div>
              </div>
              <div className='p-4 text-start '>
                <div className='text-lg sm:text-display-xs font-bold text-neutral-950 dark:text-foreground'>
                  {b.rating.toFixed(0)}
                </div>
                <div className='text-sm sm:text-md font-medium text-neutral-950 dark:text-foreground mt-1'>Rating</div>
              </div>
              <div className='p-4 text-start '>
                <div className='text-lg sm:text-display-xs font-bold text-neutral-950 dark:text-foreground'>
                  {b.reviewCount ?? 0}
                </div>
                <div className='text-sm sm:text-md font-medium text-neutral-950 dark:text-foreground mt-1'>Reviews</div>
              </div>
            </div>
            <hr className='border-neutral-300 w-[90%] sm:w-[70%] mx-auto md:mx-0 mt-4' />
            <div className='mt-4 sm:mt-5'>
              <div className='text-xl font-bold text-neutral-950 mb-1 mt-5 dark:text-foreground'>Description</div>
              <p className='text-sm sm:text-md font-medium text-neutral-950  dark:text-foreground leading-6 line-clamp-6 sm:line-clamp-3 overflow-scroll sm:min-h-[70px] text-left'>
                {b.description}
              </p>
            </div>
            <div className='hidden sm:flex flex-wrap items-center gap-3 pt-2'>
              <Button
                variant='outline'
                onClick={() =>
                  dispatch(
                    add({ bookId: b.id, title: b.title, coverUrl: b.coverUrl })
                  )
                }
                className='rounded-full border border-neutral-300 h-10 sm:h-12 px-[36.25px] sm:px-[56.5px] mt-5 text-neutral-950 text-wm sm:text-md font-bold'
              >
                Add to Cart
              </Button>
              <Link to='/checkout'>
                <Button className='rounded-full border border-neutral-300 h-10 sm:h-12 px-[36.25px] sm:px-[56.5px] mt-5 text-white text-sm sm:text-md font-bold'>Borrow Book</Button>
              </Link>
              <button
                aria-label='Share'
                className='mt-5 rounded-full border border-neutral-300 size-10 sm:size-11 grid place-items-center'
              >
                <Share2 />
              </button>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetContent side='bottom' className='pb-5 sm:hidden'>
                <SheetHeader>
                  {/* <SheetTitle className='text-left'>Quick actions</SheetTitle> */}
                  <SheetDescription className='text-left mx-4'>Add to cart, borrow, or share this book.</SheetDescription>
                </SheetHeader>
                <div className='mt-0 flex gap-3 mx-5'>
                  <Button
                    variant='outline'
                    onClick={() => {
                      dispatch(add({ bookId: b.id, title: b.title, coverUrl: b.coverUrl }));
                      setIsSheetOpen(false);
                    }}
                    className='w-[40%] min-w-[128px] rounded-full h-11'
                  >
                    Add to Cart
                  </Button>
                  <Link to='/checkout' onClick={() => setIsSheetOpen(false)}>
                    <Button className='min-w-[128px] w-[40%] rounded-full h-11'>Borrow Book</Button>
                  </Link>
                  <Button
                    variant='outline'
                    onClick={() => {
                      const ns = (typeof navigator !== 'undefined' ? (navigator as Navigator & { share?: (data: { title: string; url: string }) => Promise<void> }) : undefined);
                      if (ns?.share) {
                        // Fire and forget; avoid unhandled rejection warnings
                        ns.share({ title: b.title, url: window.location.href }).catch(() => {});
                      }
                      setIsSheetOpen(false);
                    }}
                    className='w-11 rounded-full h-11 flex items-center justify-center gap-2'
                    aria-label='Share'
                  >
                    <Share2 className='inline-block ' /> 
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <hr className='border-neutral-300 mt-6 sm:mt-16' />

      {/* Reviews */}
      <div className='space-y-6 mt-16 text-center md:text-left'>
        <div
          className='font-bold text-display-xs sm:text-display-lg text-neutral-950 dark:text-foreground cursor-pointer hover:opacity-90'
          onClick={() => setIsReviewOpen(true)}
          role='button'
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsReviewOpen(true)}
        >
          Review
        </div>
        <div className='flex items-center gap-2 '>
          <img src='/star.svg' className='size-6' />
          <span className='font-semibold'>{b.rating.toFixed(1)}</span>
          <span className='text-neutral-950 '>
            ({b.reviewCount ?? reviews.length} Ulasan)
          </span>
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          {reviews.map((r) => (
            <div
              key={r.id}
              role='button'
              tabIndex={0}
              onClick={() => setIsReviewOpen(true)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsReviewOpen(true)}
              className='rounded-2xl shadow-custom dark:border-border bg-white dark:bg-background p-5 cursor-pointer hover:shadow-md transition-shadow'
            >
              <div className='flex items-center gap-2 sm:gap-3'>
                <img
                  src='/avatarfall.png'
                  className='size-[58px] sm:size-16 rounded-full cursor-pointer'
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsReviewOpen(true);
                  }}
                />
                <div>
                  <div className='text-sm sm:text-lg font-bold text-neutral-950 dark:text-foreground '>{r.user.name}</div>
                  <div className='text-sm mt-1 sm:text-md dark:text-muted-foreground'>
                    {dayjs(r.createdAt).format('DD MMM YYYY, HH:mm')}
                  </div>
                </div>
              </div>
              <div className='mt-2 sm:mt-4'>
                <div className='flex items-center gap-1'>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <img
                      key={i}
                      src='/star.svg'
                      className={
                        'w-6 h-6' +
                        (i < Math.round(r.rating) ? '' : ' opacity-30')
                      }
                    />
                  ))}
                </div>
              </div>
              {r.comment && (
                <p className='mt-2 text-sm text-neutral-950 leading-6 line-clamp-3 sm:line-clamp-2 dark:text-foreground'>
                  {r.comment}
                </p>
              )}
            </div>
          ))}
        </div>
        <div className='pt-2'>
          <Button variant='outline' className='mx-auto block rounded-full px-5'>
            Load More
          </Button>
        </div>

        <div className='hidden font-bold text-xl text-neutral-950 dark:text-foreground mt-2 cursor-pointer hover:opacity-90' onClick={() => setIsReviewOpen(true)}>
          Write a review
        </div>

        {/* Clickable review area (opens sheet) */}
        <div
          role='button'
          tabIndex={0}
          onClick={() => setIsReviewOpen(true)}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsReviewOpen(true)}
          className='hidden rounded-2xl border border-neutral-300 dark:border-border bg-white dark:bg-background p-4 text-left max-w-2xl mx-auto sm:mx-0'
        >
          <div className='text-sm text-neutral-500 dark:text-muted-foreground'>Tap to rate and write your review…</div>
        </div>

        {/* Write Review Sheet (mobile & desktop) */}
        <Sheet open={isReviewOpen} onOpenChange={setIsReviewOpen}>
          <SheetContent side='bottom' className='pb-6 px-5'>
            <SheetHeader>
              <SheetTitle>Write a review</SheetTitle>
              <SheetDescription>Share your thoughts and rating for this book.</SheetDescription>
            </SheetHeader>
            <form
              className='mt-0 w-full flex flex-col gap-4'
              onSubmit={handleSubmit((v) => {
                reviewMutation.mutate(v);
                reset({ rating: 5, comment: '' });
                setIsReviewOpen(false);
              })}
            >
              <div className='flex items-center gap-1'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <img
                    key={i}
                    src='/star.svg'
                    className={`w-6 h-6 cursor-pointer ${i < (watch('rating') || 0) ? '' : 'opacity-30'}`}
                    onClick={() => {
                      // set rating via react-hook-form
                      const val = i + 1;
                      reset({ rating: val, comment: watch('comment') });
                    }}
                  />
                ))}
              </div>

              <div className='mt-2 flex flex-col gap-3 w-full'>
                <Input placeholder='Your thoughts…' className='w-full' {...register('comment')} />
                <Button type='submit' disabled={reviewMutation.isPending} className='w-[200px] h-10 rounded-full'>
                  Send
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {/* Related */}
      <div className='space-y-6'>
        <div className='font-bold text-xl text-neutral-950 dark:text-foreground'>
          Related Books
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4'>
          {relatedQ.data?.items?.map((rb, i) => (
            <ProductCard
              key={rb.id}
              id={rb.id}
              title={rb.title}
              authorName={rb.author.name}
              coverUrl={rb.coverUrl}
              rating={rb.rating}
              index={i}
              compact
            />
          ))}
        </div>
      </div>
    </div>
  );
}
