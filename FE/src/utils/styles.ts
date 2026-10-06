export type Tone = 'neutral' | 'info' | 'warning' | 'success' | 'danger' | 'primary';

export const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-canvas text-ink-700 border-line-strong',
  info: 'bg-info-50 text-info-600 border-info-200',
  warning: 'bg-warning-50 text-warning-700 border-warning-200',
  success: 'bg-success-50 text-success-700 border-success-200',
  danger: 'bg-danger-50 text-danger-700 border-danger-200',
  primary: 'bg-primary-50 text-primary-700 border-primary-200'
};

/** Card surface used across the workspace. */
export const CARD = 'rounded-lg border border-line bg-surface shadow-card';
/** Table header row. */
export const TH_ROW = 'border-b border-line bg-raised text-left text-2xs uppercase tracking-wide text-ink-500';
/** Table body row. */
export const TR = 'border-b border-line/70 last:border-0';

const FIELD_BASE =
'block w-full rounded-md border bg-surface px-2.5 text-sm text-ink-900 placeholder:text-ink-500 transition-colors duration-150 ease-exp focus:border-primary-600 focus:outline-none disabled:cursor-not-allowed disabled:bg-canvas disabled:text-ink-500';

export function inputClass(invalid = false): string {
  return `${FIELD_BASE} h-9 ${invalid ? 'border-danger-600' : 'border-line'}`;
}

export function textareaClass(invalid = false): string {
  return `${FIELD_BASE} min-h-[84px] resize-y py-2 leading-relaxed ${invalid ? 'border-danger-600' : 'border-line'}`;
}