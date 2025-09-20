import React from 'react';
import { useForm } from 'react-hook-form';
import { useDeficiencies, useInspections } from '../../hooks/useApi';
import type { DeficiencyFormData, FormProps } from '../../types/components';

interface DeficiencyFormProps extends FormProps {
  inspections?: { id: string; title: string; job_number: string }[];
}

export default function DeficiencyForm({ onSuccess, inspections }: DeficiencyFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<DeficiencyFormData>();
  const { createAsync, isCreating } = useDeficiencies({ withQuery: false });
  const shouldFetchInspections = !inspections;
  const { data: inspectionData } = useInspections({ withQuery: shouldFetchInspections });
  const availableInspections = inspections ?? inspectionData ?? [];

  const onSubmit = async (data: DeficiencyFormData) => {
    try {
      await createAsync({
        description: data.description,
        severity: data.severity,
        location: data.location,
        status: 'open',
        inspection_id: data.inspectionId || null,
        assigned_to: null,
        due_date: data.dueDate ? new Date(data.dueDate).toISOString() : null
      });

      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to report deficiency:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register('description', { required: 'Description is required' })}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Severity</label>
        <select
          {...register('severity', { required: 'Severity is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Select severity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        {errors.severity && (
          <p className="mt-1 text-sm text-red-600">{errors.severity.message}</p>
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
        <label className="block text-sm font-medium text-gray-700">Related Inspection</label>
        <select
          {...register('inspectionId')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">No linked inspection</option>
          {availableInspections.map((inspection) => (
            <option key={inspection.id} value={inspection.id}>
              {inspection.title} ({inspection.job_number})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Due Date</label>
        <input
          type="date"
          {...register('dueDate')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <button
        type="submit"
        disabled={isCreating}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isCreating ? 'Submitting...' : 'Report Deficiency'}
      </button>
    </form>
  );
}

