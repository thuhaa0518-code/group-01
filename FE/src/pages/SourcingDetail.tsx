import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useProcurement } from '../contexts/ProcurementContext';
import { useAction } from '../hooks/useAction';
import { addQuotation, confirmQuotation, createPO, selectSupplier, updateQuotation } from '../utils/procurementActions';
import { MIN_QUOTATIONS, prTotal, quotationTotal, recommend } from '../utils/rules';
import { workflowStates } from '../utils/workflow';
import { formatDate, formatVND } from '../utils/format';
import type { Quotation } from '../types/procurement';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Alert } from '../components/ui/Alert';
import { ReasonDialog } from '../components/ui/ReasonDialog';
import { buttonClass } from '../components/ui/Button';
import { WorkflowStepper } from '../components/workflow/WorkflowStepper';
import { QuotationCard } from '../components/sourcing/QuotationCard';
import { AddQuotationPanel } from '../components/sourcing/AddQuotationPanel';
import { SourceFileDialog } from '../components/sourcing/SourceFileDialog';
import { ComparisonMatrix } from '../components/sourcing/ComparisonMatrix';
import { RecommendationPanel } from '../components/sourcing/RecommendationPanel';
import { CreatePOPanel } from '../components/sourcing/CreatePOPanel';
import { NotFoundPage } from './NotFound';

