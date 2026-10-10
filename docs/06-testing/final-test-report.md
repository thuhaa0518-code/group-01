# Báo Cáo Kiểm Thử Cuối Cùng (Final Test Report) — ProcureAI

> **Hệ thống:** ProcureAI — Internal Procurement & Approval Platform<br/>
> **Mã tài liệu:** QA-11-FTR (Hiệu chỉnh theo thẩm định độc lập QA-12A)<br/>
> **Phiên bản:** v1.3.0<br/>
> **Thời điểm lập báo cáo:** 2026-10-10T01:15:00+07:00<br/>
> **Người thực hiện:** Senior QA Lead (Trần Thị Thu Hà)<br/>
> **Phân loại Kết luận Độc lập theo 3 Mục tiêu:**
> - **1. Chạy Demo Cục bộ (Local Demo):**
>   - **Tầng Dịch vụ & API Backend:** **`LOCAL SERVICE SMOKE PASS`** (Xác minh tại RUN-20261010-004600 & RUN-20261010-011000)
>   - **Tầng Trình diễn Giao diện (UI Interaction):** **`LOCAL DEMO NOT VERIFIED`** (Chưa có tương tác trình duyệt thực tế; asset script chính bị 404)
> - **2. Triển khai Staging / UAT:** **`NOT VERIFIED`** (Chưa có môi trường và cấu hình Staging)
> - **3. Phát hành Production:** **`BLOCKED / NOT READY`** (Chặn do lỗi Lint, Typecheck và thiếu cấu hình Prod)

---

## 1. Mục Tiêu & Phạm Vi Báo Cáo

Báo cáo này đóng vai trò là tài liệu chốt kiểm thử độc lập cuối cùng của chu trình QA (từ QA-01 đến QA-12A), đối chiếu chéo toàn diện giữa:
- Nhật ký thực thi bằng chứng kiểm thử tại [`docs/06-testing/evidence/RUN-20261010-000500/`](evidence/RUN-20261010-000500/), [`RUN-20261010-004600/`](evidence/RUN-20261010-004600/), và đợt thẩm định [`RUN-20261010-011000/`](evidence/RUN-20261010-011000/).
- Sổ theo dõi khiếm khuyết [`docs/06-testing/04-defects/BUG_TRACKER.md`](04-defects/BUG_TRACKER.md).
- Báo cáo phân loại lỗi [`docs/06-testing/04-defects/bug-triage-report.md`](04-defects/bug-triage-report.md).
- Ma trận truy vết yêu cầu [`docs/06-testing/01-plans/requirement-traceability-matrix.md`](01-plans/requirement-traceability-matrix.md).
- Mã nguồn kiểm thử và mã nguồn sản phẩm thực tế của dự án.

---

## 2. Bảng Xác Minh Bằng Chứng Thực Tế (Execution Evidence Verification)

Dữ liệu dưới đây được đối chiếu nghiêm ngặt 1:1 với nhật ký gốc [`RUN-20261010-000500/execution-log.txt`](evidence/RUN-20261010-000500/execution-log.txt), không suy diễn:

| Lệnh thực thi (Command) | Phạm vi kiểm tra | Exit Code | Số Test / Số Lỗi | Thời gian thực thi | Run ID | Đánh giá Suite |
| :--- | :--- | :---: | :--- | :---: | :---: | :---: |
| `python manage.py test procurement.test_gov01_gov02.Gov01Gov02AutomatedTests.test_tc_gov01_002_prevent_bypass_and_verify_bug_sec_01 -v 2` | Retest đích danh `BUG-0001` (BUG-SEC-01) | **0** | **1 test (1 PASS, 0 FAIL, 0 ERROR)** | 0.038s | `RUN-20261010-000500` | **PASS** |
| `python manage.py test -v 2` | Toàn bộ 12 User Stories & Governance Backend | **0** | **53 tests (53 PASS, 0 FAIL, 0 ERROR)** | 0.301s | `RUN-20261010-000500` | **PASS** |
| `npm.cmd --prefix FE run lint` | ESLint kiểm tra cú pháp mã nguồn React Frontend | **1** | **17 problems (2 errors, 15 warnings)** | ~3s | `RUN-20261010-000500` | **FAIL** |
| `npx.cmd --prefix FE tsc --project FE/tsconfig.json --noEmit` | TypeScript compiler typecheck `FE/src/` | **1** | **69 errors (66 TS6133, 3 TS2749)** | ~4s | `RUN-20261010-000500` | **FAIL** |
| `npm.cmd --prefix FE run build` | Vite production build tạo bundle SPA | **0** | **2,380 modules transformed (Tạo dist/ thành công)** | 34.83s | `RUN-20261010-000500` | **BUILD PASS** |

---

