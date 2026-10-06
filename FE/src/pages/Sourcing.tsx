import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, CircleCheckIcon } from 'lucide-react';
import { useProcurement } from '../contexts/ProcurementContext';
import { MIN_QUOTATIONS, prTotal } from '../utils/rules';
import { formatDate, formatVND } from '../utils/format';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';

export function SourcingPage() {
  const { state } = useProcurement();
  const list = state.requests.
  filter((r) => r.status === 'approved' || r.status === 'supplier_selected').
  sort((a, b) => (a.requiredBy || '').localeCompare(b.requiredBy || ''));

  return (
    <div>
      <PageHeader title="Sourcing" description="PR đã được phê duyệt — thu thập Quotation, review dữ liệu AI, so sánh và chọn Supplier." />
      {list.length === 0 ?
      <div className="rounded-lg border border-hairline">
          <EmptyState icon={CircleCheckIcon} title="Không có PR cần Sourcing" description="PR sẽ xuất hiện sau khi hoàn tất bước Approve." />
        </div> :

      <ul className="divide-y divide-hairline border-y border-hairline">
          {list.map((pr) => {
          const qs = state.quotations.filter((q) => q.prId === pr.id);
          const confirmed = qs.filter((q) => q.status === 'confirmed').length;
          const next = pr.status === 'supplier_selected' ? 'Tạo PO' : confirmed >= MIN_QUOTATIONS ? 'So sánh & chọn NCC' : 'Thu thập Quotation';
          return (
            <li key={pr.id}>
                <Link to={`/sourcing/${pr.id}`} className="group grid gap-3 py-4 transition-colors duration-150 hover:bg-canvas sm:px-2 md:grid-cols-[1fr_180px_160px_auto] md:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-ink-500">{pr.id}</span>
                      <StatusBadge status={pr.status} />
                    </div>
                    <p className="mt-0.5 truncate font-semibold text-ink-900">{pr.title}</p>
                    <p className="text-xs text-ink-500">
                      {pr.category} · Cần trước {formatDate(pr.requiredBy)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-500">Quotation đã xác nhận</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex gap-0.5" aria-hidden>
                        {Array.from({ length: Math.max(MIN_QUOTATIONS, qs.length) }).map((_, i) =>
                      <span key={i} className={`h-1.5 w-5 rounded-full ${i < confirmed ? 'bg-success-600' : i < qs.length ? 'bg-warning-700' : 'bg-hairline'}`} />
                      )}
                      </div>
                      <span className="text-sm tabular-nums text-ink-900">
                        {confirmed}/{qs.length || MIN_QUOTATIONS}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold tabular-nums text-ink-900 md:text-right">{formatVND(prTotal(pr))}</p>
                  <span className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-primary-600">
                    {next}
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </li>);

        })}
        </ul>
      }
    </div>);

}