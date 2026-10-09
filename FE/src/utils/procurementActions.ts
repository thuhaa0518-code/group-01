import type {
  AuditEntry,
  PRInput,
  PRStatus,
  ProcurementState,
  PurchaseOrder,
  PurchaseRequest,
  Quotation,
  QuotationField,
  QuotationSnapshot,
  Receiving,
  ReceivingLine,
  Role,
  Supplier,
  User } from
'../types/procurement';
import { can, canViewOrderOf } from './permissions';
import { formatVND } from './format';
import {
  MIN_QUOTATIONS,
  closeBlockers,
  financeGuard,
  managerGuard,
  prTotal,
  quotationTotal,
  receivedByItem,
  recommend,
  validatePR } from
'./rules';
import { AI_REVIEW_LABEL } from './workflow';

export type ActionResult = {ok: true;state: ProcurementState;id?: string;} | {ok: false;error: string;};
export type ActionFn<A extends unknown[]> = (state: ProcurementState, actor: User, ...args: A) => ActionResult;

const fail = (error: string): ActionResult => ({ ok: false, error });
const now = () => new Date().toISOString();

function withAudit(state: ProcurementState, actor: User, entry: Omit<AuditEntry, 'id' | 'at' | 'actorId' | 'actorName' | 'role'>): ProcurementState {
  const e: AuditEntry = {
    id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    at: now(),
    actorId: actor.id,
    actorName: actor.name,
    role: actor.role,
    ...entry
  };
  return { ...state, audit: [e, ...state.audit] };
}

