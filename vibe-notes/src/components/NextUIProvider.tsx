'use client';

import React from 'react';

// Mock NextUI provider for now since we can't install the package
interface NextUIProviderProps {
  children: React.ReactNode;
}

export function NextUIProvider({ children }: NextUIProviderProps) {
  return (
    <div className="nextui-provider">
      {children}
    </div>
  );
}

// Mock NextUI components with custom styling
export function Button({ 
  children, 
  className = '', 
  variant = 'solid',
  color = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  onClick,
  type = 'button',
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  type?: 'button' | 'submit' | 'reset';
  [key: string]: any;
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-8',
    md: 'px-4 py-2 text-sm min-h-10',
    lg: 'px-6 py-3 text-base min-h-12'
  };

  const colorClasses = {
    default: {
      solid: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
      bordered: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
      light: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    },
    primary: {
      solid: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      bordered: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
      light: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    },
    secondary: {
      solid: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
      bordered: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50 focus:ring-purple-500',
      light: 'text-purple-600 hover:bg-purple-50 focus:ring-purple-500',
    },
    success: {
      solid: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      bordered: 'border-2 border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500',
      light: 'text-green-600 hover:bg-green-50 focus:ring-green-500',
    },
    warning: {
      solid: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
      bordered: 'border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500',
      light: 'text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500',
    },
    danger: {
      solid: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      bordered: 'border-2 border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500',
      light: 'text-red-600 hover:bg-red-50 focus:ring-red-500',
    },
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed';
  const loadingClasses = 'cursor-wait';

  const classes = [
    baseClasses,
    sizeClasses[size],
    colorClasses[color][variant],
    isDisabled ? disabledClasses : '',
    isLoading ? loadingClasses : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}

export function Input({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  isInvalid = false,
  errorMessage,
  className = '',
  size = 'md',
  variant = 'bordered',
  ...props
}: {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  isInvalid?: boolean;
  errorMessage?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'flat' | 'bordered' | 'faded' | 'underlined';
  [key: string]: any;
}) {
  const sizeClasses = {
    sm: 'h-8 text-sm px-3',
    md: 'h-10 text-sm px-3',
    lg: 'h-12 text-base px-4'
  };

  const variantClasses = {
    flat: 'bg-gray-100 border-2 border-transparent focus:bg-white focus:border-blue-500',
    bordered: 'bg-white border-2 border-gray-300 focus:border-blue-500',
    faded: 'bg-gray-50 border-2 border-gray-200 focus:bg-white focus:border-blue-500',
    underlined: 'bg-transparent border-0 border-b-2 border-gray-300 focus:border-blue-500 rounded-none'
  };

  const baseClasses = 'w-full outline-none transition-all duration-200 rounded-lg';
  const invalidClasses = isInvalid ? 'border-red-500 focus:border-red-500' : '';

  const classes = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    invalidClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="flex flex-col space-y-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={classes}
        {...props}
      />
      {isInvalid && errorMessage && (
        <span className="text-sm text-red-600">{errorMessage}</span>
      )}
    </div>
  );
}

export function Textarea({
  label,
  placeholder,
  value,
  onChange,
  isInvalid = false,
  errorMessage,
  className = '',
  size = 'md',
  variant = 'bordered',
  rows = 4,
  ...props
}: {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isInvalid?: boolean;
  errorMessage?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'flat' | 'bordered' | 'faded' | 'underlined';
  rows?: number;
  [key: string]: any;
}) {
  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3'
  };

  const variantClasses = {
    flat: 'bg-gray-100 border-2 border-transparent focus:bg-white focus:border-blue-500',
    bordered: 'bg-white border-2 border-gray-300 focus:border-blue-500',
    faded: 'bg-gray-50 border-2 border-gray-200 focus:bg-white focus:border-blue-500',
    underlined: 'bg-transparent border-0 border-b-2 border-gray-300 focus:border-blue-500 rounded-none'
  };

  const baseClasses = 'w-full outline-none transition-all duration-200 rounded-lg resize-vertical';
  const invalidClasses = isInvalid ? 'border-red-500 focus:border-red-500' : '';

  const classes = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    invalidClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="flex flex-col space-y-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        className={classes}
        {...props}
      />
      {isInvalid && errorMessage && (
        <span className="text-sm text-red-600">{errorMessage}</span>
      )}
    </div>
  );
}

export function Card({ 
  children, 
  className = '',
  isHoverable = false,
  isPressable = false,
  shadow = 'md',
  variant = 'elevated',
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  isHoverable?: boolean;
  isPressable?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'elevated' | 'bordered' | 'flat';
  [key: string]: any;
}) {
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  const variantClasses = {
    elevated: 'bg-white border border-gray-200',
    bordered: 'bg-white border-2 border-gray-300',
    flat: 'bg-gray-50 border border-gray-100'
  };

  const baseClasses = 'rounded-lg transition-all duration-200';
  const hoverClasses = isHoverable ? 'hover:shadow-lg hover:-translate-y-1' : '';
  const pressClasses = isPressable ? 'cursor-pointer active:scale-95' : '';

  const classes = [
    baseClasses,
    variantClasses[variant],
    shadowClasses[shadow],
    hoverClasses,
    pressClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ 
  children, 
  className = '',
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ 
  children, 
  className = '',
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  return (
    <div className={`px-4 pt-4 pb-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ 
  children, 
  className = '',
  ...props 
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  return (
    <div className={`px-4 pt-2 pb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Chip({
  children,
  color = 'default',
  variant = 'solid',
  size = 'md',
  className = '',
  ...props
}: {
  children: React.ReactNode;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  [key: string]: any;
}) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const colorClasses = {
    default: {
      solid: 'bg-gray-100 text-gray-800',
      light: 'bg-gray-50 text-gray-600',
      bordered: 'border-2 border-gray-300 text-gray-700 bg-transparent',
    },
    primary: {
      solid: 'bg-blue-100 text-blue-800',
      light: 'bg-blue-50 text-blue-600',
      bordered: 'border-2 border-blue-300 text-blue-700 bg-transparent',
    },
    success: {
      solid: 'bg-green-100 text-green-800',
      light: 'bg-green-50 text-green-600',
      bordered: 'border-2 border-green-300 text-green-700 bg-transparent',
    },
    warning: {
      solid: 'bg-yellow-100 text-yellow-800',
      light: 'bg-yellow-50 text-yellow-600',
      bordered: 'border-2 border-yellow-300 text-yellow-700 bg-transparent',
    },
    danger: {
      solid: 'bg-red-100 text-red-800',
      light: 'bg-red-50 text-red-600',
      bordered: 'border-2 border-red-300 text-red-700 bg-transparent',
    },
    secondary: {
      solid: 'bg-purple-100 text-purple-800',
      light: 'bg-purple-50 text-purple-600',
      bordered: 'border-2 border-purple-300 text-purple-700 bg-transparent',
    },
  };

  const baseClasses = 'inline-flex items-center font-medium rounded-full';

  const classes = [
    baseClasses,
    sizeClasses[size],
    colorClasses[color][variant],
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}