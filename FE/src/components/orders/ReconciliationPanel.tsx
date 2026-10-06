import React, { useState } from 'react';
import { CircleCheckIcon, CircleXIcon, LockIcon } from 'lucide-react';
import type { PurchaseOrder, PurchaseRequest, Receiving } from '../../types/procurement';
import { closeBlockers, receivedByItem } from '../../utils/rules';
import { textareaClass } from '../../utils/styles';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

interface ReconciliationPanelProps {
  pr: PurchaseRequest;
  po: PurchaseOrder;
  receivings: Receiving[];
  canReconcile: boolean;
  canClose: boolean;
  reconcilerName?: string;
  onReconcile: (note: string) => boolean;
  onClose: () => boolean;
}

export function ReconciliationPanel({ pr, po, receivings, canReconcile, canClose, reconcilerName, onReconcile, onClose }: ReconciliationPanelProps) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState<'reconcile' | 'close' | null>(null);
  const received = receivedByItem(po.id, receivings);
  const exceptions = receivings.filter((r) => r.poId === po.id && r.type === 'discrepancy');
  const blockers = closeBlockers(pr, po, receivings);

  const rows = po.lines.map((l) => {
    const prQty = pr.items.find((i) => i.id === l.itemId)?.quantity ?? 0;
    const rcv = received[l.itemId] ?? 0;
    return { name: l.name, prQty, poQty: l.quantity, rcv, ok: prQty === l.quantity && rcv === l.quantity };
  });

  const run = (kind: 'reconcile' | 'close') => {
    setLoading(kind);
    window.setTimeout(() => {
      if (kind === 'reconcile') onReconcile(note);else
      onClose();
      setLoading(null);
    }, 350);
  };

  return (
    <section aria-labelledby="recon-title">
      <h2 id="recon-title" className="text-xl font-semibold text-ink-900">
        Đối soát & Close
      </h2>
      <p className="mt-1 text-sm text-ink-500">PR ↔ PO ↔ Receiving phải khớp trước khi Close (REQ-BR-11).</p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs text-ink-500">
              <th className="py-2 pr-4 font-medium">Dòng hàng</th>
              <th className="px-4 py-2 text-right font-medium">PR</th>
              <th className="px-4 py-2 text-right font-medium">PO</th>
              <th className="px-4 py-2 text-right font-medium">Receiving</th>
              <th className="py-2 pl-4 font-medium">Kết quả</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {rows.map((r) =>
            <tr key={r.name}>
                <td className="py-2.5 pr-4 text-ink-900">{r.name}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.prQty}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.poQty}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.rcv}</td>
                <td className="py-2.5 pl-4">
                  {r.ok ?
                <span className="inline-flex items-center gap-1 text-success-600">
                      <CircleCheckIcon className="h-4 w-4" aria-hidden /> Khớp
                    </span> :

                <span className="inline-flex items-center gap-1 text-danger-600">
                      <CircleXIcon className="h-4 w-4" aria-hidden /> Chưa khớp
                    </span>
                }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {exceptions.length > 0 &&
      <Alert tone="warning" title={`${exceptions.length} lần nhận có sai lệch`} className="mt-4">
          <ul className="list-disc pl-4">
            {exceptions.map((e) =>
          <li key={e.id}>{e.note}</li>
          )}
          </ul>
        </Alert>
      }

      <div className="mt-5 space-y-4">
        {po.reconciled ?
        <Alert tone="success" title="Đã đối soát PR ↔ PO ↔ Receiving">
            {reconcilerName && <>Bởi {reconcilerName}. </>}
            {po.reconcileNote}
          </Alert> :
        canReconcile && po.status === 'received' ?
        <div className="rounded-lg border border-hairline p-4">
            <label htmlFor="recon-note" className="mb-1.5 block text-sm font-medium text-ink-700">
              Ghi chú đối soát {exceptions.length > 0 ? <span className="text-danger-600">*</span> : <span className="font-normal text-ink-500">(không bắt buộc)</span>}
            </label>
            <textarea id="recon-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder={exceptions.length ? 'Cách xử lý sai lệch: chấp nhận, đổi trả, giảm trừ…' : ''} className={textareaClass()} />
            <Button className="mt-3" onClick={() => run('reconcile')} loading={loading === 'reconcile'}>
              Xác nhận đối soát
            </Button>
          </div> :
        null}

        {po.status !== 'closed' &&
        <div className="flex flex-col gap-3 rounded-lg bg-canvas p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              {blockers.length ?
            <>
                  <p className="font-semibold text-ink-900">Close đang bị khóa</p>
                  <ul className="mt-1 space-y-0.5 text-ink-700">
                    {blockers.map((b) =>
                <li key={b} className="flex items-center gap-1.5">
                        <LockIcon className="h-3.5 w-3.5 text-ink-500" aria-hidden />
                        {b}
                      </li>
                )}
                  </ul>
                </> :

            <p className="font-semibold text-success-600">Đủ điều kiện Close PR.</p>
            }
            </div>
            {canClose &&
          <Button variant="primary" disabled={blockers.length > 0} onClick={() => run('close')} loading={loading === 'close'} icon={<LockIcon className="h-4 w-4" aria-hidden />}>
                Close PR
              </Button>
          }
          </div>
        }
      </div>
    </section>);

}