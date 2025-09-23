import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setAuth } from '@/features/auth/authSlice';
import { getErrorMessage } from '@/lib/errors';
import { login as apiLogin } from '@/services/users';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
type Form = z.infer<typeof schema>;

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [showPwd, setShowPwd] = useState(false);

  const onSubmit = async (v: Form) => {
    try {
      const res = await apiLogin(v);
      dispatch(setAuth(res));
      toast.success('Welcome back!');
      if (res.user.role === 'ADMIN') nav('/admin');
      else nav('/');
    } catch (e: unknown) {
      toast.error(getErrorMessage(e) ?? 'Login failed');
    }
  };

  return (
    <div className='mx-auto max-w-[400px] space-y-6 py-10'>
      <div className='flex items-center gap-[11.8px]'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 42 42'
          className='w-[33px] h-[33px] fill-primary-300'
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
              fill=''
            />
          </g>
        </svg>
        <div className='font-bold text-[25.2px] leading-[33px] '>Booky</div>
      </div>
      <div className='space-y-2'>
        <h1 className='text-display-xs sm:text-display-sm font-bold '>Login</h1>
        <p className='text-sm sm:text-md font-semibold text-neutral-950 mb-5'>
          Sign in to manage your library account.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <div>
          <Label htmlFor='email' className='font-bold pb-2 text-sm'>
            Email
          </Label>
          <Input
            id='email'
            className='text-md font-semibold mt-1 h-10 rounded-xl'
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          {errors.email && (
            <p className='text-xs mt-1 text-destructive'>
              {errors.email.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor='password' className='font-bold pb-2'>
            Password
          </Label>
          <div className='relative'>
            <Input
              id='password'
              type={showPwd ? 'text' : 'password'}
              aria-invalid={!!errors.password}
              className='text-md font-normal h-10 rounded-lg'
              {...register('password')}
            />
            <button
              type='button'
              aria-label={showPwd ? 'Hide password' : 'Show password'}
              className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground'
              onClick={() => setShowPwd((s) => !s)}
            >
              {showPwd ? (
                <EyeOff className='size-4' />
              ) : (
                <Eye className='size-4' />
              )}
            </button>
          </div>
          {errors.password && (
            <p className='text-xs mt-1 text-destructive'>
              {errors.password.message}
            </p>
          )}
        </div>
        <Button
          disabled={isSubmitting}
          className='w-full rounded-full h-12 text-md font-bold'
        >
          Login
        </Button>
      </form>
      <p className='text-sm sm:text-md font-semibold text-center'>
        Don&apos;t have an account?{' '}
        <Link to='/register' className='text-primary-300'>
          Register
        </Link>
      </p>
    </div>
  );
}
