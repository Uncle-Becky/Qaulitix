import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import type { Inspections, Deficiencies, Photos, Notifications } from '../types/api';

export function useInspections() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['inspections'],
    queryFn: () => api.inspections.getAll(),
    retry: 1
  });

  const createMutation = useMutation({
    mutationFn: api.inspections.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      toast.success('Inspection created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create inspection: ' + error.message);
    }
  });

  return {
    data: query.data as Inspections[] | undefined,
    isLoading: query.isLoading,
    error: query.error,
    create: createMutation.mutate
  };
}

export function useDeficiencies() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['deficiencies'],
    queryFn: () => api.deficiencies.getAll(),
    retry: 1
  });

  const createMutation = useMutation({
    mutationFn: api.deficiencies.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deficiencies'] });
      toast.success('Deficiency reported successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to report deficiency: ' + error.message);
    }
  });

  return {
    data: query.data as Deficiencies[] | undefined,
    isLoading: query.isLoading,
    error: query.error,
    create: createMutation.mutate
  };
}

export function usePhotos() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['photos'],
    queryFn: () => api.photos.getAll(),
    retry: 1
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, metadata }: { file: File; metadata: Partial<Photos> }) => {
      if (!user?.id) throw new Error('User must be logged in to upload photos');
      
      const url = await api.photos.uploadImage(file);
      
      return api.photos.create({
        url,
        ...metadata,
        created_by: user.id
      } as Omit<Photos, 'id' | 'created_at' | 'updated_at'>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      toast.success('Photo uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to upload photo: ' + error.message);
    }
  });

  return {
    data: query.data as Photos[] | undefined,
    isLoading: query.isLoading,
    error: query.error,
    upload: uploadMutation.mutate,
    isUploading: uploadMutation.isLoading
  };
}

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => user?.id ? api.notifications.getUnread(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
    retry: 1
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => {
      if (!user?.id) throw new Error('User must be logged in to mark notifications as read');
      return api.notifications.markAllAsRead(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      toast.success('All notifications marked as read');
    },
    onError: (error: Error) => {
      toast.error('Failed to mark notifications as read: ' + error.message);
    }
  });

  return {
    data: query.data as Notifications[] | undefined,
    isLoading: query.isLoading,
    error: query.error,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarking: markAllAsReadMutation.isLoading
  };
}