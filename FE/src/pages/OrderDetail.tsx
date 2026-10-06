import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useCurrentUser } from '../contexts/AuthContext';
import { useProcurement } from '../contexts/ProcurementContext';
import { useAction } from '../hooks/useAction';
import { can, canViewOrderOf } from '../utils/permissions';
import { closePR, reconcilePO, recordReceiving } from '../utils/procurementActions';
import { linesSubtotal, receivedByItem, receivingProgress } from '../utils/rules';
import { formatDate, formatDateTime, formatVND } from '../utils/format';
import { PageHeader } from '../components/ui/PageHeader';
import { POStatusBadge } from '../components/ui/StatusBadge';
import { Tag } from '../components/ui/Tag';
import { Alert } from '../components/ui/Alert';
import { buttonClass } from '../components/ui/Button';
import { TraceabilityChain } from '../components/requests/TraceabilityChain';
import { ReceivingForm } from '../components/orders/ReceivingForm';
import { ReconciliationPanel } from '../components/orders/ReconciliationPanel';
import { AuditTimeline } from '../components/workflow/AuditTimeline';
import { UnauthorizedPage } from './Unauthorized';
import { NotFoundPage } from './NotFound';

const RCV_LABEL = { full: 'Nhận đủ', partial: 'Nhận một phần', discrepancy: 'Sai lệch' } as const;
const RCV_TONE = { full: 'success', partial: 'info', discrepancy: 'warning' } as const;

