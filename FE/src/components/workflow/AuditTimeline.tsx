import React from 'react';
import type { AuditEntry, Role } from '../../types/procurement';
import { ROLE_LABEL } from '../../utils/permissions';
import { formatDateTime } from '../../utils/format';
import { STATUS_META } from '../../utils/workflow';

const ROLE_DOT: Record<Role, string> = {
  employee: 'bg-info-600',
  manager: 'bg-primary-600',
  finance: 'bg-warning-600',
  procurement: 'bg-success-600',
  admin: 'bg-ink-500'
};

function statusLabel(s?: string) {
  if (!s) return '';
  return (STATUS_META as Record<string, {label: string;}>)[s]?.label ?? s;
}

export function AuditTimeline({ entries, showEntity = false }: {entries: AuditEntry[];showEntity?: boolean;}) {
  if (!entries.length) return <p className="text-sm text-ink-700">Chưa có thao tác nào.</p>;
  const sorted = [...entries].sort((a, b) => b.at.localeCompare(a.at));
  return (
    <ol className="relative space-y-4 pl-5">
      <span aria-hidden className="absolute bottom-1.5 left-[3px] top-1.5 w-px bg-line" />
      {sorted.map((e) =>
      <li key={e.id} className="relative">
          <span aria-hidden className={`absolute -left-5 top-1.5 h-[7px] w-[7px] rounded-full ring-2 ring-surface ${ROLE_DOT[e.role]}`} />
          <p className="text-sm font-medium leading-snug text-ink-900">
            {e.action}
            {showEntity && <span className="tabular ml-1.5 text-2xs font-normal text-ink-500">{e.entityId}</span>}
          </p>
          <p className="mt-0.5 text-xs text-ink-500">
            {ROLE_LABEL[e.role]} · {e.actorName} · <time dateTime={e.at}>{formatDateTime(e.at)}</time>
          </p>
          {(e.fromStatus || e.toStatus) &&
        <p className="mt-1 text-xs text-ink-700">
              {statusLabel(e.fromStatus)}
              {e.fromStatus && e.toStatus ? ' → ' : ''}
              <span className="font-medium">{statusLabel(e.toStatus)}</span>
            </p>
        }
          {e.reason && <p className="mt-1 text-xs leading-relaxed text-ink-900">“{e.reason}”</p>}
          {e.details && <p className="mt-0.5 text-xs leading-relaxed text-ink-700">{e.details}</p>}
        </li>
      )}
    </ol>);

}