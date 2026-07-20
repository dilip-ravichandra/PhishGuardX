/**
 * Extracts a human-readable message from a thrown error. authApi throws
 * plain Error objects whose message is the backend's error.message
 * (see features/auth/api.ts's unwrap()), so this is usually a direct pass-through.
 */
export function extractErrorMessage(error: unknown): string | null {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return null;
}