## 3. Ranh Giới Kiểm Thử Bảo Mật & Đánh Giá `BUG-0001` (BUG-SEC-01)

### 3.1. Những Gì Đã Xác Minh & Đạt Chuẩn (Verified Scope)
- **Quy tắc No Self-Approval Guard tại Endpoint `/api/v1/sync/`:**
  - Đã bổ sung logic kiểm tra danh tính Actor tại [`procurement/views.py`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/views.py#L25-L90).
  - Test method `test_tc_gov01_002_prevent_bypass_and_verify_bug_sec_01` trong [`procurement/test_gov01_gov02.py`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/test_gov01_gov02.py#L196-L260) đã xác minh 4 kịch bản cụ thể:
    1. *Session Bypass:* Requester đăng nhập session gửi POST duyệt PR $\rightarrow$ Server trả về `HTTP 403 Forbidden`, DB giữ nguyên `pending_manager` (**PASS**).
    2. *Payload Actor Bypass:* Gửi `actorId` trùng `requester.id` $\rightarrow$ Server trả về `HTTP 403 Forbidden`, DB không đổi (**PASS**).
    3. *Anonymous Bypass:* Gửi yêu cầu ẩn danh thiếu Actor $\rightarrow$ Server trả về `HTTP 403 Forbidden` (`APPROVAL_ACTOR_REQUIRED`) (**PASS**).
    4. *Legitimate Approver:* Admin hoặc Manager hợp lệ khác duyệt $\rightarrow$ Server trả về `HTTP 200 OK`, PR chuyển sang `approved` (**PASS**).
- **Quy tắc No Self-Approval tại Domain Logic:**
  - Hàm nghiệp vụ `check_approval_permission` chặn Manager tự duyệt PR tại tầng domain ([`TC-GOV01-001`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/test_gov01_gov02.py#L106)) (**PASS**).
- **Trạng thái Defect:** Giữ nguyên mức **`VERIFIED`**, chưa chuyển sang `CLOSED` cho đến khi có sign-off chính thức từ Backend Lead (Nguyễn Thị Thùy Dung) hoặc Tech Lead.

### 3.2. Những Ranh Giới & Phạm Vi Chưa Kiểm Chứng (Unverified Security Scope)
> [!WARNING]
> - Kết quả kiểm thử trên **chỉ xác minh riêng rẽ quy tắc No Self-Approval đối với thao tác duyệt Purchase Request (PR approval)** tại endpoint `/api/v1/sync/`.
> - **KHÔNG ĐƯỢC SUY DIỄN** rằng toàn bộ hệ thống phân quyền 5 vai trò (RBAC) đã an toàn trên mọi endpoint.
> - Cụ thể, các hạng mục sau **CHƯA ĐƯỢC KIỂM CHỨNG TỰ ĐỘNG Ở TẦNG REST API**:
>   - Phân quyền theo vai trò (Employee, Manager, Procurement, Finance, Admin) trên các hành động khác (tạo PO, nghiệm thu Receiving, đối soát hóa đơn, quản lý nhà cung cấp).
>   - Cơ chế xác thực Token / Session Authentication trên toàn bộ các route REST API khác nếu có người truy cập trái phép.
>   - Khả năng chống tấn công giả mạo CSRF hoặc Brute-force trên giao diện đăng nhập web.

---

## 4. Ranh Giới Giao Diện Người Dùng: Phân Biệt "Build Thành Công" và "Chức Năng Giao Diện"

> [!IMPORTANT]
> - Lệnh `npm run build` đạt kết quả **BUILD PASS** chỉ chứng minh rằng bundler Vite biên dịch và đóng gói thành công các module JSX/TSX thành static assets (HTML/CSS/JS bundle) mà không gặp lỗi cú pháp phân giải gói.
> - **CHƯA CÓ BẰNG CHỨNG KIỂM THỬ GIAO DIỆN TỰ ĐỘNG (NO AUTOMATED UI / E2E TEST EVIDENCE):**
>   - Dự án chưa cấu hình và chưa chạy bất kỳ framework E2E nào (như Playwright, Cypress, Selenium).
>   - Không có bằng chứng khẳng định toàn bộ giao diện và luồng tương tác trên trình duyệt chạy trơn tru không lỗi runtime.
>   - Do đó, mức độ sẵn sàng của UI trên môi trường trình duyệt thực tế được đánh giá là **`NOT VERIFIED BY AUTOMATION`** và bắt buộc phải kiểm thử thủ công (Manual Exploration / UAT).

---

## 5. Ranh Giới Cơ Sở Dữ Liệu & Migrations

- **Những gì thực sự được kiểm tra:**
  - Lệnh `makemigrations --check --dry-run` xác nhận không có migration nào bị thiếu giữa Django models và các file migration hiện có.
  - Lệnh `python manage.py test` thực thi trên cơ sở dữ liệu in-memory SQLite (`file:memorydb_default?mode=memory&cache=shared`) chứng minh tính cô lập của bộ test và tính hợp lệ của schema SQLite cục bộ.
- **Những gì chưa được kiểm chứng:**
  - Môi trường in-memory SQLite **không tự chứng minh tính tương thích hoàn toàn** với hệ quản trị cơ sở dữ liệu Production (như PostgreSQL hoặc MySQL).
  - Chưa kiểm chứng các cơ chế nâng cao trên production DB: Transaction Isolation levels, Concurrency locks, Index performance trên tập dữ liệu lớn.

---

## 6. Tình Trạng Các Khiếm Khuyết Còn Mở (`BUG-0002` Đến `BUG-0005`)

| Bug ID | Tóm tắt lỗi | Loại lỗi | Severity / Priority | Trạng thái | Ảnh hưởng hệ thống | Điều kiện tiên quyết để Đóng |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| **`BUG-0002`** | Gán regex trong điều kiện `while` tại `aiStandardizer.ts:72` | UI / Lint | **Medium** / **P2** | **TRIAGED** | Làm fail lệnh CI/CD lint check; Vite vẫn build được | Bọc biểu thức bằng cặp ngoặc tròn chuẩn theo rule `no-cond-assign` |
| **`BUG-0003`** | Arrow function rỗng tại `ProcurementContext.tsx:76` | UI / Lint | **Low** / **P3** | **TRIAGED** | Lỗi linter `@typescript-eslint/no-empty-function` | Thêm lệnh no-op hoặc ghi chú rõ ràng vào hàm |
| **`BUG-0004`** | 69 lỗi TypeScript compiler trong thư mục `FE/src/` | UI / Types | **Medium** / **P2** | **TRIAGED** | Làm fail `tsc --noEmit`; Vite production build vẫn thành công | Tinh chỉnh kiểu `BoxIcon` và xử lý các biến `React` import thừa |
| **`BUG-0005`** | 2 file test Node cũ trong `tests/` import module không tồn tại | Test Infra | **Low** / **P4** | **TRIAGED** | Gây lỗi nếu chạy `node --test`; không ảnh hưởng Django suite | Di chuyển vào thư mục lưu trữ `tests/archive/` hoặc xóa bỏ |

---

## 7. Kết Luận Phát Hành Theo Từng Mục Tiêu Độc Lập

### 1. Mục tiêu Local Demo (Chạy thử nghiệm máy cục bộ)
- **Tầng Dịch Vụ & API Backend:** 👉 **`LOCAL SERVICE SMOKE PASS`**
  - *Căn cứ thực tế (QA-12 & QA-12A):* Django server khởi chạy thành công; `GET /api/v1/state/` phản hồi HTTP 200 đầy đủ dữ liệu; `POST /api/v1/sync/` chặn đứng No Self-Approval với HTTP 403 Forbidden (`SELF_APPROVAL_FORBIDDEN`); mount element `<div id="root"></div>` tồn tại trong HTML root.
- **Tầng Giao Diện Người Dùng & Trình Diễn Toàn Trình:** 👉 **`LOCAL DEMO NOT VERIFIED`**
  - *Căn cứ thực tế (QA-12A / RUN-20261010-011000):*
    - Chưa có bằng chứng thao tác trình duyệt thực tế do Playwright bị chặn driver; các kịch bản `MC-01` đến `MC-06` được hiệu chỉnh chính xác thành `NOT RUN` / `NOT VERIFIED`.
    - Tệp `FE/dist/index.html` hiện tại tham chiếu script `/assets/index-eMT3_iPN.js` bị trả về **HTTP 404 Not Found** (thiếu file bundle JS sau đợt merge), có nguy cơ gây lỗi trắng trang nếu mở trên trình duyệt thật. Cần chạy lại `npm run build` trước khi demo.

### 2. Mục tiêu Staging / UAT Deployment
👉 **`NOT VERIFIED`**
- *Căn cứ:* Chưa có hạ tầng server Staging, chưa có file cấu hình môi trường staging, chưa thực hiện smoke test hay deploy thử nghiệm lên server từ xa. Mới chỉ kiểm thử trên máy cục bộ.

### 3. Mục tiêu Production Release
👉 **`BLOCKED / NOT READY`**
- *Căn cứ:* Chặn phát hành chính thức do:
  1. Pipeline kiểm tra chất lượng mã nguồn Frontend thất bại (ESLint Exit 1, TypeScript Exit 1).
  2. Chưa cấu hình môi trường bảo mật production (`DEBUG=False`, `SECRET_KEY` bí mật, HTTPS/HSTS, production DB).
  3. Cần Backend Lead xác nhận đóng `BUG-0001` trước khi release.