export function OrderDetailPage() {
  const { id } = useParams();
  const user = useCurrentUser();
  const { state } = useProcurement();
  const act = useAction();

  const po = state.orders.find((o) => o.id === id);
  if (!po) return <NotFoundPage message="Không tìm thấy Purchase Order." />;
  const pr = state.requests.find((r) => r.id === po.prId);
  if (!pr || !canViewOrderOf(user, pr)) return <UnauthorizedPage />;

  const supplier = state.suppliers.find((s) => s.id === po.supplierId);
  const rcvs = state.receivings.filter((r) => r.poId === po.id).sort((a, b) => a.receivedAt.localeCompare(b.receivedAt));
  const received = receivedByItem(po.id, state.receivings);
  const progress = receivingProgress(po, state.receivings);
  const nameOf = (uid?: string) => state.users.find((u) => u.id === uid)?.name ?? '—';
  const canReceive = can(user, 'receiving.record') && (po.status === 'issued' || po.status === 'partially_received');
  const audit = state.audit.filter((a) => a.entityId === po.id || a.entityId === pr.id);

  return (
    <div>
      <PageHeader
        back={{ to: '/orders', label: 'Purchase Orders' }}
        meta={<POStatusBadge status={po.status} />}
        title={po.id}
        description={`${supplier?.name} · Tạo ${formatDateTime(po.createdAt)} bởi ${nameOf(po.createdBy)} · Giao dự kiến ${formatDate(po.expectedDelivery)}`}
        actions={
        <Link to={`/requests/${pr.id}`} className={buttonClass('secondary')}>
            Xem {pr.id}
          </Link>
        } />
      

      <TraceabilityChain
        nodes={[
        { label: 'Purchase Request', value: pr.id, sub: pr.title, to: `/requests/${pr.id}`, done: true },
        { label: 'Quotation đã chọn', value: supplier?.name ?? '—', sub: state.quotations.find((q) => q.id === po.quotationId)?.fileName, to: can(user, 'sourcing.manage') ? `/sourcing/${pr.id}` : undefined, done: true },
        { label: 'Purchase Order', value: po.id, sub: formatVND(po.total), done: true },
        { label: 'Receiving', value: `${progress.received}/${progress.ordered} đã nhận`, sub: `${rcvs.length} lần ghi nhận`, done: rcvs.length > 0 }]
        } />
      

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <section aria-labelledby="lines-title">
            <h2 id="lines-title" className="text-xl font-semibold text-ink-900">
              Dòng hàng
            </h2>
            <div className="mt-4 rounded-lg border border-line bg-surface p-5 shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-line bg-canvas text-xs text-ink-500">
                      <th className="py-3 px-4 font-medium">Hàng hóa</th>
                      <th className="px-4 py-3 text-right font-medium">Đặt</th>
                      <th className="px-4 py-3 text-right font-medium">Đã nhận</th>
                      <th className="px-4 py-3 text-right font-medium">Đơn giá</th>
                      <th className="py-3 px-4 text-right font-medium">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {po.lines.map((l) => (
                      <tr key={l.itemId}>
                        <td className="py-3.5 px-4 font-medium text-ink-900">{l.name}</td>
                        <td className="px-4 py-3.5 text-right tabular-nums">{l.quantity}</td>
                        <td className={`px-4 py-3.5 text-right tabular-nums ${(received[l.itemId] ?? 0) >= l.quantity ? 'text-success-600 font-semibold' : 'text-ink-900'}`}>
                          {received[l.itemId] ?? 0}
                        </td>
                        <td className="px-4 py-3.5 text-right tabular-nums whitespace-nowrap">{formatVND(l.unitPrice)}</td>
                        <td className="py-3.5 px-4 text-right tabular-nums whitespace-nowrap font-medium text-ink-900">{formatVND(l.unitPrice * l.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bảng tổng hợp chi phí đơn hàng thiết kế chuẩn Doanh nghiệp */}
              <div className="mt-6 border-t border-line pt-4 space-y-2.5 text-sm max-w-sm ml-auto">
                <div className="flex justify-between items-center text-ink-600">
                  <span>Tạm tính (Tiền hàng)</span>
                  <span className="tabular-nums whitespace-nowrap font-medium text-ink-900">{formatVND(linesSubtotal(po.lines))}</span>
                </div>
                <div className="flex justify-between items-center text-ink-600">
                  <span>Thuế VAT ({Math.round(po.taxRate * 100)}%)</span>
                  <span className="tabular-nums whitespace-nowrap font-medium text-ink-900">
                    {formatVND(linesSubtotal(po.lines) * po.taxRate)}
                  </span>
                </div>
                {po.shippingFee > 0 && (
                  <div className="flex justify-between items-center text-ink-600">
                    <span>Phí vận chuyển</span>
                    <span className="tabular-nums whitespace-nowrap font-medium text-ink-900">{formatVND(po.shippingFee)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-dashed border-line pt-3 mt-3">
                  <span className="text-base font-semibold text-ink-900">Tổng cộng PO</span>
                  <span className="text-xl font-bold text-primary-700 tabular-nums whitespace-nowrap">
                    {formatVND(po.total)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section aria-labelledby="history-title">
            <h2 id="history-title" className="text-xl font-semibold text-ink-900">
              Lịch sử Receiving
            </h2>
            {rcvs.length === 0 ?
            <p className="mt-3 text-sm text-ink-500">Chưa có lần nhận hàng nào.</p> :

            <ul className="mt-4 divide-y divide-hairline border-y border-hairline">
                {rcvs.map((r) =>
              <li key={r.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-ink-900">
                        {r.id} · {r.lines.map((l) => `${l.quantity} ${po.lines.find((p) => p.itemId === l.itemId)?.name ?? ''}`).join(', ')}
                      </p>
                      <p className="text-xs text-ink-500">
                        {nameOf(r.receivedBy)} · {formatDateTime(r.receivedAt)}
                      </p>
                      {r.note && <p className="mt-1 text-sm text-ink-700">{r.note}</p>}
                    </div>
                    <Tag tone={RCV_TONE[r.type]}>{RCV_LABEL[r.type]}</Tag>
                  </li>
              )}
              </ul>
            }
          </section>

          <ReconciliationPanel
            pr={pr}
            po={po}
            receivings={state.receivings}
            canReconcile={can(user, 'reconcile')}
            canClose={can(user, 'pr.close')}
            reconcilerName={po.reconciledBy ? nameOf(po.reconciledBy) : undefined}
            onReconcile={(note) => {
              const res = act(reconcilePO, po.id, note);
              if (res.ok) toast.success('Đã xác nhận đối soát.');
              return res.ok;
            }}
            onClose={() => {
              const res = act(closePR, pr.id);
              if (res.ok) toast.success(`${pr.id} đã được Close.`);
              return res.ok;
            }} />
          

          <section aria-labelledby="po-audit">
            <h2 id="po-audit" className="mb-5 text-xl font-semibold text-ink-900">
              Audit Trail
            </h2>
            <AuditTimeline entries={audit} showEntity />
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          {canReceive ?
          <ReceivingForm
            po={po}
            received={received}
            onSubmit={(lines, note, discrepancy) => {
              const res = act(recordReceiving, po.id, lines, note, discrepancy);
              if (res.ok) toast.success('Đã ghi nhận Receiving.');
              return res.ok;
            }} /> :

          po.status === 'issued' || po.status === 'partially_received' ?
          <Alert tone="info" title="Đang chờ ghi nhận Receiving">
              {user.role === 'procurement' || user.role === 'finance' ?
            'Người nhận hàng được phân quyền sẽ ghi nhận khi hàng về. Bạn theo dõi tiến độ tại đây.' :
            'Bạn chưa được phân quyền ghi nhận Receiving. Liên hệ Admin nếu cần.'}
            </Alert> :
          null}
        </aside>
      </div>
    </div>);

}