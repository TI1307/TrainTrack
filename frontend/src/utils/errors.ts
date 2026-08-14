// frontend/src/utils/errors.ts
import axios from 'axios';

export interface ValidationErrorItem {
  loc?: (string | number)[];
  msg: string;
  type?: string;
}

export type ApiError = string | ValidationErrorItem[];

export function getErrorMessage(err: unknown, fallback: string): ApiError {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail as ValidationErrorItem[];
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}