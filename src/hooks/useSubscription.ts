import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useSubscription(table: string, queryKey: string[]) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('db_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table
        },
        () => {
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, table, queryKey, queryClient]);
}