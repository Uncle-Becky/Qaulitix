import type { Database } from './database';

export type Tables = Database['public']['Tables'];
export type Documents = Tables['documents']['Row'];
export type Inspections = Tables['inspections']['Row'];
export type Deficiencies = Tables['deficiencies']['Row'];
export type Photos = Tables['photos']['Row'];
export type Notifications = Tables['notifications']['Row'];
export type Comments = Tables['comments']['Row'];
export type Activities = Tables['activities']['Row'];

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface ApiError extends Error {
  code?: string;
  details?: string;
  hint?: string;
}