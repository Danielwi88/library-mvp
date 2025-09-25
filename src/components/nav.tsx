import ThemeToggle from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { logout } from '@/features/auth/authSlice';
import { setSearch } from '@/features/ui/uiSlice';
import type { RootState } from '@/store';
import {
  ChevronDown,
  X as CloseIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

function BookyMark({
  className = 'size-10 sm:size-[42px] text-primary',
}: {
  className?: string;
}) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 42 42'
      className={className}
      fill='none'
      aria-hidden
    >
      <mask
        id='booky_mask'
        style={{ maskType: 'luminance' }}
        maskUnits='userSpaceOnUse'
        x='0'
        y='0'
        width='42'
        height='42'
      >
        <path d='M42 0H0V42H42V0Z' fill='white' />
      </mask>
      <g mask='url(#booky_mask)'>
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M22.5 0H19.5V13.2832L14.524 0.967222L11.7425 2.09104L16.8474 14.726L7.21142 5.09009L5.09011 7.21142L14.3257 16.447L2.35706 11.2178L1.15596 13.9669L13.8202 19.5H0V22.5H13.8202L1.15597 28.0331L2.35706 30.7822L14.3257 25.553L5.09011 34.7886L7.21142 36.9098L16.8474 27.274L11.7425 39.909L14.524 41.0327L19.5 28.7169V42H22.5V28.7169L27.476 41.0327L30.2574 39.909L25.1528 27.274L34.7886 36.9098L36.9098 34.7886L27.6742 25.553L39.643 30.7822L40.8439 28.0331L28.1799 22.5H42V19.5H28.1797L40.8439 13.9669L39.643 11.2178L27.6742 16.447L36.9098 7.2114L34.7886 5.09009L25.1528 14.726L30.2574 2.09104L27.476 0.967222L22.5 13.2832V0Z'
          fill='currentColor'
        />
      </g>
    </svg>
  );
}

