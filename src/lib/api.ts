import { supabase } from './supabase';
import type { ApiError, ApiResponse, Documents, Inspections, Deficiencies, Photos, Notifications } from '../types/api';

export class ApiClientError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export const api = {
  inspections: {
    async getAll(): Promise<Inspections[]> {
      const { data, error } = await supabase
        .from('inspections')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw new ApiClientError(error.message, error.code);
      return data || [];
    },

    async create(inspection: Omit<Inspections, 'id' | 'created_at' | 'updated_at'>): Promise<Inspections> {
      const { data, error } = await supabase
        .from('inspections')
        .insert([inspection])
        .select()
        .single();
      
      if (error) throw new ApiClientError(error.message, error.code);
      if (!data) throw new ApiClientError('Failed to create inspection');
      return data;
    }
  },

  deficiencies: {
    async getAll(): Promise<Deficiencies[]> {
      const { data, error } = await supabase
        .from('deficiencies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw new ApiClientError(error.message, error.code);
      return data || [];
    },

    async create(deficiency: Omit<Deficiencies, 'id' | 'created_at' | 'updated_at'>): Promise<Deficiencies> {
      const { data, error } = await supabase
        .from('deficiencies')
        .insert([deficiency])
        .select()
        .single();
      
      if (error) throw new ApiClientError(error.message, error.code);
      if (!data) throw new ApiClientError('Failed to create deficiency');
      return data;
    }
  },

  photos: {
    async getAll(): Promise<Photos[]> {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw new ApiClientError(error.message, error.code);
      return data || [];
    },

    async uploadImage(file: File): Promise<string> {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw new ApiClientError(uploadError.message);

      const { data } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      return data.publicUrl;
    },

    async create(photo: Omit<Photos, 'id' | 'created_at' | 'updated_at'>): Promise<Photos> {
      const { data, error } = await supabase
        .from('photos')
        .insert([photo])
        .select()
        .single();
      
      if (error) throw new ApiClientError(error.message, error.code);
      if (!data) throw new ApiClientError('Failed to create photo record');
      return data;
    }
  },

  notifications: {
    async getUnread(userId: string): Promise<Notifications[]> {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false });
      
      if (error) throw new ApiClientError(error.message, error.code);
      return data || [];
    },

    async markAllAsRead(userId: string): Promise<void> {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId);
      
      if (error) throw new ApiClientError(error.message, error.code);
    }
  }
};