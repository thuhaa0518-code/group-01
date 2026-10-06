import React from 'react';
import { CheckIcon, TriangleAlertIcon, XIcon } from 'lucide-react';
import { WORKFLOW_STEPS } from '../../utils/workflow';
import type { StepState } from '../../utils/workflow';

const MARKER: Record<StepState, string> = {
  completed: 'border-success-200 bg-success-50 text-success-700',
  current: 'border-primary-600 bg-primary-600 text-white',
  blocked: 'border-danger-200 bg-danger-50 text-danger-600',
  exception: 'border-warning-200 bg-warning-50 text-warning-700',
  upcoming: 'border-line bg-surface text-ink-500'
};

const STATE_SR: Record<StepState, string> = {
  completed: 'hoàn tất',
  current: 'đang xử lý',
  blocked: 'bị chặn',
  exception: 'cần chỉnh sửa',
  upcoming: 'chưa tới'
};

export function WorkflowStepper({ states }: {states: StepState[];}) {
  return (
    <nav aria-label="Tiến độ quy trình" className="overflow-x-auto">
      <ol className="flex min-w-[40rem] items-center gap-1.5">
        {WORKFLOW_STEPS.map((step, i) => {
          const s = states[i];
          return (
            <li key={step.key} className="flex min-w-0 flex-1 items-center gap-1.5" aria-current={s === 'current' ? 'step' : undefined}>
              <span className={`flex h-5 w-5 flex-none items-center justify-center rounded-full border text-2xs font-semibold ${MARKER[s]}`}>
                {s === 'completed' ?
                <CheckIcon className="h-3 w-3" aria-hidden /> :
                s === 'blocked' ?
                <XIcon className="h-3 w-3" aria-hidden /> :
                s === 'exception' ?
                <TriangleAlertIcon className="h-3 w-3" aria-hidden /> :

                i + 1
                }
              </span>
              <span className={`truncate text-2xs ${s === 'current' || s === 'blocked' || s === 'exception' ? 'font-semibold text-ink-900' : s === 'completed' ? 'text-ink-700' : 'text-ink-500'}`}>
                {step.label}
                <span className="sr-only"> — {STATE_SR[s]}</span>
              </span>
              {i < WORKFLOW_STEPS.length - 1 && <span aria-hidden className={`h-px flex-1 ${s === 'completed' ? 'bg-success-200' : 'bg-line'}`} />}
            </li>);

        })}
      </ol>
    </nav>);

}