export function Nav() {
  const nav = useNavigate();
  const { user } = useSelector((s: RootState) => s.auth);
  const cartCount = useSelector((s: RootState) =>
    s.cart.items.reduce((a, b) => a + b.qty, 0)
  );
  const dispatch = useDispatch();
  const search = useSelector((s: RootState) => s.ui.search);
  const [mobileSearch, setMobileSearch] = useState(false);

  return (
    <header className='sticky top-0 z-30 bg-white/90 dark:bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-white/95 flex flex-col md:flex-row items-stretch md:items-center border-none shadow-[0_0_20px_0_rgba(203,202,202,0.25)] min-h-16 sm:min-h-20'>
      <div className='container mx-auto max-w-[1200px] px-3 sm:px-0 flex items-center gap-3'>
        {/* Left: brand */}
        <Link
          to='/'
          className='flex items-center gap-[15px] font-semibold text-lg text-foreground'
        >
          <BookyMark />
          <span className='hidden xm:inline text-display-md font-bold'>
            Booky
          </span>
        </Link>

        {/* Center: search (desktop, after login) */}
        {user && (
          <div className='hidden md:block flex-1 max-w-xl mx-auto'>
            <div className='relative'>
              <SearchIcon className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-6 sm:size-5 text-neutral-950 sm:text-neutral-950 dark:text-foreground' />
              <Input
                placeholder='Search book'
                value={search}
                onChange={(e) => dispatch(setSearch(e.target.value))}
                className='h-10 rounded-full border border-neutral-300  pl-9 pr-4 font-medium text-sm'
              />
            </div>
          </div>
        )}

        {/* Right */}
        <div className='ml-auto flex items-center gap-2'>
          {/* Mobile: search icon + cart + menu */}
          <button
            className='md:hidden p-2 rounded-md border'
            aria-label='Search'
            onClick={() => setMobileSearch(true)}
          >
            <SearchIcon className='size-4' />
          </button>

          {/* Desktop theme toggle */}
          <div className='block'>
            <ThemeToggle />
          </div>
          <Link to='/cart' className='relative p-2 text-foreground'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='27'
              viewBox='0 0 24 27'
              fill='none'
              className='size-7 sm:size-8'
            >
              <path
                d='M6.6665 7.66667V6.33333C6.6665 4.91885 7.22841 3.56229 8.2286 2.5621C9.22879 1.5619 10.5853 1 11.9998 1C13.4143 1 14.7709 1.5619 15.7711 2.5621C16.7713 3.56229 17.3332 4.91885 17.3332 6.33333V7.66667'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                fill='none'
              />
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M0.781333 7.11336C-7.94729e-08 7.8947 0 9.1507 0 11.6654V15.6654C0 20.6934 -1.58946e-07 23.208 1.56267 24.7694C3.12533 26.3307 5.63867 26.332 10.6667 26.332H13.3333C18.3613 26.332 20.876 26.332 22.4373 24.7694C23.9987 23.2067 24 20.6934 24 15.6654V11.6654C24 9.1507 24 7.8947 23.2187 7.11336C22.4373 6.33203 21.1813 6.33203 18.6667 6.33203H5.33333C2.81867 6.33203 1.56267 6.33203 0.781333 7.11336ZM9.33333 12.9987C9.33333 12.6451 9.19286 12.3059 8.94281 12.0559C8.69276 11.8058 8.35362 11.6654 8 11.6654C7.64638 11.6654 7.30724 11.8058 7.05719 12.0559C6.80714 12.3059 6.66667 12.6451 6.66667 12.9987V15.6654C6.66667 16.019 6.80714 16.3581 7.05719 16.6082C7.30724 16.8582 7.64638 16.9987 8 16.9987C8.35362 16.9987 8.69276 16.8582 8.94281 16.6082C9.19286 16.3581 9.33333 16.019 9.33333 15.6654V12.9987ZM17.3333 12.9987C17.3333 12.6451 17.1929 12.3059 16.9428 12.0559C16.6928 11.8058 16.3536 11.6654 16 11.6654C15.6464 11.6654 15.3072 11.8058 15.0572 12.0559C14.8071 12.3059 14.6667 12.6451 14.6667 12.9987V15.6654C14.6667 16.019 14.8071 16.3581 15.0572 16.6082C15.3072 16.8582 15.6464 16.9987 16 16.9987C16.3536 16.9987 16.6928 16.8582 16.9428 16.6082C17.1929 16.3581 17.3333 16.019 17.3333 15.6654V12.9987Z'
                fill='currentColor'
              />
            </svg>

            {cartCount > 0 && (
              <span className='absolute z-50 top-1 right-0.5 min-w-5 h-5 px-1 rounded-full bg-[var(--color-accent-red,#D9206E)] text-white text-xs font-bold leading-5 text-center'>
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className='flex items-center gap-2'>
              {/* Desktop: avatar with menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className='flex items-center gap-2 px-2.5 py-1.5  bg-white/80 dark:bg-transparent'>
                    <Avatar className='size-10 sm:size-12'>
                      <AvatarImage src={'/avatarfall.png'} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className='text-lg font-semibold hidden sm:block'>
                      {user.name}
                    </span>
                    <ChevronDown className='size-6 font-semibold hidden sm:block' />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='end'
                  className='w-screen sm:w-[200px] py-4 sm:bg-white sm:dark:bg-background bg-black/50 backdrop-blur-sm '
                >
                  <DropdownMenuItem
                    onClick={() => nav('/me/loans?tab=profile')}
                    className='cursor-pointer'
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => nav('/me/loans?tab=borrowed')}
                    className='cursor-pointer'
                  >
                    Borrowed List
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => nav('/me/loans?tab=reviews')}
                    className='cursor-pointer'
                  >
                    Reviews
                  </DropdownMenuItem>
                  {user.role === 'ADMIN' && (
                    <DropdownMenuItem
                      onClick={() => nav('/admin')}
                      className='cursor-pointer'
                    >
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => dispatch(logout())}
                    className='text-destructive cursor-pointer'
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              {/* Desktop buttons */}
              <div className='hidden md:flex items-center gap-2'>
                <Button
                  variant='outline'
                  className='rounded-full h-9 px-4 !text-primary-300'
                  onClick={() => nav('/login')}
                >
                  Login
                </Button>
                <Button
                  className='rounded-full h-9 px-5'
                  onClick={() => nav('/register')}
                >
                  Register
                </Button>
              </div>
              {/* Mobile hamburger */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className='md:hidden p-2 rounded-md border'
                    aria-label='Menu'
                  >
                    <MenuIcon className='size-5' />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='end'
                  className='w-screen sm:w-auto py-5 px-6 sm:bg-white sm:dark:bg-background bg-black/50 backdrop-blur-sm'
                >
                  <div className='flex items-center gap-3'>
                    <Button
                      variant='outline2'
                      className='flex-1 rounded-full h-10 px-5 border-2 border-primary-300 !bg-white !text-primary-300  font-semibold'
                      onClick={() => nav('/login')}
                    >
                      Login
                    </Button>
                    <Button
                      className='flex-1 rounded-full h-10 px-6 bg-primary-300 text-white font-semibold hover:bg-primary-400'
                      onClick={() => nav('/register')}
                    >
                      Register
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Mobile search row */}
      {mobileSearch && (
        <div className='md:hidden w-full border-t bg-background'>
          <div className='w-full px-3 py-2'>
            <div className='relative'>
              <SearchIcon className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-950 dark:text-foreground' />
              <Input
                autoFocus
                placeholder='Search book'
                value={search}
                onChange={(e) => dispatch(setSearch(e.target.value))}
                className='h-10 w-full rounded-full pl-9 pr-9'
              />
              <button
                aria-label='Close search'
                className='absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-neutral-950 hover:bg-neutral-100 dark:text-foreground dark:hover:bg-neutral-800/40'
                onClick={() => setMobileSearch(false)}
              >
                <CloseIcon className='size-4' />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
