/**
 * Local Storage Custom Hook
 * 
 * This hook provides a simple interface for storing and retrieving data
 * from localStorage with automatic JSON serialization/deserialization
 * and TypeScript type safety.
 * 
 * Features:
 * - Automatic JSON parsing and stringification
 * - TypeScript generic support for type safety
 * - Error handling for localStorage access
 * - SSR-safe (returns initial value on server)
 * 
 * Usage:
 * const [value, setValue] = useLocalStorage<string>('key', 'defaultValue');
 * const [user, setUser] = useLocalStorage<User>('user', null);
 * 
 * @param key - The localStorage key
 * @param initialValue - Default value if key doesn't exist
 * @returns [value, setValue] tuple similar to useState
 */

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}