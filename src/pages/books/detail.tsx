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
    <div className='space-y-8'>
      {/* Breadcrumb */}
      <div className='text-xs text-neutral-600'>
        <Link to='/' className='hover:underline'>
          Home
        </Link>
        <span className='mx-1'>›</span>
        {b.categories?.[0] && (
          <>
            <span className='text-neutral-700'>{b.categories[0].name}</span>
            <span className='mx-1'>›</span>
          </>
        )}
        <span className='text-neutral-900'>{b.title}</span>
      </div>

      {/* Top section card */}
      <div className='rounded-xl border bg-white p-4 sm:p-5'>
        <div className='grid gap-6 md:grid-cols-[280px,1fr] items-start'>
          {/* Left: cover + metadata */}
          <div>
            <CoverImage
              src={b.coverUrl}
              alt={b.title}
              index={0}
              className='rounded-xl w-[321px] h-[482px] object-cover border'
            />
            <div className='mt-2 text-xs inline-flex items-center gap-1 text-neutral-700'>
              <img src='/star.svg' className='w-3.5 h-3.5' />{' '}
              {b.rating.toFixed(1)}
            </div>
            <div className='mt-2 text-xs font-semibold text-neutral-800'>
              {b.author.name}
            </div>
          </div>

          {/* Right: title + stats + description + actions */}
          <div className='space-y-4'>
            {b.categories?.[0] && (
              <div className='inline-block rounded-full bg-[var(--color-primary-200,#D2E3FF)] text-neutral-800 px-3 py-1 text-xs font-semibold'>
                {b.categories[0].name}
              </div>
            )}
            <h1 className='text-[22px] sm:text-[24px] leading-[30px] font-extrabold text-neutral-900'>
              {b.title}
            </h1>
            <div className='text-[12px] text-neutral-600'>{b.author.name}</div>
            <div className='text-[12px] inline-flex items-center gap-1 text-neutral-800'>
              <img src='/star.svg' className='w-3.5 h-3.5' />{' '}
              {b.rating.toFixed(1)}
            </div>
            <div className='grid grid-cols-3 divide-x rounded-xl border'>
              <div className='p-4 text-center'>
                <div className='text-[18px] font-extrabold'>
                  {b.totalCopies ?? 0}
                </div>
                <div className='text-[11px] text-neutral-600 mt-1'>Page</div>
              </div>
              <div className='p-4 text-center'>
                <div className='text-[18px] font-extrabold'>
                  {b.rating.toFixed(0)}
                </div>
                <div className='text-[11px] text-neutral-600 mt-1'>Rating</div>
              </div>
              <div className='p-4 text-center'>
                <div className='text-[18px] font-extrabold'>
                  {b.reviewCount ?? 0}
                </div>
                <div className='text-[11px] text-neutral-600 mt-1'>Reviews</div>
              </div>
            </div>
            <hr className='border-neutral-300' />
            <div>
              <div className='text-[14px] font-semibold mb-1'>Description</div>
              <p className='text-[12px] text-neutral-700 leading-6'>
                {b.description}
              </p>
            </div>
            <div className='flex items-center gap-2 pt-1'>
              <Button
                variant='outline'
                onClick={() =>
                  dispatch(
                    add({ bookId: b.id, title: b.title, coverUrl: b.coverUrl })
                  )
                }
                className='rounded-full'
              >
                Add to Cart
              </Button>
              <Link to='/checkout'>
                <Button className='rounded-full'>Borrow Book</Button>
              </Link>
              <button
                aria-label='Share'
                className='ml-1 size-9 grid place-items-center rounded-full border text-neutral-700'
              >
                ↗
              </button>
            </div>
          </div>
        </div>
      </div>

      <hr className='border-neutral-300' />

      {/* Reviews */}
      <div className='space-y-3'>
        <h2 className='text-[18px] font-extrabold'>Review</h2>
        <div className='flex items-center gap-2 text-[12px] text-neutral-700'>
          <img src='/star.svg' className='w-4 h-4' />
          <span className='font-semibold'>{b.rating.toFixed(1)}</span>
          <span className='text-neutral-600'>
            ({b.reviewCount ?? reviews.length} Ulasan)
          </span>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          {reviews.map((r) => (
            <div key={r.id} className='rounded-xl border p-4 bg-white'>
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
                <p className='mt-2 text-sm text-neutral-700 leading-6'>
                  {r.comment}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Simple review form */}
        <h3 className='font-semibold mt-2'>Write a review</h3>
        <form
          className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2'
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
      <div className='space-y-3'>
        <h3 className='font-semibold'>Related Books</h3>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4'>
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
