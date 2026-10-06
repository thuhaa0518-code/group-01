# ProcureAI Code Review Process & Pull Request Verification Evidence

> **Hệ thống:** ProcureAI - Internal Procurement & Approval Platform  
> **Quy trình:** Git Feature Branch -> Pull Request -> Code Review Checklist -> Merge  
> **Thành viên phụ trách:** Nguyễn Thị Thùy Dung (Backend) & Trần Thị Thu Hà (QA / Tester)  
> **Đường dẫn file:** `docs/08-quality/code-review.md`  
> **Trạng thái:** Confirmed  

---

## 1. Peer Code Review Checklist Standard

Tất cả Pull Request (PR) bắt buộc phải đạt 100% các tiêu chí kiểm tra trước khi được chấp nhận merge vào nhánh `main`:

- [x] **Bảo mật & RBAC (Security):** Mọi API endpoint đều phải đi qua `authenticateToken` và middleware kiểm tra `authorizeRoles([...])`.
- [x] **Tách biệt vai trò (No Self-Approval Guard):** Có câu lệnh kiểm tra `PR.requester_id !== current_user.id` trong hàm approve.
- [x] **Xử lý lỗi (Error Handling):** Sử dụng `try-catch` đúng chuẩn, không nuốt lỗi, trả về HTTP status code phù hợp (400, 401, 403, 422, 500).
- [x] **Không chứa Secrets (Secret Hygiene):** Không commit hardcode JWT Secret hay Gemini API Key vào source code (`.env.example` được sử dụng).
- [x] **Toàn vẹn CSDL (ACID Transactions):** Các thao tác chuyển trạng thái nhiều bảng (`PR → PO → Budget`) phải nằm trong SQLite transaction (`db.service.js`).
- [x] **Automated Test Coverage:** Có unit/integration test đi kèm phủ cả luồng thành công (Happy path) và luồng thất bại (Failure path) trong `tests/workflow.test.js`.

---

## 2. Pull Request Code Review Evidence Sample

### PR #14: Implement Procurement Workflow State Engine & Finance Budget Guard
- **Branch:** `feature/workflow-state-engine` -> `main`
- **Tác giả:** Nguyễn Thị Thùy Dung (Backend Developer)
- **Reviewer:** Trần Thị Thu Hà (QA / Tester) & Nguyễn Trương Thùy Dương (BA/PO)
- **Liên kết Story/Task/Test:** User Story `US-04`, `US-08` | Task `TSK-BE-02`, `TSK-BE-03` | Automated Test `tests/workflow.test.js`

#### Review Comments & Resolution Log:

1. **[BLOCKER] - Security Violation (Phân quyền Phê duyệt)**
   - **Reviewer (Trần Thị Thu Hà):** `src/server/services/workflow.service.js:L42` thiếu câu lệnh kiểm tra ngăn chặn người tạo tự phê duyệt PR của chính mình (Self-Approval).
   - **Tác giả phản hồi (Nguyễn Thị Thùy Dung):** Đã bổ sung đoạn guard trong `approvePR`:
     ```javascript
     if (pr.requesterId === currentUser.id && currentUser.role !== 'ADMIN') {
       throw new Error('QUY TẮC AN TOÀN (No Self-Approval): Bạn không thể tự phê duyệt Yêu cầu Mua sắm do chính mình tạo ra!');
     }
     ```
   - **Trạng thái:** **RESOLVED & RE-VERIFIED**.

2. **[MAJOR] - Transaction Data Integrity**
   - **Reviewer (Nguyễn Trương Thùy Dương):** Khi chuyển PR sang trạng thái `PO_CREATED`, hàm đang tạo PO trước rồi mới cập nhật status PR. Nếu sập ở giữa sẽ lệch dữ liệu.
   - **Tác giả phản hồi (Nguyễn Thị Thùy Dung):** Đã bổ sung cơ chế rollback và bọc kiểm tra trạng thái nguyên khối trong `workflow.service.js`.
   - **Trạng thái:** **RESOLVED & RE-VERIFIED**.

3. **[MINOR] - Code Formatting & Log Scrubbing**
   - **Reviewer (Trần Thị Thu Hà):** Xóa các dòng `console.log(jwtToken)` trong middleware để tránh lộ token trong server logs.
   - **Tác giả phản hồi:** Đã xóa toàn bộ console.log nhạy cảm trong `auth.js`.
   - **Trạng thái:** **RESOLVED**.

#### Final Decision:
> **APPROVED BY REVIEWERS (2/2 Approved)**  
> PR #14 đã pass 100% integration tests trong `tests/workflow.test.js` và được merge thành công vào `main`.
