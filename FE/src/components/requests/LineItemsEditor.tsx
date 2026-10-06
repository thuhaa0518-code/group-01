import React from 'react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import type { LineItem } from '../../types/procurement';
import { inputClass } from '../../utils/styles';
import { formatVND } from '../../utils/format';
import { Button } from '../ui/Button';

interface LineItemsEditorProps {
  items: LineItem[];
  errors: Record<string, string>;
  onChange: (id: string, patch: Partial<LineItem>) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}

export function LineItemsEditor({ items, errors, onChange, onAdd, onRemove }: LineItemsEditorProps) {
  return (
    <div>
      <ol className="space-y-4">
        {items.map((item, idx) => {
          const err = (f: string) => errors[`item.${item.id}.${f}`];
          return (
            <li key={item.id} className="rounded-lg border border-hairline p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-ink-900">Dòng {idx + 1}</p>
                {items.length > 1 &&
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="rounded-md p-1.5 text-ink-500 transition-colors duration-150 hover:bg-danger-50 hover:text-danger-600"
                  aria-label={`Xóa dòng ${idx + 1}`}>
                  
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                }
              </div>
              <div className="grid gap-3 md:grid-cols-12">
                <div className="md:col-span-12">
                  <label htmlFor={`name-${item.id}`} className="mb-1 block text-xs font-medium text-ink-700">
                    Sản phẩm / dịch vụ <span className="text-danger-600">*</span>
                  </label>
                  <input id={`name-${item.id}`} value={item.name} onChange={(e) => onChange(item.id, { name: e.target.value })} className={inputClass(Boolean(err('name')))} />
                  {err('name') && <p className="mt-1 text-xs text-danger-600">{err('name')}</p>}
                </div>
                <div className="md:col-span-12">
                  <label htmlFor={`specs-${item.id}`} className="mb-1 block text-xs font-medium text-ink-700">
                    Thông số kỹ thuật <span className="text-danger-600">*</span>
                  </label>
                  <input
                    id={`specs-${item.id}`}
                    value={item.specs}
                    onChange={(e) => onChange(item.id, { specs: e.target.value })}
                    placeholder="VD: CPU, RAM, kích thước, chất liệu, bảo hành…"
                    className={inputClass(Boolean(err('specs')))} />
                  
                  {err('specs') && <p className="mt-1 text-xs text-danger-600">{err('specs')}</p>}
                </div>
                <div className="md:col-span-3">
                  <label htmlFor={`qty-${item.id}`} className="mb-1 block text-xs font-medium text-ink-700">
                    Số lượng <span className="text-danger-600">*</span>
                  </label>
                  <input
                    id={`qty-${item.id}`}
                    type="number"
                    min={1}
                    value={item.quantity || ''}
                    onChange={(e) => onChange(item.id, { quantity: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                    className={inputClass(Boolean(err('quantity')))} />
                  
                  {err('quantity') && <p className="mt-1 text-xs text-danger-600">{err('quantity')}</p>}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor={`unit-${item.id}`} className="mb-1 block text-xs font-medium text-ink-700">
                    Đơn vị
                  </label>
                  <input id={`unit-${item.id}`} value={item.unit} onChange={(e) => onChange(item.id, { unit: e.target.value })} className={inputClass()} />
                </div>
                <div className="md:col-span-4">
                  <label htmlFor={`price-${item.id}`} className="mb-1 block text-xs font-medium text-ink-700">
                    Đơn giá dự toán (₫) <span className="text-danger-600">*</span>
                  </label>
                  <input
                    id={`price-${item.id}`}
                    type="number"
                    min={0}
                    step={1000}
                    value={item.estUnitPrice || ''}
                    onChange={(e) => onChange(item.id, { estUnitPrice: Math.max(0, Number(e.target.value) || 0) })}
                    className={inputClass(Boolean(err('estUnitPrice')))} />
                  
                  {err('estUnitPrice') && <p className="mt-1 text-xs text-danger-600">{err('estUnitPrice')}</p>}
                </div>
                <div className="flex flex-col justify-end md:col-span-3">
                  <p className="text-xs text-ink-500">Thành tiền</p>
                  <p className="h-10 text-sm font-semibold leading-10 tabular-nums text-ink-900">{formatVND(item.quantity * item.estUnitPrice)}</p>
                </div>
              </div>
            </li>);

        })}
      </ol>
      {errors.items && <p className="mt-2 text-xs text-danger-600">{errors.items}</p>}
      <Button variant="secondary" size="sm" className="mt-4" icon={<PlusIcon className="h-4 w-4" aria-hidden />} onClick={onAdd}>
        Thêm dòng
      </Button>
    </div>);

}