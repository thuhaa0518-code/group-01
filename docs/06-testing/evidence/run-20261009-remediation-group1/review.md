# AI-QA-03A — Independent Review of Group 1 Remediation

- **Review Run ID:** `run-20261009-remediation-group1`
- **Reviewer:** Senior QA Engineer & Independent Software Reviewer
- **Evaluation Date:** 2026-10-09T15:35:00+07:00
- **Overall Review Decision:** **ACCEPTED WITH GAPS**

---

## 1. Xác minh tính hợp lệ của 16 Test Cases

Hạ tầng kiểm thử đã được đưa từ trạng thái crash (Error on import) về trạng thái thực thi được (Ran 16 tests in 0.090s, OK). Dưới đây là phân tích chi tiết bản chất kỹ thuật của từng test:

| Test Identifier | Yêu cầu liên kết | Đối tượng thực sự được gọi | Loại kiểm thử | Đánh giá tính hợp lệ & Lỗ hổng còn thiếu |
|:---|:---|:---|:---:|:---|
| `test_user_roles_and_properties` | REQ-NFR-02 | `User` Model & `@property full_name` | Model Unit | **HỢP LỆ.** Kiểm tra 5 vai trò và property. *Thiếu:* Kiểm tra ràng buộc khi gán role không hợp lệ ngoài choices. |
| `test_budget_remaining_calculation` | REQ-FR-08, REQ-FR-09 | `Budget` Model & `@property remaining` | Model Unit | **HỢP LỆ.** Kiểm tra công thức `allocated - committed`. *Thiếu:* Dữ liệu biên khi committed vượt quá allocated (ngân sách âm). |
| `test_pr_creation_and_estimated_amount` | REQ-FR-01, REQ-BR-01 | `PurchaseRequest`, `PRLineItem` & `@property total_estimated_amount` | Model Unit | **HỢP LỆ.** Kiểm tra tính tổng tiền từ nhiều line items. *Thiếu:* Trường hợp PR không có item nào (`count == 0`). |
| `test_quotation_calculations` | REQ-FR-10, REQ-FR-11 | `Quotation` Model & `@property subtotal`, `total_amount` | Model Unit | **HỢP LỆ.** Kiểm tra phép toán Decimal có VAT và phí vận chuyển. *Thiếu:* Thuế suất 0% hoặc âm. |
| `test_purchase_order_and_receiving` | REQ-FR-16, REQ-FR-17 | `PurchaseOrder`, `Receiving` Models | Model Unit | **HỢP LỆ.** Kiểm tra quan hệ ForeignKey giữa PO và Receiving. *Thiếu:* Kiểm tra số lượng nhận vượt quá số lượng đặt. |
| `test_audit_entry_logging` | REQ-NFR-03 | `AuditEntry` Model | Model Unit | **HỢP LỆ.** Kiểm tra persistence của bản ghi kiểm toán. *Thiếu:* Tính bất biến (Immutability) của log. |
| `test_ai_standardizer_service` | REQ-FR-03 | `procurement.services.run_ai_standardizer` | Service Unit | **HỢP LỆ.** Gọi trực tiếp hàm nghiệp vụ AI, kiểm tra gợi ý danh mục và chuẩn hóa thông số. *Thiếu:* Tiêu đề rỗng hoặc ngôn ngữ không xác định. |
| `test_step_01_create_draft_pr_and_ai_standardizer` | REQ-FR-01, REQ-FR-03 | `run_ai_standardizer` + `PurchaseRequest.objects.create` | Lifecycle Step | **HỢP LỆ.** Khởi tạo PR nháp và kiểm tra kết quả chuẩn hóa AI. |
| `test_step_02_submit_pr_and_budget_commitment` | REQ-FR-02, REQ-BR-01 | Gán trực tiếp `pr.status = 'pending_manager'` + cộng budget | Simulation | **GAPS.** Test đang mô phỏng bước submit bằng cách gán trực tiếp model field thay vì gọi qua một service transition hoặc API endpoint. |
| `test_step_03_strict_no_self_approval_guard` | REQ-NFR-02, REQ-BR-03 | Local closure `can_user_approve` trong nội bộ test method | Mock Guard | **CRITICAL GAP.** Test sử dụng một hàm closure cục bộ trong thân test để assert lỗi `PermissionError`, **chưa chứng minh được backend Django có cơ chế tự động chặn** khi nhận request phê duyệt từ chính requester. |
| `test_step_04_manager_approval_success` | REQ-FR-05, REQ-FR-06 | Gán trực tiếp `pr.status = 'approved'` + tạo `AuditEntry` | Simulation | **GAPS.** Mô phỏng luồng thành công ở mức dữ liệu ORM, chưa kiểm tra quyền đăng nhập của Manager qua view. |
| `test_step_05_quotation_collection_and_price_anomaly_alert` | REQ-FR-13, REQ-FR-15 | `Quotation.objects.create` + local `evaluate_anomaly` | Logic Check | **GAPS.** Kiểm tra logic tính toán ngưỡng ≥ 20% bằng hàm toán học trong test, chưa tích hợp gọi hàm `run_ai_quotation_analysis` trong `services.py`. |
| `test_step_06_create_po_from_selected_quotation` | REQ-FR-16 | `PurchaseOrder.objects.create` + gán `pr.po_id` | Lifecycle Step | **HỢP LỆ VỀ DỮ LIỆU.** Kiểm tra tính toàn vẹn quan hệ giữa PR và PO. |
| `test_step_07_goods_receiving_full` | REQ-FR-17 | `Receiving.objects.create` + cập nhật PO/PR | Lifecycle Step | **HỢP LỆ VỀ DỮ LIỆU.** Kiểm tra lưu biên bản nhận hàng đủ 100%. |
| `test_step_08_close_pr_lifecycle` | REQ-FR-18 | Gán `pr.status = 'closed'` | Lifecycle Step | **HỢP LỆ VỀ DỮ LIỆU.** Kiểm tra trạng thái kết thúc chu trình. |
| `test_step_09_api_state_and_sync_endpoints` | API Contract | Django Test Client: `GET /api/v1/state/` & `POST /api/v1/sync/` | **Full API Contract** | **HỢP LỆ CAO NHẤT.** Gọi trực tiếp HTTP request qua Django Test Client, xác minh HTTP 200, kiểm tra 7 cấu trúc domain và xác nhận thay đổi được lưu thực sự vào database. |

