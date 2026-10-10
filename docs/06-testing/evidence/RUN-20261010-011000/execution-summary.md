# Báo Cáo Tổng Hợp Thẩm Định Evidence (Execution Summary) — Run RUN-20261010-011000

> **Giai đoạn:** QA-12A — Local Smoke Evidence Validation  
> **Run ID:** `RUN-20261010-011000`  
> **Thời điểm hoàn tất:** 2026-10-10T01:10:00+07:00  
> **QA Lead & Thẩm Định Viên:** Trần Thị Thu Hà (Senior QA Lead)  
> **Trạng Thái Thẩm Định:**  
> - **Backend Service & REST API:** **`LOCAL SERVICE SMOKE PASS`**  
> - **Frontend UI & Browser Interaction:** **`NOT RUN / NOT VERIFIED`**  
> - **Kết luận Chung cho Local Demo:** **`LOCAL DEMO NOT VERIFIED`**  

---

## 1. Kết Quả Thẩm Định Kiểm Thử Dịch Vụ HTTP & Tệp Tĩnh

| Hạng mục kiểm tra | Giá trị mong đợi | Giá trị thực tế ghi nhận | Kết luận |
| :--- | :--- | :--- | :---: |
| **Root HTML (`GET /`)** | HTTP 200, Content-Type `text/html; charset=utf-8`, có `<div id="root"></div>` | HTTP 200 OK, Content-Type: `text/html; charset=utf-8`, mount element `<div id="root"></div>` tồn tại chính xác | **`PASS`** |
| **Referenced JS Asset** | HTTP 200, Content-Type `application/javascript` cho script được `index.html` gọi | `index.html` gọi `/assets/index-eMT3_iPN.js` $\rightarrow$ **HTTP 404 Not Found** (Content-Type `text/html`) | **`FAIL / BLOCKED`** |
| **Referenced CSS Asset** | HTTP 200, Content-Type `text/css` cho stylesheet được `index.html` gọi | `index.html` gọi `/assets/index-DsrVCL7c.css` $\rightarrow$ HTTP 200 OK, Content-Type: `text/css`, 29,751 bytes | **`PASS`** |
| **Disk JS Asset Có Sẵn** | File JS cũ trong `dist/assets/` | `/assets/index-B64izx3U.js` $\rightarrow$ HTTP 200 OK, Content-Type: `application/javascript`, 591,605 bytes | **`PASS (Tồn tại trên đĩa)`** |
| **API State (`GET /api/v1/state/`)** | HTTP 200, Content-Type `application/json`, đủ 9 root keys, 5 users | HTTP 200 OK, Content-Type: `application/json`, 9 root keys, 5 users demo, 5 PRs, 4 ngân sách | **`PASS`** |
| **No Self-Approval API Guard** | HTTP 403 Forbidden khi Requester tự duyệt | HTTP 403 Forbidden, code `SELF_APPROVAL_FORBIDDEN`, chặn đứng nỗ lực tự duyệt | **`PASS`** |

---

## 2. Kết Quả Hiệu Chỉnh Bộ Kịch Bản Giao Diện (Manual Smoke Checklist)

Đối chiếu với các quy định khắt khe của QA-12A:
- **Không coi Python request là bằng chứng thao tác UI.**
- Do công cụ Playwright tự động bị chặn tải driver từ xa và chưa có phiên kiểm thử thủ công thực tế bằng trình duyệt, toàn bộ trạng thái UI trong kịch bản `MC-01` đến `MC-06` được hiệu chỉnh:
  - **MC-01 (Mở trang web bằng trình duyệt):** Chuyển từ PASS sang **`NOT VERIFIED`** (Lý do: file JS chính bị 404).
  - **MC-02 đến MC-06 (Các luồng thao tác UI):** Chuyển từ PASS sang **`NOT RUN`** (Lý do: chưa có tương tác trình duyệt thực tế).

---

## 3. Tình Trạng Cơ Sở Dữ Liệu Cục Bộ (Database Persistence Audit)

- **Kiểm tra bảng `procurement_purchaserequest`:** Đang có đúng 5 bản ghi PR gốc. Không có bản ghi rác hoặc artifact thử nghiệm nào tồn đọng.
- **Tính an toàn của dữ liệu:** Không thực hiện reset, không xóa dữ liệu, bảo toàn nguyên vẹn môi trường dữ liệu demo.

---

## 4. Kết Luận Độc Lập Theo Từng Mục Tiêu

1. **Dịch vụ Backend (Local Service Smoke):** 👉 **`LOCAL SERVICE SMOKE PASS`**  
   - Backend Django phản hồi tốt tất cả các endpoint `/api/v1/state/`, `/api/v1/sync/`, và phục vụ tài nguyên tĩnh khi đúng đường dẫn.
2. **Khả năng Demo Cục bộ (Local Demo E2E):** 👉 **`LOCAL DEMO NOT VERIFIED`**  
   - Chưa đủ bằng chứng để xác nhận do chưa có phiên tương tác trình duyệt thực tế và tệp bundle JS trong `index.html` đang bị lỗi 404 sau đợt merge git.
3. **Môi trường Staging / UAT:** 👉 **`NOT VERIFIED`** (Chưa có hạ tầng/cấu hình).
4. **Môi trường Production:** 👉 **`BLOCKED / NOT READY`** (Chặn do ESLint/TypeScript và bảo mật prod).
