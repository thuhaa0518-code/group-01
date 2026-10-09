# AI-QA-02 — Test Infrastructure Triage & Remediation Plan

- **Run ID tham chiếu:** `run-20261009-144500`
- **Thời điểm lập kế hoạch:** 2026-10-09T14:57:00+07:00
- **Vai trò:** Senior QA Engineer, Test Automation Engineer & Independent Software Reviewer
- **Mục tiêu:** Thiết lập lộ trình kỹ thuật chi tiết để đưa hạ tầng kiểm thử về trạng thái đáng tin cậy, thực thi lặp lại được (reproducible) và truy vết 100% đến yêu cầu nghiệp vụ thực tế.
- **Nguyên tắc giai đoạn:** **Chỉ phân tích và lập kế hoạch — Chưa thực hiện sửa đổi mã nguồn, test, cấu hình hoặc cơ sở dữ liệu.**

---

## 1. Bảng phân loại tất cả Defect (Defect Inventory & Classification)

| Defect ID | Hạng mục | Mức độ ưu tiên | Trạng thái hiện tại | Nguyên nhân gốc rễ đã xác minh | Ảnh hưởng đến dự án |
|:---|:---|:---:|:---:|:---|:---|
| **DEFECT-01** | Integration Test Suite | **Blocker (P1)** | ERROR (Crash on import) | `tests/workflow.test.js` import `../src/server/services/db.service.js`. Thư mục `src/` trên repo rỗng do backend thực tế viết bằng Django (`procurement/`). | Toàn bộ 6 test case workflow và AI anomaly không thể chạy tự động. |
| **DEFECT-02** | Django Backend Unit Tests | **Blocker (P1)** | ERROR (Crash on import) | `procurement/tests.py` import `Department` và `PRItem`, nhưng `procurement/models.py` dùng chuỗi `department` và model `PRLineItem`. | `python manage.py test` thất bại 100%, không đo được test backend. |
| **DEFECT-03** | RBAC / Permission Test Suite | **Major (P2)** | BLOCKED | `tests/permissions.test.ts` import từ `../src/client/src/auth/permissions` và cần `vitest`, trong khi logic thực tế nằm ở `FE/src/utils/rules.ts` & `permissions.ts`. | Quy tắc No Self-Approval và RBAC không có test suite tự động kiểm chứng. |
| **DEFECT-04** | Frontend Static Code Health (ESLint / TSC) | **Major (P2)** | FAIL (2 Lint errors, 69 TS errors) | - `FE/src/utils/aiStandardizer.ts:72`: gán trong vòng lặp (`no-cond-assign`).<br/>- `FE/src/contexts/ProcurementContext.tsx:76`: empty arrow function.<br/>- 69 lỗi TypeScript do dùng `BoxIcon` làm type và unused variables. | Mã nguồn FE không vượt qua gate CI/Lint; tiềm ẩn bug runtime parsing. |
| **DEFECT-05** | Security Dependency Audit | **Critical (P1 Security)** | FAIL (47 Vulnerabilities) | `FE/package-lock.json` kéo các gói phụ thuộc cũ (`tar` critical, `minimatch`, `js-yaml`, `esbuild`, `react-router`). | Tiềm ẩn rủi ro DoS / Path Traversal khi triển khai production. |
| **DEFECT-06** | Documentation Integrity Discrepancy | **Major (P2 Quality)** | MISLEADING | Tài liệu `docs/06-testing/test-cases.md` và `README.md` tuyên bố "21/21 Test Cases PASS - 100% Pass" nhưng thực tế output chưa từng chạy pass trên repo này. | Sai lệch tính toàn vẹn thông tin nghiệm thu chất lượng dự án. |

---

## 2. Danh sách file dự kiến thay đổi (Impacted Files Inventory)

