import React, { useState } from 'react';
import { CircleCheckIcon, EyeIcon, FileSpreadsheetIcon, FileTextIcon, PencilIcon, TriangleAlertIcon } from 'lucide-react';
import type { Quotation, QuotationField, QuotationSnapshot, Supplier } from '../../types/procurement';
import { lineAnomaly, quotationTotal } from '../../utils/rules';
import { formatPercent, formatVND } from '../../utils/format';
import { inputClass } from '../../utils/styles';
import { Button } from '../ui/Button';
import { Tag } from '../ui/Tag';

interface QuotationCardProps {
  quotation: Quotation;
  supplier?: Supplier;
  editable: boolean;
  onSave: (patch: QuotationSnapshot) => boolean;
  onConfirm: () => void;
  onViewSource: () => void;
}

const FIELD_LABEL: Record<QuotationField, string> = {
  unitPrice: 'Đơn giá',
  taxRate: 'Thuế',
  shippingFee: 'Phí vận chuyển',
  deliveryDays: 'Giao hàng',
  warrantyMonths: 'Bảo hành'
};

export function QuotationCard({ quotation: q, supplier, editable, onSave, onConfirm, onViewSource }: QuotationCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<QuotationSnapshot>(q);

  const startEdit = () => {
    setDraft({ lines: q.lines.map((l) => ({ ...l })), taxRate: q.taxRate, shippingFee: q.shippingFee, deliveryDays: q.deliveryDays, warrantyMonths: q.warrantyMonths });
    setEditing(true);
  };

  const flag = (f: QuotationField) =>
  q.editedFields.includes(f) ?
  <Tag tone="primary" className="h-5 px-1.5 text-[11px]">Đã sửa</Tag> :
  q.lowConfidence.includes(f) && q.status === 'extracted' ?
  <Tag tone="warning" className="h-5 px-1.5 text-[11px]" icon={<TriangleAlertIcon className="h-3 w-3" aria-hidden />}>
        AI chưa chắc
      </Tag> :
  null;

  const FileIcon = q.fileType === 'excel' ? FileSpreadsheetIcon : FileTextIcon;

  return (
    <article className={`rounded-lg border p-5 ${q.status === 'extracted' ? 'border-warning-200' : 'border-hairline'}`}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-ink-900">{supplier?.name ?? '—'}</h3>
          <p className="mt-0.5 inline-flex max-w-full items-center gap-1.5 text-xs text-ink-500">
            <FileIcon className="h-3.5 w-3.5 flex-none" aria-hidden />
            <span className="truncate">{q.fileName}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Tag tone="info">AI {formatPercent(q.aiConfidence)}</Tag>
          {q.status === 'confirmed' ?
          <Tag tone="success" icon={<CircleCheckIcon className="h-3 w-3" aria-hidden />}>Đã xác nhận</Tag> :

          <Tag tone="warning" icon={<TriangleAlertIcon className="h-3 w-3" aria-hidden />}>Cần review</Tag>
          }
        </div>
      </header>

      <div className="mt-4 space-y-3">
        {(editing ? draft.lines : q.lines).map((l, idx) => {
          const anomaly = lineAnomaly(l);
          return (
            <div key={l.itemId}>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-ink-700">
                  {l.name} <span className="text-ink-500">× {l.quantity}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  {flag('unitPrice')}
                  {editing ?
                  <input
                    type="number"
                    aria-label={`Đơn giá ${l.name}`}
                    value={l.unitPrice}
                    min={0}
                    step={1000}
                    onChange={(e) => setDraft((d) => ({ ...d, lines: d.lines.map((x, i) => i === idx ? { ...x, unitPrice: Number(e.target.value) || 0 } : x) }))}
                    className={`${inputClass()} h-8 w-36 text-right`} /> :


                  <span className="font-medium tabular-nums text-ink-900">{formatVND(l.unitPrice)}</span>
                  }
                </span>
              </div>
              {anomaly &&
              <p className="mt-1.5 flex gap-1.5 rounded-md bg-warning-50 px-2.5 py-2 text-xs text-warning-700">
                  <TriangleAlertIcon className="mt-px h-3.5 w-3.5 flex-none" aria-hidden />
                  <span>
                    Giá bất thường: cao hơn {formatPercent(anomaly.diff)} so với trung bình lịch sử {formatVND(anomaly.reference.avgUnitPrice)} ({anomaly.reference.label},{' '}
                    {anomaly.reference.samples} giao dịch, {anomaly.reference.period}). Ngưỡng cảnh báo ≥ 20%.
                  </span>
                </p>
              }
            </div>);

        })}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-hairline pt-4 text-sm sm:grid-cols-4">
        <Field label={FIELD_LABEL.taxRate} flag={flag('taxRate')}>
          {editing ?
          <NumberInput value={Math.round(draft.taxRate * 100)} suffix="%" onChange={(v) => setDraft((d) => ({ ...d, taxRate: v / 100 }))} label="Thuế %" /> :

          `${Math.round(q.taxRate * 100)}%`
          }
        </Field>
        <Field label={FIELD_LABEL.shippingFee} flag={flag('shippingFee')}>
          {editing ? <NumberInput value={draft.shippingFee} step={10000} onChange={(v) => setDraft((d) => ({ ...d, shippingFee: v }))} label="Phí vận chuyển" /> : formatVND(q.shippingFee)}
        </Field>
        <Field label={FIELD_LABEL.deliveryDays} flag={flag('deliveryDays')}>
          {editing ? <NumberInput value={draft.deliveryDays} suffix="ngày" onChange={(v) => setDraft((d) => ({ ...d, deliveryDays: v }))} label="Số ngày giao" /> : `${q.deliveryDays} ngày`}
        </Field>
        <Field label={FIELD_LABEL.warrantyMonths} flag={flag('warrantyMonths')}>
          {editing ? <NumberInput value={draft.warrantyMonths} suffix="tháng" onChange={(v) => setDraft((d) => ({ ...d, warrantyMonths: v }))} label="Bảo hành" /> : `${q.warrantyMonths} tháng`}
        </Field>
      </dl>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-4">
        <div>
          <p className="text-xs text-ink-500">Tổng tiền (gồm thuế & vận chuyển)</p>
          <p className="text-lg font-semibold tabular-nums text-ink-900">{formatVND(quotationTotal(editing ? draft : q))}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="tertiary" size="sm" icon={<EyeIcon className="h-4 w-4" aria-hidden />} onClick={onViewSource}>
            Xem file gốc
          </Button>
          {editable && (
          editing ?
          <>
                <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>
                  Hủy
                </Button>
                <Button
              size="sm"
              onClick={() => {
                if (onSave(draft)) setEditing(false);
              }}>
              
                  Lưu chỉnh sửa
                </Button>
              </> :

          <>
                <Button variant="secondary" size="sm" icon={<PencilIcon className="h-4 w-4" aria-hidden />} onClick={startEdit}>
                  Chỉnh sửa
                </Button>
                {q.status === 'extracted' &&
            <Button size="sm" icon={<CircleCheckIcon className="h-4 w-4" aria-hidden />} onClick={onConfirm}>
                    Xác nhận dữ liệu
                  </Button>
            }
              </>)
          }
        </div>
      </div>
    </article>);

}

function Field({ label, flag, children }: {label: string;flag: React.ReactNode;children: React.ReactNode;}) {
  return (
    <div>
      <dt className="flex flex-wrap items-center gap-1 text-xs text-ink-500">
        {label} {flag}
      </dt>
      <dd className="mt-0.5 font-medium tabular-nums text-ink-900">{children}</dd>
    </div>);

}

function NumberInput({ value, onChange, suffix, step = 1, label }: {value: number;onChange: (v: number) => void;suffix?: string;step?: number;label: string;}) {
  return (
    <span className="flex items-center gap-1">
      <input type="number" aria-label={label} min={0} step={step} value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} className={`${inputClass()} h-8 w-full min-w-0`} />
      {suffix && <span className="text-xs text-ink-500">{suffix}</span>}
    </span>);

}