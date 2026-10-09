# Sổ tay Lệnh Kiểm thử Chuẩn hóa (Test Command Reference) — ProcureAI

> **Mã tài liệu:** QA-05-CMD  
> **Hệ thống:** ProcureAI — Internal Procurement & Approval Platform  
> **Phiên bản:** v1.0.0  
> **Thời điểm ban hành:** 2026-10-09T21:22:00+07:00  
> **Tác giả:** Senior QA Engineer & Test Automation Engineer  
> **Tài liệu căn cứ:** [test-environment.md](test-environment.md), [test-data-strategy.md](test-data-strategy.md), Codebase thực tế  

---

## 1. Giới thiệu & Quy tắc Thực thi trên Windows

Do chính sách bảo mật thực thi PowerShell trên Windows (`ExecutionPolicy`), các lệnh `npm` hoặc `npx` phải được thực thi thông qua tệp mở rộng `.cmd` (ví dụ: `npm.cmd`, `npx.cmd`).

Tất cả các lệnh dưới đây được chuẩn hóa theo đúng cấu trúc thư mục thực tế của dự án:
- Backend: Chạy tại thư mục gốc repository (`d:\LTUD\group-01 - LTUDDN`).
- Frontend: Chạy với cờ `--prefix FE` hoặc thực thi trực tiếp trong thư mục con `FE/`.

---

## 2. Bảng Danh mục Lệnh Kiểm thử theo Từng Hạng mục

| STT | Lệnh thực thi chính xác | Hạng mục / Cấp độ | Điều kiện tiên quyết | Phạm vi kiểm thử | Tác động hệ thống | Dạng Evidence thu được |
|:---:|:---|:---|:---|:---|:---|:---|
| **1** | `python manage.py test procurement.tests -v 2` | Backend Model Unit Tests | Python 3.13, Django 5.x | 7 unit tests (Tính toán Budget, PRLineItem, VAT, AuditEntry, AI service) | In-memory DB (Zero disk change) | Chi tiết từng test case, thời gian chạy, exit code 0 |
| **2** | `python manage.py test procurement.tests_workflow -v 2` | Backend Workflow Integration Tests | Django models & services khả dụng | 9 workflow tests (7 bước PR, No Self-Approval guard, Anomaly alert $\ge 20\%$, API sync) | In-memory DB (Tự động rollback) | Từng bước quy trình, HTTP response assertions |
| **3** | `python manage.py test -v 2` | Toàn bộ Backend Automated Test Suite | Môi trường Python hoạt động | Toàn bộ 16 tests trong ứng dụng `procurement` | In-memory DB | Báo cáo tổng thể `Ran 16 tests in X.XXXs, OK` |
| **4** | `python manage.py check` | Kiểm tra Toàn vẹn Hệ thống Django | Cấu hình `settings.py` hợp lệ | Rà soát toàn bộ cấu hình, model fields, routing | Read-only | `System check identified no issues (0 silenced)` |
| **5** | `python manage.py makemigrations --check --dry-run` | Kiểm tra Đồng bộ Schema Cơ sở dữ liệu | Django ORM models | Đối chiếu model code với các file migration | Read-only | `No changes detected` (Schema khớp 100%) |
| **6** | `npm.cmd --prefix FE run lint` | Kiểm tra Chất lượng Mã nguồn Frontend (ESLint) | Node.js v24, `FE/node_modules` | Toàn bộ file `.js,.jsx,.ts,.tsx` trong `FE/` | Read-only | Danh sách lỗi cú pháp, cảnh báo ESLint |
| **7** | `npx.cmd --prefix FE tsc --project FE/tsconfig.json --noEmit` | Kiểm tra Kiểu Dữ liệu TypeScript Frontend | TypeScript trong `FE/` | Toàn bộ mã nguồn TypeScript `FE/src/` | Read-only | Danh sách lỗi type check (`TS6133`, `TS2749`) |
| **8** | `npm.cmd --prefix FE run build` | Đóng gói Production Bundle Frontend | Dependencies trong `FE/node_modules` | Toàn bộ mã nguồn React + CSS + Assets | Tạo thư mục `FE/dist/` | Dung lượng các chunks bundle (`index.html`, `.css`, `.js`) |
| **9** | `python manage.py runserver 127.0.0.1:8000` | Khởi chạy Backend Server (Kiểm thử thủ công) | Port 8000 khả dụng | Phục vụ API REST cho kiểm thử giao diện | Khởi chạy tiến trình background | Request log trên console server |
| **10**| `npm.cmd --prefix FE run dev` | Khởi chạy Frontend Dev Server (Kiểm thử thủ công) | Port 5173 khả dụng | Phục vụ giao diện React UI với Vite HMR | Khởi chạy tiến trình background | Vite Local URL (`http://localhost:5173/`) |

---

## 3. Hướng dẫn Thu thập Bằng chứng (Evidence Harvesting Protocol)

Khi thực thi bất kỳ lệnh kiểm thử chính thức nào để phục vụ báo cáo chất lượng:

1. **Lệnh tạo nhật ký thực thi (Execution Log Harvesting):**
   ```powershell
   # Ví dụ: Thu thập raw execution log của toàn bộ backend test suite
   python manage.py test -v 2 > docs/06-testing/evidence/RUN-YYYYMMDD-HHMMSS/execution-log.txt 2>&1
   ```
2. **Kiểm tra Exit Code:**
   - Trong PowerShell, kiểm tra exit code ngay sau khi chạy:
     ```powershell
     $LASTEXITCODE
     ```
   - Exit code `0`: Thành công hoàn toàn (PASS).
   - Exit code `!= 0`: Thất bại hoặc có lỗi (FAIL / ERROR).

---

## 4. Các Lệnh Bị Đánh dấu Lỗi Thời / Không Sử dụng (Deprecated Legacy Commands)

Để tránh gây sập test suite và hiểu lầm về kiến trúc, **tuyệt đối không sử dụng** các lệnh sau:

- ❌ `node --test tests/workflow.test.js`: File này nhập `src/server` không tồn tại $\rightarrow$ Gây lỗi `ERR_MODULE_NOT_FOUND`. Đã được thay thế hoàn toàn bằng lệnh số 2 (`procurement.tests_workflow`).
- ❌ `npx vitest run tests/permissions.test.ts`: File này nhập `src/client` không tồn tại và `vitest` chưa được khai báo trong dependencies $\rightarrow$ Bị fail suite.
