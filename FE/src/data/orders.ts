import type { PurchaseOrder, Receiving } from '../types/procurement';

export const orders: PurchaseOrder[] = [
{
  id: 'PO-2026-0041', prId: 'PR-2026-0095', quotationId: 'q-0095-a', supplierId: 'sup-saomai', createdAt: '2026-09-18T14:00:00', createdBy: 'u-phuong',
  lines: [{ itemId: 'i1', name: 'Máy chiếu Full HD 4000 lumens', quantity: 2, unitPrice: 16_200_000 }], taxRate: 0.1, shippingFee: 300_000, total: 35_940_000,
  expectedDelivery: '2026-09-30', status: 'issued', reconciled: false
},
{
  id: 'PO-2026-0038', prId: 'PR-2026-0090', quotationId: 'q-0090-a', supplierId: 'sup-digiworld', createdAt: '2026-09-12T15:00:00', createdBy: 'u-phuong',
  lines: [{ itemId: 'i1', name: 'Tai nghe chống ồn không dây', quantity: 8, unitPrice: 2_250_000 }], taxRate: 0.1, shippingFee: 150_000, total: 19_950_000,
  expectedDelivery: '2026-09-24', status: 'received', reconciled: false
},
{
  id: 'PO-2026-0035', prId: 'PR-2026-0085', quotationId: 'q-0085-a', supplierId: 'sup-anphat', createdAt: '2026-09-05T10:00:00', createdBy: 'u-phuong',
  lines: [{ itemId: 'i1', name: 'Ổ cứng SSD NVMe 1TB', quantity: 6, unitPrice: 2_450_000 }], taxRate: 0.1, shippingFee: 0, total: 16_170_000,
  expectedDelivery: '2026-09-09', status: 'closed', reconciled: true, reconciledBy: 'u-ha', reconcileNote: 'Khớp PR ↔ PO ↔ Receiving, không có sai lệch.'
}];


export const receivings: Receiving[] = [
{ id: 'RCV-0038-1', poId: 'PO-2026-0038', receivedBy: 'u-trang', receivedAt: '2026-09-24T10:30:00', lines: [{ itemId: 'i1', quantity: 6 }], type: 'partial', note: 'Nhà cung cấp giao đợt 1.' },
{ id: 'RCV-0038-2', poId: 'PO-2026-0038', receivedBy: 'u-trang', receivedAt: '2026-09-26T15:10:00', lines: [{ itemId: 'i1', quantity: 2 }], type: 'discrepancy', note: '1 hộp tai nghe bị móp vỏ, sản phẩm hoạt động bình thường — đã chụp ảnh lưu hồ sơ.' },
{ id: 'RCV-0035-1', poId: 'PO-2026-0035', receivedBy: 'u-nam', receivedAt: '2026-09-10T09:00:00', lines: [{ itemId: 'i1', quantity: 6 }], type: 'full', note: 'Nhận đủ, niêm phong nguyên vẹn.' }];