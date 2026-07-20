/**
 * The access token lives in memory only - never localStorage or
 * sessionStorage - to minimize the window an XSS payload could steal it.
 * It's naturally cleared on page reload, at which point AuthContext
 * silently re-authenticates using the httpOnly refresh cookie.
 */
let accessToken: string | null = null;

export const tokenStore = {
  get(): string | null {
    return accessToken;
  },
  set(token: string | null): void {
    accessToken = token;
  }
};
