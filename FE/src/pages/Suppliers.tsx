import React, { useMemo, useState } from 'react';
import { Building2Icon, PencilIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Supplier } from '../types/procurement';
import { useCurrentUser } from '../contexts/AuthContext';
import { useProcurement } from '../contexts/ProcurementContext';
import { useAction } from '../hooks/useAction';
import { can } from '../utils/permissions';
import { saveSupplier } from '../utils/procurementActions';
import { inputClass } from '../utils/styles';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Tag } from '../components/ui/Tag';
import { EmptyState } from '../components/ui/EmptyState';
import { SupplierDialog } from '../components/suppliers/SupplierDialog';

export function SuppliersPage() {
  const user = useCurrentUser();
  const { state } = useProcurement();
  const act = useAction();
  const canManage = can(user, 'supplier.manage');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Supplier | undefined>();
  const [open, setOpen] = useState(false);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.suppliers.filter((s) => !q || s.name.toLowerCase().includes(q) || s.taxCode.includes(q) || s.categories.some((c) => c.toLowerCase().includes(q)));
  }, [state.suppliers, query]);

  const quoteCount = (id: string) => state.quotations.filter((q) => q.supplierId === id).length;
  const poCount = (id: string) => state.orders.filter((o) => o.supplierId === id).length;

  return (
    <div>
      <PageHeader
        title="Suppliers"
        description={canManage ? 'Danh bạ nhà cung cấp dùng để thu thập Quotation.' : 'Chế độ xem — chỉ Procurement được thêm hoặc sửa Supplier.'}
        actions={
        canManage &&
        <Button
          icon={<PlusIcon className="h-4 w-4" aria-hidden />}
          onClick={() => {
            setEditing(undefined);
            setOpen(true);
          }}>
          
              Thêm Supplier
            </Button>

        } />
      

      <div className="relative mb-4 md:w-80">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden />
        <label htmlFor="sup-search" className="sr-only">
          Tìm Supplier
        </label>
        <input id="sup-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tên, mã số thuế, Category" className={`${inputClass()} pl-9`} />
      </div>

      {list.length === 0 ?
      <div className="rounded-lg border border-hairline">
          <EmptyState icon={Building2Icon} title="Không tìm thấy Supplier" />
        </div> :

      <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-hairline text-xs text-ink-500">
                <th className="py-3 pr-4 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium">Liên hệ</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 text-right font-medium">Quotation / PO</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                {canManage && <th className="py-3 pl-4"><span className="sr-only">Thao tác</span></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {list.map((s) =>
            <tr key={s.id}>
                  <td className="py-3.5 pr-4">
                    <p className="font-medium text-ink-900">{s.name}</p>
                    <p className="font-mono text-xs text-ink-500">MST {s.taxCode}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-ink-900">{s.contactName}</p>
                    <p className="text-xs text-ink-500">
                      {s.email} · {s.phone}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {s.categories.map((c) =>
                  <Tag key={c}>{c}</Tag>
                  )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right tabular-nums text-ink-700">
                    {quoteCount(s.id)} / {poCount(s.id)}
                  </td>
                  <td className="px-4 py-3.5">{s.status === 'active' ? <Tag tone="success">Hoạt động</Tag> : <Tag>Ngừng</Tag>}</td>
                  {canManage &&
              <td className="py-3.5 pl-4 text-right">
                      <Button
                  variant="tertiary"
                  size="sm"
                  icon={<PencilIcon className="h-4 w-4" aria-hidden />}
                  onClick={() => {
                    setEditing(s);
                    setOpen(true);
                  }}>
                  
                        Sửa
                      </Button>
                    </td>
              }
                </tr>
            )}
            </tbody>
          </table>
        </div>
      }

      <SupplierDialog
        open={open}
        supplier={editing}
        categories={state.categories}
        onClose={() => setOpen(false)}
        onSave={(input) => {
          const res = act(saveSupplier, input, editing?.id);
          if (res.ok) toast.success(editing ? 'Đã cập nhật Supplier.' : 'Đã thêm Supplier.');
          return res.ok;
        }} />
      
    </div>);

}