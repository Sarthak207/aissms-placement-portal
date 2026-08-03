import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authApi } from '../../services/authApi';

const schema = z.object({ email: z.string().email('Enter a valid email') });

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }) => {
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <h1 className="font-display text-2xl text-navy mb-2">Check your email</h1>
        <p className="text-sm text-slate-light">
          If an account exists for that email, we've sent a link to reset your password.
        </p>
        <Link to="/login" className="inline-block mt-6 text-seal-dark font-medium hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-navy mb-1">Reset your password</h1>
      <p className="text-sm text-slate-light mb-6">Enter your email and we'll send you a reset link.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Button type="submit" className="w-full" isLoading={submitting}>
          Send reset link
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
