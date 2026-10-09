# Sổ Theo Dõi Khiếm Khuyết Chính Thức (Official Defect Tracker) — ProcureAI

> **Hệ thống:** ProcureAI — Internal Procurement & Approval Platform  
> **Thư mục quản lý:** `docs/06-testing/BUG_TRACKER.md` (Bản đồng bộ tại `docs/testing/BUG_TRACKER.md`)  
> **Thời điểm cập nhật:** 2026-10-09T22:25:00+07:00  
> **QA Lead & Reporter:** Trần Thị Thu Hà (QA / Tester)  

*Vui lòng xem bản chính thức đầy đủ chi tiết tại [docs/06-testing/BUG_TRACKER.md](../06-testing/BUG_TRACKER.md).*

---

## Bảng Tổng Hợp Danh Mục Defect Hiện Hữu

| Bug ID | Tóm tắt lỗi (Summary) | Loại lỗi (Type) | US / REQ Liên kết | Severity | Priority | Trạng thái (Status) | Primary Owner | Assignee | Bằng chứng thực tế (Evidence) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| **`BUG-0001`**<br/>*(BUG-SEC-01)* | Thiếu server-side actor check tại `/api/v1/sync/` có thể bypass No Self-Approval | Security | `GOV-01`<br/>`REQ-NFR-02` | **Critical** | **P1 (Blocker)** | **TRIAGED** | Nguyễn Thị Thùy Dung | Nguyễn Thị Thùy Dung | [`RUN-20261009-220000`](../06-testing/evidence/RUN-20261009-220000/execution-log.txt)<br/>`TC-GOV01-002` |
| **`BUG-0002`**<br/>*(BUG-FE-01)* | Lỗi cú pháp assignment trong biểu thức điều kiện tại `aiStandardizer.ts:72` | UI / Lint | `US-03`<br/>`REQ-FR-03` | **Medium** | **P2 (High)** | **TRIAGED** | Trần Thị Kiều Giang | Trần Thị Kiều Giang | [`RUN-20261009-220000`](../06-testing/evidence/RUN-20261009-220000/execution-log.txt)<br/>`npm run lint` Exit 1 |
| **`BUG-0003`**<br/>*(BUG-FE-02)* | Arrow function rỗng vi phạm linter tại `ProcurementContext.tsx:76` | UI / Lint | `US-01`<br/>`REQ-FR-01` | **Low** | **P3 (Medium)** | **TRIAGED** | Trần Thị Kiều Giang | Trần Thị Kiều Giang | [`RUN-20261009-220000`](../06-testing/evidence/RUN-20261009-220000/execution-log.txt)<br/>`npm run lint` Exit 1 |
| **`BUG-0004`**<br/>*(BUG-TS-01)* | TypeScript compiler báo 69 lỗi typecheck trong mã nguồn `FE/src/` | UI / Types | `US-01..10`<br/>`REQ-NFR-01` | **Medium** | **P2 (High)** | **TRIAGED** | Trần Thị Kiều Giang | Trần Thị Kiều Giang | [`RUN-20261009-220000`](../06-testing/evidence/RUN-20261009-220000/execution-log.txt)<br/>`tsc --noEmit` Exit 1 |
| **`BUG-0005`**<br/>*(DEFECT-03)* | Hai tệp test cũ (`tests/workflow.test.js`, `permissions.test.ts`) import module không tồn tại | Test Infra | `GOV-01`<br/>`REQ-NFR-02` | **Low** | **P4 (Low)** | **TRIAGED** | Nguyễn Thị Thùy Dung | Trần Thị Thu Hà | `qa-inventory.md`<br/>`node --test` Exit 1 |
| **`BUG-0006`**<br/>*(BUG-001)* | *(Lịch sử)* Manager tự duyệt PR của chính mình ở tầng nghiệp vụ domain | Functional | `GOV-01`<br/>`REQ-NFR-02` | **Critical** | **P1** | **CLOSED** | Nguyễn Thị Thùy Dung | Nguyễn Thị Thùy Dung | `TC-GOV01-001` PASS |
| **`BUG-0007`**<br/>*(BUG-002)* | *(Lịch sử)* Sập trang khi Gemini API bị rate limit (429) | Functional | `US-07`<br/>`REQ-FR-15` | **High** | **P2** | **CLOSED** | Nguyễn Trúc Lam | Nguyễn Trúc Lam | Fallback parser |
| **`BUG-0008`**<br/>*(BUG-003)* | *(Lịch sử)* Trạng thái PR bị kẹt không chuyển sang `po_created` sau khi lập PO | Functional | `US-08`<br/>`REQ-FR-16` | **High** | **P2** | **CLOSED** | Trần Thị Kiều Giang | Trần Thị Kiều Giang | `TC-US08-001` PASS |
| **`BUG-0009`**<br/>*(BUG-004)* | *(Lịch sử)* `ReferenceError: fs is not defined` khi phục vụ static assets | Backend | `N/A`<br/>`REQ-NFR-01` | **Low** | **P4** | **CLOSED** | Nguyễn Thị Thùy Dung | Nguyễn Thị Thùy Dung | Đã giải quyết |
