import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export function Button({ isLoading, children, disabled, className = '', ...rest }: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...rest}
    >
      {isLoading ? 'Please wait...' : children}
    </button>
  );
}
