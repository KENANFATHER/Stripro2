/**
 * API Service Types and Interfaces
 * 
 * This file defines all the TypeScript interfaces and types used across
 * the service layer for both REST and GraphQL API integrations.
 * 
 * Usage:
 * - Import these types in service files for type safety
 * - Extend interfaces when adding new API endpoints
 * - Use generic types for reusable API patterns
 */

// ===== CORE API TYPES =====

/**
 * Generic API Response wrapper
 * Used for consistent response structure across all endpoints
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

/**
 * API Error structure
 * Standardized error format for better error handling
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  path?: string;
}

/**
 * Pagination parameters for list endpoints
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Sorting parameters for list endpoints
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filtering parameters for list endpoints
 */
export interface FilterParams {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: any;
}

/**
 * Combined query parameters for list endpoints
 */
export interface QueryParams extends PaginationParams, SortParams, FilterParams {}

// ===== USER INTERFACES =====

/**
 * Core User interface
 * Represents a user in the system with authentication and profile data
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  stripeConnected: boolean;
  stripeAccountId?: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

/**
 * User preferences and settings
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  dashboard: DashboardSettings;
}

/**
 * Notification settings for users
 */
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  weeklyReports: boolean;
  monthlyDigest: boolean;
  transactionAlerts: boolean;
  lowProfitWarnings: boolean;
}

/**
 * Dashboard customization settings
 */
export interface DashboardSettings {
  defaultView: 'overview' | 'clients' | 'transactions';
  chartsEnabled: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  favoriteMetrics: string[];
}

/**
 * User creation/update payload
 */
export interface CreateUserPayload {
  email: string;
  name: string;
  password: string;
  role?: User['role'];
  preferences?: Partial<UserPreferences>;
}

export interface UpdateUserPayload {
  name?: string;
  avatar?: string;
  role?: User['role'];
  status?: User['status'];
  preferences?: Partial<UserPreferences>;
}

// ===== CLIENT INTERFACES =====

/**
 * Core Client interface
 * Represents a business client with financial metrics
 */
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  
  // Financial metrics
  totalRevenue: number;
  stripeFees: number;
  netProfit: number;
  profitMargin: number;
  averageTransactionValue: number;
  
  // Transaction statistics
  transactionCount: number;
  lastTransactionDate?: string;
  firstTransactionDate?: string;
  
  // Status and metadata
  status: 'active' | 'inactive' | 'suspended';
  tags: string[];
  notes?: string;
  
  // Stripe integration
  stripeCustomerId?: string;
  stripeMetadata?: Record<string, string>;
  
  // Address information
  address?: ClientAddress;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
}

/**
 * Client address information
 */
export interface ClientAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/**
 * Client analytics and insights
 */
export interface ClientAnalytics {
  clientId: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  
  // Revenue trends
  revenueGrowth: number; // percentage
  revenueByMonth: MonthlyMetric[];
  
  // Transaction patterns
  transactionFrequency: number; // transactions per month
  seasonalTrends: SeasonalTrend[];
  
  // Profitability analysis
  profitabilityScore: number; // 0-100
  costEfficiency: number;
  
  // Predictions
  predictedRevenue: number;
  churnRisk: 'low' | 'medium' | 'high';
  
  // Benchmarks
  industryComparison: IndustryBenchmark;
}

/**
 * Monthly metrics for trend analysis
 */
export interface MonthlyMetric {
  month: string; // YYYY-MM format
  value: number;
  change: number; // percentage change from previous month
}

/**
 * Seasonal trend data
 */
export interface SeasonalTrend {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  averageRevenue: number;
  transactionCount: number;
  profitMargin: number;
}

/**
 * Industry benchmark comparison
 */
export interface IndustryBenchmark {
  industry: string;
  averageRevenue: number;
  averageProfitMargin: number;
  percentileRank: number; // 0-100
}

/**
 * Client creation/update payloads
 */
export interface CreateClientPayload {
  name: string;
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  companySize?: Client['companySize'];
  address?: ClientAddress;
  tags?: string[];
  notes?: string;
  stripeCustomerId?: string;
}

export interface UpdateClientPayload {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  companySize?: Client['companySize'];
  status?: Client['status'];
  address?: Partial<ClientAddress>;
  tags?: string[];
  notes?: string;
}

// ===== TRANSACTION INTERFACES =====

/**
 * Core Transaction interface
 * Represents a financial transaction with detailed metadata
 */
export interface Transaction {
  id: string;
  
  // Client relationship
  clientId: string;
  clientName: string;
  clientEmail: string;
  
  // Financial details
  amount: number;
  currency: string;
  stripeFee: number;
  netAmount: number;
  
  // Transaction metadata
  description: string;
  reference?: string;
  invoiceNumber?: string;
  
  // Stripe integration
  stripeTransactionId: string;
  stripeChargeId?: string;
  stripePaymentIntentId?: string;
  stripePaymentMethodId?: string;
  
  // Status and processing
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  processingStatus: 'initiated' | 'authorized' | 'captured' | 'settled';
  
  // Payment method details
  paymentMethod: PaymentMethod;
  
  // Risk and fraud
  riskScore?: number; // 0-100
  fraudFlags?: string[];
  
  // Dates and timing
  transactionDate: string;
  processedAt?: string;
  settledAt?: string;
  
