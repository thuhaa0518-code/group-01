import React, { useRef, useState } from 'react';
import { UploadIcon } from 'lucide-react';
import type { Supplier } from '../../types/procurement';
import { inputClass } from '../../utils/styles';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';

interface AddQuotationPanelProps {
  suppliers: Supplier[];
  category: string;
  usedSupplierIds: string[];
  onAdd: (supplierId: string, fileName: string) => boolean;
}

export function AddQuotationPanel({ suppliers, category, usedSupplierIds, onAdd }: AddQuotationPanelProps) {
  const [supplierId, setSupplierId] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{supplier?: string;file?: string;}>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const available = suppliers.filter((s) => s.status === 'active' && !usedSupplierIds.includes(s.id));
  const matching = available.filter((s) => s.categories.includes(category));
  const others = available.filter((s) => !s.categories.includes(category));

  const submit = () => {
    const next: typeof errors = {};
    if (!supplierId) next.supplier = 'Chọn Supplier.';
    if (!fileName) next.file = 'Tải lên file Quotation (PDF/Excel).';else
    if (!/\.(pdf|xlsx|xls)$/i.test(fileName)) next.file = 'Chỉ hỗ trợ PDF hoặc Excel.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    window.setTimeout(() => {
      const ok = onAdd(supplierId, fileName);
      setLoading(false);
      if (ok) {
        setSupplierId('');
        setFileName('');
        if (fileRef.current) fileRef.current.value = '';
      }
    }, 1200);
  };

  return (
    <div className="rounded-lg border border-dashed border-line p-5">
      <h3 className="font-semibold text-ink-900">Thêm Quotation</h3>
      <p className="mt-0.5 text-sm text-ink-500">AI sẽ trích xuất đơn giá, thuế, phí vận chuyển, thời gian giao và bảo hành. Bạn review trước khi dùng.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <FormField label="Supplier" htmlFor="q-supplier" required error={errors.supplier}>
          <select id="q-supplier" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className={inputClass(Boolean(errors.supplier))} disabled={loading}>
            <option value="">Chọn Supplier</option>
            {matching.length > 0 &&
            <optgroup label={`Cung cấp ${category}`}>
                {matching.map((s) =>
              <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
              )}
              </optgroup>
            }
            {others.length > 0 &&
            <optgroup label="Supplier khác">
                {others.map((s) =>
              <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
              )}
              </optgroup>
            }
          </select>
        </FormField>
        <FormField label="File Quotation" htmlFor="q-file" required error={errors.file} hint="PDF, XLSX hoặc XLS">
          <input
            ref={fileRef}
            id="q-file"
            type="file"
            accept=".pdf,.xlsx,.xls"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
            disabled={loading}
            className="block w-full text-sm text-ink-700 file:mr-3 file:h-10 file:cursor-pointer file:rounded-md file:border file:border-line file:bg-white file:px-3 file:text-sm file:font-semibold file:text-ink-900 hover:file:bg-canvas" />
          
        </FormField>
      </div>
      <Button className="mt-4" icon={<UploadIcon className="h-4 w-4" aria-hidden />} onClick={submit} loading={loading}>
        {loading ? 'AI đang trích xuất dữ liệu…' : 'Tải lên & trích xuất'}
      </Button>
    </div>);

}