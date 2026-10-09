import type {
  Budget,
  LineItem,
  PRInput,
  PriceReference,
  PurchaseOrder,
  PurchaseRequest,
  Quotation,
  QuotationLine,
  Receiving,
  User } from
'../types/procurement';
import { priceReferences } from '../data/priceReferences';
import { formatCompactVND } from './format';

/** ASM-05: PR trên 50 triệu VND cần cả Manager và Finance approval. */
export const FINANCE_THRESHOLD = 50_000_000;
/** Open decision: số Quotation tối thiểu trước Compare (giả định 2). */
export const MIN_QUOTATIONS = 2;
/** REQ-FR-15: cảnh báo khi đơn giá ≥ 20% so với trung bình lịch sử. */
export const ANOMALY_THRESHOLD = 0.2;
export const RECOMMENDATION_WEIGHTS = { price: 0.6, delivery: 0.2, warranty: 0.2 };
export const ANOMALY_PENALTY = 10;

export function prTotal(pr: {items: LineItem[];}): number {
  return pr.items.reduce((sum, i) => sum + (i.quantity || 0) * (i.estUnitPrice || 0), 0);
}

export function validatePR(input: PRInput): Record<string, string> {
  const e: Record<string, string> = {};
  const title = (input?.title || '').trim();
  const category = input?.category || '';
  const department = input?.department || '';
  const costCenter = input?.costCenter || '';
  const budgetCode = input?.budgetCode || '';
  const requiredBy = input?.requiredBy || '';
  const deliveryLocation = (input?.deliveryLocation || '').trim();
  const justification = (input?.justification || '').trim();
  const items = input?.items || [];

  if (title.length < 5) e.title = 'Nhập tiêu đề tối thiểu 5 ký tự.';
  if (!category) e.category = 'Chọn Category.';
  if (!department) e.department = 'Thiếu Department.';
  if (!costCenter) e.costCenter = 'Chọn Cost centre.';
  if (!budgetCode) e.budgetCode = 'Chọn Budget code.';
  if (!requiredBy) e.requiredBy = 'Chọn ngày cần hàng.'; else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(requiredBy) <= today) e.requiredBy = 'Ngày cần hàng phải sau hôm nay.';
  }
  if (!deliveryLocation) e.deliveryLocation = 'Nhập địa điểm giao hàng.';
  if (justification.length < 20) e.justification = 'Mô tả mục đích mua sắm tối thiểu 20 ký tự.';
  if (items.length === 0) e.items = 'Thêm ít nhất 1 sản phẩm/dịch vụ.';
  items.forEach((i) => {
    const name = (i?.name || '').trim();
    const specs = (i?.specs || '').trim();
    if (!name) e[`item.${i.id}.name`] = 'Nhập tên sản phẩm/dịch vụ.';
    if (!specs) e[`item.${i.id}.specs`] = 'Nhập thông số kỹ thuật.';
    if (!(i.quantity > 0)) e[`item.${i.id}.quantity`] = 'Số lượng > 0.';
    if (!(i.estUnitPrice > 0)) e[`item.${i.id}.estUnitPrice`] = 'Nhập đơn giá dự toán.';
  });
  return e;
}

export interface BudgetCheck {
  allocated: number;
  committed: number;
  available: number;
  requested: number;
  remainingAfter: number;
  overBudget: boolean;
}

export function budgetCheck(amount: number, budget?: Budget): BudgetCheck {
  const allocated = budget?.allocated ?? 0;
  const committed = budget?.committed ?? 0;
  const available = allocated - committed;
  return { allocated, committed, available, requested: amount, remainingAfter: available - amount, overBudget: amount > available };
}

export interface ApprovalGuard {
  check: BudgetCheck;
  selfApproval: boolean;
  outOfScope: boolean;
  overThreshold: boolean;
  overBudget: boolean;
  blockReason?: string;
  approveBlock?: string;
}

export function managerGuard(user: User, pr: PurchaseRequest, budget?: Budget): ApprovalGuard {
  const check = budgetCheck(prTotal(pr), budget);
  const selfApproval = pr.requesterId === user.id;
  const outOfScope = pr.department !== user.department;
  const overThreshold = check.requested > FINANCE_THRESHOLD;
  const overBudget = check.overBudget;
  let blockReason: string | undefined;
  if (selfApproval) blockReason = 'Bạn là người tạo PR này. Theo quy tắc No Self-Approval, bạn không thể tự xử lý phê duyệt — PR cần cấp có thẩm quyền khác.';else
  if (outOfScope) blockReason = 'PR không thuộc phòng ban bạn quản lý.';
  const approveBlock =
  blockReason ?? (
  overBudget ?
  'PR vượt Budget khả dụng. Chọn Reject, yêu cầu chỉnh sửa hoặc chuyển Finance kiểm tra ngân sách.' :
  undefined);
  return { check, selfApproval, outOfScope, overThreshold, overBudget, blockReason, approveBlock };
}

