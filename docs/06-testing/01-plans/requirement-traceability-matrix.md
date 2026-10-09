# Ma trận Truy vết Yêu cầu & Kiểm thử (Requirement Traceability Matrix - RTM)

> **Mã tài liệu:** QA-02-RTM  
> **Hệ thống:** ProcureAI — Internal Procurement & Approval Platform  
> **Thời điểm cập nhật:** 2026-10-09T21:05:00+07:00  
> **Người thực hiện:** Senior QA Engineer & Test Automation Engineer  
> **Nguồn yêu cầu chính thức:** [5.requirements.md](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/01-discovery/5.requirements.md), [user-stories.md](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/03-product/user-stories.md), [TRACEABILITY.md](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/05-technical/story-specs/TRACEABILITY.md)  
> **Đợt thực thi gần nhất (Latest Run ID):** `run-20261009-remediation-group1`  

---

## 1. Bảng Ma trận Truy vết Yêu cầu (Requirement Traceability Matrix)

| Requirement ID | US ID | AC ID | Test Case IDs | Automated Test IDs | Latest Run ID | Result | Bug IDs | Evidence Link | Coverage Status |
|:---|:---:|:---:|:---:|:---|:---:|:---:|:---:|:---|:---:|
| **REQ-FR-01** | `US-01` | `AC-01-01` | `TC-WF-001` | `test_pr_creation_and_estimated_amount`<br/>`test_step_01_create_draft_pr_and_ai_standardizer` | `run-20261009-remediation-group1` | **PASS** | None | [Log](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/run-20261009-remediation-group1/execution-log.txt) | **COVERED** |
| **REQ-FR-02** | `US-01` | `AC-01-02` | `TC-WF-002` | `test_step_02_submit_pr_and_budget_commitment` | `run-20261009-remediation-group1` | **PASS** | None | [Log](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/run-20261009-remediation-group1/execution-log.txt) | **COVERED** |
| **REQ-FR-03** | `US-03` | `AC-03-01` | `TC-AI-001` | `test_ai_standardizer_service`<br/>`test_step_01_create_draft_pr_and_ai_standardizer` | `run-20261009-remediation-group1` | **PASS** | `BUG-FE-01` | [Log](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/run-20261009-remediation-group1/execution-log.txt) | **COVERED** |
| **REQ-FR-04** | `US-02` | `AC-02-01` | `TC-WF-002` | `test_step_02_submit_pr_and_budget_commitment`<br/>`test_step_09_api_state_and_sync_endpoints` | `run-20261009-remediation-group1` | **PASS** | None | [Log](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/run-20261009-remediation-group1/execution-log.txt) | **COVERED** |
| **REQ-FR-05** | `US-04` | `AC-04-01` | `TC-WF-003` | `test_step_04_manager_approval_success` | `run-20261009-remediation-group1` | **PASS** | None | [Log](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/run-20261009-remediation-group1/execution-log.txt) | **COVERED** |
| **REQ-FR-06** | `US-04` | `AC-04-02` | `TC-WF-003` | `test_step_04_manager_approval_success` | `run-20261009-remediation-group1` | **PASS** | None | [Log](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/run-20261009-remediation-group1/execution-log.txt) | **COVERED** |
| **REQ-FR-07** | `US-04` | `AC-04-03` | `TC-WF-003` | `test_step_04_manager_approval_success`<br/>`test_step_09_api_state_and_sync_endpoints` | `run-20261009-remediation-group1` | **PASS** | None | [Log](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/run-20261009-remediation-group1/execution-log.txt) | **COVERED** |
| **REQ-FR-08** | `US-05` | `AC-05-01` | `TC-WF-002` | `test_budget_remaining_calculation`<br/>`test_step_02_submit_pr_and_budget_commitment` | `run-20261009-remediation-group1` | **PASS** | None | [Log](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/run-20261009-remediation-group1/execution-log.txt) | **COVERED** |
| **REQ-FR-09** | `US-05` | `AC-05-02` | `TC-WF-002` | `test_budget_remaining_calculation` | `run-20261009-remediation-group1` | **PASS** | None | [Log](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/run-20261009-remediation-group1/execution-log.txt) | **COVERED** |
| **REQ-FR-10** | `US-06` | `AC-06-01` | `TC-WF-003` | `test_quotation_calculations`<br/>`test_step_05_quotation_collection_and_price_anomaly_alert` | `run-20261009-remediation-group1` | **PASS** | None | [Log](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/run-20261009-remediation-group1/execution-log.txt) | **COVERED** |
| **REQ-FR-11** | `US-06` | `AC-06-02` | `TC-WF-003` | `test_quotation_calculations` | `run-20261009-remediation-group1` | **PASS** | None | [Log](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/run-20261009-remediation-group1/execution-log.txt) | **COVERED** |
| **REQ-FR-12** | `US-06` | `AC-06-03` | `TC-WF-003` | `test_step_05_quotation_collection_and_price_anomaly_alert` | `run-20261009-remediation-group1` | **PASS** | None | [Log](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/run-20261009-remediation-group1/execution-log.txt) | **COVERED** |
| **REQ-FR-13** | `US-07` | `AC-07-01` | `TC-AI-002` | `test_step_05_quotation_collection_and_price_anomaly_alert` | `run-20261009-remediation-group1` | **PASS** | None | [Log](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/run-20261009-remediation-group1/execution-log.txt) | **COVERED** |
| **REQ-FR-14** | `US-07` | `AC-07-02` | `TC-US07-003` | `test_tc_us07_003_ai_supplier_recommendation_criteria` | `RUN-20261009-214300` | **PASS** | None | [Log](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261009-214300/execution-log.txt) | **COVERED** |
| **REQ-FR-15** | `US-07` | `AC-07-03` | `TC-AI-002`<br/>`TC-US07-001` | `test_step_05_quotation_collection_and_price_anomaly_alert`<br/>`test_tc_us07_001_price_anomaly_alert_triggered` | `RUN-20261009-214300` | **PASS** | None | [Log](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261009-214300/execution-log.txt) | **COVERED** |
| **REQ-FR-16** | `US-08` | `AC-08-01` | `TC-US08-001`<br/>`TC-US08-003` | `test_tc_us08_001_create_valid_po_from_selected_quotation`<br/>`test_step_06_create_po_from_selected_quotation` | `RUN-20261009-214700` | **PASS** | None | [Log](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261009-214700/execution-log.txt) | **COVERED** |
| **REQ-FR-17** | `US-09` | `AC-09-01` | `TC-US09-001`<br/>`TC-US09-002` | `test_tc_us09_001_record_full_receiving`<br/>`test_step_07_goods_receiving_full` | `RUN-20261009-214700` | **PASS** | None | [Log](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261009-214700/execution-log.txt) | **COVERED** |
| **REQ-FR-18** | `US-10` | `AC-10-01` | `TC-US10-001`<br/>`TC-US10-003` | `test_tc_us10_001_close_pr_success`<br/>`test_step_08_close_pr_lifecycle` | `RUN-20261009-214700` | **PASS** | None | [Log](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261009-214700/execution-log.txt) | **COVERED** |
| **REQ-NFR-01**| `US-01..10`| `AC-NFR-01`| `TC-DATA-001`| `ProcurementUnitModelTests` (7 tests)<br/>`test_step_09_api_state_and_sync_endpoints` | `RUN-20261009-215300` | **PASS** | None | [Log](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261009-215300/execution-log.txt) | **COVERED** |
| **REQ-NFR-02**| `GOV-01` | `AC-GOV-01` | `TC-GOV01-001`<br/>`TC-GOV01-002`<br/>`TC-GOV01-003` | `test_tc_gov01_001_strict_no_self_approval_guard`<br/>`test_tc_gov01_002_prevent_bypass_and_verify_bug_sec_01`<br/>`test_tc_gov01_003_rbac_matrix_5_roles` | `RUN-20261010-000500` | **PASS (Verified)** | `BUG-0001 (VERIFIED)`<br/>`BUG-0005 (TRIAGED)` | [Log](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261010-000500/execution-log.txt) | **COVERED** |
| **REQ-NFR-03**| `GOV-02` | `AC-GOV-02` | `TC-GOV02-001`<br/>`TC-GOV02-002` | `test_tc_gov02_001_automated_audit_entry_logging`<br/>`test_tc_gov02_002_audit_trail_immutability_and_api_safety` | `RUN-20261009-215300` | **PASS** | None | [Log](file:///d:/LTUD/group-01%20-%20LTUDDN/docs/06-testing/evidence/RUN-20261009-215300/execution-log.txt) | **COVERED** |

---

## 2. Thống kê Mức độ Bao phủ Kiểm thử (Traceability & Coverage Summary)

- **Tổng số Functional Requirements (FR):** 18
  - Đã được bao phủ và kiểm thử tự động PASS: **18 / 18** (100.0%)
  - Chưa có test case thực thi riêng: **0 / 18**
- **Tổng số Non-Functional Requirements (NFR):** 3
  - Đã kiểm thử đầy đủ PASS: **3 / 3** (`REQ-NFR-01`, `REQ-NFR-02`, `REQ-NFR-03` - **100% COVERED**)
  - Tái hiện & xác nhận defect an ninh: `BUG-SEC-01` (được thẩm định qua `TC-GOV01-002`)
- **Tổng số Bugs/Defects liên quan:**
  - `BUG-SEC-01` liên kết với `REQ-NFR-02` (Thiếu server-side enforcement tại `/api/v1/sync/`).
  - `BUG-FE-01` liên kết với `REQ-FR-03` (Lỗi linting regex trong `aiStandardizer.ts`).
  - `DEFECT-03` liên kết với `REQ-NFR-02` (File `tests/permissions.test.ts` bị crash do import code client cũ).
