import React from 'react';
import { useNavigate } from 'react-router-dom';
import { InboxIcon, TriangleAlertIcon, InfoIcon } from 'lucide-react';
import type { PurchaseRequest } from '../../types/procurement';
import { useProcurement } from '../../contexts/ProcurementContext';
import { prFlags, prTotal } from '../../utils/rules';
import { workflowStates } from '../../utils/workflow';
import { formatDate, formatVND } from '../../utils/format';
import { StatusBadge } from '../ui/StatusBadge';
import { Tag } from '../ui/Tag';
import { EmptyState } from '../ui/EmptyState';
import { WorkflowMini } from '../workflow/WorkflowMini';

interface RequestTableProps {
  requests: PurchaseRequest[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  linkTo?: (pr: PurchaseRequest) => string;
}

export function RequestTable({ requests, loading, emptyTitle = 'Không có Purchase Request', emptyDescription, linkTo }: RequestTableProps) {
  const { state } = useProcurement();
  const navigate = useNavigate();
  const go = (pr: PurchaseRequest) => navigate(linkTo ? linkTo(pr) : `/requests/${pr.id}`);

  if (loading) {
    return (
      <div className="divide-y divide-hairline border-y border-hairline" aria-busy="true" aria-label="Đang tải danh sách">
        {[0, 1, 2, 3].map((i) =>
        <div key={i} className="flex animate-pulse items-center gap-4 py-4">
            <div className="h-3 w-24 rounded bg-hairline" />
            <div className="h-3 flex-1 rounded bg-hairline" />
            <div className="h-3 w-20 rounded bg-hairline" />
          </div>
        )}
      </div>);

  }

  if (!requests.length) {
    return (
      <div className="rounded-lg border border-hairline">
        <EmptyState icon={InboxIcon} title={emptyTitle} description={emptyDescription} />
      </div>);

  }

  const rows = requests.map((pr) => {
    const budget = state.budgets.find((b) => b.code === pr.budgetCode);
    const confirmed = state.quotations.filter((q) => q.prId === pr.id && q.status === 'confirmed').length;
    return {
      pr,
      requester: state.users.find((u) => u.id === pr.requesterId)?.name ?? '—',
      flags: prFlags(pr, budget),
      steps: workflowStates(pr.status, confirmed),
      total: prTotal(pr)
    };
  });

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs font-medium text-ink-500">
              <th className="py-3 pr-4 font-medium">Purchase Request</th>
              <th className="px-4 py-3 font-medium">Người tạo</th>
              <th className="px-4 py-3 text-right font-medium">Giá trị</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Tiến độ</th>
              <th className="py-3 pl-4 font-medium">Cập nhật</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {rows.map(({ pr, requester, flags, steps, total }) =>
            <tr key={pr.id} onClick={() => go(pr)} className="cursor-pointer transition-colors duration-150 hover:bg-canvas">
                <td className="max-w-[340px] py-3.5 pr-4">
                  <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(pr);
                  }}
                  className="block max-w-full text-left">
                  
                    <span className="font-mono text-xs text-ink-500">{pr.id}</span>
                    <span className="block truncate font-medium text-ink-900">{pr.title}</span>
                  </button>
                  {flags.length > 0 &&
                <div className="mt-1 flex flex-wrap gap-1">
                      {flags.map((f) =>
                  <Tag key={f.label} tone={f.tone} icon={f.tone === 'warning' ? <TriangleAlertIcon className="h-3 w-3" aria-hidden /> : <InfoIcon className="h-3 w-3" aria-hidden />}>
                          {f.label}
                        </Tag>
                  )}
                    </div>
                }
                </td>
                <td className="px-4 py-3.5">
                  <span className="block text-ink-900">{requester}</span>
                  <span className="text-xs text-ink-500">{pr.department}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-right font-medium tabular-nums text-ink-900">{formatVND(total)}</td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={pr.status} />
                </td>
                <td className="px-4 py-3.5">
                  <WorkflowMini states={steps} />
                </td>
                <td className="whitespace-nowrap py-3.5 pl-4 text-ink-500">{formatDate(pr.updatedAt)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-hairline border-y border-hairline md:hidden">
        {rows.map(({ pr, requester, flags, steps, total }) =>
        <li key={pr.id}>
            <button type="button" onClick={() => go(pr)} className="w-full py-4 text-left">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-ink-500">{pr.id}</span>
                <StatusBadge status={pr.status} />
              </div>
              <p className="mt-1 font-medium text-ink-900">{pr.title}</p>
              <p className="mt-0.5 text-xs text-ink-500">
                {requester} · {formatDate(pr.updatedAt)}
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold tabular-nums">{formatVND(total)}</span>
                <WorkflowMini states={steps} />
              </div>
              {flags.length > 0 &&
            <div className="mt-2 flex flex-wrap gap-1">
                  {flags.map((f) =>
              <Tag key={f.label} tone={f.tone} icon={<TriangleAlertIcon className="h-3 w-3" aria-hidden />}>
                      {f.label}
                    </Tag>
              )}
                </div>
            }
            </button>
          </li>
        )}
      </ul>
    </>);

}