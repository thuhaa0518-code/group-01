# ProcureAI Story Specifications & End-to-End Traceability Matrix (v1)

> **Hệ thống:** ProcureAI - Internal Procurement & Approval Platform  
> **Nguồn Taiga Backlog:** `https://tree.taiga.io/project/thgnud1022-ai-procurement-purchase-approval-system/backlog`  
> **Đường dẫn file:** `docs/06-technical/story-specs/TRACEABILITY.md`  
> **Trạng thái:** Confirmed (100% Stories linked to Owners, No Orphan Stories)  

---

## 1. Team Allocation & Story Ownership Summary

| Thành viên | Vai trò | User Stories chính đảm nhận (Taiga Owner) | Scope công việc |
|:---|:---|:---|:---|
| **Trần Thị Kiều Giang** | Frontend Developer | **US-01** | Thiết kế UI/UX form PR, Validation client & Luồng Submit |
| **Nguyễn Trúc Lam** | AI Vault | **US-03, US-07** | Prompting AI, AI Standardizer, Quotation OCR & Anomaly Alert |
| **Nguyễn Trương Thùy Dương** | BA / PO | **US-04, US-05, US-06** | Manager Approval flow, Finance Budget Check & Sourcing rules |
| **Nguyễn Thị Thùy Dung** | Backend Developer | **US-02, US-08, US-09, GOV-01** | Workflow State Machine, PO API, Receiving API & Auth/RBAC |
| **Trần Thị Thu Hà** | QA / Tester | **US-10, GOV-02** | Acceptance verification, PR Close criteria & Audit Trail logging |

---

## 2. Complete End-to-End Traceability Matrix

| Story ID | Requirement ID | User Story Summary | Acceptance Criteria (Given/When/Then) | FE Component / Screen | BE API Endpoint | DB Table & Columns | Primary Owner | Task ID |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| **US-01** | `REQ-FR-01`, `REQ-BR-01` | Tạo & Quản lý PR | Given Employee logged in, When filling title, category & items, Then PR is created in `DRAFT` state | `NewPRModal`, `PRListPage` | `POST /api/purchase-requests` | `PurchaseRequest`, `PRItem` | **Trần Thị Kiều Giang** | `TSK-FE-01` |
| **US-02** | `REQ-FR-04` | Theo dõi trạng thái PR | Given User views PR list, When clicking PR detail, Then exact step & status timeline is rendered | `PRStatusTimeline` | `GET /api/purchase-requests/:id` | `PurchaseRequest.status` | **Nguyễn Thị Thùy Dung** | `TSK-BE-02` |
| **US-03** | `REQ-FR-03` | AI Standardizer gợi ý PR | Given User creating PR, When clicking AI Standardize, Then AI auto-fills category & suggestions | `AIStandardizerPanel` | `POST /api/ai/normalize-pr` | `PurchaseRequest.ai_normalized_notes` | **Nguyễn Trúc Lam** | `TSK-AI-01` |
| **US-04** | `REQ-FR-05`, `REQ-FR-06`, `REQ-BR-03` | Manager Phê duyệt PR | Given Manager reviewing PR, When clicking Approve/Reject, Then PR updates state to `APPROVED` / `REJECTED` | `ManagerPRDetailModal` | `POST /api/purchase-requests/:id/approve` | `PurchaseRequest.status`, `ApprovalHistory` | **Nguyễn Trương Thùy Dương** | `TSK-BA-01` |
| **US-05** | `REQ-FR-08`, `REQ-FR-09`, `REQ-BR-04` | Finance Kiểm tra Ngân sách | Given PR >50M or over budget, When Finance reviews, Then Budget is checked & approved | `FinanceBudgetReview` | `POST /api/purchase-requests/:id/forward-finance` | `Budget.reserved_amount`, `PurchaseRequest` | **Nguyễn Trương Thùy Dương** | `TSK-BA-02` |
| **US-06** | `REQ-FR-10`, `REQ-FR-11` | Thu thập & Liên kết Báo giá | Given Procurement, When uploading Supplier Quotation PDF, Then quotation is linked to PR | `QuotationUploadModal` | `POST /api/purchase-requests/:id/quotations` | `Quotation`, `Supplier` | **Nguyễn Trương Thùy Dương** | `TSK-BA-03` |
| **US-07** | `REQ-FR-12`, `REQ-FR-13`, `REQ-BR-08` | AI So sánh Báo giá & Cảnh báo | Given multiple quotations, When clicking Compare, Then AI renders comparison matrix & anomaly alert | `QuotationCompareMatrix` | `POST /api/ai/compare-quotations` | `Quotation.is_selected`, `AuditLog` | **Nguyễn Trúc Lam** | `TSK-AI-02` |
| **US-08** | `REQ-FR-16`, `REQ-BR-10` | Tạo Purchase Order | Given Approved PR & selected quote, When Procurement creates PO, Then PO status becomes `ISSUED` | `CreatePOForm` | `POST /api/purchase-orders` | `PurchaseOrder` | **Nguyễn Thị Thùy Dung** | `TSK-BE-03` |
| **US-09** | `REQ-FR-17` | Ghi nhận Biên bản Nhận hàng | Given PO issued, When user inputs received quantity, Then Receiving record is created | `ReceivingForm` | `POST /api/purchase-orders/:id/receive` | `Receiving` | **Nguyễn Thị Thùy Dung** | `TSK-BE-04` |
| **US-10** | `REQ-FR-18`, `REQ-BR-11` | Đóng Yêu cầu Mua sắm (Close) | Given Receiving completed, When Procurement closes PR, Then PR state updates to `CLOSED` | `PRDetailActions` | `POST /api/purchase-requests/:id/close` | `PurchaseRequest.status`, `Budget.spent_amount` | **Trần Thị Thu Hà** | `TSK-QA-01` |
| **GOV-01** | `REQ-NFR-02` | Phân quyền RBAC & Guard | Given request to protected route, When JWT token checked, Then deny if role is unauthorized | `ProtectedRoute` | Auth Middleware | `User.role` | **Nguyễn Thị Thùy Dung** | `TSK-BE-05` |
| **GOV-02** | `REQ-NFR-03` | Audit Logging | Given any state transition action, When executed, Then log action, actor_id & timestamp | `AuditTrailWidget` | Audit Logger Middleware | `AuditLog` | **Trần Thị Thu Hà** | `TSK-QA-02` |

---

## 3. End-to-End Requirement Traceability Verification (Trace 1 REQ Sample)

### Sample Trace: `REQ-FR-13` (AI Quotation Comparison Matrix)
- **Requirement:** `REQ-FR-13` - System AI supports analyzing and displaying comparison matrix across multiple vendor quotations.
- **Business Rule:** `REQ-BR-08` - AI provides recommendation only; human Procurement must explicitly select final Supplier.
- **User Story:** `US-07` (Primary Owner: **Nguyễn Trúc Lam - AI Vault**).
- **Acceptance Criteria:** `Given 2 or more uploaded vendor quotations, When Procurement triggers AI Compare, Then AI returns a structured JSON matrix comparing price, warranty, delivery time and highlights price anomalies ≥ 20%.`
- **UI Screen:** `QuotationCompareMatrix.jsx` component in React JS.
- **API Endpoint:** `POST /api/ai/compare-quotations`
- **Data Model:** `Quotation.ai_extracted_json`, `Quotation.is_selected` in SQLite.
- **Task:** `TSK-AI-02` (AI Prompt & Comparison Engine).
- **Test Case:** `TC-AI-002` - Verified Pass.
- **Result:** **100% Traceability (No Orphan Requirements or Orphan Stories).**
