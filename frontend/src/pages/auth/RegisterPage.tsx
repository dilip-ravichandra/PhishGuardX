import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { registerSchema, type RegisterFormValues } from '../../features/auth/schemas';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { extractErrorMessage } from '../../utils/error-message';

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    try {
      await registerUser(values);
      navigate('/account');
    } catch (error) {
      const message = extractErrorMessage(error) ?? 'Registration failed. Please try again.';
      toast.error(message);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h1 className="mb-1 text-xl font-semibold text-slate-100">Create your account</h1>
        <p className="mb-6 text-sm text-slate-400">Start protecting your inbox with PhishGuardX.</p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField label="Full name" autoComplete="name" error={errors.name?.message} {...register('name')} />
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <TextField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" isLoading={isSubmitting}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
