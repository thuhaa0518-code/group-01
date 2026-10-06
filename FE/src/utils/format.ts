import { format, parseISO } from 'date-fns';

const vnd = new Intl.NumberFormat('vi-VN');

export function formatVND(value: number): string {
  return `${vnd.format(Math.round(value))} ₫`;
}

export function formatCompactVND(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tỷ`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr`;
  return formatVND(value);
}

export function formatNumber(value: number): string {
  return vnd.format(value);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`;
}

export function formatDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'dd/MM/yyyy');
  } catch {
    return iso;
  }
}

export function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'dd/MM/yyyy HH:mm');
  } catch {
    return iso;
  }
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts.length > 1 ? parts[parts.length - 2][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2)).toUpperCase();
}