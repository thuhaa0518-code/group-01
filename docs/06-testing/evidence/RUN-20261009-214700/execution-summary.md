# Execution Summary — RUN-20261009-214700

## 1. Metadata
- **Run ID:** `RUN-20261009-214700`
- **Timestamp:** 2026-10-09T21:47:00+07:00
- **Scope:** Batch 4 — Automated Tests for `US-08` (PO Creation, Supplier Selection & Immutability), `US-09` (Goods Receiving & Over-receiving Boundary), `US-10` (Close PR Lifecycle & Budget Settlement)
- **Framework:** Python `unittest` via Django Test Runner (`django.test.TestCase`, `django.test.Client`)
- **Target File:** `procurement/test_us08_us09_us10.py`
- **Environment:** Windows 11, Python 3.13.2, Django 5.1.x, SQLite In-Memory Database (`file:memorydb_default?mode=memory&cache=shared`)

---

## 2. Test Execution Results

| Test Method | TC ID | US ID | AC ID | Description | Status | Duration |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| `test_tc_us08_001_create_valid_po_from_selected_quotation` | `TC-US08-001` | `US-08` | `AC-08-01` | Tạo PO hợp lệ từ báo giá đã chọn; PO ở trạng thái issued, PR chuyển sang po_created | **PASS** | <0.01s |
| `test_tc_us08_002_reject_po_creation_without_selected_supplier` | `TC-US08-002` | `US-08` | `AC-08-01` | **Negative:** Chặn tạo PO khi chưa chọn NCC trúng thầu (REQ-BR-10) | **PASS** | <0.01s |
| `test_tc_us08_003_po_immutability_and_data_integrity` | `TC-US08-003` | `US-08` | `AC-08-01` | **Data Integrity:** Chặn tùy tiện sửa đổi tổng tiền/dữ liệu PO sau khi đã phát hành | **PASS** | <0.01s |
| `test_tc_us09_001_record_full_receiving` | `TC-US09-001` | `US-09` | `AC-09-01` | Ghi nhận nhận hàng đầy đủ (3/3 máy); PO và PR chuyển trạng thái sang received | **PASS** | <0.01s |
| `test_tc_us09_002_record_partial_receiving` | `TC-US09-002` | `US-09` | `AC-09-01` | Ghi nhận nhận hàng một phần (2/3 máy); PO sang partially_received, PR không vội sang received | **PASS** | <0.01s |
| `test_tc_us09_003_reject_over_receiving_boundary` | `TC-US09-003` | `US-09` | `AC-09-01` | **Negative / Boundary:** Chặn số lượng nhận (4 máy) vượt quá số lượng đặt (3 máy) (ASM-06) | **PASS** | <0.01s |
| `test_tc_us10_001_close_pr_success` | `TC-US10-001` | `US-10` | `AC-10-01` | Đóng PR thành công khi biên bản nhận hàng đã hoàn tất; PR chuyển sang closed | **PASS** | <0.01s |
| `test_tc_us10_002_reject_closing_pr_before_receiving` | `TC-US10-002` | `US-10` | `AC-10-01` | **Negative:** Chặn đóng PR khi hàng chưa nhận (còn ở po_created) theo REQ-BR-11 | **PASS** | <0.01s |
| `test_tc_us10_003_budget_finalization_on_close_pr` | `TC-US10-003` | `US-10` | `AC-10-01` | Quyết toán ngân sách khi đóng PR; số tiền cam kết và số dư còn lại được xác nhận trọn vẹn | **PASS** | <0.01s |

**Summary Metrics:**
- **Total Tests Executed:** 9
- **Passed:** 9 (100%)
- **Failed:** 0
- **Errors:** 0
- **Skipped:** 0
- **Total Duration:** 0.049s

---

## 3. Regression Impact Check
- Lệnh chạy kiểm tra hồi quy toàn dự án:
  - Command: `python manage.py test -v 1`
  - Output: `Ran 48 tests in 0.203s — OK`
- Không có bất kỳ lỗi hồi quy nào trên toàn bộ 48 test methods (16 baseline + 6 Batch 1 + 10 Batch 2 + 7 Batch 3 + 9 Batch 4).

---

## 4. Observations & Notes
- Hoàn tất kiểm chứng trọn vẹn vòng đời mua sắm từ tạo PO $\rightarrow$ Giao nhận hàng Receiving $\rightarrow$ Đóng PR (Close PR).
- Các giả định và quy tắc nghiệp vụ (`REQ-BR-10`, `REQ-BR-11`, `ASM-06`, `REQ-NFR-01`) đều được kiểm thử 2 chiều (positive và negative).
- Primary Owners:
  - `US-08`: Nguyễn Thị Thùy Dung
  - `US-09`: Nguyễn Thị Thùy Dung
  - `US-10`: Trần Thị Thu Hà
