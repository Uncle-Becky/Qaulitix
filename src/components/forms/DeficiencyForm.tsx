import React from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import type { DeficiencyFormData } from '../../types/components';
import type { FormProps } from '../../types/components';
import toast from 'react-hot-toast';

export default function DeficiencyForm({ onSuccess }: FormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<DeficiencyFormData>();

  const onSubmit = async (data: DeficiencyFormData) => {
    try {
      const { error } = await supabase
        .from('deficiencies')
        .insert([{
          ...data,
          status: 'open',
        }]);

      if (error) throw error;
      
      toast.success('Deficiency reported successfully');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to report deficiency');
      console.error('Error:', error);
    }
  };

  // Rest of the component remains the same
}