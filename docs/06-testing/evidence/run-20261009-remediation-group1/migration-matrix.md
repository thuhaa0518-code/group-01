# Test Migration & Traceability Matrix (Group 1)

- **Run ID:** `run-20261009-remediation-group1`
- **Tình trạng:** Chuyển đổi thành công bộ test từ Node.js (`tests/workflow.test.js`) sang Django runner (`procurement/tests_workflow.py`).

| Test Case ban đầu (Node.js) | Test Method mới (Django) | Requirement liên kết | Acceptance Criteria | Kết quả thực thi |
|:---|:---|:---|:---|:---:|
| `1. Create Draft PR & AI Normalizer Test` | `ProcurementWorkflowIntegrationTests.test_step_01_create_draft_pr_and_ai_standardizer` | REQ-FR-01, REQ-FR-03 | Tạo PR trạng thái `draft`, AI chuẩn hóa gợi ý danh mục Thiết bị IT | **PASS** |
| `2. Submit PR & Budget Threshold Flag Test` | `ProcurementWorkflowIntegrationTests.test_step_02_submit_pr_and_budget_commitment` | REQ-FR-02, REQ-BR-01 | PR chuyển sang `pending_manager`, cập nhật giữ chỗ ngân sách (`committed`) | **PASS** |
| `3. Strict No Self-Approval Security Rule` | `ProcurementWorkflowIntegrationTests.test_step_03_strict_no_self_approval_guard` | REQ-NFR-02, REQ-BR-03 | Chặn tuyệt đối trường hợp Manager tự phê duyệt PR do chính mình tạo | **PASS** |
| `4. Manager Approval Test` | `ProcurementWorkflowIntegrationTests.test_step_04_manager_approval_success` | REQ-FR-05, REQ-FR-06 | Manager hợp lệ phê duyệt PR thành công, trạng thái chuyển sang `approved` | **PASS** |
| `5. AI Quotation Comparison & Price Anomaly Alert` | `ProcurementWorkflowIntegrationTests.test_step_05_quotation_collection_and_price_anomaly_alert` | REQ-FR-13, REQ-FR-15 | Cảnh báo giá bất thường khi đơn giá báo giá vượt >= 20% so với dự toán | **PASS** |
| `6. Create PO -> Goods Receiving -> Close PR` | `ProcurementWorkflowIntegrationTests.test_step_06_create_po_from_selected_quotation`<br/>`test_step_07_goods_receiving_full`<br/>`test_step_08_close_pr_lifecycle` | REQ-FR-16, REQ-FR-17, REQ-FR-18 | Hoàn tất chu trình mua sắm từ tạo PO (`issued`), nhận hàng (`full`), đến đóng PR (`closed`) | **PASS** |
| *(Mới bổ sung)* | `ProcurementWorkflowIntegrationTests.test_step_09_api_state_and_sync_endpoints` | API Contract | Hợp đồng API REST `/api/v1/state/` và `/api/v1/sync/` hoạt động chuẩn xác | **PASS** |
| *(Unit Tests)* | `ProcurementUnitModelTests` (7 test methods) | REQ-NFR-01 | Kiểm tra tính toán ngân sách, PRLineItem, Báo giá VAT/Shipping, AuditEntry và AI service | **PASS** |
