/**
 * Debounce Custom Hook
 * 
 * This hook debounces a value, delaying updates until after a specified
 * delay period has passed without the value changing. Useful for search
 * inputs, API calls, and performance optimization.
 * 
 * Features:
 * - Configurable delay period
 * - Automatic cleanup on unmount
 * - TypeScript generic support
 * - Memory efficient with proper cleanup
 * 
 * Usage:
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     // Perform search API call
 *   }
 * }, [debouncedSearchTerm]);
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns The debounced value
 */

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes before the delay
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}