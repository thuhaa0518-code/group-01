import React from 'react';
import { SparklesIcon } from 'lucide-react';
import type { Quotation, Supplier } from '../../types/procurement';
import type { Recommendation } from '../../utils/rules';
import { ANOMALY_PENALTY, RECOMMENDATION_WEIGHTS, quotationAnomalies } from '../../utils/rules';
import { formatVND } from '../../utils/format';

interface RecommendationPanelProps {
  recommendation: Recommendation;
  quotes: Quotation[];
  suppliers: Supplier[];
}

export function RecommendationPanel({ recommendation, quotes, suppliers }: RecommendationPanelProps) {
  const rec = quotes.find((q) => q.id === recommendation.recommendedId);
  if (!rec) return null;
  const score = recommendation.scores.find((s) => s.quotationId === rec.id);
  const name = (q: Quotation) => suppliers.find((s) => s.id === q.supplierId)?.name ?? '—';
  const others = recommendation.scores.filter((s) => s.quotationId !== rec.id);
  const cheapest = [...recommendation.scores].sort((a, b) => a.total - b.total)[0];

  const reasons: string[] = [];
  if (cheapest?.quotationId === rec.id) {
    const second = [...recommendation.scores].sort((a, b) => a.total - b.total)[1];
    reasons.push(`Tổng tiền thấp nhất ${formatVND(score?.total ?? 0)}${second ? `, rẻ hơn ${formatVND(second.total - (score?.total ?? 0))} so với phương án kế tiếp` : ''}.`);
  } else if (cheapest) {
    reasons.push(`Tổng tiền cao hơn phương án rẻ nhất ${formatVND((score?.total ?? 0) - cheapest.total)} nhưng bù lại bằng giao hàng / bảo hành.`);
  }
  reasons.push(`Giao hàng ${rec.deliveryDays} ngày, bảo hành ${rec.warrantyMonths} tháng.`);
  const flagged = quotes.filter((q) => q.id !== rec.id && quotationAnomalies(q).length);
  flagged.forEach((q) => reasons.push(`${name(q)} bị trừ ${ANOMALY_PENALTY} điểm vì có đơn giá bất thường so với lịch sử.`));

  return (
    <section className="rounded-lg border border-info-200 bg-info-50 p-5" aria-labelledby="rec-title">
      <h3 id="rec-title" className="inline-flex items-center gap-2 font-semibold text-ink-900">
        <SparklesIcon className="h-4 w-4 text-info-600" aria-hidden />
        AI Recommendation
      </h3>
      <p className="mt-2 text-sm text-ink-900">
        Đề xuất <span className="font-semibold">{name(rec)}</span> · {score?.score.toLocaleString('vi-VN')}/100 điểm
        {others.length > 0 &&
        <span className="text-ink-500"> (so với {others.map((o) => `${name(quotes.find((q) => q.id === o.quotationId) as Quotation)} ${o.score.toLocaleString('vi-VN')}`).join(', ')})</span>
        }
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-700">
        {reasons.map((r) =>
        <li key={r}>{r}</li>
        )}
      </ul>
      <p className="mt-3 text-xs text-ink-500">
        Tiêu chí: Tổng tiền {RECOMMENDATION_WEIGHTS.price * 100}% · Thời gian giao {RECOMMENDATION_WEIGHTS.delivery * 100}% · Bảo hành {RECOMMENDATION_WEIGHTS.warranty * 100}% · trừ{' '}
        {ANOMALY_PENALTY} điểm nếu có giá bất thường. AI chỉ đề xuất — Procurement là người quyết định Supplier (REQ-BR-08).
      </p>
    </section>);

}