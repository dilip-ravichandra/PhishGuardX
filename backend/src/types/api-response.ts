/**
 * Standard API response envelope, per the Implementation Blueprint's
 * API conventions (Section 8): every response follows { success, data, error }.
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
