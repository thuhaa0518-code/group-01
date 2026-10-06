import React from 'react';
import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, htmlFor, required, error, hint, children, className }: FormFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
        {required && <span className="text-danger-600"> *</span>}
      </label>
      {children}
      {error ?
      <p id={`${htmlFor}-error`} className="mt-1.5 text-xs text-danger-600">
          {error}
        </p> :
      hint ?
      <p className="mt-1.5 text-xs text-ink-500">{hint}</p> :
      null}
    </div>);

}