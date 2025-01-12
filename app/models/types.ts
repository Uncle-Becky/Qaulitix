// Shared type definitions
export type Severity = 'low' | 'medium' | 'high';
export type Status = 'pending' | 'in-progress' | 'completed' | 'failed' | 'resolved';
export type DocumentType = 'spec' | 'code' | 'requirement';
export type NotificationType = 'deficiency' | 'inspection' | 'task' | 'system';
export type NotificationSeverity = 'info' | 'warning' | 'critical';

export interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseModel {
  name: string;
  role: 'manager' | 'supervisor' | 'inspector';
  email: string;
}

export interface Theme {
  colors: {
    primary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    text: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}