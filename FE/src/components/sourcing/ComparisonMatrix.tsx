import React from 'react';
import { CircleCheckIcon, SparklesIcon, TriangleAlertIcon } from 'lucide-react';
import type { Quotation, Supplier } from '../../types/procurement';
import type { QuoteScore } from '../../utils/rules';
import { lineAnomaly, linesSubtotal, quotationTotal } from '../../utils/rules';
import { formatVND } from '../../utils/format';
import { Button } from '../ui/Button';
import { Tag } from '../ui/Tag';

interface ComparisonMatrixProps {
  quotes: Quotation[];
  suppliers: Supplier[];
  scores: QuoteScore[];
  recommendedId?: string;
  selectedId?: string;
  canSelect: boolean;
  onSelect: (qid: string) => void;
}

type Better = 'min' | 'max';

export function ComparisonMatrix({ quotes, suppliers, scores, recommendedId, selectedId, canSelect, onSelect }: ComparisonMatrixProps) {
  const name = (q: Quotation) => suppliers.find((s) => s.id === q.supplierId)?.name ?? '—';
  const scoreOf = (q: Quotation) => scores.find((s) => s.quotationId === q.id)?.score ?? 0;
  const itemIds = quotes[0]?.lines.map((l) => l.itemId) ?? [];

  const rows: {label: string;value: (q: Quotation) => number;format: (v: number) => string;better?: Better;strong?: boolean;}[] = [
  ...itemIds.map((itemId) => ({
    label: `Đơn giá · ${quotes[0].lines.find((l) => l.itemId === itemId)?.name ?? ''}`,
    value: (q: Quotation) => q.lines.find((l) => l.itemId === itemId)?.unitPrice ?? 0,
    format: formatVND,
    better: 'min' as Better
  })),
  { label: 'Tạm tính', value: (q) => linesSubtotal(q.lines), format: formatVND, better: 'min' },
  { label: 'Thuế', value: (q) => Math.round(linesSubtotal(q.lines) * q.taxRate), format: formatVND },
  { label: 'Phí vận chuyển', value: (q) => q.shippingFee, format: formatVND, better: 'min' },
  { label: 'Tổng tiền', value: (q) => quotationTotal(q), format: formatVND, better: 'min', strong: true },
  { label: 'Thời gian giao', value: (q) => q.deliveryDays, format: (v) => `${v} ngày`, better: 'min' },
  { label: 'Bảo hành', value: (q) => q.warrantyMonths, format: (v) => `${v} tháng`, better: 'max' },
  { label: 'Điểm AI', value: scoreOf, format: (v) => `${v.toLocaleString('vi-VN')}/100`, better: 'max' }];


  const bestOf = (row: (typeof rows)[number]) => {
    if (!row.better) return undefined;
    const vals = quotes.map(row.value);
    return row.better === 'min' ? Math.min(...vals) : Math.max(...vals);
  };

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-hairline align-bottom">
              <th className="w-48 py-3 pr-4 text-xs font-medium text-ink-500">Tiêu chí</th>
              {quotes.map((q) =>
              <th key={q.id} scope="col" className={`px-4 py-3 ${q.id === selectedId ? 'bg-primary-50' : ''}`}>
                  <div className="flex flex-col items-start gap-1">
                    {q.id === recommendedId &&
                  <Tag tone="info" icon={<SparklesIcon className="h-3 w-3" aria-hidden />}>
                        AI đề xuất
                      </Tag>
                  }
                    <span className="font-semibold text-ink-900">{name(q)}</span>
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {rows.map((row) => {
              const best = bestOf(row);
              return (
                <tr key={row.label}>
                  <th scope="row" className="py-2.5 pr-4 text-xs font-medium text-ink-500">
                    {row.label}
                  </th>
                  {quotes.map((q) => {
                    const v = row.value(q);
                    const isBest = best !== undefined && v === best && quotes.length > 1;
                    const anomaly = row.label.startsWith('Đơn giá') && q.lines.some((l) => row.label.endsWith(l.name) && lineAnomaly(l));
                    return (
                      <td key={q.id} className={`px-4 py-2.5 tabular-nums ${q.id === selectedId ? 'bg-primary-50' : ''} ${row.strong ? 'font-semibold' : ''}`}>
                        <span className={`inline-flex items-center gap-1 ${isBest ? 'text-success-600' : 'text-ink-900'}`}>
                          {row.format(v)}
                          {isBest && <CircleCheckIcon className="h-3.5 w-3.5" aria-label="Tốt nhất" />}
                          {anomaly && <TriangleAlertIcon className="h-3.5 w-3.5 text-warning-700" aria-label="Giá bất thường" />}
                        </span>
                      </td>);

                  })}
                </tr>);

            })}
            <tr>
              <td className="py-3" />
              {quotes.map((q) =>
              <td key={q.id} className={`px-4 py-3 ${q.id === selectedId ? 'bg-primary-50' : ''}`}>
                  {q.id === selectedId ?
                <Tag tone="primary" icon={<CircleCheckIcon className="h-3 w-3" aria-hidden />}>Đã chọn</Tag> :
                canSelect ?
                <Button size="sm" variant={q.id === recommendedId ? 'primary' : 'secondary'} onClick={() => onSelect(q.id)}>
                      Select supplier
                    </Button> :
                null}
                </td>
              )}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {quotes.map((q) =>
        <details key={q.id} className="rounded-lg border border-hairline p-4" open={q.id === recommendedId}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
              <span className="font-semibold text-ink-900">{name(q)}</span>
              {q.id === recommendedId && <Tag tone="info">AI đề xuất</Tag>}
            </summary>
            <dl className="mt-3 space-y-1.5 text-sm">
              {rows.map((row) =>
            <div key={row.label} className="flex justify-between gap-3">
                  <dt className="text-ink-500">{row.label}</dt>
                  <dd className={`tabular-nums ${row.strong ? 'font-semibold' : ''}`}>{row.format(row.value(q))}</dd>
                </div>
            )}
            </dl>
            {q.id === selectedId ?
          <Tag tone="primary" className="mt-3">Đã chọn</Tag> :

          canSelect &&
          <Button size="sm" className="mt-3 w-full" variant={q.id === recommendedId ? 'primary' : 'secondary'} onClick={() => onSelect(q.id)}>
                  Select supplier
                </Button>

          }
          </details>
        )}
      </div>
    </>);

}