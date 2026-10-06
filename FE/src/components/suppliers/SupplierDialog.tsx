import React, { useEffect, useState } from 'react';
import type { Supplier } from '../../types/procurement';
import { inputClass } from '../../utils/styles';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';

interface SupplierDialogProps {
  open: boolean;
  supplier?: Supplier;
  categories: string[];
  onClose: () => void;
  onSave: (input: Omit<Supplier, 'id'>) => boolean;
}

const EMPTY: Omit<Supplier, 'id'> = { name: '', taxCode: '', contactName: '', email: '', phone: '', categories: [], status: 'active' };

export function SupplierDialog({ open, supplier, categories, onClose, onSave }: SupplierDialogProps) {
  const [v, setV] = useState<Omit<Supplier, 'id'>>(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (supplier) {
        const { id: _id, ...rest } = supplier;
        setV({ ...rest, categories: [...rest.categories] });
      } else setV(EMPTY);
    }
  }, [open, supplier]);

  const set = <K extends keyof typeof v,>(k: K, val: (typeof v)[K]) => setV((p) => ({ ...p, [k]: val }));
  const toggleCat = (c: string) => set('categories', v.categories.includes(c) ? v.categories.filter((x) => x !== c) : [...v.categories, c]);

  const submit = () => {
    setLoading(true);
    window.setTimeout(() => {
      const ok = onSave(v);
      setLoading(false);
      if (ok) onClose();
    }, 300);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={supplier ? 'Cập nhật Supplier' : 'Thêm Supplier'}
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={submit} loading={loading}>
            Lưu Supplier
          </Button>
        </>
      }>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Tên Supplier" htmlFor="s-name" required className="sm:col-span-2">
          <input id="s-name" value={v.name} onChange={(e) => set('name', e.target.value)} className={inputClass()} />
        </FormField>
        <FormField label="Mã số thuế" htmlFor="s-tax" required hint="10 hoặc 13 chữ số">
          <input id="s-tax" inputMode="numeric" value={v.taxCode} onChange={(e) => set('taxCode', e.target.value)} className={inputClass()} />
        </FormField>
        <FormField label="Người liên hệ" htmlFor="s-contact">
          <input id="s-contact" value={v.contactName} onChange={(e) => set('contactName', e.target.value)} className={inputClass()} />
        </FormField>
        <FormField label="Email" htmlFor="s-email" required>
          <input id="s-email" type="email" value={v.email} onChange={(e) => set('email', e.target.value)} className={inputClass()} />
        </FormField>
        <FormField label="Điện thoại" htmlFor="s-phone">
          <input id="s-phone" value={v.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass()} />
        </FormField>
        <fieldset className="sm:col-span-2">
          <legend className="mb-1.5 text-sm font-medium text-ink-700">
            Category cung cấp <span className="text-danger-600">*</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const on = v.categories.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleCat(c)}
                  className={`h-8 rounded-full border px-3 text-sm transition-colors duration-150 ${on ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-line text-ink-700 hover:bg-canvas'}`}>
                  
                  {c}
                </button>);

            })}
          </div>
        </fieldset>
        <label className="inline-flex items-center gap-2 text-sm text-ink-700 sm:col-span-2">
          <input
            type="checkbox"
            checked={v.status === 'active'}
            onChange={(e) => set('status', e.target.checked ? 'active' : 'inactive')}
            className="h-4 w-4 rounded border-line text-primary-600 focus:ring-primary-600" />
          
          Đang hoạt động (có thể nhận yêu cầu báo giá)
        </label>
      </div>
    </Modal>);

}