| STT | Đường dẫn file | Nhóm thay đổi | Mục đích can thiệp dự kiến |
|:---:|:---|:---|:---|
| 1 | `procurement/tests.py` | Backend Tests | Cập nhật import `PRLineItem`, User, Budget; sửa các trường `pr_number` ➔ `id`, `total_estimated_amount` ➔ `total_amount` để test chạy thành công trên Django runner. |
| 2 | `tests/workflow.test.js` | Integration Tests | *Phương án A:* Chuyển đổi test thành HTTP API Integration Test gọi trực tiếp Django backend (`/api/v1/state/`, `/api/v1/sync/`).<br/>*Phương án B:* Viết lại toàn bộ sang `procurement/tests_integration.py` dùng Django test client. |
| 3 | `tests/permissions.test.ts` | Frontend Security Tests | Cập nhật import trỏ về `FE/src/utils/rules.ts` và `FE/src/utils/permissions.ts` (test hàm `managerGuard`, `can`, `canViewRequest`). Cấu hình script chạy qua Node test runner hoặc Vitest. |
| 4 | `FE/src/utils/aiStandardizer.ts` | Frontend Logic | Sửa dòng 72 thành `while ((m = re.exec(text)))` để thỏa mãn rule `no-cond-assign`. |
| 5 | `FE/src/contexts/ProcurementContext.tsx` | Frontend State | Bổ sung comment hoặc handler lỗi cho catch block tại dòng 76 để xử lý `@typescript-eslint/no-empty-function`. |
| 6 | `FE/src/components/requests/TraceabilityChain.tsx` | Frontend UI / Types | Sửa kiểu type `BoxIcon` thành `typeof BoxIcon` hoặc `LucideIcon` từ `lucide-react`. |
| 7 | `FE/src/components/ui/EmptyState.tsx` | Frontend UI / Types | Sửa kiểu type `BoxIcon` thành `typeof BoxIcon` hoặc `LucideIcon`. |
| 8 | `FE/src/components/ui/StatusBadge.tsx` | Frontend UI / Types | Sửa kiểu type `BoxIcon` thành `typeof BoxIcon` hoặc `LucideIcon`. |
| 9 | `docs/06-testing/test-cases.md` | QA Documentation | Cập nhật lại kết quả test thực thi sau khi các test suite được sửa, ghi nhận đúng log thực tế thay vì output giả định. |
| 10 | `docs/06-testing/README.md` | QA Documentation | Đồng bộ lại số lượng test cases và tình trạng kiểm thử thực tế. |

---

## 3. Thứ tự khắc phục và lý do (Remediation Sequence & Rationale)

Kế hoạch được chia thành 4 giai đoạn logic theo nguyên tắc từ nền tảng mã nguồn đến bộ kiểm thử:

### Giai đoạn 1: Chuẩn hóa Static Code Health (Lint & Typecheck FE)
- **Lý do:** Đây là các lỗi xác định rõ ràng, không phụ thuộc vào quyết định kiến trúc lớn, giúp mã nguồn Frontend ổn định trước khi viết test cho UI/logic.
- **Thực hiện:** Sửa `no-cond-assign`, empty function, và các định nghĩa kiểu `BoxIcon` trong các component.

### Giai đoạn 2: Khắc phục Django Backend Unit Tests (`procurement/tests.py`)
- **Lý do:** Backend Django là lõi dữ liệu và nghiệp vụ thực tế của hệ thống. Django test runner hoàn toàn độc lập, an toàn (tự tạo test database SQLite trong RAM/file tạm) và không phụ thuộc bên ngoài.
- **Thực hiện:** Căn chỉnh model imports theo đúng `procurement/models.py`, viết bổ sung test case cho No Self-Approval và Budget threshold.

### Giai đoạn 3: Tái cấu trúc Workflow Integration & Security Guard Tests
- **Lý do:** Cần giải quyết dứt điểm mâu thuẫn giữa `tests/workflow.test.js` (kiến trúc Node cũ) và Backend Django.
- **Thực hiện:** Tùy thuộc vào quyết định của người dùng (xem Mục 5), đưa các kịch bản workflow (7 bước) và No Self-Approval vào test runner phù hợp.

### Giai đoạn 4: Cập nhật tài liệu kiểm thử và xử lý Security Audit
- **Lý do:** Tài liệu QA chỉ được cập nhật sau khi các bài test đã thực sự chạy pass và có log thực tế đính kèm.
- **Thực hiện:** Cập nhật `test-cases.md`, rà soát cập nhật các gói npm nếu được phê duyệt.

---

## 4. Test và tiêu chí PASS cho từng bước (Step Verification & Acceptance Criteria)

| Bước | Hành động kỹ thuật | Lệnh xác minh | Tiêu chí PASS (Acceptance Criteria) |
|:---|:---|:---|:---|
| **B1: Frontend Lint** | Sửa `aiStandardizer.ts` & `ProcurementContext.tsx` | `npm.cmd --prefix FE run lint` | Exit code 0, 0 errors. |
| **B2: Frontend Typecheck** | Sửa định nghĩa type `BoxIcon` và unused vars | `npx.cmd --prefix FE tsc -p FE/tsconfig.json --noEmit` | Exit code 0, 0 errors. |
| **B3: Django Unit Tests** | Sửa `procurement/tests.py` khớp models | `python manage.py test procurement` | Exit code 0, `Ran X tests in ... OK`. |
| **B4: Security Guard Test** | Cập nhật `permissions.test.ts` hoặc Django test | Runner tương ứng | Chặn thành công trường hợp requester tự approve (throw error / return false). |
| **B5: Integration Workflow** | Chạy toàn bộ luồng 7 bước | Lệnh test suite tương ứng | 100% test steps PASS, state chuyển đổi đúng từ Draft ➔ Closed. |
| **B6: Production Build** | Kiểm tra build cuối cùng | `npm.cmd --prefix FE run build` | Bundle tạo thành công, 0 lỗi. |

---

## 5. Các quyết định cần người dùng phê duyệt (Decision Gate)

