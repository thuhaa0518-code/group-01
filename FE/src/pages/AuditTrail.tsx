import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, HistoryIcon, SearchIcon } from 'lucide-react';
import type { AuditEntity, Role } from '../types/procurement';
import { useProcurement } from '../contexts/ProcurementContext';
import { ROLE_LABEL } from '../utils/permissions';
import { formatDateTime } from '../utils/format';
import { STATUS_META } from '../utils/workflow';
import { inputClass } from '../utils/styles';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Tag } from '../components/ui/Tag';

const ENTITIES: AuditEntity[] = ['PR', 'Quotation', 'PO', 'Supplier', 'User', 'Budget', 'Category', 'Auth'];
const PAGE = 25;

function statusLabel(s?: string) {
  return s ? (STATUS_META as Record<string, {label: string;}>)[s]?.label ?? s : '';
}

export function AuditTrailPage() {
  const { state } = useProcurement();
  const [query, setQuery] = useState('');
  const [entity, setEntity] = useState<AuditEntity | 'all'>('all');
  const [role, setRole] = useState<Role | 'all'>('all');
  const [limit, setLimit] = useState(PAGE);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...state.audit].
    filter((a) => entity === 'all' || a.entity === entity).
    filter((a) => role === 'all' || a.role === role).
    filter((a) => !q || [a.action, a.actorName, a.entityId, a.reason ?? '', a.details ?? ''].some((s) => s.toLowerCase().includes(q))).
    sort((a, b) => b.at.localeCompare(a.at));
  }, [state.audit, query, entity, role]);

  const linkFor = (e: AuditEntity, id: string) => {
    if (e === 'PR') return `/requests/${id}`;
    if (e === 'PO') return `/orders/${id}`;
    if (e === 'Quotation') {
      const prId = state.quotations.find((q) => q.id === id)?.prId;
      return prId ? `/requests/${prId}` : undefined;
    }
    return undefined;
  };

  return (
    <div>
      <PageHeader title="Audit Trail" description={`${state.audit.length} bản ghi · người thực hiện, thời điểm, thao tác, trạng thái trước/sau, lý do và thay đổi dữ liệu (REQ-NFR-03).`} />

      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <div className="relative md:w-80">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden />
          <label htmlFor="audit-q" className="sr-only">
            Tìm trong Audit Trail
          </label>
          <input id="audit-q" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Thao tác, người dùng, mã bản ghi, lý do" className={`${inputClass()} pl-9`} />
        </div>
        <label htmlFor="audit-entity" className="sr-only">
          Đối tượng
        </label>
        <select id="audit-entity" value={entity} onChange={(e) => setEntity(e.target.value as AuditEntity | 'all')} className={`${inputClass()} md:w-44`}>
          <option value="all">Mọi đối tượng</option>
          {ENTITIES.map((e) =>
          <option key={e} value={e}>
              {e}
            </option>
          )}
        </select>
        <label htmlFor="audit-role" className="sr-only">
          Vai trò
        </label>
        <select id="audit-role" value={role} onChange={(e) => setRole(e.target.value as Role | 'all')} className={`${inputClass()} md:w-44`}>
          <option value="all">Mọi vai trò</option>
          {(Object.keys(ROLE_LABEL) as Role[]).map((r) =>
          <option key={r} value={r}>
              {ROLE_LABEL[r]}
            </option>
          )}
        </select>
      </div>

      {list.length === 0 ?
      <div className="rounded-lg border border-hairline">
          <EmptyState icon={HistoryIcon} title="Không có bản ghi phù hợp" />
        </div> :

      <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-xs text-ink-500">
                  <th className="py-3 pr-4 font-medium">Thời điểm</th>
                  <th className="px-4 py-3 font-medium">Người thực hiện</th>
                  <th className="px-4 py-3 font-medium">Thao tác</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="py-3 pl-4 font-medium">Lý do / chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline align-top">
                {list.slice(0, limit).map((a) => {
                const to = linkFor(a.entity, a.entityId);
                return (
                  <tr key={a.id}>
                      <td className="whitespace-nowrap py-3 pr-4 tabular-nums text-ink-700">{formatDateTime(a.at)}</td>
                      <td className="px-4 py-3">
                        <p className="text-ink-900">{a.actorName}</p>
                        <p className="text-xs text-ink-500">{ROLE_LABEL[a.role]}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink-900">{a.action}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs">
                          <Tag className="h-5 px-1.5 text-[11px]">{a.entity}</Tag>
                          {to ?
                        <Link to={to} className="font-mono text-primary-600 hover:underline">
                              {a.entityId}
                            </Link> :

                        <span className="font-mono text-ink-500">{a.entityId}</span>
                        }
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-700">
                        {(a.fromStatus || a.toStatus) &&
                      <span className="inline-flex flex-wrap items-center gap-1">
                            {statusLabel(a.fromStatus)}
                            {a.fromStatus && a.toStatus && <ArrowRightIcon className="h-3 w-3 text-ink-500" aria-hidden />}
                            <span className="font-medium">{statusLabel(a.toStatus)}</span>
                          </span>
                      }
                      </td>
                      <td className="max-w-[320px] py-3 pl-4">
                        {a.reason && <p className="text-ink-900">“{a.reason}”</p>}
                        {a.details && <p className="text-xs text-ink-500">{a.details}</p>}
                      </td>
                    </tr>);

              })}
              </tbody>
            </table>
          </div>
          {list.length > limit &&
        <div className="mt-4 text-center">
              <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="text-sm font-semibold text-primary-600 hover:underline">
                Xem thêm ({list.length - limit} bản ghi)
              </button>
            </div>
        }
        </>
      }
    </div>);

}