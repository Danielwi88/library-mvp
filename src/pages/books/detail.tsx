import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBookDetail, fetchBooks } from '@/services/books';
import { upsertReview, type Review } from '@/services/reviews';
import { Button } from '@/components/ui/button';
import { useDispatch } from 'react-redux';
import { add } from '@/features/cart/cartSlice';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import ProductCard from '@/components/product-card';
import CoverImage from '@/components/cover-image';

export default function BookDetail() {
  const { id = '' } = useParams();
  const qc = useQueryClient();
  const dispatch = useDispatch();

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

  const { register, handleSubmit, reset } = useForm<{
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
    <div className='mx-auto px-4 sm:px-6 lg:px-0 space-y-8'>
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
        <span className='hover:underline text-neutral-950 text-sm font-semibold'>{b.title}</span>
      </div>

      {/* Top section card */}
      <div className=' bg-white dark:bg-background p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]'>
        <div className='flex flex-col md:flex-row gap-9 items-start'>
          {/* Left: cover + metadata */}
          <div className='flex-shrink-0'>
            <CoverImage
              src={b.coverUrl}
              alt={b.title}
              index={0}
              className='w-[212px] sm:w-[260px] md:w-[321px] aspect-[321/482] object-cover border-8 border-neutral-200'
            />
            {/* <div className='mt-3 text-xs inline-flex items-center gap-1 text-neutral-950'>
              <img src='/star.svg' className='w-3.5 h-3.5' />{' '}
              {b.rating.toFixed(1)}
            </div>
            <div className='mt-1 text-xs font-semibold text-neutral-800'>
              {b.author.name}
            </div> */}
          </div>

          {/* Right: title + stats + description + actions */}
          <div className='flex-1 space-y-0 mt-3'>
            {b.categories?.[0] && (
              <div className='inline-block rounded border border-neutral-300 bg-neutral-25 text-neutral-800 px-3 py-0.5 text-sm font-bold'>
                {b.categories[0].name}
              </div>
            )}
            <h1 className='mt-2 text-md sm:text-lg sm:text-display-sm font-bold text-neutral-950 dark:text-foreground'>
              {b.title}
            </h1>
            <div className='mt-1 text-sm sm:text-md text-neutral-950 dark:text-foreground sm:text-neutral-700 font-medium'>
              {b.author.name}
            </div>
            <div className='mt-2 flex items-center gap-1 text-sm sm:text-md font-bold text-neutral-900'>
              <img src='/star.svg' className='w-6 h-6' />{' '}
              {b.rating.toFixed(1)}
            </div>
            <div className='grid grid-cols-3 divide-x border-none border-neutral-300 dark:border-border'>
              <div className='p-4 text-center'>
                <div className='text-[18px] font-extrabold'>
                  {b.totalCopies ?? 0}
                </div>
                <div className='text-[10px] text-neutral-950 mt-1'>Page</div>
              </div>
              <div className='p-4 text-center'>
                <div className='text-[18px] font-extrabold'>
                  {b.rating.toFixed(0)}
                </div>
                <div className='text-[10px] text-neutral-950 mt-1'>Rating</div>
              </div>
              <div className='p-4 text-center'>
                <div className='text-[18px] font-extrabold'>
                  {b.reviewCount ?? 0}
                </div>
                <div className='text-[10px] text-neutral-950 mt-1'>Reviews</div>
              </div>
            </div>
            <hr className='border-neutral-300' />
            <div>
              <div className='text-[13px] font-semibold mb-1'>Description</div>
              <p className='text-[12px] text-neutral-950 leading-6'>
                {b.description}
              </p>
            </div>
            <div className='flex flex-wrap items-center gap-3 pt-2'>
              <Button
                variant='outline'
                onClick={() =>
                  dispatch(
                    add({ bookId: b.id, title: b.title, coverUrl: b.coverUrl })
                  )
                }
                className='rounded-full border border-neutral-300 px-5'
              >
                Add to Cart
              </Button>
              <Link to='/checkout'>
                <Button className='rounded-full px-5'>Borrow Book</Button>
              </Link>
              <button
                aria-label='Share'
                className='rounded-full border border-neutral-300 size-9 grid place-items-center'
              >
                ↗
              </button>
            </div>
          </div>
        </div>
      </div>

      <hr className='border-neutral-300' />

      {/* Reviews */}
      <div className='space-y-6'>
        <div className='font-bold text-xl text-neutral-950 dark:text-foreground'>
          Review
        </div>
        <div className='flex items-center gap-2 text-[12px] text-neutral-950'>
          <img src='/star.svg' className='w-4 h-4' />
          <span className='font-semibold'>{b.rating.toFixed(1)}</span>
          <span className='text-neutral-950'>
            ({b.reviewCount ?? reviews.length} Ulasan)
          </span>
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          {reviews.map((r) => (
            <div
              key={r.id}
              className='rounded-2xl border border-neutral-300 dark:border-border bg-white dark:bg-background p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]'
            >
              <div className='flex items-center gap-2'>
                <img src='/avatarfall.png' className='w-8 h-8 rounded-full' />
                <div>
                  <div className='text-sm font-medium'>{r.user.name}</div>
                  <div className='text-xs text-muted-foreground'>
                    {dayjs(r.createdAt).format('DD MMM YYYY, HH:mm')}
                  </div>
                </div>
              </div>
              <div className='mt-2'>
                <div className='flex items-center gap-1'>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <img
                      key={i}
                      src='/star.svg'
                      className={
                        'w-3.5 h-3.5' +
                        (i < Math.round(r.rating) ? '' : ' opacity-30')
                      }
                    />
                  ))}
                </div>
              </div>
              {r.comment && (
                <p className='mt-2 text-sm text-neutral-950 leading-6'>
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

        {/* Simple review form */}
        <div className='font-bold text-xl text-neutral-950 dark:text-foreground mt-2'>
          Write a review
        </div>
        <form
          className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1'
          onSubmit={handleSubmit((v) => {
            reviewMutation.mutate(v);
            reset({ rating: 5, comment: '' });
          })}
        >
          <Input
            type='number'
            min={1}
            max={5}
            step={1}
            className='w-28'
            {...register('rating', { valueAsNumber: true })}
          />
          <Input placeholder='Your thoughts...' {...register('comment')} />
          <Button type='submit' disabled={reviewMutation.isPending}>
            Send
          </Button>
        </form>
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
