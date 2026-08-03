import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authApi } from '../../services/authApi';

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Needs an uppercase letter')
      .regex(/[0-9]/, 'Needs a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const email = params.get('email');
  const token = params.get('token');

  const onSubmit = async ({ newPassword }) => {
    if (!email || !token) {
      toast.error('Invalid or missing reset link');
      return;
    }
    setSubmitting(true);
    try {
      await authApi.resetPassword({ email, token, newPassword });
      toast.success('Password reset — please sign in');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or expired');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-navy mb-1">Set a new password</h1>
      <p className="text-sm text-slate-light mb-6">Choose a strong new password for your account.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="New password" type="password" {...register('newPassword')} error={errors.newPassword?.message} />
        <Input
          label="Confirm new password"
          type="password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />
        <Button type="submit" className="w-full" isLoading={submitting}>
          Reset password
        </Button>
      </form>
      <p className="text-sm text-slate-light text-center mt-6">
        <Link to="/login" className="text-seal-dark font-medium hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
