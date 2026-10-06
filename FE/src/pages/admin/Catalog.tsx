import React, { useState } from 'react';
import { PencilIcon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Budget } from '../../types/procurement';
import { useProcurement } from '../../contexts/ProcurementContext';
import { useAction } from '../../hooks/useAction';
import { addCategory, updateBudget } from '../../utils/procurementActions';
import { formatVND } from '../../utils/format';
import { inputClass } from '../../utils/styles';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { ReasonDialog } from '../../components/ui/ReasonDialog';
import { FormField } from '../../components/ui/FormField';
import { Tag } from '../../components/ui/Tag';

export function AdminCatalogPage() {
  const { state } = useProcurement();
  const act = useAction();
  const [editing, setEditing] = useState<Budget | null>(null);
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [newCat, setNewCat] = useState('');

  const openEdit = (b: Budget) => {
    setEditing(b);
    setAmount(String(b.allocated));
    setAmountError('');
  };

  return (
    <div>
      <PageHeader title="Budget & Danh mục" description="Cấu hình ngân sách ban đầu theo phòng ban và danh mục mua sắm. Ngưỡng phê duyệt hiện là giả định MVP (ASM-02)." />

      <section aria-labelledby="budget-title">
        <h2 id="budget-title" className="text-xl font-semibold text-ink-900">
          Budget năm 2026
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-hairline text-xs text-ink-500">
                <th className="py-2 pr-4 font-medium">Budget code</th>
                <th className="px-4 py-2 font-medium">Phòng ban / Cost centre</th>
                <th className="px-4 py-2 text-right font-medium">Được cấp</th>
                <th className="px-4 py-2 text-right font-medium">Đã cam kết</th>
                <th className="px-4 py-2 text-right font-medium">Khả dụng</th>
                <th className="py-2 pl-4">
                  <span className="sr-only">Thao tác</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {state.budgets.map((b) =>
              <tr key={b.code}>
                  <td className="py-3 pr-4">
                    <p className="font-mono text-sm text-ink-900">{b.code}</p>
                    <p className="text-xs text-ink-500">{b.name}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {b.department} · {b.costCenter}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{formatVND(b.allocated)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{formatVND(b.committed)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums">{formatVND(b.allocated - b.committed)}</td>
                  <td className="py-3 pl-4 text-right">
                    <Button variant="tertiary" size="sm" icon={<PencilIcon className="h-4 w-4" aria-hidden />} onClick={() => openEdit(b)}>
                      Điều chỉnh
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12 max-w-2xl" aria-labelledby="cat-title">
        <h2 id="cat-title" className="text-xl font-semibold text-ink-900">
          Danh mục mua sắm
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {state.categories.map((c) =>
          <Tag key={c} className="h-8 px-3 text-sm">
              {c}
            </Tag>
          )}
        </div>
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            const res = act(addCategory, newCat);
            if (res.ok) {
              toast.success('Đã thêm danh mục.');
              setNewCat('');
            }
          }}>
          
          <FormField label="Thêm danh mục" htmlFor="new-cat" className="flex-1">
            <input id="new-cat" value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="VD: Thiết bị an ninh" className={inputClass()} />
          </FormField>
          <Button type="submit" variant="secondary" icon={<PlusIcon className="h-4 w-4" aria-hidden />}>
            Thêm
          </Button>
        </form>
      </section>

      <ReasonDialog
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={`Điều chỉnh ${editing?.code ?? ''}`}
        description={editing ? `Đã cam kết ${formatVND(editing.committed)} — ngân sách mới không được thấp hơn.` : undefined}
        confirmLabel="Lưu Budget"
        reasonLabel="Lý do điều chỉnh"
        onConfirm={(reason) => {
          if (!editing) return false;
          const value = Number(amount);
          if (!(value > 0)) {
            setAmountError('Nhập số tiền hợp lệ.');
            return false;
          }
          const res = act(updateBudget, editing.code, value, reason);
          if (res.ok) toast.success('Đã điều chỉnh Budget.');
          return res.ok;
        }}>
        
        <FormField label="Ngân sách được cấp (₫)" htmlFor="budget-amount" required error={amountError}>
          <input id="budget-amount" type="number" min={0} step={1_000_000} value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass(Boolean(amountError))} />
        </FormField>
      </ReasonDialog>
    </div>);

}