# Bảng Kiểm Thử Khói Thủ Công (Manual Smoke Checklist) — Thẩm Định QA-12A

> **Giai đoạn:** QA-12A — Local Smoke Evidence Validation  
> **Run ID:** `RUN-20261010-011000`  
> **Đối Tượng Thẩm Định:** Bộ kịch bản `MC-01` đến `MC-06` từ `RUN-20261010-004600`  
> **Nguyên Tắc Thẩm Định:** Tuân thủ nghiêm ngặt quy tắc QA-12A: Không coi request API Python là bằng chứng đã thao tác UI. Chuyển trạng thái sang `NOT RUN` hoặc `NOT VERIFIED` nếu chưa có tương tác trình duyệt thực tế.

---

## 1. Bảng Đối Chiếu Tính Toàn Vẹn Của Các Kịch Bản Manual Checklist

| STT | Mã Kịch Bản | Thao Tác Dự Kiến | Phương Pháp Đã Thực Hiện | Bằng Chứng Thực Tế Có Sẵn | Trạng Thái Thẩm Định | Ghi Chú & Căn Cứ Đánh Giá |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| 1 | **MC-01** | Truy cập `http://127.0.0.1:8000/` bằng trình duyệt | Python `urllib.request` (Không có browser interaction) | `GET /` trả về HTML 200 có `<div id="root"></div>`. Nhưng file JS `/assets/index-eMT3_iPN.js` bị **404 Not Found**. | **`NOT VERIFIED`** | Chưa mở trình duyệt thực tế; asset script chính bị 404 gây lỗi nạp bundle. |
| 2 | **MC-02** | Đăng nhập `u-nam`, tạo PR và kiểm tra ngân sách | Python `urllib.request` gọi `/api/v1/sync/` | Dữ liệu không ghi vào `db.sqlite3`; không có ảnh chụp hoặc video thao tác màn hình form. | **`NOT RUN`** | Chỉ kiểm tra hợp đồng API; người dùng/QA chưa thực hiện thao tác trên form UI. |
| 3 | **MC-03** | Thao tác gửi duyệt và chặn No Self-Approval trên UI | Python `urllib.request` gọi `/api/v1/sync/` | Backend API chặn đúng HTTP 403 `SELF_APPROVAL_FORBIDDEN`; nhưng chưa có bằng chứng nút ẩn/hiện trên UI. | **`NOT RUN` (UI)**<br/>*(API: PASS)* | Endpoint API đã PASS; tương tác giao diện người dùng chưa thực thi qua trình duyệt. |
| 4 | **MC-04** | Trưởng phòng `u-vietanh` duyệt PR trên màn hình duyệt | Chưa thực thi qua trình duyệt | Không có tương tác DOM; không có ảnh chụp màn hình phê duyệt. | **`NOT RUN`** | Chưa có người vận hành đăng nhập và thao tác nút duyệt trên giao diện. |
| 5 | **MC-05** | Màn hình Sourcing: Nhập báo giá & AI so sánh | Chưa thực thi qua trình duyệt | Không có bằng chứng mở trang Sourcing hoặc bấm nút AI trên UI. | **`NOT RUN`** | Chưa thực hiện tương tác UI thực tế. |
| 6 | **MC-06** | Tạo PO, Nhận hàng (Receiving) & Audit Log trên UI | Chưa thực thi qua trình duyệt | Không có bằng chứng giao diện tạo PO và xác nhận nhận hàng. | **`NOT RUN`** | Chưa thực hiện tương tác UI thực tế. |

---

## 2. Kế Hoạch Chuẩn Bị Dữ Liệu An Toàn Cho Buổi Demo Thực Tế

1. **Khắc phục lỗi nạp asset Frontend:**
   - Trong `FE/dist/index.html`, script đang trỏ tới `/assets/index-eMT3_iPN.js` (không tồn tại trong `FE/dist/assets/`).
   - Cần chạy lại lệnh biên dịch `npm run build` trong thư mục `FE/` để sinh bộ bundle đồng bộ giữa `index.html` và các tệp JS/CSS trong `dist/assets/`.
2. **Bảo toàn dữ liệu demo:**
   - Cơ sở dữ liệu `db.sqlite3` hiện tại hoàn toàn sạch, đang chứa đúng 5 tài khoản demo và 5 PRs ban đầu.
   - Không chạy lệnh reset DB để giữ nguyên dữ liệu đã chuẩn bị.
3. **Thực hiện vòng kiểm thử thủ công thật (Manual UI Testing):**
   - Người vận hành cần mở trình duyệt Chrome/Edge thực tế tại máy trạm, truy cập `http://127.0.0.1:8000/`.
   - Thực hiện lần lượt 6 kịch bản trên và chụp ảnh màn hình làm bằng chứng trước khi công bố buổi demo sẵn sàng.
