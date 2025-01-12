import React from 'react';
import { useForm } from 'react-hook-form';
import { useDocuments } from '../../hooks/useApi';
import toast from 'react-hot-toast';

interface DocumentFormData {
  title: string;
  type: 'spec' | 'code' | 'requirement';
  content: string;
}

export default function DocumentForm({ onSuccess }: { onSuccess?: () => void }) {
  const { create } = useDocuments();
  const { register, handleSubmit, formState: { errors } } = useForm<DocumentFormData>();

  const onSubmit = async (data: DocumentFormData) => {
    try {
      await create({
        ...data,
        status: 'draft',
        metadata: {},
        revision_history: []
      });
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to create document');
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          {...register('title', { required: 'Title is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          {...register('type', { required: 'Type is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="spec">Specification</option>
          <option value="code">Code</option>
          <option value="requirement">Requirement</option>
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Content</label>
        <textarea
          {...register('content', { required: 'Content is required' })}
          rows={6}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Create Document
      </button>
    </form>
  );
}