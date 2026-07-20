import axios from 'axios';
import { env } from '../utils/env';
import { tokenStore } from './token-store';

/**
 * Centralized Axios instance. Per Volume 3, Axios is responsible for
 * request interception, JWT attachment, and response parsing.
 *
 * withCredentials is required so the httpOnly refresh-token cookie set by
 * the backend is sent on /auth/refresh and /auth/logout requests.
 */
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((requestConfig) => {
  const token = tokenStore.get();
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

// Deduplicates concurrent refresh attempts: if five requests 401 at once,
// only one refresh call is made and all five retry against its result.
let refreshInFlight: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!refreshInFlight) {
    refreshInFlight = axios
      .post<{ success: true; data: { accessToken: string } }>(
        `${env.apiBaseUrl}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      .then((response) => {
        const newToken = response.data.data.accessToken;
        tokenStore.set(newToken);
        return newToken;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest?._retried && !isAuthEndpoint) {
      originalRequest._retried = true;
      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        tokenStore.set(null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

