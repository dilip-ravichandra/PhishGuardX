import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { loginSchema, type LoginFormValues } from '../../features/auth/schemas';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { extractErrorMessage } from '../../utils/error-message';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    try {
      await login(values);
      navigate('/account');
    } catch (error) {
      const message = extractErrorMessage(error) ?? 'Invalid email or password';
      toast.error(message);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h1 className="mb-1 text-xl font-semibold text-slate-100">Sign in</h1>
        <p className="mb-6 text-sm text-slate-400">Welcome back to PhishGuardX.</p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" isLoading={isSubmitting}>
            Sign in
          </Button>
        </form>

        <button
          type="button"
          disabled
          title="Google OAuth is not yet implemented (FR-003)"
          className="mt-3 w-full cursor-not-allowed rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-500"
        >
          Continue with Google (coming soon)
        </button>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-emerald-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
