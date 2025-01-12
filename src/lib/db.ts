import { supabase } from './supabase';
import type { Database } from '../types/database';

type Tables = Database['public']['Tables'];

export class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export const db = {
  /**
   * Get a database client
   * Uses Supabase for all operations
   */
  async getClient() {
    try {
      return {
        read: supabase,
        write: supabase
      };
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Helper to handle database errors consistently
   */
  handleError(error: unknown): never {
    if (error instanceof Error) {
      throw new DatabaseError(error.message);
    }
    throw new DatabaseError('An unknown database error occurred');
  }
};