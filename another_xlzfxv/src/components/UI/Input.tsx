import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="relative">
        <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          {label}
        </label>
        <input
          ref={ref} // Crucial for react-hook-form to register the input
          id={props.id || props.name}
          className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } ${className}`}
          {...props} // Passes name, onChange, onBlur, value, etc. from react-hook-form
        />
        {error && (
          <p className="mt-1 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input'; // Good practice for forwardRef components

export default Input;
