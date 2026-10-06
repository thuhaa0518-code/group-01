import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, CircleCheckIcon, TriangleAlertIcon } from 'lucide-react';
import { useProcurement } from '../contexts/ProcurementContext';
import { budgetCheck, prTotal } from '../utils/rules';
import { formatVND, formatPercent } from '../utils/format';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Tag } from '../components/ui/Tag';

export function BudgetReviewPage() {
  const { state } = useProcurement();
  const queue = state.requests.filter((r) => r.status === 'finance_review');

  return (
    <div>
      <PageHeader title="Budget Review" description="PR được Manager chuyển sang Finance hoặc thuộc policy phải kiểm tra ngân sách." />

      <section aria-labelledby="queue-title">
        <h2 id="queue-title" className="mb-3 text-xl font-semibold text-ink-900">
          Hàng chờ Finance <span className="text-base font-normal text-ink-500">({queue.length})</span>
        </h2>
        {queue.length === 0 ?
        <div className="rounded-lg border border-hairline">
            <EmptyState icon={CircleCheckIcon} title="Không có PR chờ kiểm tra" description="PR được chuyển Finance sẽ xuất hiện tại đây." />
          </div> :

        <ul className="divide-y divide-hairline border-y border-hairline">
            {queue.map((pr) => {
            const budget = state.budgets.find((b) => b.code === pr.budgetCode);
            const check = budgetCheck(prTotal(pr), budget);
            return (
              <li key={pr.id}>
                  <Link to={`/requests/${pr.id}`} className="group grid gap-4 py-5 transition-colors duration-150 hover:bg-canvas sm:px-2 md:grid-cols-[1fr_auto]">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-ink-500">{pr.id}</span>
                        {check.overBudget && <Tag tone="warning" icon={<TriangleAlertIcon className="h-3 w-3" aria-hidden />}>Vượt {formatVND(-check.remainingAfter)}</Tag>}
                      </div>
                      <p className="mt-0.5 font-semibold text-ink-900">{pr.title}</p>
                      <p className="mt-1 text-sm text-ink-700">
                        <span className="text-ink-500">Lý do chuyển: </span>
                        {pr.lastReason ?? '—'}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm md:w-[420px]">
                      <Metric label="Giá trị PR" value={formatVND(check.requested)} strong />
                      <Metric label="Khả dụng" value={formatVND(check.available)} tone={check.available <= 0 ? 'text-danger-600' : undefined} />
                      <Metric label="Đã dùng" value={formatVND(check.committed)} />
                      <span className="col-span-3 inline-flex items-center justify-end gap-1 text-sm font-semibold text-primary-600">
                        Kiểm tra Budget
                        <ArrowRightIcon className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </div>
                  </Link>
                </li>);

          })}
          </ul>
        }
      </section>

      <section className="mt-12" aria-labelledby="alloc-title">
        <h2 id="alloc-title" className="text-xl font-semibold text-ink-900">
          Allocated / Used / Available
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-hairline text-xs text-ink-500">
                <th className="py-2 pr-4 font-medium">Budget</th>
                <th className="px-4 py-2 text-right font-medium">Allocated</th>
                <th className="px-4 py-2 text-right font-medium">Used (đã cam kết)</th>
                <th className="px-4 py-2 text-right font-medium">Available</th>
                <th className="py-2 pl-4 font-medium">Sử dụng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {state.budgets.map((b) => {
                const pct = b.committed / b.allocated;
                return (
                  <tr key={b.code}>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-ink-900">{b.department}</p>
                      <p className="font-mono text-xs text-ink-500">
                        {b.code} · {b.costCenter}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{formatVND(b.allocated)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{formatVND(b.committed)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums">{formatVND(b.allocated - b.committed)}</td>
                    <td className="py-3 pl-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-hairline">
                          <span className={`block h-full ${pct > 0.9 ? 'bg-warning-700' : 'bg-primary-600'}`} style={{ width: `${Math.min(100, pct * 100)}%` }} />
                        </div>
                        <span className="text-xs tabular-nums text-ink-500">{formatPercent(pct)}</span>
                      </div>
                    </td>
                  </tr>);

              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>);

}

function Metric({ label, value, strong, tone }: {label: string;value: string;strong?: boolean;tone?: string;}) {
  return (
    <div>
      <p className="text-xs text-ink-500">{label}</p>
      <p className={`tabular-nums ${strong ? 'font-semibold' : ''} ${tone ?? 'text-ink-900'}`}>{value}</p>
    </div>);

}