function nextId(prefix: string, ids: string[]): string {
  const max = ids.reduce((m, id) => {
    const n = parseInt(id.split('-').pop() ?? '0', 10);
    return Number.isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
}

function patchPR(state: ProcurementState, id: string, patch: Partial<PurchaseRequest>): ProcurementState {
  return { ...state, requests: state.requests.map((r) => r.id === id ? { ...r, ...patch, updatedAt: now() } : r) };
}

function patchPO(state: ProcurementState, id: string, patch: Partial<PurchaseOrder>): ProcurementState {
  return { ...state, orders: state.orders.map((o) => o.id === id ? { ...o, ...patch } : o) };
}

function commitBudget(state: ProcurementState, code: string, amount: number): ProcurementState {
  return { ...state, budgets: state.budgets.map((b) => b.code === code ? { ...b, committed: b.committed + amount } : b) };
}

/* ---------- Purchase Request ---------- */

export function savePRDraft(state: ProcurementState, actor: User, input: PRInput, id?: string): ActionResult {
  if (!can(actor, 'pr.create')) return fail('Bạn không có quyền tạo Purchase Request.');
  if (id) {
    const pr = state.requests.find((r) => r.id === id);
    if (!pr) return fail('Không tìm thấy PR.');
    if (pr.requesterId !== actor.id) return fail('Chỉ người tạo được chỉnh sửa PR này.');
    if (pr.status !== 'draft' && pr.status !== 'revision') return fail('PR đã Submit, không thể chỉnh sửa.');
    let next = patchPR(state, id, { ...input });
    next = withAudit(next, actor, { action: 'Cập nhật PR', entity: 'PR', entityId: id, fromStatus: pr.status, toStatus: pr.status, details: `Tổng dự toán ${formatVND(prTotal(input))}` });
    return { ok: true, state: next, id };
  }
  const newId = nextId('PR-2026-', state.requests.map((r) => r.id));
  const pr: PurchaseRequest = { ...input, id: newId, requesterId: actor.id, createdAt: now(), updatedAt: now(), status: 'draft', routedToFinance: false };
  let next: ProcurementState = { ...state, requests: [pr, ...state.requests] };
  next = withAudit(next, actor, { action: 'Tạo PR (Draft)', entity: 'PR', entityId: newId, toStatus: 'draft', details: `Kết quả review AI: ${AI_REVIEW_LABEL[input.aiReview]}` });
  return { ok: true, state: next, id: newId };
}

export function submitPR(state: ProcurementState, actor: User, input: PRInput, id?: string): ActionResult {
  if (Object.keys(validatePR(input)).length) return fail('PR còn thiếu thông tin bắt buộc. Kiểm tra các trường được đánh dấu.');
  const saved = savePRDraft(state, actor, input, id);
  if (!saved.ok) return saved;
  const prId = saved.id as string;
  const before = saved.state.requests.find((r) => r.id === prId);
  let next = patchPR(saved.state, prId, { status: 'pending_manager', lastReason: undefined });
  next = withAudit(next, actor, {
    action: 'Submit PR',
    entity: 'PR',
    entityId: prId,
    fromStatus: before?.status,
    toStatus: 'pending_manager',
    details: `Kết quả review AI: ${AI_REVIEW_LABEL[input.aiReview]} · Tổng ${formatVND(prTotal(input))}`
  });
  return { ok: true, state: next, id: prId };
}

export type ManagerDecision = 'approve' | 'reject' | 'revision' | 'finance';

const MANAGER_MAP: Record<ManagerDecision, {status: PRStatus;action: string;}> = {
  approve: { status: 'approved', action: 'Manager Approve' },
  reject: { status: 'rejected', action: 'Manager Reject' },
  revision: { status: 'revision', action: 'Manager yêu cầu chỉnh sửa' },
  finance: { status: 'finance_review', action: 'Manager chuyển Finance' }
};

export function managerDecide(state: ProcurementState, actor: User, id: string, decision: ManagerDecision, reason: string): ActionResult {
  if (!can(actor, 'approval.manager')) return fail('Bạn không có quyền phê duyệt cấp Manager.');
  const pr = state.requests.find((r) => r.id === id);
  if (!pr) return fail('Không tìm thấy PR.');
  if (pr.status !== 'pending_manager') return fail('PR không ở trạng thái chờ Manager duyệt.');
  const budget = state.budgets.find((b) => b.code === pr.budgetCode);
  const g = managerGuard(actor, pr, budget);
  if (g.blockReason) return fail(g.blockReason);
  if (decision !== 'approve' && reason.trim().length < 5) return fail('Vui lòng nhập lý do (tối thiểu 5 ký tự).');
  if (decision === 'approve' && g.approveBlock) return fail(g.approveBlock);
  let status: PRStatus;
  let action: string;
  if (decision === 'approve') {
    if (g.overThreshold) {
      status = 'finance_review';
      action = 'Manager phê duyệt (chuyển Finance duyệt tiếp do PR > 50tr)';
    } else {
      status = 'approved';
      action = 'Manager Approve';
    }
  } else {
    status = MANAGER_MAP[decision].status;
    action = MANAGER_MAP[decision].action;
  }

  let next = patchPR(state, id, {
    status,
    lastReason: reason.trim() || undefined,
    routedToFinance: pr.routedToFinance || decision === 'finance' || g.overThreshold,
    approvedAt: status === 'approved' ? now() : pr.approvedAt
  });
  if (status === 'approved') next = commitBudget(next, pr.budgetCode, g.check.requested);
  next = withAudit(next, actor, {
    action,
    entity: 'PR',
    entityId: id,
    fromStatus: pr.status,
    toStatus: status,
    reason: reason.trim() || undefined,
    details: `Budget khả dụng: ${formatVND(g.check.available)} · Giá trị PR: ${formatVND(g.check.requested)}`
  });
  return { ok: true, state: next };
}

export type FinanceDecision = 'approve' | 'reject' | 'revision';

export function financeDecide(state: ProcurementState, actor: User, id: string, decision: FinanceDecision, reason: string): ActionResult {
  if (!can(actor, 'approval.finance')) return fail('Bạn không có quyền phê duyệt ngân sách.');
  const pr = state.requests.find((r) => r.id === id);
  if (!pr) return fail('Không tìm thấy PR.');
  if (pr.status !== 'finance_review') return fail('PR không ở bước Finance Review.');
  const budget = state.budgets.find((b) => b.code === pr.budgetCode);
  const g = financeGuard(actor, pr, budget);
  if (g.blockReason) return fail(g.blockReason);
  if (decision !== 'approve' && reason.trim().length < 5) return fail('Vui lòng nhập lý do (tối thiểu 5 ký tự).');
  if (decision === 'approve' && g.overBudget && reason.trim().length < 5)
  return fail('PR vượt Budget khả dụng — nhập ghi chú phê duyệt ngân sách theo policy.');
  const status: PRStatus = decision === 'approve' ? 'approved' : decision === 'reject' ? 'rejected' : 'revision';
  let next = patchPR(state, id, { status, lastReason: reason.trim() || undefined, approvedAt: decision === 'approve' ? now() : pr.approvedAt });
  if (decision === 'approve') next = commitBudget(next, pr.budgetCode, g.check.requested);
  next = withAudit(next, actor, {
    action: decision === 'approve' ? 'Finance phê duyệt ngân sách' : decision === 'reject' ? 'Finance Reject' : 'Finance yêu cầu chỉnh sửa',
    entity: 'PR',
    entityId: id,
    fromStatus: pr.status,
    toStatus: status,
    reason: reason.trim() || undefined,
    details: `Budget khả dụng: ${formatVND(g.check.available)} · Giá trị PR: ${formatVND(g.check.requested)}${g.overBudget ? ' · Vượt Budget' : ''}`
  });
  return { ok: true, state: next };
}

/* ---------- Quotation ---------- */

function hash(s: string): number {
  return s.split('').reduce((h, c) => h * 31 + c.charCodeAt(0) >>> 0, 7);
}

export function addQuotation(state: ProcurementState, actor: User, prId: string, supplierId: string, fileName: string): ActionResult {
  if (!can(actor, 'sourcing.manage')) return fail('Bạn không có quyền thu thập Quotation.');
  const pr = state.requests.find((r) => r.id === prId);
  if (!pr) return fail('Không tìm thấy PR.');
  if (pr.status !== 'approved') return fail('Chỉ thu thập Quotation cho PR đã được phê duyệt và chưa chọn Supplier (REQ-BR-02, BR-06).');
  const supplier = state.suppliers.find((s) => s.id === supplierId);
  if (!supplier || supplier.status !== 'active') return fail('Supplier không hợp lệ hoặc đang ngừng hoạt động.');
  if (state.quotations.some((q) => q.prId === prId && q.supplierId === supplierId)) return fail('Supplier này đã có Quotation cho PR.');
  const lower = fileName.toLowerCase();
  const fileType = /\.(xlsx|xls)$/.test(lower) ? 'excel' : /\.pdf$/.test(lower) ? 'pdf' : null;
  if (!fileType) return fail('Chỉ hỗ trợ file Quotation dạng PDF hoặc Excel (.pdf, .xlsx, .xls).');

  const seed = hash(supplierId + prId);
  const factor = 0.9 + seed % 26 / 100;
  const snapshot: QuotationSnapshot = {
    lines: pr.items.map((i) => ({ itemId: i.id, name: i.name, quantity: i.quantity, unitPrice: Math.round(i.estUnitPrice * factor / 1000) * 1000 })),
    taxRate: 0.1,
    shippingFee: seed % 4 * 150_000,
    deliveryDays: 3 + seed % 10,
    warrantyMonths: [12, 24, 36][seed % 3]
  };
  const lowConfidence: QuotationField[] = seed % 2 ? ['shippingFee'] : ['deliveryDays'];
  const q: Quotation = {
    ...snapshot,
    id: `q-${Date.now().toString(36)}`,
    prId,
    supplierId,
    fileName,
    fileType,
    status: 'extracted',
    aiConfidence: Math.min(0.97, 0.74 + seed % 20 / 100),
    lowConfidence,
    editedFields: [],
    original: snapshot,
    createdAt: now()
  };
  let next: ProcurementState = { ...state, quotations: [...state.quotations, q] };
  next = withAudit(next, actor, {
    action: 'Thêm Quotation & AI trích xuất',
    entity: 'Quotation',
    entityId: q.id,
    details: `${supplier.name} · ${fileName} · độ tin cậy ${Math.round(q.aiConfidence * 100)}% · liên kết ${prId}`
  });
  return { ok: true, state: next, id: q.id };
}

export function updateQuotation(state: ProcurementState, actor: User, qid: string, patch: QuotationSnapshot): ActionResult {
  if (!can(actor, 'sourcing.manage')) return fail('Bạn không có quyền chỉnh sửa Quotation.');
  const q = state.quotations.find((x) => x.id === qid);
  if (!q) return fail('Không tìm thấy Quotation.');
  const pr = state.requests.find((r) => r.id === q.prId);
  if (pr?.status !== 'approved') return fail('Không thể sửa Quotation sau khi đã chọn Supplier (ASM-04).');
  if (patch.lines.some((l) => !(l.unitPrice > 0)) || patch.taxRate < 0 || patch.shippingFee < 0 || patch.deliveryDays <= 0 || patch.warrantyMonths < 0)
  return fail('Giá trị không hợp lệ. Đơn giá, thời gian giao hàng phải lớn hơn 0.');
  const o = q.original;
  const edited: QuotationField[] = [];
  if (patch.lines.some((l, i) => l.unitPrice !== o.lines[i]?.unitPrice)) edited.push('unitPrice');
  if (patch.taxRate !== o.taxRate) edited.push('taxRate');
  if (patch.shippingFee !== o.shippingFee) edited.push('shippingFee');
  if (patch.deliveryDays !== o.deliveryDays) edited.push('deliveryDays');
  if (patch.warrantyMonths !== o.warrantyMonths) edited.push('warrantyMonths');
  let next: ProcurementState = {
    ...state,
    quotations: state.quotations.map((x) => x.id === qid ? { ...x, ...patch, editedFields: edited, status: 'extracted' } : x)
  };
  next = withAudit(next, actor, {
    action: 'Chỉnh sửa dữ liệu AI extraction',
    entity: 'Quotation',
    entityId: qid,
    details: edited.length ? `Trường đã sửa so với file gốc: ${edited.join(', ')} · Tổng mới ${formatVND(quotationTotal(patch))}` : 'Không thay đổi so với file gốc'
  });
  return { ok: true, state: next };
}

export function confirmQuotation(state: ProcurementState, actor: User, qid: string): ActionResult {
  if (!can(actor, 'sourcing.manage')) return fail('Bạn không có quyền xác nhận Quotation.');
  const q = state.quotations.find((x) => x.id === qid);
  if (!q) return fail('Không tìm thấy Quotation.');
  let next: ProcurementState = { ...state, quotations: state.quotations.map((x) => x.id === qid ? { ...x, status: 'confirmed' } : x) };
  next = withAudit(next, actor, {
    action: 'Xác nhận dữ liệu AI extraction',
    entity: 'Quotation',
    entityId: qid,
    fromStatus: 'extracted',
    toStatus: 'confirmed',
    details: q.editedFields.length ? `Đã chỉnh sửa: ${q.editedFields.join(', ')}` : 'Chấp nhận nguyên bản, không chỉnh sửa'
  });
  return { ok: true, state: next };
}

export function selectSupplier(state: ProcurementState, actor: User, prId: string, qid: string, note: string): ActionResult {
  if (!can(actor, 'sourcing.manage')) return fail('Bạn không có quyền chọn Supplier.');
  const pr = state.requests.find((r) => r.id === prId);
  if (!pr || pr.status !== 'approved') return fail('PR chưa sẵn sàng để chọn Supplier.');
  const confirmed = state.quotations.filter((q) => q.prId === prId && q.status === 'confirmed');
  if (confirmed.length < MIN_QUOTATIONS) return fail(`Cần tối thiểu ${MIN_QUOTATIONS} Quotation đã xác nhận trước khi so sánh.`);
  const q = confirmed.find((x) => x.id === qid);
  if (!q) return fail('Quotation chưa được xác nhận dữ liệu.');
  const rec = recommend(confirmed);
  if (rec.recommendedId !== qid && note.trim().length < 5) return fail('Bạn chọn khác đề xuất AI — vui lòng nhập lý do lựa chọn.');
  const name = (id?: string) => state.suppliers.find((s) => s.id === state.quotations.find((x) => x.id === id)?.supplierId)?.name ?? '—';
  let next = patchPR(state, prId, { status: 'supplier_selected', selectedQuotationId: qid, selectionNote: note.trim() || undefined });
  next = withAudit(next, actor, {
    action: 'Procurement chọn Supplier',
    entity: 'PR',
    entityId: prId,
    fromStatus: 'approved',
    toStatus: 'supplier_selected',
    reason: note.trim() || undefined,
    details: `Chọn ${name(qid)} · AI đề xuất ${name(rec.recommendedId)} · ${formatVND(quotationTotal(q))}`
  });
  return { ok: true, state: next };
}

/* ---------- Purchase Order, Receiving, Close ---------- */

export function createPO(state: ProcurementState, actor: User, prId: string, expectedDelivery: string): ActionResult {
  if (!can(actor, 'po.create')) return fail('Bạn không có quyền tạo Purchase Order.');
  const pr = state.requests.find((r) => r.id === prId);
  if (!pr || pr.status !== 'supplier_selected' || !pr.selectedQuotationId) return fail('PO chỉ được tạo sau khi PR được Approve và Supplier được chọn (REQ-BR-10).');
  const q = state.quotations.find((x) => x.id === pr.selectedQuotationId);
  if (!q || q.status !== 'confirmed') return fail('Quotation đã chọn không hợp lệ.');
  if (!expectedDelivery) return fail('Chọn ngày giao hàng dự kiến.');
  const poId = nextId('PO-2026-', state.orders.map((o) => o.id));
  const po: PurchaseOrder = {
    id: poId,
    prId,
    quotationId: q.id,
    supplierId: q.supplierId,
    createdAt: now(),
    createdBy: actor.id,
    lines: q.lines.map((l) => ({ ...l })),
    taxRate: q.taxRate,
    shippingFee: q.shippingFee,
    total: quotationTotal(q),
    expectedDelivery,
    status: 'issued',
    reconciled: false
  };
  let next: ProcurementState = { ...state, orders: [po, ...state.orders] };
  next = patchPR(next, prId, { status: 'po_created', poId });
  const supplierName = state.suppliers.find((s) => s.id === q.supplierId)?.name ?? '';
  next = withAudit(next, actor, {
    action: 'Tạo Purchase Order',
    entity: 'PO',
    entityId: poId,
    fromStatus: 'supplier_selected',
    toStatus: 'po_created',
    details: `${supplierName} · ${formatVND(po.total)} · liên kết ${prId} / ${q.id}`
  });
  return { ok: true, state: next, id: poId };
}

export function recordReceiving(state: ProcurementState, actor: User, poId: string, lines: ReceivingLine[], note: string, discrepancy: boolean): ActionResult {
  if (!can(actor, 'receiving.record')) return fail('Bạn chưa được phân quyền ghi nhận Receiving.');
  const po = state.orders.find((o) => o.id === poId);
  if (!po) return fail('Không tìm thấy PO.');
  const pr = state.requests.find((r) => r.id === po.prId);
  if (!canViewOrderOf(actor, pr)) return fail('PO không thuộc phạm vi của bạn.');
  if (po.status !== 'issued' && po.status !== 'partially_received') return fail('PO đã nhận đủ hoặc đã đóng.');
  const received = receivedByItem(poId, state.receivings);
  const total = lines.reduce((s, l) => s + l.quantity, 0);
  if (total <= 0) return fail('Nhập số lượng nhận cho ít nhất 1 dòng.');
  for (const l of lines) {
    const poLine = po.lines.find((p) => p.itemId === l.itemId);
    if (!poLine) return fail('Dòng hàng không có trên PO.');
    if (l.quantity < 0 || !Number.isInteger(l.quantity)) return fail('Số lượng nhận phải là số nguyên không âm.');
    const remaining = poLine.quantity - (received[l.itemId] ?? 0);
    if (l.quantity > remaining) return fail(`Số lượng nhận "${poLine.name}" vượt số lượng còn lại trên PO (${remaining}).`);
  }
  if (discrepancy && note.trim().length < 5) return fail('Mô tả sai lệch (tối thiểu 5 ký tự).');
  const after = { ...received };
  lines.forEach((l) => after[l.itemId] = (after[l.itemId] ?? 0) + l.quantity);
  const complete = po.lines.every((p) => (after[p.itemId] ?? 0) >= p.quantity);
  const type: Receiving['type'] = discrepancy ? 'discrepancy' : complete ? 'full' : 'partial';
  const rcv: Receiving = {
    id: `RCV-${poId.slice(-4)}-${state.receivings.filter((r) => r.poId === poId).length + 1}`,
    poId,
    receivedBy: actor.id,
    receivedAt: now(),
    lines: lines.filter((l) => l.quantity > 0),
    type,
    note: note.trim()
  };
  const poStatus = complete ? 'received' : 'partially_received';
  let next: ProcurementState = { ...state, receivings: [...state.receivings, rcv] };
  next = patchPO(next, poId, { status: poStatus });
  if (pr) next = patchPR(next, pr.id, { status: complete ? 'received' : 'partially_received' });
  const ordered = po.lines.reduce((s, l) => s + l.quantity, 0);
  const got = Object.values(after).reduce((s, v) => s + v, 0);
  next = withAudit(next, actor, {
    action: `Ghi nhận Receiving (${type === 'full' ? 'nhận đủ' : type === 'partial' ? 'một phần' : 'sai lệch'})`,
    entity: 'PO',
    entityId: poId,
    fromStatus: po.status,
    toStatus: poStatus,
    reason: discrepancy ? note.trim() : undefined,
    details: `Nhận ${total} · lũy kế ${got}/${ordered}`
  });
  return { ok: true, state: next };
}

export function reconcilePO(state: ProcurementState, actor: User, poId: string, note: string): ActionResult {
  if (!can(actor, 'reconcile')) return fail('Bạn không có quyền đối soát.');
  const po = state.orders.find((o) => o.id === poId);
  if (!po) return fail('Không tìm thấy PO.');
  if (po.status !== 'received') return fail('Chỉ đối soát khi Receiving đã hoàn tất.');
  if (po.reconciled) return fail('PO đã được đối soát.');
  const hasException = state.receivings.some((r) => r.poId === poId && r.type === 'discrepancy');
  if (hasException && note.trim().length < 5) return fail('Có sai lệch khi nhận hàng — nhập ghi chú xử lý trước khi xác nhận đối soát.');
  let next = patchPO(state, poId, { reconciled: true, reconciledBy: actor.id, reconcileNote: note.trim() || undefined });
  next = withAudit(next, actor, { action: 'Đối soát PR ↔ PO ↔ Receiving', entity: 'PO', entityId: poId, reason: note.trim() || undefined, details: hasException ? 'Có sai lệch đã được ghi chú' : 'Khớp số lượng' });
  return { ok: true, state: next };
}

export function closePR(state: ProcurementState, actor: User, prId: string): ActionResult {
  if (!can(actor, 'pr.close')) return fail('Bạn không có quyền Close PR.');
  const pr = state.requests.find((r) => r.id === prId);
  if (!pr) return fail('Không tìm thấy PR.');
  const po = state.orders.find((o) => o.prId === prId);
  const blockers = closeBlockers(pr, po, state.receivings);
  if (blockers.length) return fail(blockers[0]);
  let next = patchPR(state, prId, { status: 'closed' });
  if (po) next = patchPO(next, po.id, { status: 'closed' });
  next = withAudit(next, actor, { action: 'Close PR', entity: 'PR', entityId: prId, fromStatus: pr.status, toStatus: 'closed', details: po ? `PO ${po.id} đã đóng` : undefined });
  return { ok: true, state: next };
}

/* ---------- Supplier & Admin ---------- */

export function saveSupplier(state: ProcurementState, actor: User, input: Omit<Supplier, 'id'>, id?: string): ActionResult {
  if (!can(actor, 'supplier.manage')) return fail('Bạn không có quyền quản lý Supplier.');
  if (input.name.trim().length < 3) return fail('Tên Supplier tối thiểu 3 ký tự.');
  if (!/^\d{10}(\d{3})?$/.test(input.taxCode.trim())) return fail('Mã số thuế gồm 10 hoặc 13 chữ số.');
  if (!/^\S+@\S+\.\S+$/.test(input.email.trim())) return fail('Email không hợp lệ.');
  if (!input.categories.length) return fail('Chọn ít nhất 1 Category cung cấp.');
  if (id) {
    const before = state.suppliers.find((s) => s.id === id);
    let next: ProcurementState = { ...state, suppliers: state.suppliers.map((s) => s.id === id ? { ...s, ...input } : s) };
    next = withAudit(next, actor, { action: 'Cập nhật Supplier', entity: 'Supplier', entityId: id, fromStatus: before?.status, toStatus: input.status, details: input.name });
    return { ok: true, state: next, id };
  }
  const newId = `sup-${Date.now().toString(36)}`;
  let next: ProcurementState = { ...state, suppliers: [...state.suppliers, { ...input, id: newId }] };
  next = withAudit(next, actor, { action: 'Thêm Supplier', entity: 'Supplier', entityId: newId, details: input.name });
  return { ok: true, state: next, id: newId };
}

export function updateUser(state: ProcurementState, actor: User, userId: string, patch: Partial<User>, reason: string): ActionResult {
  if (!can(actor, 'admin.users')) return fail('Bạn không có quyền quản lý tài khoản.');
  const u = state.users.find((x) => x.id === userId);
  if (!u) return fail('Không tìm thấy tài khoản.');
  if (reason.trim().length < 5) return fail('Nhập lý do thay đổi thông tin/quyền (tối thiểu 5 ký tự).');
  const changes: string[] = [];
  if (patch.name && patch.name !== u.name) changes.push(`Tên: ${u.name} → ${patch.name}`);
  if (patch.email && patch.email !== u.email) changes.push(`Email: ${u.email} → ${patch.email}`);
  if (patch.department && patch.department !== u.department) changes.push(`Phòng ban: ${u.department} → ${patch.department}`);
  if (patch.title !== undefined && patch.title !== u.title) changes.push(`Chức danh: ${u.title || 'Trống'} → ${patch.title}`);
  if (patch.role && patch.role !== u.role) changes.push(`Vai trò: ${u.role} → ${patch.role}`);
  if (patch.password && patch.password.trim()) changes.push('Đổi mật khẩu tài khoản');
  if (patch.locked !== undefined && patch.locked !== u.locked) changes.push(patch.locked ? 'Khóa tài khoản' : 'Mở khóa tài khoản');
  if (patch.canReceive !== undefined && patch.canReceive !== u.canReceive) changes.push(patch.canReceive ? 'Cấp quyền Receiving' : 'Thu hồi quyền Receiving');
  if (!changes.length) return fail('Không có thay đổi.');
  let next: ProcurementState = { ...state, users: state.users.map((x) => x.id === userId ? { ...x, ...patch } : x) };
  next = withAudit(next, actor, {
    action: 'Cập nhật tài khoản & thông tin',
    entity: 'User',
    entityId: userId,
    reason: reason.trim(),
    details: `${u.name} (${u.email}) · ${changes.join(' · ')}`
  });
  return { ok: true, state: next };
}

export function updateBudget(state: ProcurementState, actor: User, code: string, allocated: number, reason: string): ActionResult {
  if (!can(actor, 'budget.manage')) return fail('Bạn không có quyền quản lý Budget.');
  const b = state.budgets.find((x) => x.code === code);
  if (!b) return fail('Không tìm thấy Budget.');
  if (!(allocated > 0)) return fail('Ngân sách được cấp phải lớn hơn 0.');
  if (allocated < b.committed) return fail(`Ngân sách không thể thấp hơn số đã cam kết (${formatVND(b.committed)}).`);
  if (reason.trim().length < 5) return fail('Nhập lý do điều chỉnh (tối thiểu 5 ký tự).');
  let next: ProcurementState = { ...state, budgets: state.budgets.map((x) => x.code === code ? { ...x, allocated } : x) };
  next = withAudit(next, actor, { action: 'Điều chỉnh Budget', entity: 'Budget', entityId: code, reason: reason.trim(), details: `${formatVND(b.allocated)} → ${formatVND(allocated)}` });
  return { ok: true, state: next };
}

export function addCategory(state: ProcurementState, actor: User, name: string): ActionResult {
  if (!can(actor, 'category.manage')) return fail('Bạn không có quyền quản lý danh mục.');
  const clean = name.trim();
  if (clean.length < 3) return fail('Tên danh mục tối thiểu 3 ký tự.');
  if (state.categories.some((c) => c.toLowerCase() === clean.toLowerCase())) return fail('Danh mục đã tồn tại.');
  let next: ProcurementState = { ...state, categories: [...state.categories, clean] };
  next = withAudit(next, actor, { action: 'Thêm danh mục', entity: 'Category', entityId: clean });
  return { ok: true, state: next };
}

export function logAuth(state: ProcurementState, actor: User, action: string): ActionResult {
  return { ok: true, state: withAudit(state, actor, { action, entity: 'Auth', entityId: actor.id }) };
}

export function roleOf(state: ProcurementState, userId: string): Role | undefined {
  return state.users.find((u) => u.id === userId)?.role;
}