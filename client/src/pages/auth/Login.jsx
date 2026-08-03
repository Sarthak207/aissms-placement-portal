import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

const DASHBOARD_BY_ROLE = {
  student: '/student/dashboard',
  company_hr: '/company/dashboard',
  tpo: '/tpo/dashboard',
  coordinator: '/coordinator/dashboard',
  admin: '/admin/users',
};

export default function Login() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { rememberMe: false } });

  const onSubmit = async (values) => {
    const result = await login(values);
    if (result.meta.requestStatus === 'fulfilled') {
      const role = result.payload.role;
      const redirectTo = location.state?.from?.pathname || DASHBOARD_BY_ROLE[role] || '/';
      navigate(redirectTo, { replace: true });
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-navy mb-1">Sign in</h1>
      <p className="text-sm text-slate-light mb-6">Access your placement portal account.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" placeholder="you@college.edu" {...register('email')} error={errors.email?.message} />
        <Input label="Password" type="password" placeholder="••••••••" {...register('password')} error={errors.password?.message} />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-navy">
            <input type="checkbox" className="rounded" {...register('rememberMe')} />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-seal-dark font-medium hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" isLoading={status === 'loading'}>
          Sign in
        </Button>
      </form>

      <p className="text-sm text-slate-light text-center mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-seal-dark font-medium hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
