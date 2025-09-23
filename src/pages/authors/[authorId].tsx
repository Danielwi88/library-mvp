import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAuthorBooks } from '../../services/authors';
import ProductCard from '../../components/product-card'


interface Author {
  id: string | number;
  name: string;
  bio?: string | null;
}

interface BookAuthor { id?: string | number; name: string }

interface Book {
  id: string | number;
  title: string;
  author: BookAuthor;
  coverUrl?: string | null;
  rating?: number | null;
}

const AuthorBooksPage = () => {
  const params = useParams<Record<string, string>>();
  const idParam = params.authorId ?? params.id ?? "";
  const [authorData, setAuthorData] = useState<Author | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      if (!idParam) {
        setError('Missing author id');
        setLoading(false);
        return;
      }
      try {
        const data = await fetchAuthorBooks(idParam);
        setAuthorData(data.author);
        setBooks(data.items);
      } catch (err) {
        let message = 'Failed to fetch author books';
        if (err && typeof err === 'object') {
          const maybeResp = err as { response?: { data?: { message?: unknown } } };
          const m = maybeResp.response?.data?.message;
          if (typeof m === 'string') message = m;
          else if (err instanceof Error) message = err.message;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idParam]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!authorData) {
    return <div>{error ?? 'Author not found.'}</div>;
  }

  return (
    <div className='space-y-8 max-w-[1200px]'>
      {/* Author Profile Section */}
      <div className='flex items-center shadow-custom p-4 gap-4'>
        <div className='size-[60px] sm:size-[81px] rounded-full bg-primary/10 grid place-items-center'>
          <img src="/avatarfall.png" alt="author avatar" width='64' height='64' className='w-full h-full rounded-full' />
        </div>
        <div>
          <h1 className='text-lg font-bold text-neutral-950 dark:text-foreground'>
            {authorData.name}
          </h1>
          <div className='mt-1 flex items-center gap-2 text-sm sm:text-md text-neutral-600 dark:text-muted-foreground'>
            <img src="/Book.png" alt="book" width='24' height='24' />
            <span>{books.length} books</span>
          </div>
        </div>
      </div>

      {/* Book List Section */}
      <div className='space-y-8'>
        <h2 className='text-display-lg font-bold text-neutral-950 dark:text-foreground'>Book List</h2>
        <div className=' grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
          {books.map((book, index) => (
            <ProductCard
              key={book.id}
              id={book.id}
              title={book.title}
              authorName={book.author.name}
              authorId={book.author.id}
              coverUrl={book.coverUrl}
              rating={book.rating ?? undefined}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthorBooksPage;
