import type { Quotation } from '../types/procurement';

export const quotations: Quotation[] = [
{
  id: 'q-0098-a', prId: 'PR-2026-0098', supplierId: 'sup-hoaphat', fileName: 'BaoGia_HoaPhatPro_GheCongThaiHoc.pdf', fileType: 'pdf',
  lines: [{ itemId: 'i1', name: 'Ghế công thái học lưng lưới', quantity: 10, unitPrice: 4_900_000 }], taxRate: 0.1, shippingFee: 500_000, deliveryDays: 7, warrantyMonths: 36,
  status: 'confirmed', aiConfidence: 0.94, lowConfidence: [], editedFields: [],
  original: { lines: [{ itemId: 'i1', name: 'Ghế công thái học lưng lưới', quantity: 10, unitPrice: 4_900_000 }], taxRate: 0.1, shippingFee: 500_000, deliveryDays: 7, warrantyMonths: 36 },
  createdAt: '2026-09-21T09:40:00'
},
{
  id: 'q-0098-b', prId: 'PR-2026-0098', supplierId: 'sup-ergo', fileName: 'Ergonomic_Viet_Quote_09-2026.xlsx', fileType: 'excel',
  lines: [{ itemId: 'i1', name: 'Ghế công thái học lưng lưới', quantity: 10, unitPrice: 5_900_000 }], taxRate: 0.1, shippingFee: 0, deliveryDays: 5, warrantyMonths: 60,
  status: 'extracted', aiConfidence: 0.78, lowConfidence: ['warrantyMonths'], editedFields: [],
  original: { lines: [{ itemId: 'i1', name: 'Ghế công thái học lưng lưới', quantity: 10, unitPrice: 5_900_000 }], taxRate: 0.1, shippingFee: 0, deliveryDays: 5, warrantyMonths: 60 },
  createdAt: '2026-09-22T10:15:00'
},
{
  id: 'q-0095-a', prId: 'PR-2026-0095', supplierId: 'sup-saomai', fileName: 'SaoMai_BaoGia_MayChieu.pdf', fileType: 'pdf',
  lines: [{ itemId: 'i1', name: 'Máy chiếu Full HD 4000 lumens', quantity: 2, unitPrice: 16_200_000 }], taxRate: 0.1, shippingFee: 300_000, deliveryDays: 10, warrantyMonths: 24,
  status: 'confirmed', aiConfidence: 0.91, lowConfidence: [], editedFields: [],
  original: { lines: [{ itemId: 'i1', name: 'Máy chiếu Full HD 4000 lumens', quantity: 2, unitPrice: 16_200_000 }], taxRate: 0.1, shippingFee: 300_000, deliveryDays: 10, warrantyMonths: 24 },
  createdAt: '2026-09-15T09:00:00'
},
{
  id: 'q-0095-b', prId: 'PR-2026-0095', supplierId: 'sup-anphat', fileName: 'AnPhat_Quotation_Projector.xlsx', fileType: 'excel',
  lines: [{ itemId: 'i1', name: 'Máy chiếu Full HD 4000 lumens', quantity: 2, unitPrice: 17_500_000 }], taxRate: 0.1, shippingFee: 0, deliveryDays: 7, warrantyMonths: 24,
  status: 'confirmed', aiConfidence: 0.88, lowConfidence: [], editedFields: ['shippingFee'],
  original: { lines: [{ itemId: 'i1', name: 'Máy chiếu Full HD 4000 lumens', quantity: 2, unitPrice: 17_500_000 }], taxRate: 0.1, shippingFee: 200_000, deliveryDays: 7, warrantyMonths: 24 },
  createdAt: '2026-09-15T10:30:00'
},
{
  id: 'q-0090-a', prId: 'PR-2026-0090', supplierId: 'sup-digiworld', fileName: 'DigiWorld_Headset_Quote.pdf', fileType: 'pdf',
  lines: [{ itemId: 'i1', name: 'Tai nghe chống ồn không dây', quantity: 8, unitPrice: 2_250_000 }], taxRate: 0.1, shippingFee: 150_000, deliveryDays: 5, warrantyMonths: 12,
  status: 'confirmed', aiConfidence: 0.93, lowConfidence: [], editedFields: [],
  original: { lines: [{ itemId: 'i1', name: 'Tai nghe chống ồn không dây', quantity: 8, unitPrice: 2_250_000 }], taxRate: 0.1, shippingFee: 150_000, deliveryDays: 5, warrantyMonths: 12 },
  createdAt: '2026-09-10T09:00:00'
},
{
  id: 'q-0090-b', prId: 'PR-2026-0090', supplierId: 'sup-saomai', fileName: 'SaoMai_TaiNghe.xlsx', fileType: 'excel',
  lines: [{ itemId: 'i1', name: 'Tai nghe chống ồn không dây', quantity: 8, unitPrice: 2_400_000 }], taxRate: 0.1, shippingFee: 0, deliveryDays: 4, warrantyMonths: 12,
  status: 'confirmed', aiConfidence: 0.9, lowConfidence: [], editedFields: [],
  original: { lines: [{ itemId: 'i1', name: 'Tai nghe chống ồn không dây', quantity: 8, unitPrice: 2_400_000 }], taxRate: 0.1, shippingFee: 0, deliveryDays: 4, warrantyMonths: 12 },
  createdAt: '2026-09-10T11:00:00'
},
{
  id: 'q-0085-a', prId: 'PR-2026-0085', supplierId: 'sup-anphat', fileName: 'AnPhat_SSD.pdf', fileType: 'pdf',
  lines: [{ itemId: 'i1', name: 'Ổ cứng SSD NVMe 1TB', quantity: 6, unitPrice: 2_450_000 }], taxRate: 0.1, shippingFee: 0, deliveryDays: 3, warrantyMonths: 60,
  status: 'confirmed', aiConfidence: 0.95, lowConfidence: [], editedFields: [],
  original: { lines: [{ itemId: 'i1', name: 'Ổ cứng SSD NVMe 1TB', quantity: 6, unitPrice: 2_450_000 }], taxRate: 0.1, shippingFee: 0, deliveryDays: 3, warrantyMonths: 60 },
  createdAt: '2026-09-03T09:00:00'
},
{
  id: 'q-0085-b', prId: 'PR-2026-0085', supplierId: 'sup-digiworld', fileName: 'DigiWorld_SSD.xlsx', fileType: 'excel',
  lines: [{ itemId: 'i1', name: 'Ổ cứng SSD NVMe 1TB', quantity: 6, unitPrice: 2_600_000 }], taxRate: 0.1, shippingFee: 100_000, deliveryDays: 2, warrantyMonths: 60,
  status: 'confirmed', aiConfidence: 0.9, lowConfidence: [], editedFields: [],
  original: { lines: [{ itemId: 'i1', name: 'Ổ cứng SSD NVMe 1TB', quantity: 6, unitPrice: 2_600_000 }], taxRate: 0.1, shippingFee: 100_000, deliveryDays: 2, warrantyMonths: 60 },
  createdAt: '2026-09-03T10:00:00'
}];