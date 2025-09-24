import ProductCard from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { setCategories } from '@/features/ui/uiSlice';
import { fetchBooks } from '@/services/books';
import { fetchCategories, type Category } from '@/services/categories';
import type { RootState } from '@/store';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

const NoScrollbar = () => (
  <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
);

export default function BookList() {
  const { search } = useSelector((s: RootState) => s.ui);
  const [page, setPage] = useState(1);
  const nav = useNavigate();
  const dispatch = useDispatch();

  const { data, isLoading, error } = useQuery({
    queryKey: ['books', { search, page }],
    queryFn: () => fetchBooks({ q: search, page, limit: 12 }),
  });

  // derive simple popular authors list from current page data
  const authors = Array.from(
    new Map(
      (data?.items ?? []).map((b) => [b.author.id, b.author.name])
    ).entries()
  ).slice(0, 6);

  return (
    <div className='space-y-8 max-w-[1200px]'>
      <NoScrollbar />
      {/* Hero banner */}
      <div className='relative rounded-2xl overflow-hidden max-w-[1200px] sm:p-0'>
        <img
          src='/heroAll.png'
          alt='Welcome to Booky'
          width={1200}
          height={441}
          className='w-full h-auto object-cover'
        />
        <div className='absolute inset-0 grid place-items-center'>
          <div className='relative'>
            <h2 className='absolute inset-0 text-center text-[36px] sm:text-[56px] md:text-[72px] lg:text-[82.524px] font-bold [font-family:Quicksand] text-transparent [-webkit-text-stroke:6px_#FFF] sm:[-webkit-text-stroke:7px_#FFF] md:[-webkit-text-stroke:8px_#FFF] lg:[-webkit-text-stroke:11.19px_#FFF] leading-[normal] px-3 sm:px-0'>
              Welcome to <span className='block'>Booky</span>
            </h2>
            <h2 className='relative text-center text-[36px] sm:text-[56px] md:text-[72px] lg:text-[82.524px] font-bold [font-family:Quicksand] text-[#6597E8] leading-[normal] px-3 sm:px-0'>
              Welcome to <span className='block'>Booky</span>
            </h2>
          </div>
        </div>
      </div>

      <HomeCategories
        onClick={(id) => {
          dispatch(setCategories([id]));
          nav('/categories');
        }}
      />

      {isLoading && <p>Loading...</p>}
      {error && <p className='text-red-500'>Failed to load</p>}

      <h3 className='text-display-xs sm:text-display-lg font-bold mb-10 mt-12 text-neutral-950 dark:text-foreground'>Recommendation</h3>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 '>
        {data?.items?.map((b, i) => (
          <ProductCard
            key={b.id}
            id={b.id}
            title={b.title}
            authorName={b.author.name}
            authorId={b.author.id}
            coverUrl={b.coverUrl}
            rating={b.rating}
            index={i}
          />
        ))}
      </div>

      {data?.items && (
        <div className='flex justify-center'>
          <Button
            className='rounded-full h-10 sm:h-12 text-sm sm:text-md font-bold text-neutral-950 dark:text-background px-[39.5px] sm:px-[59px]'
            variant='outline'
            onClick={() => setPage((p) => p + 1)}
          >
            Load More
          </Button>
        </div>
      )}

      {/* Popular Authors */}
      <div className='space-y-4'>
        <h3 className='text-display-xs sm:text-display-lg text-neutral-950 font-bold dark:text-foreground'>Popular Authors</h3>
        <div className='grid grid-cols-1 xm:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 '>
          {authors.map(([id, name]) => (
            <div key={id} className='rounded-xl border-none shadow-custom p-4 text-center '>
              <Link to={`/authors/${id}`} className='group block '>
              <div className='flex justify-start space-x-4'>
                <div className='size-15 sm:size-20 rounded-full bg-primary/10 grid place-items-center text-primary font-semibold group-hover:bg-primary/20'>
                  
                    <img src="/avatarfall.png" alt="avatarfall" width='60' height='60' className='w-full h-full' />
                </div>

                <div className='flex flex-col space-y-1'>

                <div className='mt-2 text-md leading-[30px] sm:text-lg text-neutral-900 font-bold truncate underline-offset-4 group-hover:underline dark:text-foreground'>
                  {name}
                </div>
                <div className='flex gap-[6px]'>

                <img src="/Book.png" alt="book" width='24' height='24' />
              <div className='text-sm sm:text-md text-neutral-900  font-medium dark:text-muted-foreground'>
                5 books</div>
                </div>
                </div>

              </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomeCategories({ onClick }: { onClick: (id: string) => void }) {
  const q = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const iconFor = (name: string) => {
    const map: Record<string, string> = {
      Fiction: '/filter1.png',
      'Non-Fiction': '/filter2.png',
      'Self Improvement': '/filter3.png',
      Finance: '/filter4.png',
      Science: '/filter5.png',
      Education: '/filter6.png',
    };
    return map[name] ?? '/filter1.png';
  };
  const cats = (q.data ?? []) as Category[];
  const fallback: Pick<Category, 'id' | 'name'>[] = [
    { id: 1, name: 'Science' },
    { id: 3, name: 'Finance' },
    { id: 4, name: 'Self-Improvement' },
    { id: 9, name: 'Fiction' },
    { id: 11, name: 'Non-Fiction' },
    { id: 14, name: 'Education' },
  ];
  const items = cats.length ? cats : fallback;
  return (
    <div className='space-y-3'>
      

      {/* Loading state */}
      {q.isLoading && (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className='rounded-2xl border bg-white p-4 animate-pulse'
            >
              <div className='h-14 rounded-xl bg-blue-100/70 mb-2' />
              <div className='h-3 w-24 bg-neutral-200 rounded' />
            </div>
          ))}
        </div>
      )}

      {/* Error message (still show fallback cards) */}
      {q.error && (
        <p className='text-sm text-red-500'>
          Failed to load categories — showing defaults.
        </p>
      )}

      {/* Cards (API or fallback) */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4'>
        {items.map((c) => {
          const Icon = iconFor(c.name);
          return (
            <button
              key={String(c.id)}
              onClick={() => onClick(String(c.id))}
              className='text-left rounded-2xl max-w-[186.6px] border bg-white p-2 sm:p-3 shadow-[0_6px_14px_rgba(20,30,55,0.06)] hover:shadow-[0_10px_20px_rgba(20,30,55,0.08)] transition-shadow'
            >
              <div className='h-14 sm:h-16 rounded-xl bg-blue-100 grid place-items-center mb-2'>
                <img
                  src={Icon}
                  alt={c.name}
                  className='size-[44.8px] sm:size-[51.2px]'
                />
              </div>
              <div className='mt-3 text-xs sm:text-md font-semibold text-neutral-900 leading-snug'>
                {c.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Empty hint if API loaded but had no categories
      {!q.isLoading && !q.error && cats.length === 0 && (
        <p className="text-sm text-muted-foreground">No categories from the API yet. Using placeholders.</p>
      )} */}
    </div>
  );
}
