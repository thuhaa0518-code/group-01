import { useMemo } from 'react';
import type { User } from '../types/procurement';
import type { Tone } from '../utils/styles';
import { useProcurement } from '../contexts/ProcurementContext';
import { can, canViewOrderOf } from '../utils/permissions';
import { MIN_QUOTATIONS, prTotal } from '../utils/rules';

export type WorkArea = 'requests' | 'approvals' | 'budget' | 'sourcing' | 'orders';

export interface WorkItem {
  key: string;
  area: WorkArea;
  refId: string;
  title: string;
  meta: string;
  amount?: number;
  action: string;
  to: string;
  tone: Tone;
  blocked?: string;
}

export function useWorkQueue(user: User | null): WorkItem[] {
  const { state } = useProcurement();

  return useMemo(() => {
    if (!user) return [];
    const items: WorkItem[] = [];
    const nameOf = (id: string) => state.users.find((u) => u.id === id)?.name ?? '—';

    if (user.role === 'employee') {
      state.requests.
      filter((r) => r.requesterId === user.id && (r.status === 'draft' || r.status === 'revision')).
      forEach((r) =>
      items.push({
        key: `pr-${r.id}`, area: 'requests', refId: r.id, title: r.title, amount: prTotal(r),
        meta: r.status === 'revision' ? `Cần chỉnh sửa: ${r.lastReason ?? ''}` : 'Bản nháp chưa Submit',
        action: r.status === 'revision' ? 'Chỉnh sửa & gửi lại' : 'Hoàn thiện & Submit', to: `/requests/${r.id}/edit`,
        tone: r.status === 'revision' ? 'warning' : 'neutral'
      })
      );
    }

    if (user.role === 'manager') {
      state.requests.
      filter((r) => r.status === 'pending_manager' && r.department === user.department).
      forEach((r) =>
      items.push({
        key: `ap-${r.id}`, area: 'approvals', refId: r.id, title: r.title, amount: prTotal(r),
        meta: `Người tạo: ${nameOf(r.requesterId)}`, action: 'Xem & quyết định', to: `/requests/${r.id}`, tone: 'info',
        blocked: r.requesterId === user.id ? 'PR của bạn — không thể tự duyệt' : undefined
      })
      );
    }

    if (user.role === 'finance') {
      state.requests.
      filter((r) => r.status === 'finance_review').
      forEach((r) =>
      items.push({
        key: `fn-${r.id}`, area: 'budget', refId: r.id, title: r.title, amount: prTotal(r),
        meta: r.lastReason ?? 'Chuyển từ Manager', action: 'Kiểm tra Budget', to: `/requests/${r.id}`, tone: 'warning'
      })
      );
      state.orders.
      filter((o) => o.status === 'received').
      forEach((o) =>
      items.push({
        key: `rc-${o.id}`, area: 'orders', refId: o.id, title: state.requests.find((r) => r.id === o.prId)?.title ?? o.id, amount: o.total,
        meta: o.reconciled ? 'Đã đối soát — sẵn sàng Close' : 'Receiving hoàn tất — cần đối soát PR ↔ PO ↔ Receiving',
        action: o.reconciled ? 'Close PR' : 'Đối soát', to: `/orders/${o.id}`, tone: o.reconciled ? 'success' : 'primary'
      })
      );
    }

    if (user.role === 'procurement') {
      state.requests.
      filter((r) => r.status === 'approved' || r.status === 'supplier_selected').
      forEach((r) => {
        const qs = state.quotations.filter((q) => q.prId === r.id);
        const confirmed = qs.filter((q) => q.status === 'confirmed').length;
        const pendingReview = qs.length - confirmed;
        const selected = r.status === 'supplier_selected';
        items.push({
          key: `sr-${r.id}`, area: 'sourcing', refId: r.id, title: r.title, amount: prTotal(r),
          meta: selected ?
          'Đã chọn Supplier — tạo PO' :
          `${confirmed}/${MIN_QUOTATIONS} Quotation đã xác nhận${pendingReview ? ` · ${pendingReview} chờ review dữ liệu AI` : ''}`,
          action: selected ? 'Tạo PO' : confirmed >= MIN_QUOTATIONS ? 'So sánh & chọn NCC' : 'Thu thập Quotation',
          to: `/sourcing/${r.id}`, tone: selected ? 'primary' : 'success'
        });
      });
      state.orders.
      filter((o) => o.status === 'received' && o.reconciled).
      forEach((o) =>
      items.push({
        key: `cl-${o.id}`, area: 'orders', refId: o.id, title: state.requests.find((r) => r.id === o.prId)?.title ?? o.id, amount: o.total,
        meta: 'Đã đối soát — sẵn sàng Close', action: 'Close PR', to: `/orders/${o.id}`, tone: 'success'
      })
      );
    }

    if (can(user, 'receiving.record')) {
      state.orders.
      filter((o) => o.status === 'issued' || o.status === 'partially_received').
      forEach((o) => {
        const pr = state.requests.find((r) => r.id === o.prId);
        if (!canViewOrderOf(user, pr)) return;
        items.push({
          key: `rv-${o.id}`, area: 'orders', refId: o.id, title: pr?.title ?? o.id, amount: o.total,
          meta: o.status === 'partially_received' ? 'Đã nhận một phần — ghi nhận phần còn lại' : `Dự kiến giao ${o.expectedDelivery.split('-').reverse().join('/')}`,
          action: 'Ghi nhận Receiving', to: `/orders/${o.id}`, tone: 'info'
        });
      });
    }

    return items;
  }, [state, user]);
}