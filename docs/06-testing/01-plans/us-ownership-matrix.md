# Ma trận Sở hữu User Story (User Story Ownership Matrix)

> **Mã tài liệu:** QA-02-USOM  
> **Hệ thống:** ProcureAI — Internal Procurement & Approval Platform  
> **Thời điểm cập nhật:** 2026-10-09T21:05:00+07:00  
> **Người thực hiện:** Senior QA Engineer & Test Automation Engineer  
> **Nguồn phân công chính thức:** [TRACEABILITY.md](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/05-technical/story-specs/TRACEABILITY.md) & [taiga-backlog.md](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/03-product/taiga-backlog.md) (Taiga Project: `thgnud1022-ai-procurement-purchase-approval-system`)  
> **Trạng thái:** Confirmed (100% User Stories có Primary Owner duy nhất, không có orphan story)  

---

## 1. Quy tắc Trách nhiệm Sở hữu (Ownership Rules)

Mỗi User Story có **duy nhất một Primary Owner** chịu trách nhiệm xuyên suốt:
1. Requirements và Acceptance Criteria của story.
2. Thiết kế và rà soát Test Case liên quan.
3. Phối hợp với các thành viên khác triển khai và giải quyết defect.
4. Bằng chứng thực thi, kết quả retest và kiểm thử hồi quy (Regression Test).
5. Quản lý Commit/PR và giải trình nghiệm thu sản phẩm.

*Lưu ý:* Test Reviewer (Trần Thị Thu Hà - QA/Tester) độc lập kiểm tra và xác nhận tính hợp lệ của evidence, không thay thế trách nhiệm của Primary Owner.

---

## 2. Bảng Ma trận Sở hữu User Story (User Story Ownership Matrix)

