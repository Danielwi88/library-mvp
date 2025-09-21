import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import { Button } from '@/components/ui/button';
import { logout } from '@/features/auth/authSlice';
import { Input } from '@/components/ui/input';
import { setSearch } from '@/features/ui/uiSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ThemeToggle from '@/components/theme-toggle';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  ShoppingCart,
  ChevronDown,
  LogOut,
  X as CloseIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

function BookyMark({
  className = 'size-6 text-primary',
}: {
  className?: string;
}) {
  // Starburst mark used as the Booky brand icon
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
    <header className='sticky top-0 z-30 bg-white/90 dark:bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-white/95 border-b'>
      <div className='container mx-auto max-w-6xl px-3 py-3 flex items-center gap-3'>
        {/* Left: brand */}
        <Link
          to='/'
          className='flex items-center gap-2 font-semibold text-lg text-foreground'
        >
          <BookyMark className='size-6 sm:size-7 text-primary' />
          <span className='hidden xs:inline text-lg font-extrabold'>Booky</span>
        </Link>

        {/* Center: search (desktop, after login) */}
        {user && (
          <div className='hidden md:block flex-1 max-w-xl mx-auto'>
            <div className='relative'>
              <SearchIcon className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-600' />
              <Input
                placeholder='Search book'
                value={search}
                onChange={(e) => dispatch(setSearch(e.target.value))}
                className='h-10 rounded-full pl-9 pr-4'
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
            onClick={() => setMobileSearch((s) => !s)}
          >
            <SearchIcon className='size-4' />
          </button>
          <Link
            to='/cart'
            className='relative p-2 rounded-md border md:border-transparent text-foreground'
          >
            <ShoppingCart className='size-5' />
            {cartCount > 0 && (
              <span className='absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[var(--color-accent-red,#D9206E)] text-white text-[10px] font-bold leading-4 text-center'>
                {cartCount}
              </span>
            )}
          </Link>

          {/* Desktop theme toggle */}
          <div className='hidden md:block'>
            <ThemeToggle />
          </div>

          {user ? (
            <div className='flex items-center gap-2'>
              {/* Desktop: avatar with menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className='hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-full border bg-white/80'>
                    <Avatar className='size-7'>
                      <AvatarImage src={'/avatarfall.png'} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className='text-sm'>{user.name}</span>
                    <ChevronDown className='size-4 opacity-60' />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={() => nav('/me/loans?tab=profile')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => nav('/me/loans?tab=borrowed')}>
                    Borrowed List
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => nav('/me/loans?tab=reviews')}>
                    Reviews
                  </DropdownMenuItem>
                  {user.role === 'ADMIN' && (
                    <DropdownMenuItem onClick={() => nav('/admin')}>
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => dispatch(logout())}
                    className='text-destructive'
                  >
                    <LogOut className='size-4 mr-2' /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile: hamburger menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className='md:hidden p-2 rounded-md border'
                    aria-label='Menu'
                  >
                    <MenuIcon className='size-5' />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={() => nav('/')}>
                    Home
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => nav('/me/loans?tab=profile')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => nav('/me/loans?tab=borrowed')}>
                    Borrowed List
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => nav('/me/loans?tab=reviews')}>
                    Reviews
                  </DropdownMenuItem>
                  {user.role === 'ADMIN' && (
                    <DropdownMenuItem onClick={() => nav('/admin')}>
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => dispatch(logout())}
                    className='text-destructive'
                  >
                    <LogOut className='size-4 mr-2' /> Logout
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
                  className='rounded-full h-9 px-4'
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
              {/* Mobile hamburger containing actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className='md:hidden p-2 rounded-md border'
                    aria-label='Menu'
                  >
                    <MenuIcon className='size-5' />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={() => nav('/')}>
                    Home
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => nav('/login')}>
                    Login
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => nav('/register')}>
                    Register
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Mobile search row */}
      {mobileSearch && (
        <div className='border-t bg-background'>
          <div className='container mx-auto max-w-6xl px-3 py-2'>
            <div className='relative'>
              <SearchIcon className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-600' />
              <Input
                autoFocus
                placeholder='Search book'
                value={search}
                onChange={(e) => dispatch(setSearch(e.target.value))}
                className='h-10 rounded-full pl-9 pr-9'
              />
              <button
                aria-label='Close search'
                className='absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-neutral-700 hover:bg-neutral-100'
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
