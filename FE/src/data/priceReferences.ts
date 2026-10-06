import type { PriceReference } from '../types/procurement';

export const priceReferences: PriceReference[] = [
{ key: 'laptop', label: 'Laptop văn phòng hiệu năng cao', keywords: ['laptop', 'máy tính xách tay'], avgUnitPrice: 21_500_000, samples: 18, period: '03/2026 – 08/2026' },
{ key: 'monitor', label: 'Màn hình 24–27 inch', keywords: ['màn hình', 'monitor'], avgUnitPrice: 6_200_000, samples: 22, period: '03/2026 – 08/2026' },
{ key: 'chair', label: 'Ghế công thái học', keywords: ['ghế'], avgUnitPrice: 4_800_000, samples: 11, period: '01/2026 – 08/2026' },
{ key: 'projector', label: 'Máy chiếu phòng họp', keywords: ['máy chiếu', 'projector'], avgUnitPrice: 15_500_000, samples: 6, period: '01/2026 – 08/2026' },
{ key: 'headset', label: 'Tai nghe chống ồn', keywords: ['tai nghe', 'headset'], avgUnitPrice: 2_200_000, samples: 15, period: '03/2026 – 08/2026' },
{ key: 'peripheral', label: 'Bàn phím / chuột', keywords: ['bàn phím', 'chuột', 'keyboard', 'mouse'], avgUnitPrice: 1_100_000, samples: 30, period: '03/2026 – 08/2026' },
{ key: 'ssd', label: 'Ổ cứng SSD', keywords: ['ssd', 'ổ cứng'], avgUnitPrice: 2_400_000, samples: 25, period: '03/2026 – 08/2026' },
{ key: 'printer', label: 'Máy in văn phòng', keywords: ['máy in'], avgUnitPrice: 8_500_000, samples: 7, period: '01/2026 – 08/2026' }];