  // Metadata and tags
  tags: string[];
  metadata: Record<string, any>;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Payment method information
 */
export interface PaymentMethod {
  type: 'card' | 'bank_transfer' | 'digital_wallet' | 'crypto' | 'other';
  brand?: string; // visa, mastercard, etc.
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  country?: string;
  fingerprint?: string;
}

/**
 * Transaction analytics and aggregations
 */
export interface TransactionAnalytics {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  
  // Volume metrics
  totalTransactions: number;
  totalAmount: number;
  totalFees: number;
  netRevenue: number;
  
  // Average metrics
  averageTransactionValue: number;
  averageFeePercentage: number;
  
  // Growth metrics
  transactionGrowth: number; // percentage
  revenueGrowth: number; // percentage
  
  // Distribution
  transactionsByStatus: StatusDistribution[];
  transactionsByPaymentMethod: PaymentMethodDistribution[];
  transactionsByCountry: CountryDistribution[];
  
  // Time series data
  dailyVolume: DailyMetric[];
  hourlyDistribution: HourlyMetric[];
  
  // Top performers
  topClients: TopClientMetric[];
  largestTransactions: Transaction[];
}

/**
 * Distribution interfaces for analytics
 */
export interface StatusDistribution {
  status: Transaction['status'];
  count: number;
  percentage: number;
  totalAmount: number;
}

export interface PaymentMethodDistribution {
  type: PaymentMethod['type'];
  count: number;
  percentage: number;
  totalAmount: number;
  averageAmount: number;
}

export interface CountryDistribution {
  country: string;
  count: number;
  percentage: number;
  totalAmount: number;
}

export interface DailyMetric {
  date: string; // YYYY-MM-DD format
  transactionCount: number;
  totalAmount: number;
  averageAmount: number;
}

export interface HourlyMetric {
  hour: number; // 0-23
  transactionCount: number;
  totalAmount: number;
}

export interface TopClientMetric {
  clientId: string;
  clientName: string;
  transactionCount: number;
  totalAmount: number;
  averageAmount: number;
}

/**
 * Transaction creation/update payloads
 */
export interface CreateTransactionPayload {
  clientId: string;
  amount: number;
  currency?: string;
  description: string;
  reference?: string;
  invoiceNumber?: string;
  paymentMethodId?: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface UpdateTransactionPayload {
  description?: string;
  reference?: string;
  invoiceNumber?: string;
  status?: Transaction['status'];
  metadata?: Record<string, any>;
  tags?: string[];
}

// ===== DASHBOARD AND REPORTING INTERFACES =====

/**
 * Dashboard overview statistics
 */
export interface DashboardStats {
  // Revenue metrics
  totalRevenue: number;
  totalFees: number;
  netProfit: number;
  profitMargin: number;
  
  // Growth metrics
  revenueGrowth: number; // percentage
  clientGrowth: number; // percentage
  transactionGrowth: number; // percentage
  
  // Client metrics
  totalClients: number;
  activeClients: number;
  newClients: number;
  
  // Transaction metrics
  totalTransactions: number;
  averageTransactionValue: number;
  transactionVolume: number;
  
  // Time period
  period: string;
  lastUpdated: string;
}

/**
 * Report generation parameters
 */
export interface ReportParams {
  type: 'revenue' | 'clients' | 'transactions' | 'profitability' | 'custom';
  period: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
  clientIds?: string[];
  includeCharts: boolean;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  email?: string; // Send report to email
}

/**
 * Generated report metadata
 */
export interface Report {
  id: string;
  type: ReportParams['type'];
  period: ReportParams['period'];
  startDate: string;
  endDate: string;
  status: 'generating' | 'completed' | 'failed';
  downloadUrl?: string;
  fileSize?: number;
  createdAt: string;
  expiresAt: string;
}

// ===== WEBHOOK AND INTEGRATION INTERFACES =====

/**
 * Webhook event structure
 */
export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, any>;
  source: 'stripe' | 'internal' | 'external';
  timestamp: string;
  processed: boolean;
  retryCount: number;
  lastError?: string;
}

/**
 * Integration configuration
 */
export interface Integration {
  id: string;
  name: string;
  type: 'stripe' | 'quickbooks' | 'salesforce' | 'custom';
  status: 'active' | 'inactive' | 'error';
  config: Record<string, any>;
  lastSync?: string;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  createdAt: string;
  updatedAt: string;
}

// ===== GRAPHQL SPECIFIC TYPES =====

/**
 * GraphQL query variables
 */
export interface GraphQLVariables {
  [key: string]: any;
}

/**
 * GraphQL response structure
 */
export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
    extensions?: Record<string, any>;
  }>;
}

/**
 * GraphQL subscription event
 */
export interface GraphQLSubscription<T> {
  data: T;
  type: 'data' | 'error' | 'complete';
  timestamp: string;
}

// ===== UTILITY TYPES =====

/**
 * Generic list response with pagination
 */
export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult<T> {
  successful: T[];
  failed: Array<{
    item: Partial<T>;
    error: string;
  }>;
  total: number;
  successCount: number;
  failureCount: number;
}

/**
 * File upload result
 */
export interface FileUploadResult {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

/**
 * Search result with highlighting
 */
export interface SearchResult<T> {
  item: T;
  score: number;
  highlights: Record<string, string[]>;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  ttl: number; // Time to live in seconds
  key: string;
  tags: string[];
  invalidateOn: string[];
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}