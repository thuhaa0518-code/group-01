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
  
  const matches = aiCatalog.filter((e) => {
    const matchedKeyword = e.keywords.find((k) => lower.includes(k));
    if (!matchedKeyword) return false;
    const hasBetterMatch = aiCatalog.some((other) => {
      if (other === e) return false;
      const otherKeyword = other.keywords.find((k) => lower.includes(k));
      return otherKeyword && otherKeyword.length > matchedKeyword.length && otherKeyword.includes(matchedKeyword);
    });
    return !hasBetterMatch;
  });

  const requiredBy = extractDate(text);
  const deliveryLocation = extractLocation(text);
  const estUnitPrice = extractPrice(text);

  let items: { name: string; specs: string; quantity: number; unit: string; estUnitPrice?: number }[] = [];
  let category = 'Văn phòng phẩm';
  let title = 'Yêu cầu mua sắm';

  if (matches.length > 0) {
    const primary = matches[0];
    category = primary.category;
    title = matches.length > 1 ? `Mua ${primary.shortName} và thiết bị kèm theo` : `Mua ${primary.shortName}`;
    items = matches.map((m) => ({
      name: m.itemName,
      specs: m.specs,
      quantity: extractQuantity(lower, m.keywords) ?? 1,
      unit: m.unit,
      estUnitPrice: estUnitPrice ?? 0,
    }));
  } else {
    // Dynamic fallback for ANY unlisted product!
    const productName = extractProductName(text);
    category = guessCategory(lower);
    title = `Mua ${productName}`;
    const qty = extractQuantity(lower, []) ?? 1;
    const unit = extractUnit(lower) ?? 'cái';
    items = [{
      name: productName.charAt(0).toUpperCase() + productName.slice(1),
      specs: `Yêu cầu mua ${productName} theo mô tả của người dùng`,
      quantity: qty,
      unit,
      estUnitPrice: estUnitPrice ?? 0,
    }];
  }

  const missing: string[] = [];
  if (!requiredBy) missing.push('Ngày cần hàng');
  if (!deliveryLocation) missing.push('Địa điểm giao hàng');
  if (!estUnitPrice) missing.push('Đơn giá dự toán từng dòng');

  const trimmed = text.trim();
  return {
    title,
    category,
    justification: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
    items,
    requiredBy,
    deliveryLocation,
    missing,
    matched: matches.map((m) => m.shortName)
  };
}

function extractProductName(text: string): string {
  const m = text.match(/(mua|cần|sắm|yêu cầu)\s+(\d+\s*(?:cây|cái|chiếc|bộ|hộp|ram|quyển|tờ|thùng|bọc|gói)?\s*)?([^,.\n]+)/i);
  if (m && m[3]) {
    let name = m[3].trim();
    name = name.replace(/\s*(giá|giao|tại|trước|hạn|ngày|\d+).*/i, '').trim();
    if (name.length >= 2) return name;
  }
  return 'sản phẩm / dịch vụ';
}

function guessCategory(lower: string): string {
  if (/(bút|giấy|sổ|văn phòng phẩm|mực|kéo|kẹp|thước|bìa|ghim|băng dính)/.test(lower)) return 'Văn phòng phẩm';
  if (/(laptop|máy tính|màn hình|chuột|bàn phím|ram|ssd|máy in|server|ổ cứng|pc|workstation)/.test(lower)) return 'Thiết bị CNTT';
  if (/(bàn|ghế|tủ|kệ|nội thất|sofa|salon|giường|đồ gỗ|rèm|thảm|vách ngăn|bàn làm việc)/.test(lower)) return 'Nội thất văn phòng';
  if (/(máy chiếu|loa|micro|phòng họp|tivi|màn chiếu|soundbar|camera họp)/.test(lower)) return 'Thiết bị phòng họp';
  if (/(in|brochure|standee|marketing|tờ rơi|băng rôn|quảng cáo|poster|catalogue)/.test(lower)) return 'In ấn & Marketing';
  if (/(phần mềm|dịch vụ|bảo trì|bản quyền|license|cloud|vps|hosting|domain|tư vấn|sửa chữa|đào tạo)/.test(lower)) return 'Phần mềm & Dịch vụ';
  return 'Văn phòng phẩm';
}

function extractUnit(lower: string): string | undefined {
  const units = ['cây', 'bộ', 'cái', 'chiếc', 'hộp', 'ram', 'quyển', 'tờ', 'thùng', 'bọc', 'gói', 'máy', 'người', 'unit', 'pcs'];
  for (const u of units) {
    if (new RegExp(`\\b${u}\\b`, 'i').test(lower)) return u;
  }
  return undefined;
}

function extractDate(text: string): string | null {
  let m = text.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/);
  if (m) {
    const day = m[1].padStart(2, '0');
    const month = m[2].padStart(2, '0');
    const year = m[3];
    return `${year}-${month}-${day}`;
  }
  m = text.match(/(\d{1,2})[\/\.-](\d{1,2})/);
  if (m) {
    const day = m[1].padStart(2, '0');
    const month = m[2].padStart(2, '0');
    const year = new Date().getFullYear();
    return `${year}-${month}-${day}`;
  }
  return null;
}

function extractLocation(text: string): string | null {
  const m = text.match(/(giao tại|tại|giao ở|địa điểm:?)\s*([^.,;\n]+)/i);
  if (m) {
    let loc = m[2].trim();
    loc = loc.replace(/\s*(giao|trước|hạn|ngày|\d{1,2}[\/\.-]).*$/i, '').trim();
    if (loc.length >= 3) return loc.charAt(0).toUpperCase() + loc.slice(1);
  }
  return null;
}

function extractPrice(text: string): number | undefined {
  const m = text.match(/(\d+(?:[\.,]\d+)?)\s*(triệu|tr|trđ|triệu đồng|tỷ|k|đ|vnd)/i);
  if (m) {
    const val = parseFloat(m[1].replace(',', '.'));
    const unit = m[2].toLowerCase();
    if (unit.includes('triệu') || unit === 'tr' || unit === 'trđ') {
      return val * 1_000_000;
    }
    if (unit === 'k') return val * 1_000;
    if (unit === 'tỷ') return val * 1_000_000_000;
    if (unit === 'đ' || unit === 'vnd') return val;
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