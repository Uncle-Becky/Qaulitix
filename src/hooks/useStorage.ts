import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function useStorage(bucket: string) {
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File, path?: string) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = path || `${Math.random()}.${fileExt}`;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  };

  const remove = async (path: string) => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  };

  return {
    upload,
    remove,
    uploading
  };
}