import React from 'react';
import { useForm } from 'react-hook-form';
import { useInspections } from '../../hooks/useApi';
import type { InspectionFormData } from '../../types/components';

export default function InspectionForm({ onSuccess }: { onSuccess?: () => void }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<InspectionFormData>();
  const { createAsync, isCreating } = useInspections({ withQuery: false });

  const onSubmit = async (data: InspectionFormData) => {
    try {
      await createAsync({
        title: data.title,
        date: new Date(data.date).toISOString(),
        location: data.location,
        priority: data.priority,
        job_number: data.jobNumber,
        status: 'pending',
        checklist: [],
        assigned_to: null
      });

      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to schedule inspection:', error);
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
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="datetime-local"
          {...register('date', { required: 'Date is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <input
          type="text"
          {...register('location', { required: 'Location is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Priority</label>
        <select
          {...register('priority', { required: 'Priority is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        {errors.priority && (
          <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Job Number</label>
        <input
          type="text"
          {...register('jobNumber', { required: 'Job number is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.jobNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.jobNumber.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isCreating}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isCreating ? 'Scheduling...' : 'Schedule Inspection'}
      </button>
    </form>
  );
}
