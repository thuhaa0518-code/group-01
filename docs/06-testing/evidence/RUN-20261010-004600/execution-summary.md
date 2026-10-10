# Báo Cáo Tổng Hợp Thực Thi Smoke Test (Execution Summary) — Run RUN-20261010-004600

> **Giai đoạn:** QA-12 — Local Demo Smoke Test & Evidence  
> **Run ID:** `RUN-20261010-004600`  
> **Thời điểm hoàn tất:** 2026-10-10T00:46:00+07:00  
> **QA Lead & Reporter:** Trần Thị Thu Hà (QA / Tester)  
> **Kết Luận Chung:** **LOCAL DEMO VERIFIED WITH LIMITATIONS**  

---

## 1. Kết Quả Thực Thi Kiểm Thử Khói Runtime (HTTP / API Contract)

| Mã Kiểm Thử | Tên Mục Kiểm Thử | Expected Result | Actual Result | Trạng Thái | Link Bằng Chứng |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **ST-01** | Root SPA HTML Delivery | Endpoint `GET /` trả về HTTP 200 kèm root container HTML của SPA | Trả về HTTP 200, HTML dài 478 bytes, chứa `<div id="root"></div>` | **PASS** | [execution-log.txt](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261010-004600/execution-log.txt) |
| **ST-02** | Static JS & CSS Bundle Delivery | Endpoint `/assets/*.js` và `/assets/*.css` trả về HTTP 200, kích thước hợp lệ | Trả về HTTP 200; JS bundle: 591,605 bytes; CSS bundle: 29,403 bytes | **PASS** | [execution-log.txt](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261010-004600/execution-log.txt) |
| **ST-03** | API State Retrieval | Endpoint `GET /api/v1/state/` trả về HTTP 200 kèm đủ 5 users, PRs, budgets | Trả về HTTP 200; nạp đủ 5 tài khoản demo, 5 PRs, 4 budgets | **PASS** | [execution-log.txt](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261010-004600/execution-log.txt) |
| **ST-04** | Demo 5 Roles Accounts Ready | Đủ 5 vai trò hệ thống: employee, manager, procurement, finance, admin | Tìm thấy đủ 5 vai trò trong cơ sở dữ liệu demo cục bộ | **PASS** | [execution-log.txt](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261010-004600/execution-log.txt) |
| **ST-05** | No Self-Approval Security Guard | Endpoint `POST /api/v1/sync/` từ chối HTTP 403 Forbidden khi Requester tự duyệt | Trả về đúng HTTP 403 Forbidden kèm code `SELF_APPROVAL_FORBIDDEN` | **PASS** | [execution-log.txt](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261010-004600/execution-log.txt) |
| **ST-06** | Workflow State Sync | Endpoint `POST /api/v1/sync/` trả về HTTP 200 khi đồng bộ dữ liệu hợp lệ | Trả về HTTP 200; ghi nhận và trả về đúng danh sách PRs cập nhật | **PASS** | [execution-log.txt](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261010-004600/execution-log.txt) |

---

## 2. Kết Quả Kịch Bản Kiểm Thử Giao Diện Thủ Công (Manual Smoke Checklist)

| Mã Checklist | Phạm Vi Trình Diễn | Trạng Thái Hiệu Chỉnh (QA-12A) | Ghi Chú Đánh Giá |
| :---: | :--- | :---: | :--- |
| **MC-01** | Khởi chạy máy chủ cục bộ & tải trang Single Page Application | **`NOT VERIFIED`** | Tầng HTTP phục vụ HTML 200, nhưng chưa có phiên tương tác trình duyệt thực tế được ghi nhận |
| **MC-02** | Nhân viên tạo Yêu cầu Mua sắm (PR) và kiểm tra ngân sách | **`NOT RUN`** | Chỉ mới kiểm tra hợp đồng API qua Python script; chưa thao tác trên UI |
| **MC-03** | Cơ chế an toàn chặn Tự phê duyệt (No Self-Approval) | **`NOT RUN` (UI)**<br/>*(API: PASS)* | Backend API chặn đúng HTTP 403; tuy nhiên chưa kiểm chứng tương tác nút duyệt trên UI |
| **MC-04** | Trưởng phòng phê duyệt Yêu cầu Mua sắm | **`NOT RUN`** | Chưa có phiên thao tác trình duyệt thực tế |
| **MC-05** | Mua sắm tiếp nhận, nhập báo giá & kích hoạt AI chuẩn hóa | **`NOT RUN`** | Chưa có phiên thao tác trình duyệt thực tế |
| **MC-06** | Tạo Đơn Mua Hàng (PO), Nhận hàng & Ghi vết Audit Log | **`NOT RUN`** | Chưa có phiên thao tác trình duyệt thực tế |

---

## 3. Trạng Thái Công Cụ Tự Động Hóa Browser

- **Playwright / Browser Subagent:** **BLOCKED**
  - *Nguyên nhân:* Không tải được driver Playwright 1.57.0 từ máy chủ CDN bên ngoài (HTTP 404).
  - *Giải pháp tuân thủ:* Tuyệt đối không tự tuyên bố đã có automated UI test. Toàn bộ kịch bản giao diện được lập thành checklist thủ công, trạng thái UI thực tế là `NOT RUN` cho đến khi người vận hành thực hiện tương tác thật trên trình duyệt.

---

## 4. Danh Mục Giới Hạn Được Chấp Nhận (Accepted Limitations)

1. **Giới hạn môi trường cục bộ:** Kết quả smoke test này chỉ xác minh khả năng dịch vụ trên môi trường Local Development (`127.0.0.1:8000` với SQLite). Không suy ra tính sẵn sàng của môi trường Staging hay Production.
2. **Kiểm tra UI chưa hoàn tất:** Mới chỉ xác minh tầng Backend Service & API (`LOCAL SERVICE SMOKE PASS`); tầng tương tác trình duyệt UI chưa được thực thi và xác nhận.
3. **ESLint & TypeScript Warnings tồn đọng:** Mã nguồn Frontend vẫn còn 2 lỗi ESLint (`BUG-0002`, `BUG-0003`) và 69 lỗi TypeScript strict mode (`BUG-0004`) đã được cô lập.

---

## 5. Kết Luận Chung

- **Tầng Dịch Vụ & API Backend:** **`LOCAL SERVICE SMOKE PASS`**
- **Tầng Trình Diễn Giao Diện Cục Bộ (UI Interaction):** **`LOCAL DEMO NOT VERIFIED`** (Chưa có tương tác trình duyệt thực tế; cần người vận hành thực hiện kịch bản manual).
