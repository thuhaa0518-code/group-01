# Báo cáo Đánh giá Mức độ Sẵn sàng Kiểm thử (Test Readiness Audit)
> **Mã báo cáo:** QA-01  
> **Dự án:** ProcureAI — Internal Procurement & Approval Platform  
> **Thời điểm thực hiện:** 2026-10-09T20:46:00+07:00  
> **Người thực hiện:** Senior QA Engineer & Test Automation Engineer  
> **Tài liệu tham chiếu:** Requirements, Business Rules, User Stories, Traceability Matrix, Architecture ADRs, Git Repository  

---

## 1. Kiến trúc và Công nghệ Thực tế (Actual Technology Stack & Architecture)

Qua quá trình rà soát trực tiếp mã nguồn và môi trường thực thi trong repository, kiến trúc thực tế của hệ thống được xác định như sau:

| Thành phần | Công nghệ thực tế trong Code | Trạng thái ghi nhận trong Docs cũ | Nhận xét đối chiếu |
|:---|:---|:---|:---|
| **Frontend** | React 18.3.1, Vite 5.2, TypeScript 5.5, TailwindCSS 3.4, Framer Motion (thư mục `FE/`) | React JS Single-Page App | Trùng khớp về UI Framework, đặt tại thư mục con `FE/`. |
| **Backend** | Python 3.13.2, Django 5.x (`procurement` app, `config/`, `manage.py`) | Node.js + Express JS (`src/server`) | **MÂU THUẪN NGHIÊM TRỌNG:** Docs ghi Express + Prisma (`src/server`), nhưng thư mục `src/` rỗng; backend thực tế hoàn toàn là Django. |
| **Database** | SQLite3 (`db.sqlite3` thông qua Django ORM) | SQLite qua Prisma ORM (`prisma/dev.db`) | Khác biệt về tầng ORM truy cập dữ liệu (Django ORM vs Prisma). |
| **API Architecture**| Django Views & REST endpoints (`/api/v1/state/`, `/api/v1/sync/`) | Express REST API (`/api/purchase-requests`, v.v.) | Router và payload thực tế chạy qua view đồng bộ của Django. |
| **Package Manager**| `pip` (Python dependencies) & `npm` / `npm.cmd` (Frontend trong `FE/`) | `npm` ở root | Thư mục root không có `package.json`, các script npm chỉ nằm trong `FE/`. |
| **CI/CD Pipeline** | **Chưa có** (Không tồn tại thư mục `.github/` hay CI configuration) | Chưa cấu hình | Chưa có automated check khi push/pull request. |

### Cảnh báo mâu thuẫn kiến trúc (Architecture Divergence):
- Tài liệu kiến trúc cũ tại `docs/05-technical/architecture.md`, `data-model.md` và `API.md` mô tả hệ thống dùng Node.js/Express với Prisma.
- Thư mục gốc `tests/` chứa hai file kiểm thử:
  - `tests/workflow.test.js`: Dùng `node:test`, import `../src/server/services/db.service.js` (không tồn tại) $\rightarrow$ **Crash khi chạy**. File này đã được chú thích là `[OBSOLETE / MIGRATED]` sang Django.
  - `tests/permissions.test.ts`: Dùng `vitest`, import `../src/client/src/auth/permissions` (không tồn tại) $\rightarrow$ **Fail khi chạy**.
- **Backend chính thức đang vận hành và có test chạy được là Django** (`python manage.py test`).

---

## 2. Danh mục Requirements, User Stories & Acceptance Criteria

