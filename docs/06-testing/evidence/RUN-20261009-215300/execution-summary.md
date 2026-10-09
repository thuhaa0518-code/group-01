# Test Execution Summary — RUN-20261009-215300

## 1. Thông tin đợt thực thi
- **Mã thực thi (Run ID):** `RUN-20261009-215300`
- **Thời gian thực thi:** 2026-10-09 21:53:05
- **Phạm vi kiểm thử:** Batch 5 (Governance & Security: `GOV-01`, `GOV-02`) — 5 Test Cases
- **Môi trường:** Python 3.13.0, Django 5.1.1, Windows 11 Enterprise
- **File kịch bản:** `procurement/test_gov01_gov02.py`
- **Kết quả tổng quát:** **5/5 PASS (100%)** — Thời gian thực thi: **0.062s**
- **Độ ổn định toàn hệ thống:** Toàn bộ test suite dự án đạt **53/53 PASS (100%)**, không gây hồi quy (0 regressions).

---

## 2. Chi tiết kết quả kiểm thử theo Test Case

| TC ID | User Story | Yêu cầu / AC | Mô tả mục tiêu | Trạng thái | Thời gian | Bug liên quan |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| `TC-GOV01-001` | `GOV-01` | `REQ-NFR-02` / `AC-GOV-01` | Chặn tuyệt đối Manager tự duyệt PR của chính mình (No Self-Approval) | **PASS** | 0.015s | Không |
| `TC-GOV01-002` | `GOV-01` | `REQ-NFR-02` / `AC-GOV-01` | Chặn bypass No Self-Approval ở tầng Backend API & Kiểm tra `BUG-SEC-01` | **PASS** | 0.012s | `BUG-SEC-01` (Verified) |
| `TC-GOV01-003` | `GOV-01` | `REQ-NFR-02`, `CON-02`, `CON-03` / `AC-GOV-01` | Ma trận phân quyền RBAC 5 Vai trò (Role-Based Action Protection) | **PASS** | 0.011s | Không |
| `TC-GOV02-001` | `GOV-02` | `REQ-NFR-03` / `AC-GOV-02` | Tự động ghi nhận Audit Log khi có thay đổi trạng thái | **PASS** | 0.012s | Không |
| `TC-GOV02-002` | `GOV-02` | `REQ-NFR-03` / `AC-GOV-02` | Tính toàn vẹn và bất biến của bản ghi Kiểm toán (Audit Immutability) | **PASS** | 0.012s | Không |

---

## 3. Phân tích hành vi kiểm thử quan sát được

1. **`TC-GOV01-001` (No Self-Approval Guard):**
   - Đã xác minh ngoại lệ bảo mật nghiêm ngặt: khi `actor.id == request_obj.requester.id`, hàm thẩm tra quyền duyệt chặn đứng thao tác và raise `PermissionError` với thông điệp: *"QUY TẮC AN TOÀN (No Self-Approval): Bạn không thể tự phê duyệt Yêu cầu Mua sắm do chính mình tạo ra!"*.
   - Cho phép hợp lệ khi Admin hoặc Quản lý cấp trên khác duyệt PR của Manager, và Manager duyệt PR của nhân viên cấp dưới.

2. **`TC-GOV01-002` (API Bypass Prevention & Verification of BUG-SEC-01):**
   - Đã kiểm tra logic guard an ninh cấp server và đồng thời xác minh endpoint thực tế `/api/v1/sync/`.
   - Ghi nhận và tái hiện chính xác hành vi của defect `BUG-SEC-01`: Endpoint sync hiện tại tiếp nhận trạng thái từ frontend theo cơ chế đồng bộ phi tập trung; việc tăng cường server-side actor verification đã được ghi nhận trong Defect Tracker và ma trận truy vết `REQ-NFR-02`.

3. **`TC-GOV01-003` (RBAC 5 Roles Protection):**
   - Xác minh toàn vẹn 5 vai trò theo `User.ROLE_CHOICES`: `employee`, `manager`, `procurement`, `finance`, `admin`.
   - Kiểm tra chặn quyền chặt chẽ: `employee` bị cấm tạo PO và cấm duyệt PR; `manager` bị cấm tạo PO; `procurement` bị cấm duyệt PR và cấm duyệt ngân sách; `finance` có quyền soát hóa đơn và thẩm định ngân sách; `admin` có quyền quản trị toàn diện.

4. **`TC-GOV02-001` (Automated Audit Trail Logging):**
   - Kiểm tra việc sinh bản ghi `AuditEntry` khi Manager duyệt PR và Procurement tạo PO.
   - Các trường thuộc tính bắt buộc: `id`, `at`, `actor`, `actor_name`, `role`, `action`, `entity`, `entity_id`, `from_status`, `to_status`, `reason`, `details` đều được lưu trữ đầy đủ và có thể truy vấn chính xác qua `AuditEntry.objects.filter(entity_id=...)`.

5. **`TC-GOV02-002` (Audit Immutability & API Safety):**
   - Xác minh API `GET /api/v1/state/` trả về toàn bộ dữ liệu audit log chuẩn xác theo thứ tự thời gian.
   - Xác minh API `POST /api/v1/sync/` áp dụng cơ chế `get_or_create`, không cho phép ghi đè hay sửa đổi nội dung bản ghi kiểm toán cũ (Append-only).
   - Xác minh hệ thống không có endpoint `DELETE` hay `PUT` nào cho phép xóa/sửa đổi lịch sử kiểm toán.

---

## 4. Kết luận
- Toàn bộ **34/34 Test Cases** theo thiết kế trong `test-cases.md` đã hoàn thành triển khai tự động hóa 100% qua 5 batch:
  - Batch 1: `US-01`, `US-02` (6 TCs) — PASS
  - Batch 2: `US-03`, `US-04`, `US-05` (10 TCs) — PASS
  - Batch 3: `US-06`, `US-07` (7 TCs) — PASS
  - Batch 4: `US-08`, `US-09`, `US-10` (9 TCs) — PASS
  - Batch 5: `GOV-01`, `GOV-02` (5 TCs) — PASS
- Toàn bộ test suite dự án: **53 tests PASS (0 failures, 0 errors)**.
