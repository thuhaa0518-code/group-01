import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon } from 'lucide-react';
import type { PRStatus } from '../types/procurement';
import { useCurrentUser } from '../contexts/AuthContext';
import { useProcurement } from '../contexts/ProcurementContext';
import { can, canViewRequest } from '../utils/permissions';
import { prFlags } from '../utils/rules';
import { STATUS_META } from '../utils/workflow';
import { inputClass } from '../utils/styles';
import { PageHeader } from '../components/ui/PageHeader';
import { RequestTable } from '../components/requests/RequestTable';
import { buttonClass } from '../components/ui/Button';

const SCOPE_TEXT = {
  employee: 'PR do bạn tạo.',
  manager: 'PR thuộc phòng ban bạn quản lý.',
  finance: 'PR được chuyển Finance và PR đang ở bước PO / Receiving để đối soát.',
  procurement: 'PR đã được phê duyệt, sẵn sàng cho Sourcing và PO.',
  admin: 'Toàn bộ PR trong hệ thống (chỉ xem).'
};

export function RequestsPage() {
  const user = useCurrentUser();
  const { state } = useProcurement();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<PRStatus | 'all'>('all');
  const [onlyWarnings, setOnlyWarnings] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(t);
  }, []);

  const visible = useMemo(() => state.requests.filter((r) => canViewRequest(user, r)), [state.requests, user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visible.
    filter((r) => status === 'all' || r.status === status).
    filter((r) => !q || r.id.toLowerCase().includes(q) || r.title.toLowerCase().includes(q)).
    filter((r) => !onlyWarnings || prFlags(r, state.budgets.find((b) => b.code === r.budgetCode)).length > 0).
    sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [visible, status, query, onlyWarnings, state.budgets]);

  const statusOptions = Array.from(new Set(visible.map((r) => r.status)));

  return (
    <div>
      <PageHeader
        title="Purchase Requests"
        description={SCOPE_TEXT[user.role]}
        actions={
        can(user, 'pr.create') &&
        <Link to="/requests/new" className={buttonClass('primary')}>
              New request
            </Link>

        } />
      

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative md:w-80">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden />
          <label htmlFor="pr-search" className="sr-only">
            Tìm kiếm PR
          </label>
          <input
            id="pr-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo mã hoặc tiêu đề"
            className={`${inputClass()} pl-9`} />
          
        </div>
        <label htmlFor="pr-status" className="sr-only">
          Lọc trạng thái
        </label>
        <select id="pr-status" value={status} onChange={(e) => setStatus(e.target.value as PRStatus | 'all')} className={`${inputClass()} md:w-56`}>
          <option value="all">Tất cả trạng thái</option>
          {statusOptions.map((s) =>
          <option key={s} value={s}>
              {STATUS_META[s].label}
            </option>
          )}
        </select>
        <label className="inline-flex items-center gap-2 text-sm text-ink-700">
          <input type="checkbox" checked={onlyWarnings} onChange={(e) => setOnlyWarnings(e.target.checked)} className="h-4 w-4 rounded border-line text-primary-600 focus:ring-primary-600" />
          Chỉ PR có cảnh báo Budget
        </label>
        <span className="text-sm text-ink-500 md:ml-auto">{filtered.length} kết quả</span>
      </div>

      <RequestTable
        requests={filtered}
        loading={loading}
        emptyTitle={visible.length ? 'Không có PR phù hợp bộ lọc' : 'Chưa có Purchase Request'}
        emptyDescription={visible.length ? 'Thử bỏ bớt điều kiện lọc.' : can(user, 'pr.create') ? 'Tạo PR đầu tiên để bắt đầu quy trình mua sắm.' : 'Chưa có PR nào trong phạm vi của bạn.'} />
      
    </div>);

}