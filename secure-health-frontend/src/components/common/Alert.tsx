import React from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export type AlertVariant = 'success' | 'warning' | 'error' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const variantStyles = {
  success: {
    container: 'bg-green-50',
    icon: 'text-green-400',
    title: 'text-green-800',
    content: 'text-green-700',
    closeButton: 'bg-green-50 text-green-500 hover:bg-green-100',
    Icon: CheckCircleIcon,
  },
  warning: {
    container: 'bg-yellow-50',
    icon: 'text-yellow-400',
    title: 'text-yellow-800',
    content: 'text-yellow-700',
    closeButton: 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100',
    Icon: ExclamationTriangleIcon,
  },
  error: {
    container: 'bg-red-50',
    icon: 'text-red-400',
    title: 'text-red-800',
    content: 'text-red-700',
    closeButton: 'bg-red-50 text-red-500 hover:bg-red-100',
    Icon: XCircleIcon,
  },
  info: {
    container: 'bg-blue-50',
    icon: 'text-blue-400',
    title: 'text-blue-800',
    content: 'text-blue-700',
    closeButton: 'bg-blue-50 text-blue-500 hover:bg-blue-100',
    Icon: InformationCircleIcon,
  },
};

export default function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}: AlertProps) {
  const styles = variantStyles[variant];
  const Icon = styles.Icon;

  return (
    <div className={`rounded-md p-4 ${styles.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${styles.icon}`} aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${styles.title}`}>{title}</h3>
          )}
          <div className={`text-sm ${title ? 'mt-2' : ''} ${styles.content}`}>
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.closeButton}`}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