### 2.1 Yêu cầu Chức năng (Functional Requirements - FR)
Hệ thống xác định 18 Functional Requirements thuộc 7 nhóm nghiệp vụ chính (`docs/01-discovery/5.requirements.md`):
- **REQ-FR-01 (Must):** Employee tạo và quản lý Purchase Request (PR).
- **REQ-FR-02 (Must):** Kiểm tra các trường bắt buộc của PR trước khi Submit.
- **REQ-FR-03 (Should):** AI hỗ trợ chuẩn hóa PR và gợi ý thông tin trước khi Submit.
- **REQ-FR-04 (Must):** Employee theo dõi trạng thái PR trong quy trình.
- **REQ-FR-05 (Must):** Manager xem thông tin PR và ngân sách trước khi duyệt.
- **REQ-FR-06 (Must):** Manager có thể Approve, Reject, yêu cầu sửa đổi hoặc chuyển Finance.
- **REQ-FR-07 (Must):** Hệ thống hỗ trợ Approval Workflow.
- **REQ-FR-08 (Must):** Finance kiểm tra PR với Budget trước khi duyệt.
- **REQ-FR-09 (Must):** Cảnh báo khi PR vượt Budget cho phép.
- **REQ-FR-10 (Must):** Procurement quản lý Supplier và thu thập nhiều Quotation.
- **REQ-FR-11 (Should):** Chuẩn hóa thông tin Quotation để đối chiếu.
- **REQ-FR-12 (Must):** So sánh Quotation giữa nhiều Supplier.
- **REQ-FR-13 (Must):** AI hỗ trợ phân tích và hiển thị ma trận so sánh Quotation.
- **REQ-FR-14 (Should):** AI đưa ra Recommendation dựa trên tiêu chí Quotation.
- **REQ-FR-15 (Should):** AI cảnh báo giá bất thường khi chênh lệch $\ge 20\%$ so với lịch sử.
- **REQ-FR-16 (Must):** Tạo Purchase Order (PO) sau khi PR duyệt và chọn Supplier.
- **REQ-FR-17 (Must):** Ghi nhận biên bản Receiving đối với hàng hóa/dịch vụ.
- **REQ-FR-18 (Must):** Close PR sau khi hoàn tất các bước mua sắm và nhận hàng.

### 2.2 Yêu cầu Phi chức năng (Non-Functional Requirements - NFR) & Business Rules
- **REQ-NFR-01 (Must):** Tính nhất quán dữ liệu xuyên suốt quy trình mua sắm.
- **REQ-NFR-02 (Must):** Phân quyền 5 vai trò (Employee, Manager, Procurement, Finance, Admin) và **Quy tắc tuyệt đối No Self-Approval** (người tạo PR không được tự duyệt PR của mình).
- **REQ-NFR-03 (Must):** Audit Trail ghi nhận toàn bộ thao tác, quyết định và thay đổi trạng thái.
- **11 Business Rules (REQ-BR-01 đến REQ-BR-11):** Ràng buộc tuần tự của quy trình (Duyệt $\rightarrow$ Báo giá $\rightarrow$ Chọn NCC $\rightarrow$ Tạo PO $\rightarrow$ Nhận hàng $\rightarrow$ Close; Human-in-the-loop không cho AI tự duyệt/tự chọn NCC).

### 2.3 User Stories & Ma trận Sở hữu
Hệ thống có 10 User Stories chính (`US-01` đến `US-10`) và 2 Governance Stories (`GOV-01`, `GOV-02`):
- **Trần Thị Kiều Giang (Frontend):** `US-01` (Tạo & Quản lý PR Form).
- **Nguyễn Trúc Lam (AI Vault):** `US-03` (AI Standardizer), `US-07` (AI So sánh & Cảnh báo $\ge 20\%$).
- **Nguyễn Trương Thùy Dương (BA/PO):** `US-04` (Manager Review & Phê duyệt), `US-05` (Finance Budget Check), `US-06` (Quản lý Quotation).
- **Nguyễn Thị Thùy Dung (Backend):** `US-02` (Timeline trạng thái PR), `US-08` (Tạo PO), `US-09` (Receiving), `GOV-01` (RBAC & Guard).
- **Trần Thị Thu Hà (QA/Tester):** `US-10` (Close PR), `GOV-02` (Audit Trail).

