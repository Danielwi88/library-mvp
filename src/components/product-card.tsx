import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import CoverImage from '@/components/cover-image';

type Props = {
  id: string | number;
  title: string;
  authorName: string;
  authorId?: string | number;
  coverUrl?: string | null;
  rating?: number;
  index?: number; // retained for backwards compatibility
  compact?: boolean; // tighter padding for sidebars/related
  showDetailButton?: boolean;
  className?: string;
};

export function ProductCard({
  id,
  title,
  authorName,
  authorId,
  coverUrl,
  rating = 0,
  index = 0,
  compact = false,
  showDetailButton = false,
  className = '',
}: Props) {
  const infoPad = compact ? 'p-3' : 'p-4';

  const navigate = useNavigate();

  return (
    <Link
      to={`/books/${id}`}
      className={`rounded-t-xl overflow-hidden border-none shadow-[0_0_20px_0_rgba(203,202,202,0.25)]  bg-white dark:bg-background block ${className}`}
    >
      <Card className='rounded-2xl overflow-hidden'>
        <CardContent className='p-0'>
          <CoverImage
            src={coverUrl}
            alt={title}
            index={index}
            className='w-full h-[336px] max-h-[336px] object-cover'
          />
          <div className={infoPad}>
            <div
              className='text-sm sm:text-lg font-bold truncate text-neutral-900 dark:text-foreground'
              title={title}
            >
              {title}
            </div>
            <div className='text-sm sm:text-md font-medium dark:text-muted-foreground text-neutral-950 truncate'>
              {authorId !== undefined ? (
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/authors/${authorId}`);
                  }}
                  className='hover:opacity-80 focus:outline-none'
                >
                  {authorName}
                </button>
              ) : (
                authorName
              )}
            </div>
            <div className='flex items-center justify-between mt-2'>
              <span className='inline-flex items-center gap-1 text-sm sm:text-md '>
                <img
                  src='/star.svg'
                  alt='rating'
                  className='size-6 text-sm sm:text-md font-semibold text-neutral-900'
                />
                {rating.toFixed(1)}
              </span>
              {showDetailButton && (
                <Button
                  size='sm'
                  variant='outline'
                  className='rounded-full'
                  asChild
                >
                  <span>Detail</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default ProductCard;
