import React, { useState } from 'react';
import { LockIcon, PackageIcon } from 'lucide-react';
import type { Quotation, Supplier } from '../../types/procurement';
import { quotationTotal } from '../../utils/rules';
import { formatVND } from '../../utils/format';
import { inputClass } from '../../utils/styles';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';

interface CreatePOPanelProps {
  quotation: Quotation;
  supplier?: Supplier;
  selectionNote?: string;
  onCreate: (expectedDelivery: string) => boolean;
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function CreatePOPanel({ quotation: q, supplier, selectionNote, onCreate }: CreatePOPanelProps) {
  const [date, setDate] = useState(addDays(q.deliveryDays));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = () => {
    if (!date) {
      setError('Chọn ngày giao hàng dự kiến.');
      return;
    }
    setError('');
    setLoading(true);
    window.setTimeout(() => {
      onCreate(date);
      setLoading(false);
    }, 400);
  };

  return (
    <section className="rounded-lg border border-primary-200 p-5" aria-labelledby="po-title">
      <h3 id="po-title" className="font-semibold text-ink-900">
        Tạo Purchase Order
      </h3>
      <p className="mt-0.5 text-sm text-ink-500">
        Supplier đã chọn: <span className="font-medium text-ink-900">{supplier?.name}</span>
        {selectionNote && <> · Lý do: “{selectionNote}”</>}
      </p>
      <div className="mt-4 rounded-md bg-canvas p-4">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500">
          <LockIcon className="h-3.5 w-3.5" aria-hidden />
          Dữ liệu Quotation được khóa khi tạo PO — AI không thay đổi (ASM-04)
        </p>
        <ul className="mt-2 space-y-1 text-sm">
          {q.lines.map((l) =>
          <li key={l.itemId} className="flex justify-between gap-3">
              <span className="text-ink-700">
                {l.name} × {l.quantity}
              </span>
              <span className="tabular-nums">{formatVND(l.unitPrice)}</span>
            </li>
          )}
          <li className="flex justify-between gap-3 text-ink-500">
            <span>Thuế {Math.round(q.taxRate * 100)}% · Vận chuyển</span>
            <span className="tabular-nums">{formatVND(q.shippingFee)}</span>
          </li>
          <li className="flex justify-between gap-3 border-t border-hairline pt-1 font-semibold">
            <span>Tổng PO</span>
            <span className="tabular-nums">{formatVND(quotationTotal(q))}</span>
          </li>
        </ul>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <FormField label="Ngày giao dự kiến" htmlFor="po-date" required error={error} className="sm:w-56">
          <input id="po-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass(Boolean(error))} />
        </FormField>
        <Button icon={<PackageIcon className="h-4 w-4" aria-hidden />} onClick={submit} loading={loading}>
          Create PO
        </Button>
      </div>
    </section>);

}