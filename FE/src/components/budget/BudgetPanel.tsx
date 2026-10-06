import React from 'react';
import { CircleCheckIcon, TriangleAlertIcon } from 'lucide-react';
import type { Budget } from '../../types/procurement';
import { budgetCheck, FINANCE_THRESHOLD } from '../../utils/rules';
import { formatCompactVND, formatVND } from '../../utils/format';

interface BudgetPanelProps {
  budget?: Budget;
  amount: number;
  /** PR đã được cam kết vào Budget (sau khi Approve). */
  committed?: boolean;
  showThresholdNote?: boolean;
  /** Budget-only view (no specific request). */
  overview?: boolean;
}

export function BudgetPanel({ budget, amount, committed = false, showThresholdNote = true, overview = false }: BudgetPanelProps) {
  if (!budget) {
    return (
      <section className="rounded-lg border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700 shadow-card">
        Không tìm thấy Budget code. Kiểm tra lại PR hoặc liên hệ Admin.
      </section>);

  }
  const check = budgetCheck(committed || overview ? 0 : amount, budget);
  const isOver = !committed && !overview && check.overBudget;
  const usedRatio = Math.min(1, budget.committed / budget.allocated);
  const requestRatio = committed || overview ? 0 : Math.min(1 - usedRatio, amount / budget.allocated);

  return (
    <section className={`rounded-lg border shadow-card ${isOver ? 'border-warning-200 bg-warning-50/60' : 'border-line bg-surface'}`} aria-label="Budget position">
      <header className="flex flex-wrap items-start justify-between gap-2 border-b border-line/70 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">{isOver ? 'Budget warning' : 'Budget position'}</h3>
          <p className="mt-0.5 text-xs text-ink-700">
            {budget.name} · <span className="tabular">{budget.code}</span> · {budget.costCenter}
          </p>
        </div>
        {!overview &&
        <span
          className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-medium ${
          isOver ? 'border-warning-200 bg-surface text-warning-700' : 'border-success-200 bg-success-50 text-success-700'}`
          }>
          
            {isOver ? <TriangleAlertIcon className="h-3.5 w-3.5" aria-hidden /> : <CircleCheckIcon className="h-3.5 w-3.5" aria-hidden />}
            {isOver ? `Vượt ${formatVND(-check.remainingAfter)}` : committed ? 'Đã cam kết' : 'Trong Budget'}
          </span>
        }
      </header>

      <div className="px-4 py-4">
        {isOver &&
        <p className="mb-4 text-sm leading-relaxed text-warning-700">
            PR này vượt Budget khả dụng {formatVND(-check.remainingAfter)}. Manager không thể tự Approve — chọn Reject, yêu cầu chỉnh sửa hoặc chuyển Finance kiểm tra ngân sách.
          </p>
        }

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-canvas" role="presentation">
          <div className="flex h-full w-full">
            <div className="h-full bg-ink-900/70" style={{ width: `${usedRatio * 100}%` }} />
            <div className={`h-full ${isOver ? 'bg-warning-600' : 'bg-primary-600'}`} style={{ width: `${Math.max(0, requestRatio) * 100}%` }} />
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-xs text-ink-500">Allocated</dt>
            <dd className="tabular mt-0.5 font-medium text-ink-900">{formatVND(budget.allocated)}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-500">Committed</dt>
            <dd className="tabular mt-0.5 font-medium text-ink-900">{formatVND(budget.committed)}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-500">Available</dt>
            <dd className={`tabular mt-0.5 font-semibold ${check.available <= 0 ? 'text-danger-600' : 'text-ink-900'}`}>{formatVND(check.available)}</dd>
          </div>
        </dl>

        {!overview &&
        <div className="mt-4 flex items-baseline justify-between border-t border-line/70 pt-3">
            <span className="text-sm text-ink-700">{committed ? 'PR này (đã cam kết)' : 'PR này'}</span>
            <span className="tabular text-base font-semibold text-ink-900">{formatVND(amount)}</span>
          </div>
        }

        {!committed && !overview && showThresholdNote && amount > FINANCE_THRESHOLD &&
        <p className="mt-3 rounded border border-line bg-raised px-3 py-2 text-xs leading-relaxed text-ink-700">
            <span className="font-semibold text-ink-900">Trên ngưỡng {formatCompactVND(FINANCE_THRESHOLD)}</span> — cần cả Manager và Finance phê duyệt (giả định ASM-05).
          </p>
        }
      </div>
    </section>);

}