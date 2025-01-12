export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string;
          title: string;
          type: 'spec' | 'code' | 'requirement';
          content: string;
          version: number;
          status: 'draft' | 'active' | 'archived';
          metadata: Record<string, any>;
          revision_history: Record<string, any>[];
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['documents']['Insert']>;
      };
      inspections: {
        Row: {
          id: string;
          title: string;
          date: string;
          location: string;
          status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
          assigned_to: string | null;
          checklist: Record<string, any>[];
          priority: 'low' | 'medium' | 'high';
          job_number: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['inspections']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['inspections']['Insert']>;
      };
      deficiencies: {
        Row: {
          id: string;
          description: string;
          severity: 'low' | 'medium' | 'high';
          location: string;
          status: 'open' | 'in-progress' | 'resolved';
          inspection_id: string | null;
          assigned_to: string | null;
          due_date: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['deficiencies']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['deficiencies']['Insert']>;
      };
      photos: {
        Row: {
          id: string;
          url: string;
          description: string | null;
          location: string;
          deficiency_id: string | null;
          inspection_id: string | null;
          job_number: string;
          metadata: Record<string, any>;
          analysis: Record<string, any> | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['photos']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['photos']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          title: string;
          message: string;
          type: 'deficiency' | 'inspection' | 'task' | 'system';
          severity: 'info' | 'warning' | 'critical';
          read: boolean;
          related_id: string | null;
          created_at: string;
          user_id: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
    };
  };
}