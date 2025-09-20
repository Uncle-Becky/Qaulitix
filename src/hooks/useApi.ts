import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import type { Documents, Inspections, Deficiencies, Photos, Notifications } from '../types/api';
import type { Database } from '../types/database';

type InspectionInsert = Omit<Database['public']['Tables']['inspections']['Insert'], 'created_by'>;
type DeficiencyInsert = Omit<Database['public']['Tables']['deficiencies']['Insert'], 'created_by'>;
type DocumentInsert = Omit<Database['public']['Tables']['documents']['Insert'], 'created_by'>;
type PhotoInsert = Database['public']['Tables']['photos']['Insert'];

interface UseCollectionOptions {
  withQuery?: boolean;
}

export function useDocuments(options: UseCollectionOptions = {}) {
  const { withQuery = true } = options;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['documents'],
    queryFn: () => api.documents.getAll(),
    retry: 1,
    enabled: withQuery
  });

  const createMutation = useMutation({
    mutationFn: async (document: DocumentInsert) => {
      if (!user?.id) throw new Error('User must be logged in to create documents');

      return api.documents.create({
        ...document,
        created_by: user.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create document: ' + error.message);
    }
  });

  return {
    data: (query.data as Documents[] | undefined) ?? undefined,
    isLoading: withQuery ? query.isLoading : false,
    error: withQuery ? query.error : undefined,
    create: createMutation.mutate,
    createAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending
  };
}

export function useInspections(options: UseCollectionOptions = {}) {
  const { withQuery = true } = options;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['inspections'],
    queryFn: () => api.inspections.getAll(),
    retry: 1,
    enabled: withQuery
  });

  const createMutation = useMutation({
    mutationFn: async (inspection: InspectionInsert) => {
      if (!user?.id) throw new Error('User must be logged in to create inspections');

      return api.inspections.create({
        ...inspection,
        created_by: user.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      toast.success('Inspection created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create inspection: ' + error.message);
    }
  });

  return {
    data: (query.data as Inspections[] | undefined) ?? undefined,
    isLoading: withQuery ? query.isLoading : false,
    error: withQuery ? query.error : undefined,
    create: createMutation.mutate,
    createAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending
  };
}

export function useDeficiencies(options: UseCollectionOptions = {}) {
  const { withQuery = true } = options;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['deficiencies'],
    queryFn: () => api.deficiencies.getAll(),
    retry: 1,
    enabled: withQuery
  });

  const createMutation = useMutation({
    mutationFn: async (deficiency: DeficiencyInsert) => {
      if (!user?.id) throw new Error('User must be logged in to report deficiencies');

      return api.deficiencies.create({
        ...deficiency,
        created_by: user.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deficiencies'] });
      toast.success('Deficiency reported successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to report deficiency: ' + error.message);
    }
  });

  return {
    data: (query.data as Deficiencies[] | undefined) ?? undefined,
    isLoading: withQuery ? query.isLoading : false,
    error: withQuery ? query.error : undefined,
    create: createMutation.mutate,
    createAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending
  };
}

export function usePhotos(options: UseCollectionOptions = {}) {
  const { withQuery = true } = options;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['photos'],
    queryFn: () => api.photos.getAll(),
    retry: 1,
    enabled: withQuery
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, metadata }: { file: File; metadata: Omit<PhotoInsert, 'url' | 'created_by'> }) => {
      if (!user?.id) throw new Error('User must be logged in to upload photos');

      const url = await api.photos.uploadImage(file);

      return api.photos.create({
        url,
        ...metadata,
        created_by: user.id
      });
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
    data: (query.data as Photos[] | undefined) ?? undefined,
    isLoading: withQuery ? query.isLoading : false,
    error: withQuery ? query.error : undefined,
    upload: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending
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
    isMarking: markAllAsReadMutation.isPending
  };
}
