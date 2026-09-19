import type { User } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isRecoveringPassword: boolean;
  isAuthenticated: boolean;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
}
