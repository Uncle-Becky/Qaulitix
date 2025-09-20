import { ReactNode } from 'react';
import type { Documents, Inspections, Deficiencies, Photos } from './api';

export interface FormProps {
  onSuccess?: () => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title: string;
}

export interface ShareLinkProps {
  path: string;
  title?: string;
}

export interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: Error) => void;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export interface ProtectedRouteProps {
  children: ReactNode;
}

export interface DeficiencyFormData {
  description: string;
  severity: 'low' | 'medium' | 'high';
  location: string;
  dueDate?: string;
  inspectionId?: string;
}

export interface InspectionFormData {
  title: string;
  date: string;
  location: string;
  priority: 'low' | 'medium' | 'high';
  jobNumber: string;
}

export interface DocumentFormData {
  title: string;
  type: 'spec' | 'code' | 'requirement';
  content: string;
}