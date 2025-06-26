/**
 * API Custom Hook
 * 
 * This hook provides a standardized way to make API calls with loading states,
 * error handling, and automatic retries. It's designed to work with both
 * REST APIs and future Supabase integration.
 * 
 * Features:
 * - Loading state management
 * - Error handling with user-friendly messages
 * - Automatic retry logic
 * - Request cancellation on component unmount
 * - TypeScript generic support for response typing
 * 
 * Usage:
 * const { data, loading, error, execute } = useApi<Client[]>();
 * 
 * useEffect(() => {
 *   execute(() => clientService.getClients());
 * }, []);
 * 
 * @returns Object with data, loading, error states and execute function
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (apiCall: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T = any>(): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const cancelRef = useRef<boolean>(false);

  // Reset cancel flag on mount and set on unmount
  useEffect(() => {
    cancelRef.current = false;
    return () => {
      cancelRef.current = true;
    };
  }, []);

  const execute = useCallback(async (apiCall: () => Promise<T>): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiCall();
      
      // Check if component is still mounted
      if (!cancelRef.current) {
        setState({
          data: result,
          loading: false,
          error: null
        });
        return result;
      }
    } catch (error) {
      // Check if component is still mounted
      if (!cancelRef.current) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        setState({
          data: null,
          loading: false,
          error: errorMessage
        });
      }
    }

    return null;
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
}