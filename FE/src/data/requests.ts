import type { PurchaseRequest } from '../types/procurement';

const IT = { department: 'Công nghệ thông tin', costCenter: 'CC-IT-01', budgetCode: 'BGT-IT-2026' };
const MKT = { department: 'Marketing', costCenter: 'CC-MKT-01', budgetCode: 'BGT-MKT-2026' };
const HQ = 'Tầng 8, Tòa nhà Sông Đà, 18 Phạm Hùng, Hà Nội';

export const requests: PurchaseRequest[] = [
{
  id: 'PR-2026-0106', ...IT, title: 'Máy in cho phòng kế hoạch', category: 'Thiết bị CNTT', requiredBy: '', deliveryLocation: '',
  justification: 'Máy in hiện tại hỏng', items: [{ id: 'i1', name: 'Máy in', specs: '', quantity: 1, unit: 'chiếc', estUnitPrice: 0 }],
  requesterId: 'u-nam', createdAt: '2026-09-27T16:20:00', updatedAt: '2026-09-27T16:20:00', status: 'draft', routedToFinance: false, aiReview: 'none'
},
{
  id: 'PR-2026-0103', ...IT, title: 'Bộ bàn phím và chuột không dây cho phòng họp', category: 'Thiết bị CNTT', requiredBy: '2026-10-15', deliveryLocation: HQ,
  justification: 'Trang bị bàn phím, chuột không dây cho 3 phòng họp để trình chiếu và demo sản phẩm.',
  items: [{ id: 'i1', name: 'Bộ bàn phím và chuột không dây', specs: 'Kết nối Bluetooth + USB receiver, layout US, pin sạc', quantity: 3, unit: 'bộ', estUnitPrice: 1_200_000 }],
  requesterId: 'u-vietanh', createdAt: '2026-09-27T10:05:00', updatedAt: '2026-09-27T10:05:00', status: 'pending_manager', routedToFinance: false, aiReview: 'accepted'
},
{
  id: 'PR-2026-0102', ...IT, title: 'Màn hình 27 inch cho nhóm QA', category: 'Thiết bị CNTT', requiredBy: '2026-10-12', deliveryLocation: HQ,
  justification: 'Nhóm QA cần màn hình thứ hai để chạy song song test case và công cụ theo dõi lỗi.',
  items: [{ id: 'i1', name: 'Màn hình 27 inch 2K', specs: 'Tấm nền IPS, độ phân giải 2560×1440, cổng HDMI + USB-C, chân xoay dọc', quantity: 4, unit: 'chiếc', estUnitPrice: 6_500_000 }],
  requesterId: 'u-nam', createdAt: '2026-09-26T09:30:00', updatedAt: '2026-09-26T09:30:00', status: 'pending_manager', routedToFinance: false, aiReview: 'edited'
},
{
  id: 'PR-2026-0101', ...IT, title: 'Laptop cho nhóm phát triển Backend', category: 'Thiết bị CNTT', requiredBy: '2026-10-20', deliveryLocation: HQ,
  justification: 'Bổ sung laptop cho 5 kỹ sư mới onboard tháng 10, cần cấu hình đủ để chạy Docker và IDE.',
  items: [{ id: 'i1', name: 'Laptop văn phòng 14" hiệu năng cao', specs: 'CPU Intel Core i7-1355U, RAM 32GB, SSD 1TB, màn hình 14" 2.8K, bảo hành 24 tháng', quantity: 5, unit: 'chiếc', estUnitPrice: 24_000_000 }],
  requesterId: 'u-nam', createdAt: '2026-09-25T14:10:00', updatedAt: '2026-09-25T14:10:00', status: 'pending_manager', routedToFinance: false, aiReview: 'accepted'
},
{
  id: 'PR-2026-0104', ...MKT, title: 'In ấn ấn phẩm sự kiện ra mắt sản phẩm Q4', category: 'In ấn & Marketing', requiredBy: '2026-10-25', deliveryLocation: 'Trung tâm Hội nghị Quốc gia, Hà Nội',
  justification: 'Ấn phẩm phục vụ sự kiện ra mắt sản phẩm ngày 30/10 với khoảng 1.500 khách mời.',
  items: [
  { id: 'i1', name: 'Brochure A4 gấp 3', specs: 'Giấy C150, in 4 màu 2 mặt, cán mờ', quantity: 2000, unit: 'tờ', estUnitPrice: 9_000 },
  { id: 'i2', name: 'Standee cuốn 80×200cm', specs: 'Bạt Hiflex, khung nhôm, in UV', quantity: 10, unit: 'bộ', estUnitPrice: 1_500_000 },
  { id: 'i3', name: 'Backdrop sân khấu 6×3m', specs: 'Khung sắt, bạt in UV, lắp đặt tại chỗ', quantity: 1, unit: 'bộ', estUnitPrice: 5_000_000 }],

  requesterId: 'u-trang', createdAt: '2026-09-22T08:45:00', updatedAt: '2026-09-23T11:00:00', status: 'finance_review', routedToFinance: true, aiReview: 'accepted',
  lastReason: 'PR vượt Budget khả dụng của phòng Marketing (còn 15,5 tr). Đề nghị Finance xem xét điều chỉnh ngân sách sự kiện.'
},
{
  id: 'PR-2026-0099', ...IT, title: 'License phần mềm quản lý dự án (12 tháng)', category: 'Phần mềm & Dịch vụ', requiredBy: '2026-10-30', deliveryLocation: 'Bàn giao điện tử',
  justification: 'Chuẩn hóa quản lý dự án cho khối kỹ thuật thay cho bảng tính rời rạc.',
  items: [{ id: 'i1', name: 'License phần mềm quản lý dự án', specs: 'Gói Business, thanh toán theo năm', quantity: 12, unit: 'user', estUnitPrice: 2_400_000 }],
  requesterId: 'u-nam', createdAt: '2026-09-21T13:00:00', updatedAt: '2026-09-24T09:20:00', status: 'revision', routedToFinance: false, aiReview: 'dismissed',
  lastReason: 'Bổ sung số lượng user chính xác theo danh sách nhân sự và so sánh gói Standard/Business trước khi gửi lại.'
},
{
  id: 'PR-2026-0098', ...IT, title: 'Ghế công thái học cho phòng CNTT', category: 'Nội thất văn phòng', requiredBy: '2026-10-10', deliveryLocation: HQ,
  justification: 'Thay thế 10 ghế đã xuống cấp, giảm đau lưng cho nhân sự ngồi làm việc liên tục.',
  items: [{ id: 'i1', name: 'Ghế công thái học lưng lưới', specs: 'Tựa đầu, tay 4D, đệm ngồi trượt, chịu tải 120kg', quantity: 10, unit: 'chiếc', estUnitPrice: 5_000_000 }],
  requesterId: 'u-nam', createdAt: '2026-09-18T10:00:00', updatedAt: '2026-09-20T15:30:00', status: 'approved', routedToFinance: false, aiReview: 'accepted', approvedAt: '2026-09-20T15:30:00'
},
{
  id: 'PR-2026-0095', ...IT, title: 'Máy chiếu phòng họp tầng 8', category: 'Thiết bị phòng họp', requiredBy: '2026-10-01', deliveryLocation: HQ,
  justification: 'Trang bị máy chiếu cho 2 phòng họp mới cải tạo.',
  items: [{ id: 'i1', name: 'Máy chiếu Full HD 4000 lumens', specs: 'Độ phân giải 1920×1080, 4000 ANSI lumens, HDMI ×2, kèm giá treo trần', quantity: 2, unit: 'chiếc', estUnitPrice: 16_000_000 }],
  requesterId: 'u-nam', createdAt: '2026-09-12T09:00:00', updatedAt: '2026-09-18T14:00:00', status: 'po_created', routedToFinance: false, aiReview: 'accepted', approvedAt: '2026-09-14T10:00:00',
  selectedQuotationId: 'q-0095-a', poId: 'PO-2026-0041'
},
{
  id: 'PR-2026-0092', ...MKT, title: 'Máy ảnh quay vlog cho team Content', category: 'Thiết bị CNTT', requiredBy: '2026-10-05', deliveryLocation: HQ,
  justification: 'Sản xuất nội dung video ngắn cho kênh mạng xã hội.',
  items: [{ id: 'i1', name: 'Máy ảnh mirrorless quay 4K', specs: 'Cảm biến APS-C, quay 4K 60fps, kèm lens kit', quantity: 1, unit: 'bộ', estUnitPrice: 45_000_000 }],
  requesterId: 'u-trang', createdAt: '2026-09-15T11:00:00', updatedAt: '2026-09-16T09:00:00', status: 'rejected', routedToFinance: false, aiReview: 'accepted',
  lastReason: 'Chưa nằm trong kế hoạch nội dung Q4; đề xuất thuê thiết bị theo từng dự án.'
},
{
  id: 'PR-2026-0090', ...MKT, title: 'Tai nghe chống ồn cho team Content', category: 'Thiết bị CNTT', requiredBy: '2026-09-30', deliveryLocation: HQ,
  justification: 'Tai nghe phục vụ dựng video và họp trực tuyến trong không gian mở.',
  items: [{ id: 'i1', name: 'Tai nghe chống ồn không dây', specs: 'ANC, Bluetooth 5.3, pin ≥ 30 giờ, micro đàm thoại', quantity: 8, unit: 'chiếc', estUnitPrice: 2_300_000 }],
  requesterId: 'u-trang', createdAt: '2026-09-06T10:00:00', updatedAt: '2026-09-26T16:00:00', status: 'received', routedToFinance: false, aiReview: 'edited', approvedAt: '2026-09-08T09:30:00',
  selectedQuotationId: 'q-0090-a', poId: 'PO-2026-0038'
},
{
  id: 'PR-2026-0085', ...IT, title: 'Ổ cứng SSD nâng cấp máy trạm', category: 'Thiết bị CNTT', requiredBy: '2026-09-15', deliveryLocation: HQ,
  justification: 'Nâng cấp ổ cứng cho 6 máy trạm build để giảm thời gian biên dịch.',
  items: [{ id: 'i1', name: 'Ổ cứng SSD NVMe 1TB', specs: 'PCIe Gen4, đọc ≥ 7000MB/s, bảo hành 5 năm', quantity: 6, unit: 'chiếc', estUnitPrice: 2_500_000 }],
  requesterId: 'u-nam', createdAt: '2026-09-01T08:30:00', updatedAt: '2026-09-11T17:00:00', status: 'closed', routedToFinance: false, aiReview: 'accepted', approvedAt: '2026-09-02T09:12:00',
  selectedQuotationId: 'q-0085-a', poId: 'PO-2026-0035'
}];