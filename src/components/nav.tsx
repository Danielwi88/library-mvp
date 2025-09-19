import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import ThemeToggle from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { logout } from '@/features/auth/authSlice';
import { Input } from '@/components/ui/input';
import { setSearch } from '@/features/ui/uiSlice';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  ShoppingCart,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

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
    <header className='sticky top-0 z-30 border-b bg-background/80 backdrop-blur'>
      <div className='container mx-auto max-w-6xl px-3 py-3 flex items-center gap-3'>
        {/* Left: brand + mobile menu */}
        <div className='flex items-center gap-2'>
          <Link to='/' className='font-semibold text-lg'>
            <span className='mr-1'>📘</span> Booky
          </Link>
        </div>

        {/* Center: search (desktop) */}
        <div className='hidden md:block flex-1 max-w-xl mx-auto'>
          <Input
            placeholder='Search book'
            value={search}
            onChange={(e) => dispatch(setSearch(e.target.value))}
            className='h-10 rounded-full'
          />
        </div>

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
          <Link to='/cart' className='relative p-2 rounded-md border md:border-transparent'>
            <ShoppingCart className='size-5' />
            {cartCount > 0 && (
              <span className='absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] rounded-full px-1.5 py-0.5'>{cartCount}</span>
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
                  <button className='hidden md:flex items-center gap-2 px-2 py-1 rounded-full border'>
                    <Avatar className='size-7'>
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className='text-sm'>{user.name}</span>
                    <ChevronDown className='size-4 opacity-60' />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={() => nav('/me/profile')}>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => nav('/me/loans')}>Loans</DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem onClick={() => nav('/admin')}>Admin</DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => dispatch(logout())} className='text-destructive'>
                    <LogOut className='size-4 mr-2' /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile: hamburger menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className='md:hidden p-2 rounded-md border' aria-label='Menu'>
                    <MenuIcon className='size-5' />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={() => nav('/')}>Home</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => nav('/me/loans')}>Loans</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => nav('/me/profile')}>Profile</DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem onClick={() => nav('/admin')}>Admin</DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => dispatch(logout())} className='text-destructive'>
                    <LogOut className='size-4 mr-2' /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              {/* Desktop buttons */}
              <div className='hidden md:flex items-center gap-2'>
                <Button variant='outline' onClick={() => nav('/login')}>Login</Button>
                <Button className='rounded-full' onClick={() => nav('/register')}>Register</Button>
              </div>
              {/* Mobile hamburger containing actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className='md:hidden p-2 rounded-md border' aria-label='Menu'>
                    <MenuIcon className='size-5' />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={() => nav('/')}>Home</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => nav('/login')}>Login</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => nav('/register')}>Register</DropdownMenuItem>
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
            <Input
              autoFocus
              placeholder='Search book'
              value={search}
              onChange={(e) => dispatch(setSearch(e.target.value))}
              className='h-10 rounded-full'
            />
          </div>
        </div>
      )}
    </header>
  );
}