export function SourcingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useProcurement();
  const act = useAction();
  const [sourceQ, setSourceQ] = useState<Quotation | null>(null);
  const [selectQ, setSelectQ] = useState<Quotation | null>(null);

  const pr = state.requests.find((r) => r.id === id);
  if (!pr) return <NotFoundPage message="Không tìm thấy Purchase Request." />;

  const sourcingOpen = pr.status === 'approved';
  const allowed = ['approved', 'supplier_selected', 'po_created', 'partially_received', 'received', 'closed'].includes(pr.status);
  const quotes = state.quotations.filter((q) => q.prId === pr.id);
  const confirmed = quotes.filter((q) => q.status === 'confirmed');
  const pendingReview = quotes.length - confirmed.length;
  const rec = recommend(confirmed);
  const supplierOf = (q?: Quotation) => state.suppliers.find((s) => s.id === q?.supplierId);
  const selected = quotes.find((q) => q.id === pr.selectedQuotationId);
  const po = state.orders.find((o) => o.prId === pr.id);

  const onAdd = (supplierId: string, fileName: string) => {
    const res = act(addQuotation, pr.id, supplierId, fileName);
    if (res.ok) toast.success('AI đã trích xuất dữ liệu. Vui lòng review và xác nhận.');
    return res.ok;
  };

  const onSelectConfirm = (note: string) => {
    if (!selectQ) return false;
    const res = act(selectSupplier, pr.id, selectQ.id, note);
    if (res.ok) toast.success(`Đã chọn ${supplierOf(selectQ)?.name}.`);
    return res.ok;
  };

  const onCreatePO = (date: string) => {
    const res = act(createPO, pr.id, date);
    if (res.ok) {
      toast.success(`Đã tạo ${res.id}.`);
      navigate(`/orders/${res.id}`);
    }
    return res.ok;
  };

  return (
    <div>
      <PageHeader
        back={{ to: '/sourcing', label: 'Sourcing' }}
        meta={
        <>
            <span className="font-mono text-sm text-ink-500">{pr.id}</span>
            <StatusBadge status={pr.status} />
          </>
        }
        title={pr.title}
        description={`${pr.category} · ${pr.items.map((i) => `${i.quantity} ${i.unit} ${i.name}`).join('; ')} · Dự toán ${formatVND(prTotal(pr))} · Cần trước ${formatDate(pr.requiredBy)}`}
        actions={
        <Link to={`/requests/${pr.id}`} className={buttonClass('secondary')}>
            Xem PR
          </Link>
        } />
      

      {!allowed ?
      <Alert tone="blocked" title="PR chưa được phê duyệt">
          Chỉ thu thập Quotation sau khi PR hoàn tất bước Approve (REQ-BR-02, CON-01).
        </Alert> :

      <>
          <section className="rounded-lg border border-hairline p-5" aria-label="Tiến độ quy trình">
            <WorkflowStepper states={workflowStates(pr.status, confirmed.length)} />
          </section>

          <section className="mt-10" aria-labelledby="quotes-title">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="quotes-title" className="text-xl font-semibold text-ink-900">
                1. Collect Quotations
              </h2>
              <p className="text-sm text-ink-500">
                {confirmed.length}/{MIN_QUOTATIONS} tối thiểu đã xác nhận{pendingReview ? ` · ${pendingReview} chờ review` : ''}
              </p>
            </div>
            {pendingReview > 0 && sourcingOpen &&
          <Alert tone="warning" title="Có dữ liệu AI chưa được review" className="mt-4">
                Mở file gốc để đối chiếu, chỉnh sửa nếu AI đọc sai và bấm “Xác nhận dữ liệu”. Chỉ Quotation đã xác nhận mới được đưa vào so sánh.
              </Alert>
          }
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {quotes.map((q) =>
            <QuotationCard
              key={q.id}
              quotation={q}
              supplier={supplierOf(q)}
              editable={sourcingOpen}
              onViewSource={() => setSourceQ(q)}
              onConfirm={() => {
                const res = act(confirmQuotation, q.id);
                if (res.ok) toast.success('Đã xác nhận dữ liệu Quotation.');
              }}
              onSave={(patch) => {
                const res = act(updateQuotation, q.id, patch);
                if (res.ok) toast.success('Đã lưu chỉnh sửa. Vui lòng xác nhận lại dữ liệu.');
                return res.ok;
              }} />

            )}
            </div>
            {sourcingOpen &&
          <div className="mt-4">
                <AddQuotationPanel suppliers={state.suppliers} category={pr.category} usedSupplierIds={quotes.map((q) => q.supplierId)} onAdd={onAdd} />
              </div>
          }
          </section>

          <section className="mt-12" aria-labelledby="compare-title">
            <h2 id="compare-title" className="text-xl font-semibold text-ink-900">
              2. Compare & chọn Supplier
            </h2>
            {confirmed.length < MIN_QUOTATIONS ?
          <Alert tone="info" title={`Cần tối thiểu ${MIN_QUOTATIONS} Quotation đã xác nhận để so sánh`} className="mt-4">
                Hiện có {confirmed.length}. Số lượng tối thiểu là giả định MVP, cần xác nhận với doanh nghiệp.
              </Alert> :

          <div className="mt-4 space-y-6">
                <RecommendationPanel recommendation={rec} quotes={confirmed} suppliers={state.suppliers} />
                <ComparisonMatrix
              quotes={confirmed}
              suppliers={state.suppliers}
              scores={rec.scores}
              recommendedId={rec.recommendedId}
              selectedId={pr.selectedQuotationId}
              canSelect={sourcingOpen}
              onSelect={(qid) => setSelectQ(confirmed.find((q) => q.id === qid) ?? null)} />
            
              </div>
          }
          </section>

          <section className="mt-12" aria-labelledby="po-section">
            <h2 id="po-section" className="mb-4 text-xl font-semibold text-ink-900">
              3. Purchase Order
            </h2>
            {po ?
          <Alert tone="success" title={`Đã tạo ${po.id}`} action={<Link to={`/orders/${po.id}`} className={buttonClass('link')}>Xem Purchase Order</Link>}>
                {supplierOf(selected)?.name} · {formatVND(po.total)}
              </Alert> :
          pr.status === 'supplier_selected' && selected ?
          <CreatePOPanel quotation={selected} supplier={supplierOf(selected)} selectionNote={pr.selectionNote} onCreate={onCreatePO} /> :

          <Alert tone="info" title="Chưa thể tạo PO">
                PO chỉ được tạo sau khi PR được Approve và Supplier được chọn (REQ-BR-10).
              </Alert>
          }
          </section>
        </>
      }

      <SourceFileDialog quotation={sourceQ} supplier={supplierOf(sourceQ ?? undefined)} pr={pr} onClose={() => setSourceQ(null)} />
      <ReasonDialog
        open={Boolean(selectQ)}
        onClose={() => setSelectQ(null)}
        title={`Chọn ${supplierOf(selectQ ?? undefined)?.name ?? ''}`}
        description={selectQ ? `Tổng ${formatVND(quotationTotal(selectQ))} · quyết định được ghi vào Audit Trail` : undefined}
        confirmLabel="Select supplier"
        reasonRequired={Boolean(selectQ && selectQ.id !== rec.recommendedId)}
        reasonLabel={selectQ && selectQ.id !== rec.recommendedId ? 'Lý do chọn khác đề xuất AI' : 'Ghi chú lựa chọn'}
        placeholder="VD: Ưu tiên bảo hành dài, NCC đã hợp tác ổn định…"
        onConfirm={onSelectConfirm}>
        
        {selectQ && selectQ.id !== rec.recommendedId &&
        <Alert tone="info" title="Bạn đang chọn khác đề xuất của AI">
            Điều này hoàn toàn hợp lệ — AI chỉ hỗ trợ. Vui lòng ghi lý do để phục vụ truy vết.
          </Alert>
        }
      </ReasonDialog>
    </div>);

}