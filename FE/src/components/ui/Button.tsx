import React, { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { LoaderCircleIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'warning' | 'success' | 'link';
export type ButtonSize = 'md' | 'sm';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
}

const BASE =
'inline-flex items-center justify-center gap-1.5 rounded-md font-semibold whitespace-nowrap select-none transition-[color,background-color,border-color,transform] duration-150 ease-exp active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700',
  secondary: 'border border-line bg-surface text-ink-700 hover:bg-canvas hover:text-ink-900',
  tertiary: 'bg-transparent text-ink-700 hover:bg-canvas hover:text-ink-900',
  danger: 'border border-danger-200 bg-surface text-danger-700 hover:bg-danger-50',
  warning: 'border border-warning-200 bg-warning-50 text-warning-700 hover:border-warning-600',
  success: 'bg-success-600 text-white hover:bg-success-700',
  link: 'bg-transparent text-primary-600 hover:text-primary-700 hover:underline active:scale-100'
};

const SIZES: Record<ButtonSize, string> = { md: 'h-9 px-3 text-sm', sm: 'h-7 px-2.5 text-xs' };

export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string): string {
  return twMerge(BASE, VARIANTS[variant], variant === 'link' ? `h-auto px-0 ${size === 'sm' ? 'text-xs' : 'text-sm'}` : SIZES[size], className);
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
{ variant = 'primary', size = 'md', loading = false, icon, className, children, disabled, type = 'button', ...rest },
ref)
{
  return (
    <button ref={ref} type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={buttonClass(variant, size, className)} {...rest}>
      {loading ? <LoaderCircleIcon className="h-4 w-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>);

});