import React from 'react';
import type { ReactNode } from 'react';
import { BanIcon, CircleCheckIcon, CircleXIcon, InfoIcon, SparklesIcon, TriangleAlertIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

type AlertTone = 'warning' | 'error' | 'info' | 'success' | 'blocked' | 'ai';

interface AlertProps {
  tone: AlertTone;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}

const STYLES: Record<AlertTone, {box: string;icon: string;Icon: typeof InfoIcon;}> = {
  warning: { box: 'bg-warning-50 border-warning-200', icon: 'text-warning-700', Icon: TriangleAlertIcon },
  error: { box: 'bg-danger-50 border-danger-200', icon: 'text-danger-600', Icon: CircleXIcon },
  blocked: { box: 'bg-danger-50 border-danger-200', icon: 'text-danger-600', Icon: BanIcon },
  info: { box: 'bg-info-50 border-info-200', icon: 'text-info-600', Icon: InfoIcon },
  ai: { box: 'bg-info-50 border-info-200', icon: 'text-info-600', Icon: SparklesIcon },
  success: { box: 'bg-success-50 border-success-200', icon: 'text-success-600', Icon: CircleCheckIcon }
};

export function Alert({ tone, title, children, action, className }: AlertProps) {
  const s = STYLES[tone];
  return (
    <div
      role={tone === 'error' || tone === 'blocked' ? 'alert' : 'status'}
      className={twMerge('flex gap-3 rounded-lg border px-4 py-3', s.box, className)}>
      
      <s.Icon className={`mt-0.5 h-5 w-5 flex-none ${s.icon}`} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink-900">{title}</p>
        {children && <div className="mt-0.5 text-sm leading-5 text-ink-700">{children}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>);

}