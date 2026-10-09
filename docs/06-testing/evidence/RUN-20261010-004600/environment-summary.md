# Tóm Tắt Môi Trường Thực Thi (Environment Summary) — Run RUN-20261010-004600

> **Giai đoạn:** QA-12 — Local Demo Smoke Test & Evidence  
> **Run ID:** `RUN-20261010-004600`  
> **Thời điểm chạy:** 2026-10-10T00:46:00+07:00  
> **Hệ điều hành:** Windows 11 Enterprise (64-bit)  
> **Shell:** Windows PowerShell  
> **Git Branch:** `main`  
> **Git HEAD:** `103bc49` (fix(governance): enforce No Self-Approval at backend sync API (BUG-0001))  
> **Trạng thái Working Tree:** Modified (Tài liệu kiểm thử QA-11/QA-11A và file tạm scratch)  

---

## 1. Thông Số Runtime Cục Bộ & Kiến Trúc Ứng Dụng

| Thành phần | Cấu hình / Phiên bản | Ghi chú vận hành Local Demo |
| :--- | :--- | :--- |
| **Python** | `Python 3.13.0` | Runtime thực thi Backend |
| **Django** | `Django 5.1.1` | Web framework phụ trách API `/api/v1/` và trực tiếp phục vụ SPA static bundle |
| **Database Cục Bộ** | `db.sqlite3` (SQLite local file) | Chứa dữ liệu demo 5 tài khoản, ngân sách 2026, PR mẫu, nhà cung cấp |
| **Local Server Host** | `http://127.0.0.1:8000` | Cổng phục vụ thống nhất cả Frontend SPA và Backend API |
| **Frontend Bundle** | `FE/dist/` (Vite SPA production bundle) | `index-B64izx3U.js` (591.6 KB), `index-DOkmxdel.css` (29.4 KB) |
| **Trình duyệt tự động** | Playwright / Headless Browser Subagent | **BLOCKED (Offline/CDN Error)**: Không tải được driver Playwright 1.57.0 (HTTP 404 từ Azure CDN) |
| **Phương thức kiểm thử UI** | Manual Smoke Checklist | Quy trình thủ công có checklist 6 kịch bản demo cho người vận hành |

---

## 2. Ranh Giới An Toàn & Bảo Mật

1. **Cô lập Production:** Hệ thống chạy 100% trên `127.0.0.1:8000` với SQLite cục bộ `db.sqlite3`. Tuyệt đối không có kết nối hay ghi dữ liệu vào môi trường Staging/Production hay Vercel.
2. **Bảo mật Secret:** Không có API key nhạy cảm hoặc secret production hiển thị trong terminal hay log kiểm thử.
3. **Dữ liệu Demo:** Sử dụng các tài khoản demo đã seed:
   - Nhân viên (`employee`): `u-nam` (Nguyễn Văn Nam - IT)
   - Trưởng phòng (`manager`): `u-vietanh` (Trần Việt Anh - IT)
   - Mua sắm (`procurement`): `u-lan` (Lê Thị Lan - Procurement)
   - Kế toán (`finance`): `u-huong` (Phạm Mai Hương - Finance)
   - Quản trị viên (`admin`): `u-tuan` (Vũ Đức Tuấn - Admin)
