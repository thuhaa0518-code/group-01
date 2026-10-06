import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackageIcon } from 'lucide-react';
import type { PurchaseOrder } from '../types/procurement';
import { useCurrentUser } from '../contexts/AuthContext';
import { useProcurement } from '../contexts/ProcurementContext';
import { canViewOrderOf } from '../utils/permissions';
import { receivingProgress } from '../utils/rules';
import { formatDate, formatVND } from '../utils/format';
import { PageHeader } from '../components/ui/PageHeader';
import { POStatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { Tag } from '../components/ui/Tag';

type Tab = 'delivering' | 'awaiting' | 'closed';

const TABS: {key: Tab;label: string;match: (o: PurchaseOrder) => boolean;}[] = [
{ key: 'delivering', label: 'Đang giao', match: (o) => o.status === 'issued' || o.status === 'partially_received' },
{ key: 'awaiting', label: 'Received · chờ Close', match: (o) => o.status === 'received' },
{ key: 'closed', label: 'Closed', match: (o) => o.status === 'closed' }];


export function OrdersPage() {
  const user = useCurrentUser();
  const { state } = useProcurement();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('delivering');

  const visible = useMemo(() => state.orders.filter((o) => canViewOrderOf(user, state.requests.find((r) => r.id === o.prId))), [state, user]);
  const list = visible.filter(TABS.find((t) => t.key === tab)!.match).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <PageHeader title="Purchase Orders & Receiving" description="Theo dõi giao hàng, ghi nhận Receiving, đối soát PR ↔ PO ↔ Receiving và Close." />

      <div role="tablist" aria-label="Trạng thái PO" className="mb-4 flex gap-6 overflow-x-auto border-b border-hairline">
        {TABS.map((t) =>
        <button
          key={t.key}
          role="tab"
          aria-selected={tab === t.key}
          onClick={() => setTab(t.key)}
          className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-sm font-semibold transition-colors duration-150 ${tab === t.key ? 'border-primary-600 text-primary-700' : 'border-transparent text-ink-500 hover:text-ink-900'}`}>
          
            {t.label} ({visible.filter(t.match).length})
          </button>
        )}
      </div>

      {list.length === 0 ?
      <div className="rounded-lg border border-hairline">
          <EmptyState icon={PackageIcon} title="Không có Purchase Order" description="PO trong phạm vi của bạn sẽ xuất hiện tại đây." />
        </div> :

      <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-hairline text-xs text-ink-500">
                <th className="py-3 pr-4 font-medium">PO / PR</th>
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 text-right font-medium">Giá trị</th>
                <th className="px-4 py-3 font-medium">Receiving</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="py-3 pl-4 font-medium">Giao dự kiến</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {list.map((o) => {
              const pr = state.requests.find((r) => r.id === o.prId);
              const p = receivingProgress(o, state.receivings);
              const hasException = state.receivings.some((r) => r.poId === o.id && r.type === 'discrepancy');
              return (
                <tr key={o.id} onClick={() => navigate(`/orders/${o.id}`)} className="cursor-pointer transition-colors duration-150 hover:bg-canvas">
                    <td className="py-3.5 pr-4">
                      <button type="button" onClick={() => navigate(`/orders/${o.id}`)} className="text-left">
                        <span className="block font-mono text-sm font-medium text-ink-900">{o.id}</span>
                        <span className="block max-w-[260px] truncate text-xs text-ink-500">
                          {o.prId} · {pr?.title}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-ink-900">{state.suppliers.find((s) => s.id === o.supplierId)?.name}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right font-medium tabular-nums">{formatVND(o.total)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-hairline">
                          <span className="block h-full bg-success-600" style={{ width: `${p.received / p.ordered * 100}%` }} />
                        </div>
                        <span className="text-xs tabular-nums text-ink-700">
                          {p.received}/{p.ordered}
                        </span>
                      </div>
                      {hasException && <Tag tone="warning" className="mt-1">Có sai lệch</Tag>}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col items-start gap-1">
                        <POStatusBadge status={o.status} />
                        {o.status === 'received' && <span className="text-xs text-ink-500">{o.reconciled ? 'Đã đối soát' : 'Chờ đối soát'}</span>}
                      </div>
                    </td>
                    <td className="whitespace-nowrap py-3.5 pl-4 text-ink-700">{formatDate(o.expectedDelivery)}</td>
                  </tr>);

            })}
            </tbody>
          </table>
        </div>
      }
    </div>);

}