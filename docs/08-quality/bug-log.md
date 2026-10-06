# ProcureAI Quality Bug Log & Regression Evidence

> **Hệ thống:** ProcureAI - Internal Procurement & Approval Platform  
> **Thành viên phụ trách:** Trần Thị Thu Hà (QA / Tester) & Nguyễn Thị Thùy Dung (Backend)  
> **Đường dẫn file:** `docs/08-quality/bug-log.md`  
> **Trạng thái:** Confirmed (0 Open Blockers / All Bugs Resolved)  

---

## 1. Severity Standard Definitions

| Level | Severity | Mô tả tác động |
|:---:|:---|:---|
| **P1** | **Blocker** | Nghẽn luồng nghiệp vụ chính, vi phạm quy tắc bảo mật (Self-Approval), làm đứt đoạn 7 bước |
| **P2** | **Critical** | Lỗi tính toán ngân sách, sai số tiền PO hoặc AI sập làm đứt luồng không có fallback |
| **P3** | **Major** | Lỗi định dạng bảng so sánh UI, hiển thị thông báo thiếu rõ ràng |
| **P4** | **Minor** | Lỗi căn chỉnh giao diện, lỗi typo copy văn bản |

---

## 2. Comprehensive Bug Tracking Log

| Bug ID | Severity | Tiêu đề Bug | Steps to Reproduce | Expected Behavior | Actual Behavior | Primary Owner | Status | Regression Test |
|:---|:---:|:---|:---|:---|:---|:---|:---:|:---|
| **BUG-001** | **Blocker (P1)** | Manager có thể tự duyệt PR do chính mình tạo ra | 1. Đăng nhập `manager.it@company.com`<br/>2. Tạo PR mới<br/>3. Bấm Submit và bấm Approve | Hệ thống báo lỗi từ chối `No Self-Approval` | Nút Approve vẫn hoạt động, PR chuyển sang `APPROVED` | **Nguyễn Thị Thùy Dung** | **CLOSED** | `TC-SEC-001` in `tests/workflow.test.js` |
| **BUG-002** | **Critical (P2)** | Sập trang khi Gemini API bị Rate Limit (`429`) | 1. Tải lên 3 báo giá PDF<br/>2. Bấm AI So sánh khi ngắt kết nối API Key | AI Fallback tự chuyển sang offline parser và phục vụ mock recommendation | Màn hình hiển thị Unhandled Promise Rejection trắng xóa | **Nguyễn Trúc Lam** | **CLOSED** | `TC-AI-007` in `tests/workflow.test.js` |
| **BUG-003** | **Major (P3)** | Trạng thái PR bị nghẽn khi tạo PO thành công | 1. Approve PR<br/>2. Chọn báo giá và bấm Tạo PO<br/>3. Xem lại trang PR List | PR chuyển sang `PO_CREATED` | PR vẫn ở trạng thái `QUOTATION_COLLECTED` | **Trần Thị Kiều Giang** | **CLOSED** | `TC-WF-004` in `tests/workflow.test.js` |
| **BUG-004** | **Minor (P4)** | ReferenceError: fs is not defined khi chạy server | 1. Mở server Express trên Localhost<br/>2. Gửi request phục vụ static file | Phục vụ file `index.html` của React JS | Server báo lỗi `ReferenceError: fs is not defined` | **Nguyễn Thị Thùy Dung** | **CLOSED** | Added `import fs from 'fs'` |

---

## 3. Detailed Bug Fix Evidence Sample (BUG-001 Verification)

### Bug Detailed Investigation: `BUG-001` (No Self-Approval Bypass)
- **Căn nguyên (Root Cause):** Trong `src/server/services/workflow.service.js`, hàm `approvePR` chỉ kiểm tra `currentUser.role === 'MANAGER'` mà không so sánh `pr.requesterId` với `currentUser.id`.
- **Giải pháp (Fix Verification):** Bổ sung đoạn mã Guard kiểm soát chặt chẽ ở tầng Server Domain Engine:
  ```javascript
  if (pr.requesterId === currentUser.id && currentUser.role !== 'ADMIN') {
    throw new Error('QUY TẮC AN TOÀN (No Self-Approval): Bạn không thể tự phê duyệt Yêu cầu Mua sắm do chính mình tạo ra!');
  }
  ```
- **Bằng chứng Kiểm thử Lại (Regression Automated Test Evidence):**
  ```bash
  ✔ 3. Strict No Self-Approval Security Rule Guard Test (5.4915ms)
  Pass: Correctly caught security exception when Manager attempted self approval.
  ```
- **Kết luận Sign-off:** **BUG-001 VERIFIED FIXED & CLOSED**.
