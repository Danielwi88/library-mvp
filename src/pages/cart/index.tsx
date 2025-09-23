import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { Button } from '@/components/ui/button';
import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchBookDetail } from '@/services/books';
import CoverImage from '@/components/cover-image';

type Sel = Record<string, boolean>;

export default function Cart() {
  const items = useSelector((s: RootState) => s.cart.items);
  const [sel, setSel] = useState<Sel>(() =>
    Object.fromEntries(items.map((i) => [i.bookId, true]))
  );

  const bookQueries = useQuery({
    queryKey: ['cart-books', items.map((i) => i.bookId)],
    queryFn: async () => {
      const bookDetails = await Promise.all(
        items.map((item) => fetchBookDetail(item.bookId))
      );
      return bookDetails.map((detail) => detail.book);
    },
    enabled: items.length > 0,
  });
  const allChecked = useMemo(
    () => items.length > 0 && items.every((i) => sel[i.bookId]),
    [items, sel]
  );
  const count = useMemo(
    () => items.filter((i) => sel[i.bookId]).length,
    [items, sel]
  );
  const nav = useNavigate();
  const CHECK_SVG = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white' stroke-width='3'><path stroke-linecap='round' stroke-linejoin='round' d='M5 13l4 4L19 7'/></svg>")`;
  const chkStyle: CSSProperties = {
    ['--tw-chk']: CHECK_SVG,
  } as unknown as CSSProperties;

  const toggleAll = () => {
    const next = !allChecked;
    setSel(Object.fromEntries(items.map((i) => [i.bookId, next])));
  };

  const toggle = (id: string) => setSel((s) => ({ ...s, [id]: !s[id] }));

  const proceed = () => {
    if (count === 0) return;
    nav('/checkout', {
      state: {
        selectedIds: items.filter((i) => sel[i.bookId]).map((i) => i.bookId),
      },
    });
  };

  return (
    <>
      <h1 className='mx-auto max-w-[1000px] px-4 sm:px-0 text-display-xs sm:text-display-lg leading-[38px] font-bold mb-4 sm:mb-8'>
        My Cart
      </h1>
      <div className='mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-0 sm:flex sm:gap-10 justify-between'>
        <div>
          <div className='flex items-center gap-4 mb-0'>
            <input
              type='checkbox'
              checked={allChecked}
              onChange={toggleAll}
              className='size-5 appearance-none border border-neutral-300 rounded-sm checked:bg-primary-300 checked:border-primary-300 checked:[background-image:var(--tw-chk)] checked:bg-center checked:bg-no-repeat'
              style={chkStyle}
            />
            <span className='text-md font-semibold text-neutral-950 dark:text-foreground'>
              Select All
            </span>
          </div>
          <ul className='divide-y divide-neutral-200'>
            {items.map((i) => {
              const bookDetail = bookQueries.data?.find(
                (b) => b.id === i.bookId
              );
              return (
                <li key={i.bookId} className='py-6'>
                  <div className='flex items-start gap-4'>
                    <input
                      type='checkbox'
                      checked={!!sel[i.bookId]}
                      onChange={() => toggle(i.bookId)}
                      className='size-5 appearance-none border border-neutral-300 rounded-sm checked:bg-primary-300 checked:border-primary-300 checked:[background-image:var(--tw-chk)] checked:bg-center checked:bg-no-repeat'
                      style={chkStyle}
                    />
                    <CoverImage
                      src={i.coverUrl}
                      alt={i.title}
                      className='w-[70px] h-[106px] sm:w-[92px] sm:h-[138px] object-cover rounded border border-neutral-200'
                      index={0}
                    />
                    <div className='flex-1 mt-5'>
                      <span className='text-sm inline-block rounded border border-neutral-300 bg-neutral-50 text-neutral-950 px-2 py-1 text-[11px] font-semibold'>
                        {bookDetail?.categories[0]?.name || 'Category'}
                      </span>
                      <div className='mt-2  text-md sm:text-lg font-bold text-neutral-950 dark:text-foreground'>
                        {i.title}
                      </div>
                      <div className='text-sm text-md text-neutral-950 sm:text-neutral-500 font-medium'>
                        {bookDetail?.author.name || 'Author name'}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
            {items.length === 0 && (
              <li className='py-10 text-neutral-500'>Your cart is empty.</li>
            )}
          </ul>
        </div>
        {/* Summary card (right on desktop, bottom sticky on mobile) */}
        <div className='hidden md:block'>
          <Summary count={count} onBorrow={proceed} />
        </div>
        <div className='md:hidden bottom-3 left-0 right-0 px-3'>
          <div className='mx-auto max-w-6xl'>
            <Summary count={count} onBorrow={proceed} />
          </div>
        </div>
      </div>
    </>
  );
}

function Summary({ count, onBorrow }: { count: number; onBorrow: () => void }) {
  return (
    <div className='rounded-2xl w-full sm:w-[318px] border border-neutral-300 dark:border-border bg-white dark:bg-background p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]'>
      <div className='font-bold text-xl mb-6 text-neutral-950 dark:text-foreground'>
        Loan Summary
      </div>
      <div className='text-sm font-medium sm:text-md text-neutral-950 dark:text-foreground mb-6'>
        Total Book
        <span className='float-right text-md text-neutral-950 dark:text-foreground font-bold'>
          {count} Items
        </span>
      </div>
      <Button
        className='w-full rounded-full text-md font-bold text-neutral-25 '
        disabled={count === 0}
        onClick={onBorrow}
      >
        Borrow Book
      </Button>
    </div>
  );
}
