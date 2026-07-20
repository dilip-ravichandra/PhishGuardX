import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/api-client';
import type { ApiResponse } from '../../types/api-response';

interface HealthPayload {
  status: 'ok';
  service: 'backend';
  timestamp: string;
}

async function fetchBackendHealth(): Promise<HealthPayload> {
  const response = await apiClient.get<ApiResponse<HealthPayload>>('/health');
  if (!response.data.success) {
    throw new Error(response.data.error.message);
  }
  return response.data.data;
}

/**
 * Confirms the frontend can reach the backend's health endpoint. This is
 * infrastructure verification for Milestone 0, not a product feature -
 * it exists to prove the two services are wired together correctly.
 */
export function useBackendHealth() {
  return useQuery({
    queryKey: ['backend-health'],
    queryFn: fetchBackendHealth,
    retry: 1
  });
}
