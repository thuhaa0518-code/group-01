import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { PencilIcon } from 'lucide-react';
import { useCurrentUser } from '../contexts/AuthContext';
import { useProcurement } from '../contexts/ProcurementContext';
import { can, canViewRequest, ROLE_LABEL } from '../utils/permissions';
import { prTotal, receivingProgress } from '../utils/rules';
import { AI_REVIEW_LABEL, workflowStates } from '../utils/workflow';
import { formatDate, formatDateTime, formatVND } from '../utils/format';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Alert } from '../components/ui/Alert';
import { buttonClass } from '../components/ui/Button';
import { WorkflowStepper } from '../components/workflow/WorkflowStepper';
import { AuditTimeline } from '../components/workflow/AuditTimeline';
import { BudgetPanel } from '../components/budget/BudgetPanel';
import { DecisionPanel } from '../components/approvals/DecisionPanel';
import { TraceabilityChain } from '../components/requests/TraceabilityChain';
import { UnauthorizedPage } from './Unauthorized';
import { NotFoundPage } from './NotFound';

export function RequestDetailPage() {
  const { id } = useParams();
  const user = useCurrentUser();
  const { state } = useProcurement();
  const pr = state.requests.find((r) => r.id === id);

  if (!pr) return <NotFoundPage message="Không tìm thấy Purchase Request." />;
  if (!canViewRequest(user, pr)) return <UnauthorizedPage />;

  const requester = state.users.find((u) => u.id === pr.requesterId);
  const budget = state.budgets.find((b) => b.code === pr.budgetCode);
  const quotes = state.quotations.filter((q) => q.prId === pr.id);
  const confirmed = quotes.filter((q) => q.status === 'confirmed').length;
  const selectedQuote = quotes.find((q) => q.id === pr.selectedQuotationId);
  const po = state.orders.find((o) => o.prId === pr.id);
  const rcvs = po ? state.receivings.filter((r) => r.poId === po.id) : [];
  const progress = po ? receivingProgress(po, state.receivings) : undefined;
  const supplierName = (sid?: string) => state.suppliers.find((s) => s.id === sid)?.name ?? '—';
  const ids = new Set([pr.id, po?.id, ...quotes.map((q) => q.id)].filter(Boolean) as string[]);
  const audit = state.audit.filter((a) => ids.has(a.entityId));
  const total = prTotal(pr);
  const isOwner = pr.requesterId === user.id;
  const committed = !['draft', 'revision', 'pending_manager', 'finance_review', 'rejected'].includes(pr.status);

  return (
    <div>
      <PageHeader
        back={{ to: user.role === 'manager' ? '/approvals' : user.role === 'finance' && pr.status === 'finance_review' ? '/budget' : '/requests', label: 'Quay lại' }}
        meta={
        <>
            <span className="font-mono text-sm text-ink-500">{pr.id}</span>
            <StatusBadge status={pr.status} />
          </>
        }
        title={pr.title}
        description={`${requester?.name ?? '—'} · ${pr.department} · Tạo ${formatDateTime(pr.createdAt)}`}
        actions={
        <>
            {isOwner && (pr.status === 'draft' || pr.status === 'revision') &&
          <Link to={`/requests/${pr.id}/edit`} className={buttonClass(pr.status === 'revision' ? 'primary' : 'secondary')}>
                <PencilIcon className="h-4 w-4" aria-hidden />
                {pr.status === 'revision' ? 'Chỉnh sửa & gửi lại' : 'Hoàn thiện & Submit'}
              </Link>
          }
            {can(user, 'sourcing.manage') && (pr.status === 'approved' || pr.status === 'supplier_selected') &&
          <Link to={`/sourcing/${pr.id}`} className={buttonClass('primary')}>
                Mở Sourcing
              </Link>
          }
            {po &&
          <Link to={`/orders/${po.id}`} className={buttonClass('secondary')}>
                Xem {po.id}
              </Link>
          }
          </>
        } />
      

      <div className="space-y-3">
        {pr.status === 'revision' && pr.lastReason &&
        <Alert tone="warning" title="Cần chỉnh sửa trước khi gửi lại">
            {pr.lastReason}
          </Alert>
        }
        {pr.status === 'rejected' && pr.lastReason &&
        <Alert tone="error" title="PR đã bị Reject">
            {pr.lastReason}
          </Alert>
        }
        {pr.status === 'finance_review' &&
        <Alert tone="info" title="Đang chờ Finance kiểm tra Budget">
            {pr.lastReason ?? 'Manager đã chuyển PR sang Finance.'}
          </Alert>
        }
        {pr.status === 'draft' && <Alert tone="info" title="PR chưa được Submit">Hoàn thiện các trường bắt buộc và Submit để bắt đầu quy trình phê duyệt.</Alert>}
      </div>

      <section className="mt-6 rounded-lg border border-hairline p-5" aria-label="Tiến độ quy trình">
        <WorkflowStepper states={workflowStates(pr.status, confirmed)} />
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <section aria-labelledby="info-title">
            <h2 id="info-title" className="text-xl font-semibold text-ink-900">
              Thông tin yêu cầu
            </h2>
            <dl className="mt-4 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
              <Info label="Category" value={pr.category || '—'} />
              <Info label="Cost centre / Budget code" value={`${pr.costCenter || '—'} · ${pr.budgetCode || '—'}`} />
              <Info label="Required-by date" value={formatDate(pr.requiredBy)} />
              <Info label="Delivery location" value={pr.deliveryLocation || '—'} />
              <Info label="Review AI" value={AI_REVIEW_LABEL[pr.aiReview]} />
              <Info label="Cập nhật" value={formatDateTime(pr.updatedAt)} />
              <div className="sm:col-span-2">
                <dt className="text-xs text-ink-500">Business justification</dt>
                <dd className="mt-0.5 leading-6 text-ink-900">{pr.justification || '—'}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="items-title">
            <h2 id="items-title" className="text-xl font-semibold text-ink-900">
              Sản phẩm / dịch vụ
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-hairline text-xs text-ink-500">
                    <th className="py-2 pr-4 font-medium">Sản phẩm & thông số</th>
                    <th className="px-4 py-2 text-right font-medium">SL</th>
                    <th className="px-4 py-2 text-right font-medium">Đơn giá dự toán</th>
                    <th className="py-2 pl-4 text-right font-medium">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {pr.items.map((i) =>
                  <tr key={i.id}>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-ink-900">{i.name || '—'}</p>
                        <p className="text-xs text-ink-500">{i.specs || 'Chưa có thông số'}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                        {i.quantity} {i.unit}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{formatVND(i.estUnitPrice)}</td>
                      <td className="whitespace-nowrap py-3 pl-4 text-right font-medium tabular-nums">{formatVND(i.quantity * i.estUnitPrice)}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t border-line">
                    <td colSpan={3} className="py-3 pr-4 text-right text-sm font-medium text-ink-700">
                      Tổng dự toán
                    </td>
                    <td className="whitespace-nowrap py-3 pl-4 text-right text-base font-semibold tabular-nums text-ink-900">{formatVND(total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <section aria-labelledby="trace-title">
            <h2 id="trace-title" className="text-xl font-semibold text-ink-900">
              Truy vết
            </h2>
            <p className="mt-1 text-sm text-ink-500">PR ↔ Quotation ↔ PO ↔ Receiving</p>
            <div className="mt-4">
              <TraceabilityChain
                nodes={[
                { label: 'Purchase Request', value: pr.id, sub: formatVND(total), done: true },
                {
                  label: 'Quotation',
                  value: selectedQuote ? supplierName(selectedQuote.supplierId) : quotes.length ? `${quotes.length} báo giá` : 'Chưa có',
                  sub: selectedQuote ? 'Đã chọn Supplier' : quotes.length ? `${confirmed} đã xác nhận` : undefined,
                  to: can(user, 'sourcing.manage') ? `/sourcing/${pr.id}` : undefined,
                  done: quotes.length > 0
                },
                { label: 'Purchase Order', value: po?.id ?? 'Chưa tạo', sub: po ? formatVND(po.total) : undefined, to: po ? `/orders/${po.id}` : undefined, done: Boolean(po) },
                {
                  label: 'Receiving',
                  value: progress ? `${progress.received}/${progress.ordered} đã nhận` : 'Chưa nhận',
                  sub: rcvs.length ? `${rcvs.length} lần ghi nhận${po?.reconciled ? ' · đã đối soát' : ''}` : undefined,
                  to: po ? `/orders/${po.id}` : undefined,
                  done: rcvs.length > 0
                }]
                } />
              
            </div>
          </section>

          <section aria-labelledby="audit-title">
            <h2 id="audit-title" className="text-xl font-semibold text-ink-900">
              Audit Trail
            </h2>
            <p className="mb-5 mt-1 text-sm text-ink-500">Người thực hiện, thời điểm, trạng thái trước/sau và lý do.</p>
            <AuditTimeline entries={audit} />
          </section>
        </div>

        <aside className="space-y-8 lg:sticky lg:top-8 lg:self-start">
          <DecisionPanel pr={pr} budget={budget} />
          {user.role !== 'procurement' &&
          <div className="rounded-lg bg-canvas p-5">
              <BudgetPanel budget={budget} amount={total} committed={committed} />
            </div>
          }
          <div className="text-xs text-ink-500">
            Người tạo: {requester?.name} ({requester ? ROLE_LABEL[requester.role] : '—'})
          </div>
        </aside>
      </div>
    </div>);

}

function Info({ label, value }: {label: string;value: string;}) {
  return (
    <div>
      <dt className="text-xs text-ink-500">{label}</dt>
      <dd className="mt-0.5 text-ink-900">{value}</dd>
    </div>);

}