import React from 'react';
import type { ReactNode } from 'react';
import { SparklesIcon } from 'lucide-react';

interface AssistantCardProps {
  title: string;
  subtitle?: string;
  status?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

/** Container for every AI output — always labelled advisory, never a decision. */
export function AssistantCard({ title, subtitle, status, children, footer }: AssistantCardProps) {
  return (
    <section aria-label={title} className="rounded-lg border border-primary-200 bg-primary-50/50 shadow-card">
      <header className="flex items-start gap-2.5 border-b border-primary-200 px-4 py-3">
        <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded bg-primary-600 text-white">
          <SparklesIcon className="h-3.5 w-3.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-primary-700">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-ink-700">{subtitle}</p>}
        </div>
        <div className="flex flex-none flex-wrap items-center justify-end gap-1.5">
          {status}
          <span className="rounded border border-primary-200 bg-surface px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-wide text-primary-700">Advisory</span>
        </div>
      </header>
      <div className="px-4 py-3">{children}</div>
      {footer && <div className="border-t border-primary-200 px-4 py-2.5 text-xs text-ink-700">{footer}</div>}
    </section>);

}