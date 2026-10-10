# Bảng Kiểm Thử Khói Thủ Công (Manual Smoke Checklist) — Local Demo ProcureAI

> **Giai đoạn:** QA-12 — Local Demo Smoke Test  
> **Run ID:** `RUN-20261010-004600`  
> **URL Truy Cập:** `http://127.0.0.1:8000/`  
> **Tài Liệu Dành Cho:** Giảng viên, Hội đồng đánh giá và Demo Operator  
> **Quy Định:** Kiểm thử thủ công từng bước trên giao diện người dùng dựa trên runtime backend đã kiểm chứng.

---

## 1. Danh Sách Tài Khoản Demo

| Vai trò (Role) | Username | Password | Tên hiển thị | Phòng ban | Trách nhiệm chính trong kịch bản |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Nhân viên (Employee)** | `u-nam` | `123` | Nguyễn Văn Nam | Phòng CNTT | Tạo PR, gửi duyệt, nhận hàng |
| **Trưởng phòng (Manager)** | `u-vietanh` | `123` | Trần Việt Anh | Phòng CNTT | Phê duyệt PR cấp phòng ban |
| **Chuyên viên Mua sắm (Procurement)** | `u-lan` | `123` | Lê Thị Lan | Phòng Thu mua | Xử lý báo giá, chọn NCC, tạo PO |
| **Kế toán (Finance)** | `u-huong` | `123` | Phạm Mai Hương | Phòng Tài chính | Duyệt ngân sách, đối soát 3 chiều |
| **Quản trị viên (Admin)** | `u-tuan` | `123` | Vũ Đức Tuấn | Ban Quản trị | Quản lý người dùng, phân quyền, audit log |

---

## 2. Chi Tiết Kịch Bản Kiểm Thử Khói (Smoke Checklist)

| STT | Mã Kịch Bản | Bước Thao Tác (Action) | Dữ Liệu Kiểm Thử (Test Data) | Kết Quả Mong Đợi (Expected Result) | Kết Quả Thực Tế (Actual Result) | Trạng Thái | Link Bằng Chứng |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| 1 | **MC-01** | Khởi chạy trình duyệt tại máy trạm, truy cập `http://127.0.0.1:8000/` | Trình duyệt Chrome / Edge | Giao diện Single Page Application tải mượt mà; hiển thị trang Đăng nhập / Chọn vai trò; không có màn hình trắng (blank screen). | Endpoint `/` trả về HTML 200, nhưng chưa có phiên tương tác trình duyệt thực tế được ghi nhận (Playwright bị chặn tải driver). | **`NOT VERIFIED`** | [execution-log.txt](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261010-004600/execution-log.txt) |
| 2 | **MC-02** | Đăng nhập tài khoản Nhân viên và Tạo Yêu cầu Mua sắm (PR) | User: `u-nam` / `123`<br/>PR Title: `Mua bổ sung 02 màn hình Dell 27 inch`<br/>Bộ phận: Phòng CNTT | PR được khởi tạo thành công với trạng thái `draft`; hiển thị cảnh báo ngân sách khả dụng từ `BGT-IT-2026`. | Chưa thao tác giao diện người dùng; chỉ mới xác minh tầng API qua Python script. | **`NOT RUN`** | [execution-log.txt](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261010-004600/execution-log.txt) |
| 3 | **MC-03** | Gửi duyệt PR và kiểm tra chặn Tự phê duyệt (No Self-Approval) | User: `u-nam`<br/>Thao tác: Bấm gửi duyệt sang `pending_manager`, sau đó thử tự duyệt | Hệ thống chuyển trạng thái sang `pending_manager`; nút "Phê duyệt" bị ẩn hoặc nếu cố tình gọi API duyệt bằng tài khoản requester sẽ bị chặn HTTP 403 Forbidden. | Server API trả về mã `SELF_APPROVAL_FORBIDDEN` (HTTP 403 Forbidden); tuy nhiên chưa có tương tác trình duyệt thực tế trên nút UI. | **`NOT RUN` (UI)**<br/>*(API: PASS)* | [ST-05](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261010-004600/execution-log.txt) |
| 4 | **MC-04** | Đổi sang tài khoản Trưởng phòng và Phê duyệt PR | User: `u-vietanh` / `123`<br/>Hành động: Duyệt PR của `u-nam` | Trưởng phòng thấy PR trong danh sách chờ duyệt; bấm Phê duyệt thành công; trạng thái PR chuyển sang `approved` (hoặc `finance_review` nếu vượt hạn mức). | Chưa thực hiện thao tác trình duyệt thực tế. | **`NOT RUN`** | [execution-log.txt](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261010-004600/execution-log.txt) |
| 5 | **MC-05** | Đổi sang Chuyên viên Mua sắm: Báo giá & So sánh AI | User: `u-lan` / `123`<br/>PR đã duyệt: `PR-2026-0098` hoặc PR mới | Hiển thị màn hình Sourcing; cho phép nhập/tải lên báo giá nhà cung cấp (Phong Vũ, FPT); nút kích hoạt phân tích AI so sánh giá/thời gian giao hàng. | Chưa thực hiện thao tác trình duyệt thực tế. | **`NOT RUN`** | [execution-log.txt](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261010-004600/execution-log.txt) |
| 6 | **MC-06** | Tạo Đơn Mua Hàng (PO) và Nhận Hàng (Receiving) | User: `u-lan` (tạo PO)<br/>User: `u-nam` (nhận hàng) | Tạo PO thành công từ báo giá đã chọn; Nhân viên kho/người nhận xác nhận nhận đủ hàng; hệ thống lưu vết Audit Log. | Chưa thực hiện thao tác trình duyệt thực tế. | **`NOT RUN`** | [execution-log.txt](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261010-004600/execution-log.txt) |

---

## 3. Hướng Dẫn Khởi Chạy Nhanh Cho Buổi Demo

1. **Khởi động Backend & Web Server:**
   ```powershell
   # Tại thư mục gốc dự án:
   python manage.py runserver 127.0.0.1:8000
   ```
2. **Mở trình duyệt:**
   Truy cập `http://127.0.0.1:8000/`.
3. **Thực hiện theo thứ tự 6 kịch bản trên:**
   - Đăng nhập lần lượt `u-nam` -> `u-vietanh` -> `u-lan` để trình diễn trọn vẹn vòng đời nghiệp vụ Mua sắm (Procurement Lifecycle).
