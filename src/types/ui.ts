/**
 * UI-related TypeScript interfaces and types
 * 
 * This file contains type definitions for UI components, form states,
 * navigation, and other interface-related structures.
 * 
 * Usage:
 * - Import these types in UI components for props typing
 * - Use for form validation and state management
 * - Reference when building reusable component libraries
 */

export interface NavigationItem {
  id: string;
  label: string;
  icon: any; // Lucide React icon component
  path?: string;
  badge?: string | number;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
}

export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface SortConfig<T = any> {
  field: keyof T;
  direction: 'asc' | 'desc';
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}