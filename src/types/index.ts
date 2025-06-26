/**
 * Main types export file
 * 
 * This file serves as the central export point for all TypeScript types
 * used throughout the application. It provides a clean import interface
 * for components that need multiple type definitions.
 * 
 * Usage:
 * - Import types from this file: import { User, Client } from '@/types'
 * - Add new type exports here when creating new type definition files
 * - Keep this file organized by grouping related exports
 */

// Authentication types
export type {
  User,
  AuthState,
  LoginCredentials,
  SignupCredentials,
  AuthContextType
} from './auth';

// Business domain types
export type {
  Client,
  Transaction,
  DashboardStats,
  FinancialMetrics
} from './business';

// UI and component types
export type {
  NavigationItem,
  FormField,
  TableColumn,
  FilterOption,
  SortConfig,
  NotificationType,
  Notification
} from './ui';