| US ID | US Title | Primary Owner | Acceptance Criteria | Dependencies | Test Reviewer | Implementation Status | Test Status | Open Bugs | Evidence |
|:---:|:---|:---|:---|:---|:---|:---:|:---:|:---:|:---|
| **US-01** | Tạo Purchase Request với các trường bắt buộc | **Trần Thị Kiều Giang** *(Frontend)* | Không thể Submit khi thiếu trường bắt buộc; PR hợp lệ được lưu và gửi vào workflow. | Không (E-01 độc lập) | Trần Thị Thu Hà *(QA)* | Implemented (React UI + Django API) | **PASS** | None | [`test_pr_creation_and_estimated_amount`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/tests.py#L77)<br/>[`test_step_01_create_draft_pr_and_ai_standardizer`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/tests_workflow.py#L90) |
| **US-02** | Theo dõi trạng thái PR qua timeline | **Nguyễn Thị Thùy Dung** *(Backend)* | Trạng thái PR được hiển thị trong workflow; trạng thái phản ánh bước xử lý hiện tại. | `US-01` | Trần Thị Thu Hà *(QA)* | Implemented (Timeline UI + Django API) | **PASS** | None | [`test_step_02_submit_pr_and_budget_commitment`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/tests_workflow.py#L112)<br/>[`test_step_09_api_state_and_sync_endpoints`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/tests_workflow.py#L279) |
| **US-03** | Review gợi ý AI để hoàn thiện mô tả PR | **Nguyễn Trúc Lam** *(AI Vault)* | AI chỉ gợi ý; Employee có thể xác nhận hoặc chỉnh sửa gợi ý trước Submit; không có AI tự Submit. | `US-01` | Trần Thị Thu Hà *(QA)* | Implemented (`run_ai_standardizer` + AI Panel) | **PASS** | `BUG-FE-01` (Lint regex assignment) | [`test_ai_standardizer_service`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/tests.py#L173)<br/>[`test_step_01_create_draft_pr_and_ai_standardizer`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/tests_workflow.py#L90) |
| **US-04** | Manager xem PR & Budget trước khi phê duyệt | **Nguyễn Trương Thùy Dương** *(BA/PO)* | Manager xem được PR; có thể Approve, Reject, yêu cầu chỉnh sửa hoặc chuyển Finance; lý do Reject/chỉnh sửa/chuyển bước được ghi nhận. | `US-01`, `US-02` | Trần Thị Thu Hà *(QA)* | Implemented (Manager Modal + Django State) | **PASS** | None | [`test_step_04_manager_approval_success`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/tests_workflow.py#L154) |
| **US-05** | Finance kiểm tra PR với Budget để kiểm soát chi phí | **Nguyễn Trương Thùy Dương** *(BA/PO)* | Finance kiểm tra PR với Budget trước khi hoàn tất phê duyệt có yêu cầu; PR vượt Budget hiển thị cảnh báo; quyết định không do AI thực hiện. | `US-04` | Trần Thị Thu Hà *(QA)* | Implemented (Budget Service + Alert UI) | **PASS** | None | [`test_budget_remaining_calculation`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/tests.py#L64)<br/>[`test_step_02_submit_pr_and_budget_commitment`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/tests_workflow.py#L112) |
| **US-06** | Procurement liên kết nhiều Quotation với PR để so sánh | **Nguyễn Trương Thùy Dương** *(BA/PO)* | Chỉ xử lý Quotation sau khi PR được Approve; mỗi Quotation được liên kết với PR tương ứng; dữ liệu nhiều Supplier hiển thị để so sánh. | `US-04` (PR Approved) | Trần Thị Thu Hà *(QA)* | Implemented (Quotation Upload + List) | **PASS** | None | [`test_quotation_calculations`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/tests.py#L104)<br/>[`test_step_05_quotation_collection_and_price_anomaly_alert`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/tests_workflow.py#L182) |
| **US-07** | Review dữ liệu AI extraction & cảnh báo giá bất thường | **Nguyễn Trúc Lam** *(AI Vault)* | AI hỗ trợ phân tích và hiển thị so sánh; dữ liệu extraction có thể review/chỉnh sửa; Recommendation dựa trên tiêu chí Quotation; AI không tự chọn Supplier; cảnh báo giá bất thường theo ngưỡng `≥20%` khi có dữ liệu lịch sử. | `US-06` | Trần Thị Thu Hà *(QA)* | Implemented (AI Compare Matrix + Alert ≥20%) | **PASS** | None | [`test_step_05_quotation_collection_and_price_anomaly_alert`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/tests_workflow.py#L182) |
| **US-08** | Tạo Purchase Order (PO) từ PR đã duyệt và Supplier đã chọn | **Nguyễn Thị Thùy Dung** *(Backend)* | PO không được tạo khi PR chưa Approve hoặc chưa chọn Supplier; PO liên kết với PR và Quotation/Supplier được chọn; AI không tự thay đổi dữ liệu đã chọn. | `US-04`, `US-06`, `US-07` | Trần Thị Thu Hà *(QA)* | Implemented (PO Form + PO Models) | **PASS** | None | [`test_purchase_order_and_receiving`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/tests.py#L129)<br/>[`test_step_06_create_po_from_selected_quotation`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/tests_workflow.py#L221) |
| **US-09** | Ghi nhận biên bản Receiving và sai lệch thực tế | **Nguyễn Thị Thùy Dung** *(Backend)* | Receiving hỗ trợ nhận đủ, nhận một phần hoặc phát hiện sai lệch; người dùng có quyền mới được ghi nhận; tổng số lượng không vượt PO theo Assumption hiện tại. | `US-08` | Trần Thị Thu Hà *(QA)* | Implemented (Receiving API + Receiving UI) | **PASS** | None | [`test_purchase_order_and_receiving`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/tests.py#L129)<br/>[`test_step_07_goods_receiving_full`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/tests_workflow.py#L244) |
| **US-10** | Đóng yêu cầu mua sắm (Close PR) sau khi Receiving hoàn tất | **Trần Thị Thu Hà** *(QA/Tester)* | PR chỉ Close sau Receiving và các bước mua sắm liên quan hoàn tất; dữ liệu PR, PO và Receiving phải có liên kết để đối soát; không tự động Close khi còn điều kiện chưa hoàn tất. | `US-09` | Trần Thị Thu Hà *(QA)* | Implemented (Close PR Action + Validation) | **PASS** | None | [`test_step_08_close_pr_lifecycle`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/tests_workflow.py#L263) |
| **GOV-01** | Phân quyền 5 vai trò & Quy tắc No Self-Approval Guard | **Nguyễn Thị Thùy Dung** *(Backend)* | RBAC hỗ trợ Employee, Manager, Procurement, Finance và Admin; người tạo PR không thể tự Approve PR của mình. | Xuyên suốt hệ thống | Trần Thị Thu Hà *(QA)* | Implemented (Frontend guard + Django models) | **PARTIAL** | `BUG-SEC-01` (Thiếu server-side enforcement tại `/api/v1/sync/`) | [`test_user_roles_and_properties`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/tests.py#L51)<br/>[`test_step_03_strict_no_self_approval_guard`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/tests_workflow.py#L131) |
| **GOV-02** | Audit Trail ghi nhận thao tác quan trọng để truy vết | **Trần Thị Thu Hà** *(QA/Tester)* | Ghi nhận người thực hiện, thời điểm, action, thay đổi trạng thái và các quyết định Approval; mọi thay đổi phải có thể truy vết. | Xuyên suốt hệ thống | Trần Thị Thu Hà *(QA)* | Implemented (`AuditEntry` Model + Logging) | **PASS** | None | [`test_audit_entry_logging`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/tests.py#L154)<br/>[`test_step_04_manager_approval_success`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/tests_workflow.py#L154) |

---

## 3. Tổng hợp Độ phủ và Trách nhiệm theo Thành viên

| Thành viên | Vai trò | Số US sở hữu chính | Danh sách US | Tỷ lệ Test Pass | Tình trạng Open Bugs |
|:---|:---|:---:|:---|:---:|:---|
| **Trần Thị Kiều Giang** | Frontend Developer | 1 | `US-01` | 100% | 0 bug trên US-01 |
| **Nguyễn Trúc Lam** | AI Vault | 2 | `US-03`, `US-07` | 100% | 1 bug linting frontend liên quan AI utility |
| **Nguyễn Trương Thùy Dương** | BA / PO | 3 | `US-04`, `US-05`, `US-06` | 100% | 0 bug mở |
| **Nguyễn Thị Thùy Dung** | Backend Developer | 4 | `US-02`, `US-08`, `US-09`, `GOV-01` | 75% PASS / 25% PARTIAL | 1 bug bảo mật: cần bổ sung server-side guard cho `GOV-01` |
| **Trần Thị Thu Hà** | QA / Tester | 2 | `US-10`, `GOV-02` | 100% | 0 bug mở |

> **Đánh giá tổng thể:** 12/12 User Stories đều có Primary Owner duy nhất từ hồ sơ phân công chính thức của dự án. 11/12 Stories đạt trạng thái Test Status **PASS**, 1 Story (`GOV-01`) đạt **PARTIAL** do cần bổ sung cơ chế kiểm soát trực tiếp tại tầng API Django.
