/**
 * ESLint Configuration for React TypeScript Project
 * 
 * This configuration provides comprehensive linting rules for:
 * - Code quality and consistency
 * - React and React Hooks best practices
 * - TypeScript type safety
 * - Security and performance
 * - Accessibility standards
 * 
 * The configuration uses the new flat config format (ESLint 9+)
 * and includes detailed comments explaining each rule's purpose.
 */

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  // Ignore build outputs and dependencies
  { 
    ignores: [
      'dist',
      'node_modules',
      'coverage',
      '*.config.js',
      '*.config.ts',
      '.env*'
    ] 
  },
  
  // Base configuration for all files
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked
    ],
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'react': react,
      'import': importPlugin,
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect React version
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.app.json',
        },
      },
    },
    rules: {
      // ===== REACT HOOKS RULES =====
      // Enforce Rules of Hooks to prevent bugs
      ...reactHooks.configs.recommended.rules,
      
      // ===== REACT REFRESH RULES =====
      // Ensure components can be hot-reloaded during development
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // ===== REACT COMPONENT RULES =====
      // Enforce React best practices
      'react/jsx-uses-react': 'off', // Not needed with new JSX transform
      'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
      'react/jsx-uses-vars': 'error', // Prevent variables used in JSX from being marked as unused
      'react/jsx-no-undef': 'error', // Prevent usage of undefined components
      'react/jsx-key': 'error', // Require key prop for elements in arrays
      'react/no-array-index-key': 'warn', // Discourage array index as key
      'react/no-unused-prop-types': 'warn', // Prevent unused prop types
      'react/no-unused-state': 'warn', // Prevent unused state
      'react/prefer-const': 'error', // Prefer const for variables that are never reassigned
      
      // ===== TYPESCRIPT RULES =====
      // Enhanced type safety and code quality
      '@typescript-eslint/no-unused-vars': [
        'error',
        { 
          argsIgnorePattern: '^_', // Allow unused args starting with _
          varsIgnorePattern: '^_', // Allow unused vars starting with _
          ignoreRestSiblings: true // Ignore rest siblings in destructuring
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn', // Discourage 'any' type
      '@typescript-eslint/prefer-nullish-coalescing': 'error', // Use ?? instead of ||
      '@typescript-eslint/prefer-optional-chain': 'error', // Use optional chaining
      '@typescript-eslint/no-non-null-assertion': 'warn', // Discourage ! operator
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' } // Use 'import type' for type-only imports
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error', // Prevent side effects in type imports
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowString: false, // Don't allow strings in boolean context
          allowNumber: false, // Don't allow numbers in boolean context
          allowNullableObject: false, // Don't allow nullable objects
        }
      ],
      
      // ===== IMPORT/EXPORT RULES =====
      // Organize imports and prevent circular dependencies
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // Node.js built-in modules
            'external', // External packages
            'internal', // Internal modules
            'parent', // Parent directories
            'sibling', // Same directory
            'index' // Index files
          ],
          'newlines-between': 'never', // No newlines between import groups
          alphabetize: {
            order: 'asc', // Alphabetical order
            caseInsensitive: true
          }
        }
      ],
      'import/no-duplicates': 'error', // Prevent duplicate imports
      'import/no-cycle': 'error', // Prevent circular dependencies
      'import/no-self-import': 'error', // Prevent self imports
      'import/no-useless-path-segments': 'error', // Remove useless path segments
      
      // ===== CODE QUALITY RULES =====
      // General code quality and consistency
      'no-console': 'warn', // Warn about console statements (should use proper logging)
      'no-debugger': 'error', // Prevent debugger statements in production
      'no-alert': 'error', // Prevent alert/confirm/prompt
      'no-var': 'error', // Use let/const instead of var
      'prefer-const': 'error', // Prefer const for variables that are never reassigned
      'no-unused-expressions': 'error', // Prevent unused expressions
      'no-duplicate-imports': 'error', // Prevent duplicate imports
      'no-return-await': 'error', // Prevent unnecessary return await
      'require-await': 'error', // Require await in async functions
      
      // ===== SECURITY RULES =====
      // Prevent common security vulnerabilities
      'no-eval': 'error', // Prevent eval() usage
      'no-implied-eval': 'error', // Prevent implied eval
      'no-new-func': 'error', // Prevent Function constructor
      'no-script-url': 'error', // Prevent javascript: URLs
      
      // ===== PERFORMANCE RULES =====
      // Optimize performance
      'no-await-in-loop': 'warn', // Warn about await in loops
      'prefer-template': 'error', // Use template literals instead of concatenation
      
      // ===== ACCESSIBILITY RULES =====
      // Basic accessibility checks (consider adding eslint-plugin-jsx-a11y for more)
      'react/jsx-no-target-blank': [
        'error',
        { enforceDynamicLinks: 'always' } // Require rel="noopener noreferrer" for target="_blank"
      ],
      
      // ===== STYLE AND FORMATTING =====
      // Code style consistency (Prettier handles most formatting)
      'prefer-arrow-callback': 'error', // Prefer arrow functions for callbacks
      'arrow-body-style': ['error', 'as-needed'], // Use concise arrow function bodies
      'object-shorthand': 'error', // Use object shorthand syntax
      'quote-props': ['error', 'as-needed'], // Only quote object properties when needed
    },
  },
  
  // Specific rules for TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // Stricter TypeScript rules for .ts/.tsx files
      '@typescript-eslint/no-explicit-any': 'error', // Stricter any usage in TS files
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true, // Allow return type inference for expressions
          allowTypedFunctionExpressions: true, // Allow typed function expressions
          allowHigherOrderFunctions: true, // Allow HOF return type inference
        }
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'warn', // Require return types on module boundaries
      '@typescript-eslint/no-inferrable-types': 'off', // Allow explicit types even if inferrable
    },
  },
  
  // Specific rules for React component files
  {
    files: ['**/*.tsx'],
    rules: {
      // React component specific rules
      'react/prop-types': 'off', // Not needed with TypeScript
      'react/display-name': 'warn', // Require display name for components
      'react/jsx-boolean-value': ['error', 'never'], // Don't require explicit true for boolean props
      'react/jsx-curly-brace-presence': [
        'error',
        { props: 'never', children: 'never' } // Avoid unnecessary curly braces
      ],
      'react/jsx-fragments': ['error', 'syntax'], // Use <> instead of React.Fragment
      'react/jsx-no-useless-fragment': 'error', // Prevent useless fragments
      'react/self-closing-comp': 'error', // Require self-closing for components without children
    },
  },
  
  // Relaxed rules for configuration files
  {
    files: ['**/*.config.{js,ts}', '**/vite.config.ts', '**/tailwind.config.js'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in config files
      'no-console': 'off', // Allow console in config files
      '@typescript-eslint/explicit-function-return-type': 'off', // Don't require return types in config
    },
  },
  
  // Test files (if you add testing later)
  {
    files: ['**/*.{test,spec}.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in tests
      'no-console': 'off', // Allow console in tests
      '@typescript-eslint/explicit-function-return-type': 'off', // Don't require return types in tests
      'react/display-name': 'off', // Don't require display names in tests
    },
  }
);