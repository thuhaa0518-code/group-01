import React from 'react';
import { assumptions, excludedFromMvp, guardrails } from '../data/assumptions';
import { PageHeader } from '../components/ui/PageHeader';

export function AssumptionsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Prototype"
        title="Giả định cần xác nhận"
        description="Những quyết định prototype phải đưa ra khi requirements chưa quy định. Không có mục nào được coi là đã thống nhất." />
      

      <ol className="divide-y divide-line/70 rounded-lg border border-line bg-surface shadow-card">
        {assumptions.map((a) =>
        <li key={a.topic} className="grid gap-1 px-4 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
            <h2 className="text-sm font-semibold text-ink-900">{a.topic}</h2>
            <div>
              <p className="text-sm leading-relaxed text-ink-900">{a.assumption}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-700">
                <span className="font-semibold text-ink-900">Cần xác nhận:</span> {a.confirm}
              </p>
            </div>
          </li>
        )}
      </ol>

      <section className="mt-8 rounded-lg border border-line bg-surface p-4 shadow-card">
        <h2 className="text-sm font-semibold text-ink-900">Ngoài phạm vi MVP</h2>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {excludedFromMvp.map((x) =>
          <li key={x} className="rounded border border-line bg-canvas px-2 py-1 text-xs text-ink-700 line-through decoration-line-strong">
              {x}
            </li>
          )}
        </ul>
      </section>

      <section className="mt-4 rounded-lg border border-line bg-raised p-4">
        <h2 className="text-sm font-semibold text-ink-900">Nguyên tắc luôn được giữ</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-700">
          {guardrails.map((g) =>
          <li key={g}>{g}</li>
          )}
        </ul>
      </section>
    </div>);

}