import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authApi } from '../../services/authApi';

const schema = z
  .object({
    role: z.enum(['student', 'company_hr']),
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Needs an uppercase letter')
      .regex(/[0-9]/, 'Needs a number'),
    confirmPassword: z.string(),
    rollNumber: z.string().optional(),
    passingYear: z.coerce.number().optional(),
    companyName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function Register() {
  const [role, setRole] = useState('student');
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({ resolver: zodResolver(schema), defaultValues: { role: 'student' } });

  const selectRole = (r) => {
    setRole(r);
    setValue('role', r);
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await authApi.register(values);
      toast.success('Account created — you can sign in now.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-navy mb-1">Create your account</h1>
      <p className="text-sm text-slate-light mb-6">Join the AISSMS Placement Portal.</p>

      <div className="flex gap-2 mb-6 bg-navy-50 p-1 rounded-card">
        {['student', 'company_hr'].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => selectRole(r)}
            className={`flex-1 py-2 rounded-card text-sm font-medium capitalize transition-colors ${
              role === r ? 'bg-parchment-100 text-navy shadow-card' : 'text-slate-light'
            }`}
          >
            {r === 'student' ? 'Student' : 'Company HR'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full name" {...register('name')} error={errors.name?.message} />
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />

        {role === 'student' && (
          <>
            <Input label="Roll number" {...register('rollNumber')} error={errors.rollNumber?.message} />
            <Input label="Passing year" type="number" {...register('passingYear')} error={errors.passingYear?.message} />
          </>
        )}
        {role === 'company_hr' && (
          <Input label="Company name" {...register('companyName')} error={errors.companyName?.message} />
        )}

        <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
        <Input label="Confirm password" type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />

        <Button type="submit" className="w-full" isLoading={submitting}>
          Create account
        </Button>
      </form>

      <p className="text-sm text-slate-light text-center mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-seal-dark font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
