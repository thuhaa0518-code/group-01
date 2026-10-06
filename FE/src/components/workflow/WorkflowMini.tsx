import React from 'react';
import { WORKFLOW_STEPS } from '../../utils/workflow';
import type { StepState } from '../../utils/workflow';

const SEGMENT: Record<StepState, string> = {
  completed: 'bg-success-600',
  current: 'bg-primary-600',
  blocked: 'bg-danger-600',
  exception: 'bg-warning-700',
  upcoming: 'bg-hairline'
};

export function WorkflowMini({ states }: {states: StepState[];}) {
  const currentIdx = states.findIndex((s) => s !== 'completed');
  const label = currentIdx === -1 ? 'Hoàn tất quy trình' : `Bước ${currentIdx + 1}/7: ${WORKFLOW_STEPS[currentIdx].label}`;
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={label} title={label}>
      {states.map((s, i) =>
      <span key={i} className={`h-1.5 w-3 rounded-full ${SEGMENT[s]}`} />
      )}
    </div>);

}