Để triển khai sửa đổi chính xác, Senior QA cần bạn phê duyệt 3 quyết định kiến trúc:

### ❓ Quyết định 1: Ngôn ngữ & Runner cho Integration Test Suite (`tests/workflow.test.js`)
*Hiện tại hệ thống backend là Django (Python), trong khi `tests/workflow.test.js` là JavaScript.*
- **Lựa chọn 1A (Khuyên dùng):** Viết lại bộ test integration bằng Python trong Django (`procurement/tests_workflow.py`). Ưu điểm: Tận dụng test runner sẵn có của Django, kiểm tra trực tiếp ORM, transaction và API endpoint mà không cần khởi động server riêng.
- **Lựa chọn 1B:** Giữ lại JavaScript và viết lại `tests/workflow.test.js` thành Black-box API Integration Test (gửi HTTP fetch tới `http://127.0.0.1:8000/api/v1/sync/`). Nhược điểm: Phải bật server Django chạy ngầm trước khi chạy test.

### ❓ Quyết định 2: Cách thức kiểm thử Frontend Unit Tests (`tests/permissions.test.ts`)
- **Lựa chọn 2A:** Cài đặt thêm `vitest` vào `FE/devDependencies` để chạy test trực tiếp các hàm TypeScript trong `FE/src/utils/rules.ts` và `permissions.ts`.
- **Lựa chọn 2B (Không cài thêm gói):** Chuyển đổi test permissions sang kiểm thử tích hợp trong Django (`procurement/tests.py`) và kiểm tra rule qua giao diện / API.

### ❓ Quyết định 3: Xử lý 47 lỗ hổng bảo mật Dependency (`npm audit`)
- Các lỗ hổng nằm ở devDependencies (`tar`, `minimatch`, `smol-toml` từ `@vercel/python` và `esbuild`).
- Bạn có cho phép thực hiện `npm audit fix` (hoặc nâng cấp chọn lọc các package) không, hay giữ nguyên vì đây là môi trường local dev?

---

## 6. Rủi ro, phạm vi chưa xác minh và điều kiện dừng (Risks & Stop Conditions)

### Rủi ro tiềm ẩn (Risks):
1. **Rủi ro hồi quy dữ liệu:** Khi sửa test Django, nếu cấu hình không cô lập đúng có thể ảnh hưởng đến file SQLite phát triển. *Giải pháp:* Đảm bảo Django test runner sử dụng cơ sở dữ liệu tạm thời (`test_db.sqlite3`).
2. **Rủi ro phá vỡ Frontend:** Nâng cấp dependency để fix npm audit có thể gây breaking changes với Vite hoặc Tailwind. Chỉ thực hiện khi có phê duyệt.

### Phạm vi chưa xác minh (Unverified Areas):
- Hiệu năng thực tế của luồng AI Recommendation với tập dữ liệu lớn.
- Khả năng tương thích trên các hệ điều hành khác ngoài Windows.

### Điều kiện dừng (Stop Conditions):
- Nếu lệnh `makemigrations --check --dry-run` phát hiện có thay đổi model ngoài ý muốn: **Dừng lại ngay lập tức**.
- Nếu có bất kỳ test nào cố tình ghi đè dữ liệu `db.sqlite3` gốc: **Hủy bỏ thực thi**.

---

## 7. Danh sách các phát biểu trong tài liệu cần hiệu chỉnh (Documentation Rectification List)

Các phát biểu sau đây trong tài liệu hiện tại không được bằng chứng thực tế hỗ trợ và cần được cập nhật lại:

1. **`docs/06-testing/test-cases.md` (Dòng 7 & Dòng 88-100):**
   - *Phát biểu cũ:* "All Test Cases Executed & Passed (100% Pass) ... node --test tests/workflow.test.js ... Tests: 6 passed, 6 total".
   - *Thực tế:* Lệnh `node --test tests/workflow.test.js` bị crash do thiếu module `src/server`. Cần sửa lại trạng thái thực tế là `ERROR / REFACTORING REQUIRED`.
2. **`docs/06-testing/README.md` (Dòng 4 & Dòng 18):**
   - *Phát biểu cũ:* "Trạng thái: 100% Executed & Verified (0 Release Blockers) ... 21/21 Test Cases PASS".
   - *Thực tế:* Chưa có bộ test tự động nào hoàn tất thành công trên repository hiện tại. Cần ghi nhận đúng hiện trạng đang trong giai đoạn triage hạ tầng test.
3. **`docs/08-quality/bug-log.md` (Dòng 25):**
   - *Phát biểu cũ:* Ghi nhận `TC-SEC-001 in tests/workflow.test.js` là bằng chứng regression test đã pass cho BUG-001.
   - *Thực tế:* Test suite này chưa thực thi được; cần cập nhật lại liên kết bằng chứng sau khi test case No Self-Approval được triển khai và chạy thực tế.
