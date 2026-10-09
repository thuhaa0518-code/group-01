# Test Execution Summary — RUN-20261009-220000

## 1. Thông tin Phiên Thực thi (Run Metadata)
- **Mã thực thi (Run ID):** `RUN-20261009-220000`
- **Thời gian hoàn tất:** 2026-10-09 22:01:00 (Asia/Ho_Chi_Minh)
- **Chiến dịch:** QA-07 — TEST EXECUTION & EVIDENCE COLLECTION
- **Branch:** `main` (commit `224a7e8`)
- **Tác giả báo cáo:** Senior QA Engineer & Test Automation Engineer

---

## 2. Bảng Tổng hợp Kết quả Thực thi theo Từng Cấp độ (Execution Matrix)

| STT | Cấp độ / Giai đoạn kiểm thử | Lệnh thực thi chính xác | Kết quả (Status) | Số test / Đối tượng | Thời gian | Ghi chú & Mã Defect liên quan |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| **1** | System Check & Migrations | `python manage.py check` & `makemigrations --dry-run` | **PASS** | 2 checks | 1.1s | 0 silenced issues, 0 pending migrations |
| **2** | Backend Unit Tests | `python manage.py test procurement.tests -v 2` | **PASS** | 7 tests | 0.019s | Model logic, Budget, VAT, AI helper |
| **3** | Integration & API Tests | `python manage.py test -v 2` | **PASS** | 53 tests | 0.224s | 100% 34/34 approved TCs + workflow |
| **4** | Frontend Unit Tests | `npm test` (Chưa cấu hình) | **BLOCKED** | 0 tests | — | Thiếu Vitest/Jest trong `FE/package.json` |
| **5** | End-to-End Tests | Cypress / Playwright | **NOT RUN** | 0 tests | — | Chưa cấu hình framework E2E trong dự án |
| **6.1**| Frontend ESLint Audit | `npm.cmd --prefix FE run lint` | **FAIL** | 17 problems | 8.2s | 2 errors (`BUG-FE-01`), 15 warnings |
| **6.2**| TypeScript Type Check | `npx.cmd --prefix FE tsc --project FE/tsconfig.json --noEmit` | **FAIL** | 69 errors | 7.5s | `TS6133` unused vars & `TS2749` BoxIcon |
| **6.3**| Frontend Production Build | `npm.cmd --prefix FE run build` | **PASS** | 2,380 modules | 31.57s | Đóng gói thành công `FE/dist/` bundle |

---

## 3. Tổng hợp Trạng thái 34 Test Cases Đã Phê Duyệt

| Nhóm Kiểm thử / User Story | Số TC | PASS | FAIL | ERROR | BLOCKED | SKIPPED | NOT RUN | Bằng chứng thực tế |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- | :--- |
| `US-01` (Tạo & Quản lý PR) | 4 | 4 | 0 | 0 | 0 | 0 | 0 | [RUN-20261009-220000](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261009-220000/) |
| `US-02` (Timeline & Đồng bộ) | 2 | 2 | 0 | 0 | 0 | 0 | 0 | [RUN-20261009-220000](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261009-220000/) |
| `US-03` (AI Standardizer & HITL) | 3 | 3 | 0 | 0 | 0 | 0 | 0 | [RUN-20261009-220000](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261009-220000/) |
| `US-04` (Manager Approvals) | 4 | 4 | 0 | 0 | 0 | 0 | 0 | [RUN-20261009-220000](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261009-220000/) |
| `US-05` (Budget Check & Threshold) | 3 | 3 | 0 | 0 | 0 | 0 | 0 | [RUN-20261009-220000](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261009-220000/) |
| `US-06` (Quotation Collection) | 3 | 3 | 0 | 0 | 0 | 0 | 0 | [RUN-20261009-220000](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261009-220000/) |
| `US-07` (AI Quotation & Anomaly $\ge 20\%$) | 4 | 4 | 0 | 0 | 0 | 0 | 0 | [RUN-20261009-220000](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261009-220000/) |
| `US-08` (Tạo PO & Bất biến PO) | 3 | 3 | 0 | 0 | 0 | 0 | 0 | [RUN-20261009-220000](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261009-220000/) |
| `US-09` (Goods Receiving & Partial) | 3 | 3 | 0 | 0 | 0 | 0 | 0 | [RUN-20261009-220000](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261009-220000/) |
| `US-10` (Close PR & Quyết toán) | 3 | 3 | 0 | 0 | 0 | 0 | 0 | [RUN-20261009-220000](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261009-220000/) |
| `GOV-01` (No Self-Approval & RBAC) | 3 | 3 | 0 | 0 | 0 | 0 | 0 | [RUN-20261009-220000](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261009-220000/) |
| `GOV-02` (Audit Trail Immutability) | 2 | 2 | 0 | 0 | 0 | 0 | 0 | [RUN-20261009-220000](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261009-220000/) |
| **TỔNG CỘNG** | **34** | **34** | **0** | **0** | **0** | **0** | **0** | **Tỷ lệ PASS: 100% (34/34)** |
