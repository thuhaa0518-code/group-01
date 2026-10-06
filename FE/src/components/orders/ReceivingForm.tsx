import React, { useState } from 'react';
import { PackageCheckIcon } from 'lucide-react';
import type { PurchaseOrder, ReceivingLine } from '../../types/procurement';
import { inputClass, textareaClass } from '../../utils/styles';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

interface ReceivingFormProps {
  po: PurchaseOrder;
  received: Record<string, number>;
  onSubmit: (lines: ReceivingLine[], note: string, discrepancy: boolean) => boolean;
}

export function ReceivingForm({ po, received, onSubmit }: ReceivingFormProps) {
  const [qty, setQty] = useState<Record<string, string>>({});
  const [discrepancy, setDiscrepancy] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const remaining = (itemId: string) => (po.lines.find((l) => l.itemId === itemId)?.quantity ?? 0) - (received[itemId] ?? 0);
  const lineErrors: Record<string, string> = {};
  po.lines.forEach((l) => {
    const raw = qty[l.itemId];
    if (raw === undefined || raw === '') return;
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 0) lineErrors[l.itemId] = 'Nhập số nguyên ≥ 0.';else
    if (n > remaining(l.itemId)) lineErrors[l.itemId] = `Vượt số lượng còn lại trên PO (${remaining(l.itemId)}).`;
  });
  const total = po.lines.reduce((s, l) => s + (Number(qty[l.itemId]) || 0), 0);
  const noteError = submitted && discrepancy && note.trim().length < 5 ? 'Mô tả sai lệch (tối thiểu 5 ký tự).' : '';
  const willComplete = po.lines.every((l) => (received[l.itemId] ?? 0) + (Number(qty[l.itemId]) || 0) >= l.quantity);

  const fillRemaining = () => setQty(Object.fromEntries(po.lines.map((l) => [l.itemId, String(remaining(l.itemId))])));

  const submit = () => {
    setSubmitted(true);
    if (Object.keys(lineErrors).length || total <= 0 || discrepancy && note.trim().length < 5) return;
    setLoading(true);
    window.setTimeout(() => {
      const ok = onSubmit(
        po.lines.map((l) => ({ itemId: l.itemId, quantity: Number(qty[l.itemId]) || 0 })),
        note,
        discrepancy
      );
      setLoading(false);
      if (ok) {
        setQty({});
        setNote('');
        setDiscrepancy(false);
        setSubmitted(false);
      }
    }, 350);
  };

  return (
    <section className="rounded-lg border border-primary-200 p-5" aria-labelledby="rcv-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="rcv-title" className="font-semibold text-ink-900">
          Ghi nhận Receiving
        </h3>
        <Button variant="link" size="sm" onClick={fillRemaining}>
          Điền đủ số còn lại
        </Button>
      </div>
      <p className="mt-0.5 text-sm text-ink-500">Hỗ trợ nhận đủ, nhận một phần hoặc ghi nhận sai lệch. Tổng số nhận không được vượt số lượng trên PO.</p>

      <ul className="mt-4 divide-y divide-hairline border-y border-hairline">
        {po.lines.map((l) =>
        <li key={l.itemId} className="grid gap-2 py-3 sm:grid-cols-[1fr_160px] sm:items-start">
            <div>
              <p className="text-sm font-medium text-ink-900">{l.name}</p>
              <p className="text-xs text-ink-500">
                PO {l.quantity} · đã nhận {received[l.itemId] ?? 0} · còn lại {remaining(l.itemId)}
              </p>
            </div>
            <div>
              <label htmlFor={`rcv-${l.itemId}`} className="sr-only">
                Số lượng nhận {l.name}
              </label>
              <input
              id={`rcv-${l.itemId}`}
              type="number"
              min={0}
              max={remaining(l.itemId)}
              value={qty[l.itemId] ?? ''}
              placeholder="0"
              onChange={(e) => setQty((p) => ({ ...p, [l.itemId]: e.target.value }))}
              className={inputClass(Boolean(lineErrors[l.itemId]))}
              aria-invalid={Boolean(lineErrors[l.itemId])} />
            
              {lineErrors[l.itemId] && <p className="mt-1 text-xs text-danger-600">{lineErrors[l.itemId]}</p>}
            </div>
          </li>
        )}
      </ul>

      <label className="mt-4 inline-flex items-center gap-2 text-sm text-ink-700">
        <input type="checkbox" checked={discrepancy} onChange={(e) => setDiscrepancy(e.target.checked)} className="h-4 w-4 rounded border-line text-primary-600 focus:ring-primary-600" />
        Phát hiện sai lệch (hư hỏng, sai quy cách, thiếu phụ kiện…)
      </label>
      {discrepancy &&
      <div className="mt-3">
          <label htmlFor="rcv-note" className="mb-1.5 block text-sm font-medium text-ink-700">
            Mô tả sai lệch <span className="text-danger-600">*</span>
          </label>
          <textarea id="rcv-note" value={note} onChange={(e) => setNote(e.target.value)} className={textareaClass(Boolean(noteError))} />
          {noteError && <p className="mt-1 text-xs text-danger-600">{noteError}</p>}
        </div>
      }
      {submitted && total <= 0 && <p className="mt-3 text-xs text-danger-600">Nhập số lượng nhận cho ít nhất 1 dòng.</p>}

      {total > 0 && !Object.keys(lineErrors).length &&
      <Alert tone={discrepancy ? 'warning' : willComplete ? 'success' : 'info'} title={discrepancy ? 'Sẽ ghi nhận có sai lệch' : willComplete ? 'Nhận đủ theo PO' : 'Nhận một phần'} className="mt-4">
          {willComplete ? 'Sau khi lưu, PO chuyển sang chờ Finance đối soát.' : 'Phần còn lại có thể ghi nhận ở lần giao sau.'}
        </Alert>
      }

      <Button className="mt-4" icon={<PackageCheckIcon className="h-4 w-4" aria-hidden />} onClick={submit} loading={loading}>
        Lưu Receiving
      </Button>
    </section>);

}