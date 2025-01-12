import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Document = Database['public']['Tables']['documents']['Row'];

export default function Documents() {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Documents</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          New Document
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documents?.map((document) => (
          <div
            key={document.id}
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{document.title}</p>
              <p className="text-sm text-gray-500 truncate">{document.type}</p>
              <div className="mt-1 flex items-center">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${document.status === 'active' ? 'bg-green-100 text-green-800' : 
                    document.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'}`}>
                  {document.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}