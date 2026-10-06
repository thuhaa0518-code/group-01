export const assumptions: {topic: string;assumption: string;confirm: string;}[] = [
{ topic: 'Tiền tệ', assumption: 'Mọi giá trị tính bằng VND.', confirm: 'Có cho phép PO đa tiền tệ hay không, nguồn tỷ giá.' },
{ topic: 'Ngưỡng phê duyệt', assumption: 'PR trên 50 tr cần cả Manager và Finance phê duyệt. PR vượt Budget khả dụng phải chuyển Finance.', confirm: 'Ngưỡng thực tế theo giá trị và các cấp duyệt cao hơn.' },
{ topic: 'Mô hình Budget', assumption: 'Budget theo phòng ban / Budget code; Khả dụng = Được cấp − Đã cam kết. Cam kết khi PR được Approve.', confirm: 'Budget theo phòng ban, dự án hay cost centre.' },
{ topic: 'Đăng nhập & phân quyền', assumption: 'Đăng nhập bằng email + mật khẩu mẫu; 5 vai trò Employee, Manager, Finance, Procurement, Admin. Phiên hết hạn sau 30 phút không thao tác.', confirm: 'SSO, ủy quyền khi vắng mặt.' },
{ topic: 'Tự phê duyệt', assumption: 'Người tạo PR không bao giờ được phê duyệt PR của chính mình.', confirm: 'Quy trình khi Manager tự tạo PR.' },
{ topic: 'Quotation', assumption: 'Một Quotation mỗi Supplier mỗi PR, file PDF hoặc Excel. Cần tối thiểu 2 Quotation đã xác nhận để so sánh.', confirm: 'Số Quotation tối thiểu thực tế theo giá trị PR.' },
{ topic: 'AI trích xuất', assumption: 'Không có OCR thật — dữ liệu được mô phỏng và luôn phải được Procurement review, sửa và xác nhận trước khi dùng.', confirm: 'Cơ chế trích xuất thật và người chịu trách nhiệm review.' },
{ topic: 'AI đề xuất', assumption: 'Trọng số cố định: Tổng tiền 60%, Thời gian giao 20%, Bảo hành 20%; trừ điểm khi giá bất thường ≥ 20% so với lịch sử.', confirm: 'Trọng số có cấu hình theo danh mục hay không.' },
{ topic: 'Receiving', assumption: 'Ghi nhận theo từng dòng hàng; hỗ trợ nhận đủ, một phần và sai lệch. Không vượt số lượng trên PO.', confirm: 'Ai được ghi nhận Receiving và xử lý sau giao thiếu.' },
{ topic: 'Close PR', assumption: 'Chỉ Close khi đã nhận đủ và Finance đã đối soát PR ↔ PO ↔ Receiving.', confirm: 'Có yêu cầu hóa đơn / thanh toán trước khi Close hay không.' },
{ topic: 'Lưu trữ', assumption: 'Dữ liệu lưu trong trình duyệt. File Quotation chỉ lưu tên và loại để truy vết.', confirm: 'Nơi lưu trữ tài liệu và thời hạn lưu.' }];


export const excludedFromMvp = ['Quản lý tồn kho', 'Thanh toán Supplier', 'Quản lý hợp đồng', 'Tích hợp ERP / kế toán', 'Mobile app', 'Supplier portal', 'Dự báo nhu cầu'];

export const guardrails = [
'AI không bao giờ Approve, Reject hay chọn Supplier. Mọi quyết định gắn với một người cụ thể.',
'Giá trị AI gợi ý chỉ xuất hiện trên PR khi người tạo chấp nhận.',
'Đề xuất luôn hiển thị trọng số, rủi ro và dữ liệu còn thiếu.',
'Cảnh báo bất thường nêu rõ mức giá tham chiếu và không loại Quotation khỏi so sánh.',
'Quy trình chỉ đi một chiều: Request → Approve → Quotations → Compare → PO → Receive → Close.',
'Mọi thao tác được ghi Audit Trail.'];