---

## 3. Danh mục Test Hiện có và Trạng thái Evidence

| Bộ Test | Vị trí file | Framework / Lệnh chạy | Kết quả thực tế | Trạng thái Evidence |
|:---|:---|:---|:---:|:---|
| **Django Model & Service Tests** | `procurement/tests.py` | `python manage.py test procurement.tests` | **7/7 PASS** | Đã thực thi thật, database in-memory, thời gian chạy ~0.04s. |
| **Django Workflow Integration Tests** | `procurement/tests_workflow.py` | `python manage.py test procurement.tests_workflow` | **9/9 PASS** | Đã thực thi thật, bao phủ 7 bước PR, No Self-Approval rule, AI alert và REST API contract. |
| **Node.js Legacy Workflow Test** | `tests/workflow.test.js` | `node --test tests/workflow.test.js` | **CRASH / FAIL** (Exit code 1) | Thiếu module `src/server/services/db.service.js`. Đã gắn nhãn obsolete. |
| **Frontend Security Permissions Test** | `tests/permissions.test.ts` | `npx vitest run tests/permissions.test.ts` | **FAIL / BLOCKED** (Exit code 1) | Thiếu module `src/client/src/auth/permissions`; Vitest chưa nằm trong `FE/package.json`. |
| **Frontend Code Quality (ESLint)** | `FE/` | `npm.cmd --prefix FE run lint` | **FAIL** (Exit code 1) | 17 vấn đề (2 errors: `no-cond-assign`, empty arrow function; 15 warnings). |
| **Frontend Type Checking** | `FE/` | `npx tsc --project FE/tsconfig.json --noEmit` | **FAIL** (Exit code 1) | Nhiều lỗi TS6133 (unused variables) và TS2749 (`BoxIcon` type error). |
| **Frontend Production Build** | `FE/` | `npm.cmd --prefix FE run build` | **PASS** (Exit code 0) | Bundle thành công tại `FE/dist/` (HTML: 0.48 kB, CSS: 29.4 kB, JS: 584.4 kB). |
| **Django System & Migration Checks** | Root | `python manage.py check`<br/>`python manage.py makemigrations --check --dry-run` | **PASS** (Exit code 0) | Hệ thống Django toàn vẹn, 0 lỗi cấu hình, schema đồng bộ 100%. |

---

## 4. Đánh giá Mức độ Sẵn sàng Kiểm thử (Test Readiness Assessment)

### 4.1 Những điểm ĐÃ SẴN SÀNG
1. **Bộ test Backend Django:** Cả 16 test cases trong `procurement/tests.py` và `procurement/tests_workflow.py` đều thực thi trơn tru, không phụ thuộc tài nguyên bên ngoài, tự khởi tạo và dọn dẹp in-memory SQLite database.
2. **Kiến trúc dữ liệu Backend:** Django models, relationships, field constraints và các service function cơ bản (`run_ai_standardizer`, `evaluate_anomaly`) đã hoạt động ổn định.
3. **Frontend Production Build:** Vite build thành công không lỗi, ứng dụng React có thể đóng gói và triển khai.
4. **Hợp đồng API cơ bản:** Endpoint `/api/v1/state/` và `/api/v1/sync/` trả về HTTP 200 và đồng bộ state đầy đủ giữa Client và Server.

