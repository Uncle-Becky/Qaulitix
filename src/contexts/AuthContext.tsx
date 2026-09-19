import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { AuthContextType, AuthProviderProps } from '../types/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveringPassword(true);
        navigate('/login', { replace: true });
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('This email is already registered. Please sign in instead.');
        } else {
          toast.error(error.message);
        }
        throw error;
      }
      
      if (data.user && !data.session) {
        toast.success('Please check your email to confirm your account.');
      } else {
        toast.success('Registration successful!');
        navigate('/');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password');
        } else {
          toast.error(error.message);
        }
        throw error;
      }

      if (data.session) {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
        toast.success('Successfully signed in');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
      toast.success('Successfully signed out');
    } catch (error: any) {
      toast.error('Failed to sign out');
      console.error('Auth error:', error);
      throw error;
    }
  };

  const requestPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`
    });

    if (error) {
      toast.error(error.message);
      throw error;
    }

    toast.success('If that account exists, a recovery link has been sent.');
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(error.message);
      throw error;
    }

    setIsRecoveringPassword(false);
    toast.success('Password updated successfully.');
    navigate('/', { replace: true });
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    requestPasswordReset,
    updatePassword,
    signOut,
    isRecoveringPassword,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