---

## 2. Kiểm tra độc lập Quy tắc No Self-Approval

1. **Vị trí thực thi quy tắc hiện tại:**
   - **Frontend:** Quy tắc được thực thi **chặt chẽ** tại [`FE/src/utils/rules.ts`](file:///d:/LTUD/group-01%20-%20LTUDDN/FE/src/utils/rules.ts#L87) (hàm `managerGuard`: `if (selfApproval) blockReason = 'Bạn là người tạo PR này...'`) và [`FE/src/utils/procurementActions.ts`](file:///d:/LTUD/group-01%20-%20LTUDDN/FE/src/utils/procurementActions.ts#L123). Nút Approve bị vô hiệu hóa hoặc chặn trước khi dispatch.
   - **Backend:** Tại [`procurement/views.py`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/views.py#L51) (hàm `api_sync_view`), server nhận payload đồng bộ JSON từ client và lưu trực tiếp `pr.status = req_data['status']` mà **không kiểm tra danh tính người gửi request có trùng với `pr.requester` hay không**.
2. **Khả năng bị bypass:**
   - Một người dùng có thể gửi trực tiếp một HTTP POST request tới endpoint `/api/v1/sync/` với payload `{'requests': [{'id': 'PR-1', 'status': 'approved'}]}` và trạng thái sẽ được cập nhật thành công trong SQLite mà không bị chặn ở tầng backend.
3. **Đánh giá test `test_step_03_strict_no_self_approval_guard`:**
   - Test này định nghĩa một closure logic trong test để chứng minh quy tắc nghiệp vụ (Business Rule Validation). Nó khẳng định *quy tắc phải chặn*, nhưng **chưa phải là bằng chứng cho thấy server Django hiện tại đang chặn**.
   - **Kết luận:** Trạng thái backend enforcement cho No Self-Approval là: **NOT ENFORCED AT SERVER-SIDE API**. Cần được bổ sung chính thức trong **Nhóm 2 (Backend Permission & No Self-Approval Tests/Enforcement)**.

---

## 3. Rà soát thay đổi Production Code trong `procurement/models.py`

1. **Bổ sung `from decimal import Decimal` (Dòng 1):**
   - *Lý do:* Thuộc tính `@property total_amount` của class `Quotation` (dòng 151) sử dụng hàm `Decimal(str(...))` nhưng file không import thư viện `Decimal`. Khi gọi thuộc tính này, Python quăng lỗi `NameError: name 'Decimal' is not defined`.
   - *Đánh giá:* **HOÀN TOÀN HỢP LÝ VÀ BẮT BUỘC**. Đây là lỗi cú pháp/runtime thiếu import của code gốc.
2. **Bổ sung Alias `AuditLog = AuditEntry` (Dòng 228):**
   - *Lý do:* File [`procurement/services.py`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/services.py#L1) import `from .models import AuditLog...`. Trong `models.py`, model thực tế được đặt tên là `AuditEntry`.
   - *Đánh giá:* **HỢP LÝ VỀ MẶT TƯƠNG THÍCH NGƯỢC**. Tương tự như alias `PRItem = PRLineItem` đã có sẵn tại dòng 109 của `models.py`. Alias này không tạo table mới, không làm thay đổi migration schema, và cho phép module `services.py` hoạt động mà không bị crash import.
3. **Rủi ro tác dụng phụ (Side effects):**
   - Kiểm tra bằng lệnh `python manage.py makemigrations --check --dry-run` cho kết quả: `No changes detected`. Không có bất kỳ rủi ro nào đối với schema cơ sở dữ liệu.

---

## 4. Kiểm tra bộ test Node.js và CI Pipeline

1. **Bộ test Node.js cũ (`tests/workflow.test.js`):**
   - Không bị xóa tùy tiện. Đã được bổ sung comment header thông báo `[OBSOLETE / MIGRATED]` trỏ rõ ràng tới suite thay thế `procurement/tests_workflow.py` theo đúng Quyết định 1A.
2. **Kiểm tra CI Workflow:**
   - Kiểm tra hệ thống: Kho mã nguồn hiện tại **không có thư mục `.github/workflows/`** hoặc cấu hình CI tự động nào được thiết lập.
3. **Tính trung thực của số liệu tài liệu:**
   - Bộ test mới chạy thực tế 16/16 test với output xác thực `Ran 16 tests in 0.090s OK`.
   - Tuy nhiên, tài liệu cũ `docs/06-testing/test-cases.md` vẫn còn chứa đoạn text giả định cũ ("21/21 PASS node --test"). Tài liệu này cần được cập nhật chính thức ở giai đoạn sau khi hoàn thành toàn bộ các nhóm kiểm thử.

---

## 5. Kiểm tra Evidence và Trạng thái Git

1. **Xác minh Log thực tế:**
   - Tệp `docs/evidence/test-runs/run-20261009-remediation-group1/execution-log.txt` ghi nhận đầy đủ 16 dòng test verbosity 2, đúng timestamp và đúng hash bộ nhớ SQLite.
2. **Git Diff Audit:**
   - Lệnh `git diff --check` phát hiện 1 cảnh báo nhỏ: `procurement/models.py:231: new blank line at EOF`. Không có conflict hay lỗi cú pháp.
   - Lệnh `git status --short` xác nhận chỉ có 4 file liên quan đến Django test và model được chỉnh sửa:
     - `M procurement/models.py`
     - `M procurement/tests.py`
     - `M tests/workflow.test.js`
     - `?? procurement/tests_workflow.py`
     - `?? docs/evidence/`
3. **Đánh giá `migration-matrix.md`:**
   - Ma trận đã ánh xạ đúng 6 mục tiêu kiểm thử từ test suite Node cũ sang các bước tương ứng trong Django runner.

---

## 6. Kết luận & Khuyến nghị (Final Verdict)

### Trạng thái: **`ACCEPTED WITH GAPS`**

### Lý do chấp nhận:
1. Đã giải quyết triệt để lỗi crash import của cả 2 bộ test Django cũ và Node cũ.
2. 16/16 bài test chạy thành công, nhanh (0.09s), độc lập và hoàn toàn trên in-memory test database, không ảnh hưởng đến dữ liệu dev.
3. Bản sửa lỗi `Decimal` trên `models.py` là chuẩn xác và sửa đúng bug runtime tiềm ẩn.

### Các khoảng trống (Gaps) cần xử lý ở Nhóm tiếp theo:
- **Gap 1 (Trọng yếu cho Nhóm 2):** Backend Django `/api/v1/sync/` cần được bổ sung kiểm tra hoặc service bảo vệ quy tắc No Self-Approval (nếu muốn bảo vệ ở tầng backend), và bài test `test_step_03` cần chuyển từ kiểm tra hàm closure sang kiểm tra phản hồi từ API/service thật của Django.
- **Gap 2:** Khi chuyển sang Nhóm 3 (Vitest), cần viết test suite độc lập cho `FE/src/utils/rules.ts` để kiểm chứng No Self-Approval ở tầng Frontend.

Senior QA đề xuất: **Chấp thuận kết quả Nhóm 1 và sẵn sàng chuyển tiếp sang Nhóm 2 theo kế hoạch phê duyệt.**
