import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, BanIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon } from 'lucide-react';
import { useCurrentUser } from '../contexts/AuthContext';
import { useProcurement } from '../contexts/ProcurementContext';
import { managerGuard } from '../utils/rules';
import { formatDateTime, formatVND } from '../utils/format';
import { PageHeader } from '../components/ui/PageHeader';
import { Tag } from '../components/ui/Tag';
import { EmptyState } from '../components/ui/EmptyState';
import { BudgetPanel } from '../components/budget/BudgetPanel';
import { AuditTimeline } from '../components/workflow/AuditTimeline';

export function ApprovalsPage() {
  const user = useCurrentUser();
  const { state } = useProcurement();
  const [tab, setTab] = useState<'pending' | 'done'>('pending');

  const pending = useMemo(
    () => state.requests.filter((r) => r.status === 'pending_manager' && r.department === user.department).sort((a, b) => a.updatedAt.localeCompare(b.updatedAt)),
    [state.requests, user.department]
  );
  const history = state.audit.filter((a) => a.actorId === user.id && a.entity === 'PR' && a.action.startsWith('Manager'));
  const deptBudget = state.budgets.find((b) => b.department === user.department);

  return (
    <div>
      <PageHeader title="Approvals" description={`Hàng chờ duyệt của phòng ${user.department}. Budget còn lại được hiển thị trước mỗi quyết định.`} />

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div role="tablist" aria-label="Approvals" className="mb-4 flex gap-6 border-b border-hairline">
            {[
            { key: 'pending' as const, label: `Chờ duyệt (${pending.length})` },
            { key: 'done' as const, label: `Đã xử lý (${history.length})` }].
            map((t) =>
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors duration-150 ${tab === t.key ? 'border-primary-600 text-primary-700' : 'border-transparent text-ink-500 hover:text-ink-900'}`}>
              
                {t.label}
              </button>
            )}
          </div>

          {tab === 'pending' ?
          pending.length === 0 ?
          <EmptyState icon={CircleCheckIcon} title="Không có PR chờ duyệt" description="Các PR mới được Submit trong phòng ban sẽ xuất hiện tại đây." /> :

          <ul className="divide-y divide-hairline">
                {pending.map((pr) => {
              const g = managerGuard(user, pr, state.budgets.find((b) => b.code === pr.budgetCode));
              const requester = state.users.find((u) => u.id === pr.requesterId)?.name;
              return (
                <li key={pr.id}>
                      <Link to={`/requests/${pr.id}`} className="group flex flex-col gap-3 py-4 transition-colors duration-150 hover:bg-canvas sm:flex-row sm:items-center sm:px-2">
                        <div className="min-w-0 flex-1">
                          <span className="font-mono text-xs text-ink-500">{pr.id}</span>
                          <p className="truncate font-semibold text-ink-900">{pr.title}</p>
                          <p className="text-xs text-ink-500">
                            {requester} · Submit {formatDateTime(pr.updatedAt)}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {g.selfApproval && <Tag tone="danger" icon={<BanIcon className="h-3 w-3" aria-hidden />}>PR của bạn — không thể tự duyệt</Tag>}
                            {g.overBudget && <Tag tone="warning" icon={<TriangleAlertIcon className="h-3 w-3" aria-hidden />}>Vượt Budget</Tag>}
                            {g.overThreshold && <Tag tone="info" icon={<InfoIcon className="h-3 w-3" aria-hidden />}>Cần Finance (&gt; 50 tr)</Tag>}
                            {!g.selfApproval && !g.overBudget && !g.overThreshold && <Tag tone="success">Trong Budget</Tag>}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                          <span className="text-base font-semibold tabular-nums text-ink-900">{formatVND(g.check.requested)}</span>
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
                            {g.selfApproval ? 'Xem chi tiết' : 'Xem & quyết định'}
                            <ArrowRightIcon className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
                          </span>
                        </div>
                      </Link>
                    </li>);

            })}
              </ul> :


          <AuditTimeline entries={history} showEntity />
          }
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-lg bg-canvas p-5">
            <BudgetPanel budget={deptBudget} amount={0} committed showThresholdNote={false} />
          </div>
        </aside>
      </div>
    </div>);

}