import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useCurrentUser } from '../contexts/AuthContext';
import { useProcurement } from '../contexts/ProcurementContext';
import { useAction } from '../hooks/useAction';
import { useRequestForm } from '../hooks/useRequestForm';
import { savePRDraft, submitPR } from '../utils/procurementActions';
import { inputClass, textareaClass } from '../utils/styles';
import type { PurchaseRequest } from '../types/procurement';
import { PageHeader } from '../components/ui/PageHeader';
import { FormField } from '../components/ui/FormField';
import { Alert } from '../components/ui/Alert';
import { AIStandardizerPanel } from '../components/requests/AIStandardizerPanel';
import { LineItemsEditor } from '../components/requests/LineItemsEditor';
import { RequestSummary } from '../components/requests/RequestSummary';
import { can } from '../utils/permissions';
import { UnauthorizedPage } from './Unauthorized';
import { NotFoundPage } from './NotFound';

export function RequestFormPage() {
  const { id } = useParams();
  const user = useCurrentUser();
  const { state } = useProcurement();
  const existing = id ? state.requests.find((r) => r.id === id) : undefined;

  if (!can(user, 'pr.create')) return <UnauthorizedPage />;
  if (id && !existing) return <NotFoundPage message="Không tìm thấy Purchase Request." />;
  if (existing && existing.requesterId !== user.id) return <UnauthorizedPage />;
  if (existing && existing.status !== 'draft' && existing.status !== 'revision')
    return <NotFoundPage message="PR đã Submit nên không thể chỉnh sửa." />;
  return <RequestFormBody existing={existing} />;
}


function RequestFormBody({ existing }: {existing?: PurchaseRequest;}) {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const act = useAction();
  const f = useRequestForm(user, existing);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const e = f.visibleErrors;

  const save = () => {
    if ((f.values.title || '').trim().length < 3) {
      toast.error('Nhập tiêu đề trước khi lưu nháp.');
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      const res = act(savePRDraft, f.values, existing?.id);
      setSaving(false);
      if (res.ok) {
        toast.success('Đã lưu bản nháp.');
        navigate(`/requests/${res.id}`);
      }
    }, 300);
  };

  const submit = () => {
    f.setShowErrors(true);
    if (Object.keys(f.errors).length) {
      toast.error('PR còn thiếu thông tin bắt buộc.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => {
      const res = act(submitPR, f.values, existing?.id);
      setSubmitting(false);
      if (res.ok) {
        toast.success(`Đã Submit ${res.id}. PR đang chờ Manager duyệt.`);
        navigate(`/requests/${res.id}`);
      }
    }, 400);
  };

  const errorCount = Object.keys(e).length;

  return (
    <div>
      <PageHeader
        back={existing ? { to: `/requests/${existing.id}`, label: existing.id } : { to: '/requests', label: 'Purchase Requests' }}
        title={existing ? 'Chỉnh sửa Purchase Request' : 'New Purchase Request'}
        description={`${user.department} · Người tạo: ${user.name}`} />
      

      {existing?.status === 'revision' && existing.lastReason &&
      <Alert tone="warning" title="Manager yêu cầu chỉnh sửa" className="mb-6">
          {existing.lastReason}
        </Alert>
      }
      {errorCount > 0 &&
      <Alert tone="error" title={`Còn ${errorCount} trường cần bổ sung`} className="mb-6">
          Kiểm tra các trường được đánh dấu đỏ trước khi Submit (REQ-BR-01).
        </Alert>
      }

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          {/* [US-03 AI Standardizer Panel] Render Trợ lý AI ở đầu Form tạo đề xuất */}
          <AIStandardizerPanel aiReview={f.values.aiReview} onApply={f.applySuggestion} onDismiss={f.dismissSuggestion} />

          <section aria-labelledby="general-title">

            <h2 id="general-title" className="mb-4 text-xl font-semibold text-ink-900">
              Thông tin chung
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Request title" htmlFor="title" required error={e.title} className="md:col-span-2">
                <input id="title" value={f.values.title} onChange={(ev) => f.setField('title', ev.target.value)} className={inputClass(Boolean(e.title))} />
              </FormField>
              <FormField label="Category" htmlFor="category" required error={e.category}>
                <select id="category" value={f.values.category} onChange={(ev) => f.setField('category', ev.target.value)} className={inputClass(Boolean(e.category))}>
                  <option value="">Chọn Category</option>
                  {f.categories.map((c) =>
                  <option key={c} value={c}>
                      {c}
                    </option>
                  )}
                </select>
              </FormField>
              <FormField label="Department" htmlFor="department" hint="Theo phòng ban của tài khoản">
                <input id="department" value={f.values.department} disabled className={inputClass()} />
              </FormField>
              <FormField label="Budget code" htmlFor="budgetCode" required error={e.budgetCode}>
                <select id="budgetCode" value={f.values.budgetCode} onChange={(ev) => f.setBudgetCode(ev.target.value)} className={inputClass(Boolean(e.budgetCode))}>
                  <option value="">Chọn Budget code</option>
                  {f.deptBudgets.map((b) =>
                  <option key={b.code} value={b.code}>
                      {b.code} · {b.name}
                    </option>
                  )}
                </select>
              </FormField>
              <FormField label="Cost centre" htmlFor="costCenter" required error={e.costCenter}>
                <select id="costCenter" value={f.values.costCenter} onChange={(ev) => f.setField('costCenter', ev.target.value)} className={inputClass(Boolean(e.costCenter))}>
                  <option value="">Chọn Cost centre</option>
                  {Array.from(new Set(f.deptBudgets.map((b) => b.costCenter))).map((c) =>
                  <option key={c} value={c}>
                      {c}
                    </option>
                  )}
                </select>
              </FormField>
              <FormField label="Required-by date" htmlFor="requiredBy" required error={e.requiredBy}>
                <input id="requiredBy" type="date" value={f.values.requiredBy} onChange={(ev) => f.setField('requiredBy', ev.target.value)} className={inputClass(Boolean(e.requiredBy))} />
              </FormField>
              <FormField label="Delivery location" htmlFor="deliveryLocation" required error={e.deliveryLocation}>
                <input
                  id="deliveryLocation"
                  value={f.values.deliveryLocation}
                  onChange={(ev) => f.setField('deliveryLocation', ev.target.value)}
                  placeholder="VD: Tầng 8, Tòa nhà Sông Đà"
                  className={inputClass(Boolean(e.deliveryLocation))} />
                
              </FormField>
              <FormField label="Business justification" htmlFor="justification" required error={e.justification} className="md:col-span-2" hint="Mục đích mua sắm, người sử dụng, tác động nếu không mua.">
                <textarea id="justification" value={f.values.justification} onChange={(ev) => f.setField('justification', ev.target.value)} className={textareaClass(Boolean(e.justification))} />
              </FormField>
            </div>
          </section>

          <section aria-labelledby="items-title">
            <h2 id="items-title" className="mb-4 text-xl font-semibold text-ink-900">
              Sản phẩm / dịch vụ
            </h2>
            <LineItemsEditor items={f.values.items} errors={e} onChange={f.updateItem} onAdd={f.addItem} onRemove={f.removeItem} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <RequestSummary total={f.total} check={f.check} errors={f.errors} saving={saving} submitting={submitting} onSave={save} onSubmit={submit} />
        </aside>
      </div>
    </div>);

}