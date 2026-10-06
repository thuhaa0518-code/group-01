import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, BanIcon, CircleCheckIcon } from 'lucide-react';
import { useCurrentUser } from '../contexts/AuthContext';
import { useProcurement } from '../contexts/ProcurementContext';
import { useWorkQueue } from '../hooks/useWorkQueue';
import { canViewRequest, ROLE_LABEL, can } from '../utils/permissions';
import { workflowPosition, WORKFLOW_STEPS } from '../utils/workflow';
import { formatCompactVND } from '../utils/format';
import { Tag } from '../components/ui/Tag';
import { EmptyState } from '../components/ui/EmptyState';
import { BudgetPanel } from '../components/budget/BudgetPanel';
import { AuditTimeline } from '../components/workflow/AuditTimeline';
import { buttonClass } from '../components/ui/Button';

export function DashboardPage() {
  const user = useCurrentUser();
  const { state } = useProcurement();
  const queue = useWorkQueue(user);

  const pipeline = useMemo(() => {
    const counts = WORKFLOW_STEPS.map(() => 0);
    let closed = 0;
    let rejected = 0;
    state.requests.
    filter((r) => canViewRequest(user, r)).
    forEach((r) => {
      if (r.status === 'closed') return void closed++;
      if (r.status === 'rejected') return void rejected++;
      const confirmed = state.quotations.filter((q) => q.prId === r.id && q.status === 'confirmed').length;
      counts[workflowPosition(r.status, confirmed).index]++;
    });
    return { counts, closed, rejected };
  }, [state, user]);

  const deptBudget = state.budgets.find((b) => b.department === user.department);

  return (
    <div>
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-ink-500">
            {ROLE_LABEL[user.role]} · {user.department}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-ink-900 md:text-[28px] md:leading-9">Xin chào, {user.name.split(' ').pop()}</h1>
        </div>
        {can(user, 'pr.create') &&
        <Link to="/requests/new" className={buttonClass('primary')}>
            New request
          </Link>
        }
      </header>

      <div className="grid gap-10 lg:grid-cols-3">
        <section className="lg:col-span-2" aria-labelledby="queue-title">
          {user.role === 'admin' ?
          <>
              <div className="mb-4 flex items-baseline justify-between">
                <h2 id="queue-title" className="text-xl font-semibold text-ink-900">
                  Hoạt động gần đây
                </h2>
                <Link to="/audit" className="text-sm font-medium text-primary-600 hover:underline">
                  Xem Audit Trail
                </Link>
              </div>
              <AuditTimeline entries={[...state.audit].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8)} showEntity />
            </> :

          <>
              <div className="mb-3 flex items-baseline gap-2">
                <h2 id="queue-title" className="text-xl font-semibold text-ink-900">
                  Việc cần bạn xử lý
                </h2>
                <span className="text-sm text-ink-500">{queue.filter((q) => !q.blocked).length}</span>
              </div>
              {queue.length === 0 ?
            <div className="rounded-lg border border-hairline">
                  <EmptyState icon={CircleCheckIcon} title="Không có việc tồn đọng" description="Bạn đã xử lý hết các mục thuộc phạm vi của mình." />
                </div> :

            <ul className="divide-y divide-hairline border-y border-hairline">
                  {queue.map((item) =>
              <li key={item.key}>
                      <Link to={item.to} className="group flex flex-col gap-2 py-4 transition-colors duration-150 hover:bg-canvas sm:flex-row sm:items-center sm:gap-4 sm:px-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs text-ink-500">{item.refId}</span>
                            {item.blocked &&
                      <Tag tone="danger" icon={<BanIcon className="h-3 w-3" aria-hidden />}>
                                {item.blocked}
                              </Tag>
                      }
                          </div>
                          <p className="mt-0.5 truncate text-sm font-semibold text-ink-900">{item.title}</p>
                          <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">{item.meta}</p>
                        </div>
                        {item.amount !== undefined && <span className="text-sm font-semibold tabular-nums text-ink-900">{formatCompactVND(item.amount)}</span>}
                        <span className={`inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold ${item.blocked ? 'text-ink-500' : 'text-primary-600'}`}>
                          {item.blocked ? 'Xem chi tiết' : item.action}
                          <ArrowRightIcon className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
                        </span>
                      </Link>
                    </li>
              )}
                </ul>
            }
            </>
          }
        </section>

        <aside className="space-y-8">
          {(user.role === 'employee' || user.role === 'manager') && deptBudget &&
          <div className="rounded-lg bg-canvas p-5">
              <BudgetPanel budget={deptBudget} amount={0} committed showThresholdNote={false} />
            </div>
          }
          {(user.role === 'finance' || user.role === 'admin' || user.role === 'procurement') &&
          <section aria-labelledby="budgets-title" className="rounded-lg bg-canvas p-5">
              <h2 id="budgets-title" className="text-base font-semibold text-ink-900">
                Budget các phòng ban
              </h2>
              <ul className="mt-4 space-y-4">
                {state.budgets.map((b) => {
                const pct = Math.min(100, b.committed / b.allocated * 100);
                return (
                  <li key={b.code}>
                      <div className="flex items-baseline justify-between gap-2 text-sm">
                        <span className="font-medium text-ink-900">{b.department}</span>
                        <span className="tabular-nums text-ink-700">{formatCompactVND(b.allocated - b.committed)} còn lại</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white">
                        <span className={`block h-full ${pct > 90 ? 'bg-warning-700' : 'bg-primary-600'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </li>);

              })}
              </ul>
            </section>
          }
        </aside>
      </div>

      <section className="mt-12" aria-labelledby="pipeline-title">
        <h2 id="pipeline-title" className="text-xl font-semibold text-ink-900">
          Tiến độ PR theo workflow
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          PR trong phạm vi của bạn · {pipeline.closed} đã Close · {pipeline.rejected} bị Reject
        </p>
        <ol className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:grid-cols-4 lg:grid-cols-7">
          {WORKFLOW_STEPS.map((step, i) =>
          <li key={step.key} className="bg-white px-4 py-4">
              <p className="text-xs font-medium text-ink-500">
                {i + 1}. {step.label}
              </p>
              <p className={`mt-1 text-2xl font-semibold tabular-nums ${pipeline.counts[i] ? 'text-ink-900' : 'text-ink-300'}`}>{pipeline.counts[i]}</p>
            </li>
          )}
        </ol>
      </section>
    </div>);

}