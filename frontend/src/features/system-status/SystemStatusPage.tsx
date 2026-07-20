import { Link } from 'react-router-dom';
import { useBackendHealth } from './api';

/**
 * Milestone 0 placeholder landing view. Displays whether the frontend can
 * reach the backend. Replaced by the real dashboard/auth flow starting in
 * Milestone 1-2; nothing here is a documented product feature.
 */
export function SystemStatusPage() {
  const { data, isLoading, isError, error } = useBackendHealth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-4 text-slate-100">
      <h1 className="text-2xl font-semibold tracking-tight">PhishGuardX</h1>
      <p className="text-sm text-slate-400">Milestone 0 - Project Initialization</p>

      <div className="mt-6 w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-2 text-sm font-medium text-slate-300">Backend connectivity</h2>

        {isLoading && <p className="text-sm text-slate-400">Checking backend health...</p>}

        {isError && (
          <p className="text-sm text-red-400">
            Unable to reach backend: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        )}

        {data && (
          <div className="text-sm text-emerald-400">
            <p>Status: {data.status}</p>
            <p>Service: {data.service}</p>
            <p className="text-slate-500">Checked at {new Date(data.timestamp).toLocaleTimeString()}</p>
          </div>
        )}
      </div>

      <div className="flex gap-4 text-sm">
        <Link to="/login" className="text-emerald-400 hover:underline">
          Sign in
        </Link>
        <Link to="/register" className="text-emerald-400 hover:underline">
          Create account
        </Link>
      </div>
    </main>
  );
}
