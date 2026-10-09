# Tóm Tắt Môi Trường Thực Thi (Environment Summary) — Run RUN-20261010-000500

> **Giai đoạn:** QA-10 — Retest & Regression Verification  
> **Run ID:** `RUN-20261010-000500`  
> **Thời điểm chạy:** 2026-10-10T00:05:00+07:00  
> **Hệ điều hành:** Windows 11 Enterprise (64-bit)  
> **Shell:** Windows PowerShell  
> **Git Branch:** `main`  
> **Trạng thái Working Tree:** Modified (`procurement/views.py`, `procurement/test_gov01_gov02.py`)  

---

## 1. Thông Số Runtime & Thư Viện

| Thành phần | Phiên bản thực tế | Ghi chú cấu hình |
| :--- | :--- | :--- |
| **Python** | `Python 3.13.0` | Môi trường hệ thống cục bộ |
| **Django** | `Django 5.1.1` | Framework chính Backend |
| **Database Test** | SQLite in-memory (`file:memorydb_default?mode=memory&cache=shared`) | Cô lập 100%, không ghi đè `db.sqlite3` |
| **Node.js** | `v24.11.1` | Môi trường Frontend toolchain |
| **npm** | `11.6.1` | Package manager |
| **Vite** | `v5.4.21` | Bundler Frontend |
| **React** | `18.3.1` | Thư viện UI Single Page Application |
| **TypeScript** | `5.5.3` | Trình biên dịch mã nguồn `FE/src/` |
| **ESLint** | `8.50.0` | Công cụ kiểm tra chất lượng mã nguồn |

---

## 2. Mục Tiêu Thực Thi Trong Phiên

1. **Retest Defect Blocker:** `BUG-0001` (BUG-SEC-01) qua `TC-GOV01-002` trong `procurement/test_gov01_gov02.py`.
2. **Regression Backend Suite:** Toàn bộ 53 automated tests của 12 User Stories và Governance (`procurement.test_*`, `tests_workflow`, `tests`).
3. **Regression Code Quality & Frontend Build:** Kiểm tra tính nguyên vẹn của frontend (`npm run lint`, `tsc --noEmit`, `npm run build`).
