import React from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';

interface PageHeaderProps {
  title: ReactNode;
  /** Small uppercase context line, e.g. the role that owns this queue. */
  eyebrow?: ReactNode;
  /** Badges / ids shown above the title (detail pages). */
  meta?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Key figure on the right, e.g. estimated total. */
  figure?: {label: string;value: string;};
  back?: {to: string;label: string;};
}

export function PageHeader({ title, eyebrow, meta, description, actions, figure, back }: PageHeaderProps) {
  return (
    <header className="mb-6">
      {back &&
      <Link to={back.to} className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-700 transition-colors duration-150 ease-exp hover:text-ink-900">
          <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden />
          {back.label}
        </Link>
      }
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="text-2xs font-semibold uppercase tracking-wider text-ink-500">{eyebrow}</p>}
          {meta && <div className="flex flex-wrap items-center gap-2">{meta}</div>}
          <h1 className={`${eyebrow || meta ? 'mt-1.5' : ''} text-2xl font-semibold tracking-tight text-ink-900`}>{title}</h1>
          {description && <div className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-700">{description}</div>}
        </div>
        {(actions || figure) &&
        <div className="flex flex-wrap items-end gap-4">
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            {figure &&
          <div className="text-right">
                <p className="text-2xs uppercase tracking-wider text-ink-500">{figure.label}</p>
                <p className="tabular mt-0.5 text-2xl font-semibold text-ink-900">{figure.value}</p>
              </div>
          }
          </div>
        }
      </div>
    </header>);

}