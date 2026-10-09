import { aiCatalog } from '../data/aiCatalog';

export interface AISuggestion {
  title: string;
  category: string;
  justification: string;
  items: {name: string;specs: string;quantity: number;unit: string;}[];
  missing: string[];
  matched: string[];
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

  const items = matches.map((m) => ({
    name: m.itemName,
    specs: m.specs,
    quantity: extractQuantity(lower, m.keywords) ?? 1,
    unit: m.unit
  }));
  const missing = matches.flatMap((m) => m.missing);
  if (!/(ngày|trước|deadline|\d{1,2}\/\d{1,2})/.test(lower)) missing.push('Ngày cần hàng — AI không tự điền ngày');
  if (!/(tầng|văn phòng|địa chỉ|chi nhánh|tòa)/.test(lower)) missing.push('Địa điểm giao hàng');
  missing.push('Đơn giá dự toán từng dòng — AI không tự điền giá');

  const primary = matches[0];
  const trimmed = text.trim();
  return {
    title: matches.length > 1 ? `Mua ${primary.shortName} và thiết bị kèm theo` : `Mua ${primary.shortName}`,
    category: primary.category,
    justification: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
    items,
    missing,
    matched: matches.map((m) => m.shortName)
  };
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