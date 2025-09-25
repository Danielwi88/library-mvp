import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import { Button } from '@/components/ui/button';
import dayjs from 'dayjs';
import CoverImage from '@/components/cover-image';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { borrowBook } from '@/services/loans';
import { fetchBookDetail } from '@/services/books';
import { clear } from '@/features/cart/cartSlice';
import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { getErrorMessage } from '@/lib/errors';
import { Calendar } from 'lucide-react';

export default function Checkout() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const dispatch = useDispatch();
  const { state } = useLocation() as { state?: { selectedIds?: string[] } };
  const items = useSelector((s: RootState) => s.cart.items).filter(
    (i) => !state?.selectedIds || state.selectedIds.includes(i.bookId)
  );
  const user = useSelector((s: RootState) => s.auth.user)!;

  const bookQueries = useQuery({
    queryKey: ['checkout-books', items.map((i) => i.bookId)],
    queryFn: async () => {
      const bookDetails = await Promise.all(
        items.map((item) => fetchBookDetail(item.bookId))
      );
      return bookDetails.map((detail) => detail.book);
    },
    enabled: items.length > 0,
  });

  const [days, setDays] = useState<3 | 5 | 10>(3);
  const [agreeA, setAgreeA] = useState(false);
  const [agreeB, setAgreeB] = useState(false);

  const borrowDate = dayjs();
  const returnDate = useMemo(
    () => borrowDate.add(days, 'day'),
    [borrowDate, days]
  );

  const m = useMutation({
    mutationFn: async () => {
      for (const it of items) {
        // Post once per item; if qty>1, we repeat requests
        const times = Math.max(1, it.qty);
        for (let k = 0; k < times; k++) {
          await borrowBook({ bookId: it.bookId, days });
        }
      }
    },
    onSuccess: () => {
      dispatch(clear());
      toast.success('Borrowed successfully');
      qc.invalidateQueries({ queryKey: ['loans'] });
      nav('/success', {
        state: { returnDate: returnDate.format('D MMMM YYYY') },
      });
    },
    onError: (e: unknown) => {
      if (isAxiosError(e)) {
        const code = e.response?.status;
        if (code === 404) return toast.error('Book not found');
        if (code === 400) return toast.error('No Available copies');
      }
      toast.error(getErrorMessage(e) ?? 'Borrow failed');
    },
  });

  return (
    <>
      <h1 className='mx-auto max-w-[1000px] px-4 sm:px-0 text-display-xs sm:text-display-lg leading-[38px] font-bold mb-4 sm:mb-8'>
        Checkout
      </h1>
      <div className='mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-0 sm:flex sm:gap-10 justify-between'>
        <div>
          <section className='border-b border-neutral-300 dark:border-border bg-white dark:bg-background py-5  shadow-[0_1px_2px_rgba(16,24,40,0.04)] mb-6'>
            <div className='font-bold text-lg sm:text-display-xs mb-6 text-neutral-950 dark:text-foreground'>
              User Information
            </div>
            <div className=' flex flex-col  gap-3 text-sm'>
              <div className='flex justify-between '>
                <div className='text-neutral-950 font-medium text-sm sm:text-md dark:text-foreground'>
                  Name
                </div>
                <div className='text-neutral-950 font-bold text-sm sm:text-md dark:text-foreground'>
                  {user.name}
                </div>
              </div>
              <div className='flex justify-between'>
                <div className='text-neutral-950 font-medium text-sm sm:text-md dark:text-foreground '>
                  Email
                </div>
                <div className='text-neutral-950 font-bold text-sm sm:text-md dark:text-foreground'>
                  {user.email}
                </div>
              </div>
              <div className='flex justify-between'>
                <div className='text-neutral-950 font-medium text-sm sm:text-md dark:text-foreground'>
                  Phone
                </div>
                <div className='text-neutral-950 font-bold text-sm sm:text-md dark:text-foreground'>
                  {user.phone ?? '-'}
                </div>
              </div>
            </div>
          </section>

          <section className='border-none bg-white dark:bg-background p-5 sm:p-0 shadow-[0_1px_2px_rgba(16,24,40,0.04)]'>
            <div className='font-bold text-xl sm:text-display-xs mb-6 text-neutral-950 dark:text-foreground'>
              Book List
            </div>
            <ul className='divide-y divide-neutral-200'>
              {items.map((i) => {
                const bookDetail = bookQueries.data?.find(
                  (b) => b.id === i.bookId
                );
                return (
                  <li key={i.bookId} className='py-6 first:pt-0'>
                    <div className='flex items-start gap-4'>
                      <CoverImage
                        src={i.coverUrl}
                        alt={i.title}
                        className='w-[70px] h-[106px] sm:w-[92px] sm:h-[138px] object-cover rounded border border-neutral-200'
                      />
                      <div className='flex-1 items-center mt-5'>
                        <span className='text-sm inline-block rounded border border-neutral-300 bg-neutral-50 text-neutral-950 px-2 py-1 text-[11px] font-bold'>
                          {bookDetail?.categories[0]?.name || 'Category'}
                        </span>
                        <div className='mt-2 text-md sm:text-lg font-bold text-neutral-950 dark:text-foreground'>
                          {i.title}
                        </div>
                        <div className='mt-1 text-sm sm:text-md text-neutral-500 sm:text-neutral-500 font-medium'>
                          {bookDetail?.author.name || 'Author name'}
                        </div>
                        {/* <div className='text-sm text-neutral-950 sm:text-neutral-500 font-medium'>
                          Qty: {i.qty}
                        </div> */}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <aside className='rounded-2xl w-full  sm:w-[478px] border border-neutral-300 dark:border-border bg-white dark:bg-background p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] h-fit'>
          <div className='font-bold text-xl mb-6 text-neutral-950 dark:text-foreground'>
            Complete Your Borrow Request
          </div>
          <div className='space-y-6 text-sm'>
            <div>
              <div className='text-neutral-950 text-sm font-bold mb-2 dark:text-foreground'>
                Borrow Date
              </div>
              <div className='border border-neutral-300 rounded-md px-3 py-2 text-md font-semibold text-neutral-950 dark:text-foreground flex justify-between bg-neutral-100 dark:bg-background'>
                {borrowDate.format('D MMM YYYY')} <Calendar />
              </div>
            </div>

            <div>
              <div className='text-neutral-950 text-sm  font-bold mb-2 dark:text-foreground'>
                Borrow Duration
              </div>
              <div className='space-y-2'>
                {[3, 5, 10].map((d) => (
                  <label
                    key={d}
                    className='flex items-center gap-2 text-md font-semibold text-neutral-950 dark:text-foreground'
                  >
                    <input
                      type='radio'
                      name='days'
                      checked={days === d}
                      onChange={() => setDays(d as 3 | 5 | 10)}
                      className='size-4'
                    />
                    {d} Days
                  </label>
                ))}
              </div>
            </div>

            <div className='bg-primary-100 rounded-xl dark:bg-primary-200 p-4'>
              <div className='text-neutral-950 sm:text-md font-bold mb-2'>
                Return Date
              </div>
              <div className=' rounded-xl text-sm sm:text-md font-medium dark:text-foreground'>
                Please return the book(s) no later than{' '}
                <span className='text-destructive font-bold'>
                  {returnDate.format('D MMM YYYY')}
                </span>
              </div>
            </div>

            <label className='flex items-center gap-2 text-sm sm:text-md font-semibold text-neutral-950 dark:text-foreground'>
              <input
                type='checkbox'
                checked={agreeA}
                onChange={(e) => setAgreeA(e.target.checked)}
                className='size-4 cursor-pointer hover:scale-105'
              />
              I agree to return the book(s) before the due date.
            </label>
            <label className='flex items-center gap-2 text-sm sm:text-md font-semibold text-neutral-950 dark:text-foreground'>
              <input
                type='checkbox'
                checked={agreeB}
                onChange={(e) => setAgreeB(e.target.checked)}
                className='size-4 cursor-pointer hover:scale-105'
              />
              I accept the library borrowing policy.
            </label>

            <Button
              className='w-full h-12 rounded-full font-bold text-md text-neutral-25 bg-primary-300 cursor-pointer'
              disabled={!agreeA || !agreeB || items.length === 0 || m.isPending}
              onClick={() => m.mutate()}
            >
              Confirm & Borrow
            </Button>
          </div>
        </aside>
      </div>
    </>
  );
}
