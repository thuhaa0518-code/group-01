# 🧩 Thư Viện UI Component (UI Component Library Spec)

---

## 1. Danh Sách Các Component Cốt Lõi (Core Component Index)

### 1.1 `Button` (Nút bấm tương tác)
- **Variants:** `primary` (Xanh dương chính), `secondary` (Khung xám), `success` (Xanh lá duyệt), `danger` (Đỏ reject), `warning` (Vàng chuyển Finance), `tertiary` (Nút phụ).
- **States:** `default`, `hover`, `active`, `disabled`, `loading` (hiển thị Spinner).

### 1.2 `StatusBadge` (Nhãn trạng thái đơn)
- Hiển thị trực quan trạng thái PR/PO với icon tương ứng:
  - `pending_manager`: Icon Đồng hồ (`Chờ Manager duyệt`).
  - `finance_review`: Icon Cảnh báo (`Finance Review`).
  - `approved`: Icon Tích xanh (`Approved · Sourcing`).
  - `supplier_selected`: Icon Đã chọn NCC.
  - `po_created`: Icon Đã tạo PO.

### 1.3 `WorkflowStepper` (Thanh tiến độ quy trình 7 bước)
- Các bước: `Request` $\rightarrow$ `Approve` $\rightarrow$ `Collect Quotations` $\rightarrow$ `Compare` $\rightarrow$ `PO` $\rightarrow$ `Receive` $\rightarrow$ `Close`.
- **Step States:** `completed` (Đã xong), `current` (Hiện tại), `upcoming` (Sắp tới), `exception` (Cần chỉnh sửa).

### 1.4 `AIStandardizerPanel` (Bảng trợ lý AI PR Standardizer)
- Ô nhập liệu câu lệnh tiếng Việt tự do.
- Khung hiển thị gợi ý AI tự động phân tích 9 trường dữ liệu và nút **"Use this"** để điền form tự động.

### 1.5 `ComparisonMatrix` (Ma trận so sánh báo giá)
- Bảng so sánh đa chiều giữa các nhà cung cấp (Đơn giá từng món, Thuế VAT, Phí vận chuyển, Tổng tiền, Thời gian giao hàng, Thời hạn bảo hành, Điểm số AI).
- Tự động highlight ô có giá tốt nhất (`CircleCheckIcon`) và ô có giá bất thường (`TriangleAlertIcon`).
