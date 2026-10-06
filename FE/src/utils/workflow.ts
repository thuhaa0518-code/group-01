import type { AIReviewResult, POStatus, PRStatus } from '../types/procurement';
import type { Tone } from './styles';
import { MIN_QUOTATIONS } from './rules';

export const STATUS_META: Record<PRStatus, {label: string;tone: Tone;}> = {
  draft: { label: 'Draft', tone: 'neutral' },
  pending_manager: { label: 'Chờ Manager duyệt', tone: 'info' },
  revision: { label: 'Cần chỉnh sửa', tone: 'warning' },
  finance_review: { label: 'Finance Review', tone: 'warning' },
  rejected: { label: 'Rejected', tone: 'danger' },
  approved: { label: 'Approved · Sourcing', tone: 'success' },
  supplier_selected: { label: 'Đã chọn Supplier', tone: 'primary' },
  po_created: { label: 'Đã tạo PO', tone: 'primary' },
  partially_received: { label: 'Nhận một phần', tone: 'warning' },
  received: { label: 'Đã nhận · Chờ Close', tone: 'success' },
  closed: { label: 'Closed', tone: 'neutral' }
};

export const PO_STATUS_META: Record<POStatus, {label: string;tone: Tone;}> = {
  issued: { label: 'Đang giao', tone: 'info' },
  partially_received: { label: 'Nhận một phần', tone: 'warning' },
  received: { label: 'Đã nhận đủ', tone: 'success' },
  closed: { label: 'Closed', tone: 'neutral' }
};

export const AI_REVIEW_LABEL: Record<AIReviewResult, string> = {
  none: 'Không dùng AI',
  accepted: 'Chấp nhận gợi ý',
  edited: 'Đã chỉnh sửa gợi ý',
  dismissed: 'Bỏ qua gợi ý'
};

export const WORKFLOW_STEPS = [
{ key: 'request', label: 'Request', hint: 'Tạo & Submit PR' },
{ key: 'approve', label: 'Approve', hint: 'Manager / Finance' },
{ key: 'collect', label: 'Collect Quotations', hint: 'Thu thập báo giá' },
{ key: 'compare', label: 'Compare', hint: 'So sánh & chọn NCC' },
{ key: 'po', label: 'PO', hint: 'Tạo đơn đặt hàng' },
{ key: 'receive', label: 'Receive', hint: 'Ghi nhận nhận hàng' },
{ key: 'close', label: 'Close', hint: 'Đối soát & đóng' }] as
const;

export type StepState = 'completed' | 'current' | 'blocked' | 'exception' | 'upcoming';

export function workflowPosition(status: PRStatus, confirmedQuotes: number): {index: number;state: StepState;} {
  switch (status) {
    case 'draft':
      return { index: 0, state: 'current' };
    case 'revision':
      return { index: 0, state: 'exception' };
    case 'pending_manager':
    case 'finance_review':
      return { index: 1, state: 'current' };
    case 'rejected':
      return { index: 1, state: 'blocked' };
    case 'approved':
      return confirmedQuotes >= MIN_QUOTATIONS ? { index: 3, state: 'current' } : { index: 2, state: 'current' };
    case 'supplier_selected':
      return { index: 4, state: 'current' };
    case 'po_created':
    case 'partially_received':
      return { index: 5, state: 'current' };
    case 'received':
      return { index: 6, state: 'current' };
    case 'closed':
      return { index: 7, state: 'completed' };
  }
}

export function workflowStates(status: PRStatus, confirmedQuotes: number): StepState[] {
  const pos = workflowPosition(status, confirmedQuotes);
  return WORKFLOW_STEPS.map((_, i) => i < pos.index ? 'completed' : i === pos.index ? pos.state : 'upcoming');
}