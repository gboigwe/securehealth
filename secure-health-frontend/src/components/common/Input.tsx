import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helper,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={`
              ${leftIcon ? 'pl-10' : 'pl-4'}
              ${rightIcon || error ? 'pr-10' : 'pr-4'}
              block rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm
              ${error ? 'border-red-300 text-red-900 placeholder-red-300' : ''}
              ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
              ${fullWidth ? 'w-full' : ''}
              ${className || ''}
            `}
            disabled={disabled}
            ref={ref}
            {...props}
          />
          {(rightIcon || error) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {error ? (
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>
        {(helper || error) && (
          <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {error || helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