export function financeGuard(user: User, pr: PurchaseRequest, budget?: Budget): ApprovalGuard {
  const check = budgetCheck(prTotal(pr), budget);
  const selfApproval = pr.requesterId === user.id;
  return {
    check,
    selfApproval,
    outOfScope: false,
    overThreshold: check.requested > FINANCE_THRESHOLD,
    overBudget: check.overBudget,
    blockReason: selfApproval ? 'Bạn là người tạo PR này nên không thể tự phê duyệt (No Self-Approval).' : undefined
  };
}

export function prFlags(pr: PurchaseRequest, budget?: Budget): {label: string;tone: 'warning' | 'info';}[] {
  if (!['draft', 'revision', 'pending_manager', 'finance_review'].includes(pr.status)) return [];
  const check = budgetCheck(prTotal(pr), budget);
  const flags: {label: string;tone: 'warning' | 'info';}[] = [];
  if (check.overBudget) flags.push({ label: 'Vượt Budget', tone: 'warning' });
  if (check.requested > FINANCE_THRESHOLD) flags.push({ label: 'Cần Finance', tone: 'info' });
  return flags;
}

export function linesSubtotal(lines: QuotationLine[]): number {
  return lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
}

export function quotationTotal(q: {lines: QuotationLine[];taxRate: number;shippingFee: number;}): number {
  return Math.round(linesSubtotal(q.lines) * (1 + q.taxRate) + q.shippingFee);
}

export function findPriceReference(name: string): PriceReference | undefined {
  const lower = name.toLowerCase();
  return priceReferences.find((r) => r.keywords.some((k) => lower.includes(k)));
}

export interface PriceAnomaly {
  itemId: string;
  name: string;
  unitPrice: number;
  reference: PriceReference;
  diff: number;
}

export function lineAnomaly(line: QuotationLine): PriceAnomaly | undefined {
  const reference = findPriceReference(line.name);
  if (!reference) return undefined;
  const diff = (line.unitPrice - reference.avgUnitPrice) / reference.avgUnitPrice;
  return diff >= ANOMALY_THRESHOLD ? { itemId: line.itemId, name: line.name, unitPrice: line.unitPrice, reference, diff } : undefined;
}

export function quotationAnomalies(q: Quotation): PriceAnomaly[] {
  return q.lines.map(lineAnomaly).filter((a): a is PriceAnomaly => Boolean(a));
}

export interface QuoteScore {
  quotationId: string;
  total: number;
  price: number;
  delivery: number;
  warranty: number;
  penalty: number;
  score: number;
}

export interface Recommendation {
  scores: QuoteScore[];
  recommendedId?: string;
}

export function recommend(quotes: Quotation[]): Recommendation {
  if (quotes.length < MIN_QUOTATIONS) return { scores: [] };
  const totals = quotes.map((q) => quotationTotal(q));
  const minTotal = Math.min(...totals);
  const minDays = Math.min(...quotes.map((q) => q.deliveryDays));
  const maxWarranty = Math.max(...quotes.map((q) => q.warrantyMonths)) || 1;
  const scores = quotes.map((q, idx) => {
    const price = minTotal / totals[idx] * 100;
    const delivery = minDays / Math.max(q.deliveryDays, 1) * 100;
    const warranty = q.warrantyMonths / maxWarranty * 100;
    const penalty = quotationAnomalies(q).length ? ANOMALY_PENALTY : 0;
    const score =
    price * RECOMMENDATION_WEIGHTS.price + delivery * RECOMMENDATION_WEIGHTS.delivery + warranty * RECOMMENDATION_WEIGHTS.warranty - penalty;
    return { quotationId: q.id, total: totals[idx], price, delivery, warranty, penalty, score: Math.round(score * 10) / 10 };
  });
  const best = [...scores].sort((a, b) => b.score - a.score)[0];
  return { scores, recommendedId: best?.quotationId };
}

export function receivedByItem(poId: string, receivings: Receiving[]): Record<string, number> {
  const map: Record<string, number> = {};
  receivings.
  filter((r) => r.poId === poId).
  forEach((r) => r.lines.forEach((l) => map[l.itemId] = (map[l.itemId] ?? 0) + l.quantity));
  return map;
}

export function receivingProgress(po: PurchaseOrder, receivings: Receiving[]) {
  const received = receivedByItem(po.id, receivings);
  const ordered = po.lines.reduce((s, l) => s + l.quantity, 0);
  const got = po.lines.reduce((s, l) => s + Math.min(received[l.itemId] ?? 0, l.quantity), 0);
  return { ordered, received: got, complete: got >= ordered };
}

export function closeBlockers(pr: PurchaseRequest, po: PurchaseOrder | undefined, receivings: Receiving[]): string[] {
  if (pr.status === 'closed') return ['PR đã được Close.'];
  if (!po) return ['Chưa có Purchase Order liên kết.'];
  const blockers: string[] = [];
  const progress = receivingProgress(po, receivings);
  if (!progress.complete) blockers.push(`Receiving chưa hoàn tất (${progress.received}/${progress.ordered}).`);
  if (!po.reconciled) blockers.push('Chưa đối soát PR ↔ PO ↔ Receiving.');
  return blockers;
}