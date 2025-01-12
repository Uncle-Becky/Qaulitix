import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [inspections, deficiencies, documents] = await Promise.all([
        supabase.from('inspections').select('status'),
        supabase.from('deficiencies').select('severity,status'),
        supabase.from('documents').select('status')
      ]);

      return {
        inspections: inspections.data || [],
        deficiencies: deficiencies.data || [],
        documents: documents.data || []
      };
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Inspections</h3>
          <div className="space-y-2">
            <p>Pending: {stats?.inspections.filter(i => i.status === 'pending').length || 0}</p>
            <p>In Progress: {stats?.inspections.filter(i => i.status === 'in-progress').length || 0}</p>
            <p>Completed: {stats?.inspections.filter(i => i.status === 'completed').length || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Deficiencies</h3>
          <div className="space-y-2">
            <p>High Priority: {stats?.deficiencies.filter(d => d.severity === 'high').length || 0}</p>
            <p>Open: {stats?.deficiencies.filter(d => d.status === 'open').length || 0}</p>
            <p>Resolved: {stats?.deficiencies.filter(d => d.status === 'resolved').length || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Documents</h3>
          <div className="space-y-2">
            <p>Active: {stats?.documents.filter(d => d.status === 'active').length || 0}</p>
            <p>Draft: {stats?.documents.filter(d => d.status === 'draft').length || 0}</p>
            <p>Archived: {stats?.documents.filter(d => d.status === 'archived').length || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}