import { apiClient } from '../../services/api-client';
import type { ApiResponse } from '../../types/api-response';
import type { PublicUser } from '../../types/auth';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

interface AuthPayloadResponse {
  user: PublicUser;
  accessToken: string;
}

function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.error.message);
  }
  return response.data;
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthPayloadResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthPayloadResponse>>('/auth/register', payload);
    return unwrap(data);
  },

  async login(payload: LoginPayload): Promise<AuthPayloadResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthPayloadResponse>>('/auth/login', payload);
    return unwrap(data);
  },

  /** Relies on the httpOnly refresh cookie; used for silent re-auth on app load. */
  async refresh(): Promise<AuthPayloadResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthPayloadResponse>>('/auth/refresh');
    return unwrap(data);
  },

  async logout(): Promise<void> {
    await apiClient.post<ApiResponse<{ loggedOut: true }>>('/auth/logout');
  },

  async me(): Promise<PublicUser> {
    const { data } = await apiClient.get<ApiResponse<{ user: PublicUser }>>('/auth/me');
    return unwrap(data).user;
  },

  async adminUserCount(): Promise<number> {
    const { data } = await apiClient.get<ApiResponse<{ totalUsers: number }>>('/auth/admin/user-count');
    return unwrap(data).totalUsers;
  }
};
