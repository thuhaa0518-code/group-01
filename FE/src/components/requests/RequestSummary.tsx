import React from 'react';
import { CheckIcon, CircleIcon, SaveIcon, SendIcon, TriangleAlertIcon } from 'lucide-react';
import type { BudgetCheck } from '../../utils/rules';
import { FINANCE_THRESHOLD } from '../../utils/rules';
import { formatCompactVND, formatVND } from '../../utils/format';
import { Button } from '../ui/Button';

const CHECKS: {label: string;keys: (k: string) => boolean;}[] = [
{ label: 'Tiêu đề & Category', keys: (k) => k === 'title' || k === 'category' },
{ label: 'Cost centre & Budget code', keys: (k) => k === 'costCenter' || k === 'budgetCode' || k === 'department' },
{ label: 'Ngày cần hàng & địa điểm giao', keys: (k) => k === 'requiredBy' || k === 'deliveryLocation' },
{ label: 'Mục đích mua sắm', keys: (k) => k === 'justification' },
{ label: 'Sản phẩm, thông số, số lượng, đơn giá', keys: (k) => k === 'items' || k.startsWith('item.') }];


interface RequestSummaryProps {
  total: number;
  check: BudgetCheck;
  errors: Record<string, string>;
  saving: boolean;
  submitting: boolean;
  onSave: () => void;
  onSubmit: () => void;
}

export function RequestSummary({ total, check, errors, saving, submitting, onSave, onSubmit }: RequestSummaryProps) {
  const keys = Object.keys(errors);
  const done = CHECKS.filter((c) => !keys.some(c.keys)).length;
  return (
    <div className="space-y-5 rounded-lg border border-hairline bg-white p-5">
      <div>
        <p className="text-xs text-ink-500">Tổng dự toán</p>
        <p className="text-2xl font-semibold tabular-nums text-ink-900">{formatVND(total)}</p>
        <p className="mt-1 text-xs text-ink-500">Budget khả dụng: {formatVND(check.available)}</p>
      </div>

      {check.overBudget && total > 0 &&
      <p className="flex gap-2 text-xs text-warning-700">
          <TriangleAlertIcon className="h-4 w-4 flex-none" aria-hidden />
          Vượt Budget khả dụng {formatVND(-check.remainingAfter)}. Bạn vẫn có thể Submit — Manager sẽ quyết định Reject hoặc chuyển Finance.
        </p>
      }
      {total > FINANCE_THRESHOLD &&
      <p className="flex gap-2 text-xs text-info-600">
          <TriangleAlertIcon className="h-4 w-4 flex-none" aria-hidden />
          Trên {formatCompactVND(FINANCE_THRESHOLD)}: cần cả Manager và Finance phê duyệt.
        </p>
      }

      <div>
        <p className="text-sm font-semibold text-ink-900">
          Checklist trước khi Submit <span className="font-normal text-ink-500">({done}/{CHECKS.length})</span>
        </p>
        <ul className="mt-2 space-y-1.5">
          {CHECKS.map((c) => {
            const ok = !keys.some(c.keys);
            return (
              <li key={c.label} className={`flex items-center gap-2 text-sm ${ok ? 'text-ink-700' : 'text-ink-500'}`}>
                {ok ? <CheckIcon className="h-4 w-4 text-success-600" aria-label="Đã đủ" /> : <CircleIcon className="h-4 w-4 text-ink-300" aria-label="Chưa đủ" />}
                {c.label}
              </li>);

          })}
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <Button icon={<SendIcon className="h-4 w-4" aria-hidden />} onClick={onSubmit} loading={submitting} disabled={saving}>
          Submit request
        </Button>
        <Button variant="secondary" icon={<SaveIcon className="h-4 w-4" aria-hidden />} onClick={onSave} loading={saving} disabled={submitting}>
          Save draft
        </Button>
      </div>
    </div>);

}