### 4.2 Những điểm CHƯA SẴN SÀNG
1. **Thiếu hạ tầng Frontend Automated Testing:** Thư mục `FE/` hoàn toàn chưa có cấu hình test framework (không có Vitest, Jest hay React Testing Library). Chưa có bất kỳ unit/integration test nào cho UI components.
2. **Chất lượng mã nguồn Frontend chưa đạt:** Lệnh `npm run lint` và `tsc --noEmit` đều đang báo lỗi cú pháp và linter (cần khắc phục trước khi triển khai test tự động frontend).
3. **Mã kiểm thử mồ côi (Orphan / Legacy Tests):** Hai file `tests/workflow.test.js` và `tests/permissions.test.ts` ở thư mục gốc không thể chạy được do tham chiếu tới code scaffolding cũ (`src/server`, `src/client`).
4. **Lỗ hổng bảo mật tại Backend Endpoint (No Self-Approval Server Bypass):** Quy tắc No Self-Approval hiện chỉ được kiểm tra ở Frontend. Endpoint `/api/v1/sync/` của Django nhận trạng thái từ client mà chưa có logic xác thực server-side để từ chối khi requester trùng với approver.
5. **Chưa có CI/CD Pipeline:** Chưa có cơ chế chạy test tự động khi commit mã nguồn.

---

## 5. Các Rủi ro Nghiêm trọng (Critical Risks)

1. **Rủi ro phân mảnh kiến trúc giữa Tài liệu và Code (High Risk):**
   - Tài liệu tại `docs/05-technical/` mô tả Express/Prisma, trong khi code thực tế là Django. Nếu thành viên mới hoặc auditor đọc tài liệu kỹ thuật sẽ hiểu sai toàn bộ kiến trúc sản phẩm.
2. **Rủi ro vượt rào phân quyền ở tầng API (Security Bypass - Critical Risk):**
   - Một người dùng có thể gửi trực tiếp payload POST lên `/api/v1/sync/` để tự phê duyệt PR của chính mình mà không bị backend chặn, vi phạm trực tiếp yêu cầu cốt lõi `REQ-NFR-02` (No Self-Approval).
3. **Rủi ro sai lệch tài liệu kiểm thử (Documentation Inconsistency Risk):**
   - File `docs/06-testing/test-cases.md` hiện tại ghi nhận 21 test cases PASS dựa trên `tests/workflow.test.js`, trong khi thực tế file này đang crash và 16 tests thực sự chạy được là nằm ở Django `procurement/tests_workflow.py`.
4. **Rủi ro hồi quy (Regression Risk) do thiếu Frontend Tests:**
   - Khi chỉnh sửa logic UI form PR hoặc luồng duyệt trong React, không có test tự động nào cảnh báo lỗi hồi quy trước khi build.

---

## 6. Những câu hỏi cần làm rõ trước khi viết test tiếp theo (Clarification Questions)

1. **Định hướng xử lý Legacy Test Suite ở thư mục gốc:**
   - Nhóm có thống nhất lưu trữ hoặc gỡ bỏ hai file lỗi `tests/workflow.test.js` và `tests/permissions.test.ts` để tránh nhầm lẫn cho CI và các lượt test sau hay không?
2. **Phạm vi kiểm thử Frontend:**
   - Trong các bước tiếp theo, nhóm có muốn thiết lập Vitest/React Testing Library cho `FE/` để kiểm thử component UI và guard rules ở frontend, hay tập trung toàn bộ automated test vào Django Backend?
3. **Khắc phục Server-Side Enforcement cho No Self-Approval:**
   - Có cần bổ sung logic kiểm tra quyền (Server-Side Guard) trực tiếp trong view `procurement/views.py` (`api_sync_view`) để chặn request tự duyệt PR từ requester ở tầng API không?
4. **Đồng bộ hóa tài liệu kỹ thuật:**
   - Có cần cập nhật lại `docs/05-technical/architecture.md`, `data-model.md` và `API.md` để phản ánh đúng stack Django hiện tại hay không?

---
> **Kết luận QA-01:** Quá trình audit hoàn tất. Trạng thái hệ thống đã được phân loại minh bạch giữa phần sẵn sàng (Django backend test suite 16/16 PASS, build frontend PASS) và phần chưa sẵn sàng (Lỗi lint/tsc frontend, legacy tests gãy, thiếu server-side guard). Báo cáo đang chờ phê duyệt trước khi chuyển sang các bước kiểm thử tiếp theo.
