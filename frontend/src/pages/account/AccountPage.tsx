import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../features/auth/api';
import { Button } from '../../components/ui/Button';

/**
 * This is a Milestone 1 verification page only - it exists to prove
 * authentication and RBAC work end-to-end (protected route access,
 * role-gated data). The real dashboard shell/navigation is Milestone 2's
 * scope and is intentionally not built here.
 */
export function AccountPage() {
  const { user, logout } = useAuth();

  const adminCountQuery = useQuery({
    queryKey: ['admin-user-count'],
    queryFn: authApi.adminUserCount,
    retry: false
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h1 className="mb-1 text-xl font-semibold">Welcome, {user?.name}</h1>
        <p className="mb-4 text-sm text-slate-400">{user?.email}</p>
        <p className="mb-4 text-xs uppercase tracking-wide text-slate-500">Role: {user?.role}</p>

        <div className="mb-4 rounded-md border border-slate-800 bg-slate-950 p-3 text-sm">
          <p className="mb-1 font-medium text-slate-300">Admin-only data (RBAC check)</p>
          {adminCountQuery.isLoading && <p className="text-slate-500">Checking access...</p>}
          {adminCountQuery.isSuccess && (
            <p className="text-emerald-400">Access granted - total users: {adminCountQuery.data}</p>
          )}
          {adminCountQuery.isError && <p className="text-red-400">Access denied (admin role required)</p>}
        </div>

        <Button onClick={() => logout()} className="w-full">
          Log out
        </Button>
      </div>
    </main>
  );
}
