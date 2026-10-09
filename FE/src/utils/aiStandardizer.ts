import { aiCatalog } from '../data/aiCatalog';

export interface AISuggestion {
  title: string;
  category: string;
  justification: string;
  items: { name: string; specs: string; quantity: number; unit: string; estUnitPrice?: number }[];
  missing: string[];
  matched?: string[];
  requiredBy?: string | null;
  deliveryLocation?: string | null;
  budgetCode?: string | null;
  costCenter?: string | null;
}

const UNIT_WORDS = ['chiếc', 'cái', 'bộ', 'máy', 'người', 'unit', 'units', 'pcs', 'tờ', 'user'];
const NON_QUANTITY = /^(inch|"|gb|tb|hz|k|mp|w|lumens?|%|tr|triệu|đ|vnd|mb)/;

/** AI chỉ tái cấu trúc nội dung người dùng nhập — hỗ trợ Gọi Gemini 2.5 Flash API với fallback NLP nội bộ. */
export async function standardizeRequest(text: string): Promise<AISuggestion | null> {
  try {
    const res = await fetch('/api/v1/ai/standardize/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.ok && data.suggestion) {
        return data.suggestion as AISuggestion;
      }
    }
  } catch (err) {
    console.warn('Gemini API endpoint unavailable, falling back to local matcher:', err);
  }

  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      try {
        resolve(analyze(text));
      } catch (err) {
        reject(err);
      }
    }, 500);
  });
}

function analyze(text: string): AISuggestion | null {
  if (text.length > 1200) throw new Error('Nội dung quá dài để AI phân tích. Rút gọn dưới 1.200 ký tự và thử lại.');
  const lower = text.toLowerCase();
  const matches = aiCatalog.filter((e) => e.keywords.some((k) => lower.includes(k)));
  if (!matches.length) return null;

  const requiredBy = extractDate(text);
  const deliveryLocation = extractLocation(text);
  const estUnitPrice = extractPrice(text);

  const items = matches.map((m) => ({
    name: m.itemName,
    specs: m.specs,
    quantity: extractQuantity(lower, m.keywords) ?? 1,
    unit: m.unit,
    estUnitPrice: estUnitPrice ?? 0,
  }));

  const missing: string[] = [];
  if (!requiredBy) missing.push('Ngày cần hàng');
  if (!deliveryLocation) missing.push('Địa điểm giao hàng');
  if (!estUnitPrice) missing.push('Đơn giá dự toán từng dòng');

  const primary = matches[0];
  const trimmed = text.trim();
  return {
    title: matches.length > 1 ? `Mua ${primary.shortName} và thiết bị kèm theo` : `Mua ${primary.shortName}`,
    category: primary.category,
    justification: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
    items,
    requiredBy,
    deliveryLocation,
    missing,
    matched: matches.map((m) => m.shortName)
  };
}

function extractDate(text: string): string | null {
  const m = text.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/);
  if (m) {
    const day = m[1].padStart(2, '0');
    const month = m[2].padStart(2, '0');
    const year = m[3];
    return `${year}-${month}-${day}`;
  }
  return null;
}

function extractLocation(text: string): string | null {
  const m = text.match(/(giao tại|tại|giao ở|địa điểm:?)\s*([^.,;\n]+)/i);
  if (m) {
    let loc = m[2].trim();
    loc = loc.replace(/\s*(trước|hạn|ngày|\d{1,2}[\/\.-]).*$/i, '').trim();
    if (loc.length >= 3) return loc.charAt(0).toUpperCase() + loc.slice(1);
  }
  return null;
}

function extractPrice(text: string): number | undefined {
  const m = text.match(/(\d+(?:[\.,]\d+)?)\s*(triệu|tr|trđ|đ|vnd)/i);
  if (m) {
    const val = parseFloat(m[1].replace(',', '.'));
    const unit = m[2].toLowerCase();
    if (unit.includes('triệu') || unit === 'tr' || unit === 'trđ') {
      return val * 1_000_000;
    }
  }
  return undefined;
}

function extractQuantity(lower: string, keywords: string[]): number | undefined {
  for (const k of keywords) {
    const idx = lower.indexOf(k);
    if (idx < 0) continue;
    const windowText = lower.slice(Math.max(0, idx - 24), idx + k.length + 24);
    const found = pickQuantity(windowText);
    if (found) return found;
  }
  return pickQuantity(lower);
}

function pickQuantity(text: string): number | undefined {
  const re = /(\d{1,4})\s*([^\s\d,.;]*)/g;
  let fallback: number | undefined;
  let m: RegExpExecArray | null;
  while (m = re.exec(text)) {
    const n = parseInt(m[1], 10);
    const unit = m[2] ?? '';
    if (NON_QUANTITY.test(unit)) continue;
    if (UNIT_WORDS.includes(unit)) return n;
    if (fallback === undefined && n > 0 && n < 500) fallback = n;
  }
  return fallback;
}