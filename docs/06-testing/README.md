# Trung Tâm Kiểm Thử & Đảm Bảo Chất Lượng (Testing & QA Hub) — ProcureAI

> **Hệ thống:** ProcureAI — Internal Procurement & Approval Platform  
> **Thư mục gốc:** `docs/06-testing/`  
> **QA Lead & Reporter:** Trần Thị Thu Hà (QA / Tester)  
> **Cập nhật lần cuối:** 2026-10-09T22:45:00+07:00  
> **Trạng thái:** **34/34 Test Cases Tự Động Hóa PASS (100%)** | **53/53 Full Suite Tests PASS**  

---

## 1. Cấu Trúc Phân Hệ Thư Mục Chi Tiết (Directory Structure)

Thư mục `docs/06-testing/` được chuẩn hóa thành 5 phân hệ chức năng chuyên biệt theo tiêu chuẩn ISTQB & IEEE 29119:

```text
docs/06-testing/
├── README.md                      <-- Trang chủ & Mục lục điều hướng tổng thể (Bạn đang ở đây)
│
├── 01-plans/                      <-- CHIẾN LƯỢC, KẾ HOẠCH & MA TRẬN TRUY VẾT
│   ├── qa-inventory.md            (Đánh giá hiện trạng kiểm thử & Audit cơ sở mã nguồn)
│   ├── test-strategy.md           (Chiến lược kiểm thử toàn diện theo kiến trúc thực tế)
│   ├── test-plan.md               (Kế hoạch kiểm thử chi tiết, phân công US Owner & Reviewer)
│   ├── us-ownership-matrix.md     (Ma trận sở hữu 12 User Stories & Governance)
│   └── requirement-traceability-matrix.md (Ma trận truy vết 1:1 REQ -> US -> AC -> TC -> Evidence)
│
├── 02-environment/                <-- MÔI TRƯỜNG, DỮ LIỆU & SỔ TAY LỆNH
│   ├── test-environment.md        (Thông số runtime Python, Django, Node, Vite, in-memory DB)
│   ├── test-data-strategy.md      (Dữ liệu mẫu seed, fixtures, tài khoản 5 vai trò & ngân sách)
│   └── test-command-reference.md  (Sổ tay 10 lệnh kiểm thử chuẩn hóa trên Windows PowerShell)
│
├── 03-test-cases/                 <-- BỘ KỊCH BẢN KIỂM THỬ ĐÃ DUYỆT (34 TEST CASES)
│   ├── test-cases.md              (Đặc tả chi tiết 34 test cases cho người đọc với đủ Preconditions & Steps)
│   └── test-case-register.csv     (Bảng đăng ký 34 test cases dạng CSV phục vụ lọc & thống kê)
│
├── 04-defects/                    <-- QUẢN LÝ KHIẾM KHUYẾT & SÀNG LỌC LỖI
│   ├── BUG_TRACKER.md             (Sổ theo dõi khiếm khuyết chính thức IEEE 1044 / ISO 29119-3)
│   └── bug-triage-report.md       (Báo cáo sàng lọc lỗi, RCA, kế hoạch sửa & 1 Release Blocker)
│
└── evidence/                      <-- BẰNG CHỨNG THỰC THI KIỂM THỬ THEO RUN ID
    ├── RUN-20261009-212600/       (Batch 1: US-01, US-02 — 6 TCs PASS)
    ├── RUN-20261009-213800/       (Batch 2: US-03, US-04, US-05 — 10 TCs PASS)
    ├── RUN-20261009-214300/       (Batch 3: US-06, US-07 — 7 TCs PASS)
    ├── RUN-20261009-214700/       (Batch 4: US-08, US-09, US-10 — 9 TCs PASS)
    ├── RUN-20261009-215300/       (Batch 5: GOV-01, GOV-02 — 5 TCs PASS)
    ├── RUN-20261009-220000/       (QA-07 Master Full Suite Execution — 53 Tests PASS)
    ├── run-20261009-144500/       (Historical Baseline Run)
    └── run-20261009-remediation-group1/ (Historical Remediation Run)
```

---

## 2. Bảng Chỉ Mục Tài Liệu Chi Tiết (Detailed Documentation Map)

### 📌 Phân hệ 01: Chiến Lược & Kế Hoạch (`01-plans/`)
- [**Đánh giá Hiện trạng Kiểm thử (`qa-inventory.md`)**](01-plans/qa-inventory.md): Kiểm kê toàn diện kiến trúc Django + React Vite, rà soát 18 FRs, 3 NFRs và 4 rủi ro lớn.
- [**Chiến lược Kiểm thử (`test-strategy.md`)**](01-plans/test-strategy.md): Xác lập test levels (Unit, Integration, Security, Audit), risk-based testing, chính sách cô lập in-memory DB.
- [**Kế hoạch Kiểm thử (`test-plan.md`)**](01-plans/test-plan.md): Lịch trình thực thi theo 5 batch, phân công Primary Owner và Reviewer chéo.
- [**Ma trận Sở hữu User Story (`us-ownership-matrix.md`)**](01-plans/us-ownership-matrix.md): Phân bổ trách nhiệm 12 User Stories cho 5 thành viên nhóm.
- [**Ma trận Truy vết Yêu cầu RTM (`requirement-traceability-matrix.md`)**](01-plans/requirement-traceability-matrix.md): Truy vết 1:1 từ Requirements $\rightarrow$ Acceptance Criteria $\rightarrow$ Test Cases $\rightarrow$ Evidence.

### 📌 Phân hệ 02: Môi Trường & Dữ Liệu (`02-environment/`)
- [**Cấu hình Môi trường Kiểm thử (`test-environment.md`)**](02-environment/test-environment.md): Đặc tả phần cứng, Python 3.13, Django 5.1.1, Node.js v24, SQLite In-Memory.
- [**Chiến lược Quản lý Test Data (`test-data-strategy.md`)**](02-environment/test-data-strategy.md): Quy ước sinh dữ liệu động, seed 5 tài khoản mẫu, ngân sách phòng ban và bảo vệ an toàn `db.sqlite3`.
- [**Sổ tay Lệnh Kiểm thử Chuẩn hóa (`test-command-reference.md`)**](02-environment/test-command-reference.md): Bảng 10 câu lệnh PowerShell chuẩn hóa kèm hướng dẫn thu thập log.

### 📌 Phân hệ 03: Bộ Kịch Bản Kiểm Thử (`03-test-cases/`)
- [**Đặc tả Chi tiết 34 Test Cases (`test-cases.md`)**](03-test-cases/test-cases.md): 34 kịch bản kiểm thử độc lập bao phủ 100% AC từ `US-01` đến `US-10`, `GOV-01`, `GOV-02`.
- [**Sổ Đăng ký Test Cases Dạng CSV (`test-case-register.csv`)**](03-test-cases/test-case-register.csv): Bảng dữ liệu cấu trúc phục vụ lọc theo Priority, Owner, Status, Run ID.

### 📌 Phân hệ 04: Quản Lý Khiếm Khuyết (`04-defects/`)
- [**Sổ Theo dõi Khiếm khuyết Chính thức (`BUG_TRACKER.md`)**](04-defects/BUG_TRACKER.md): Đăng ký và theo dõi toàn diện 9 defects (4 closed, 5 triaged) với đầy đủ 18 trường thông tin IEEE 1044.
- [**Báo cáo Phân loại & Sàng lọc Lỗi (`bug-triage-report.md`)**](04-defects/bug-triage-report.md): Đánh giá duy nhất 1 Release Blocker (`BUG-0001`), phân tích RCA và kế hoạch sửa lỗi.

### 📌 Phân hệ 05: Bằng Chứng Thực Thi (`evidence/`)
- [**Bằng chứng Tổng hợp Đợt chạy QA-07 (`evidence/RUN-20261009-220000/`)**](evidence/RUN-20261009-220000/execution-summary.md): Master run 53/53 tests PASS, kết quả lint, typecheck và production build.
- [**Bằng chứng Batch 1 (`evidence/RUN-20261009-212600/`)**](evidence/RUN-20261009-212600/execution-summary.md): US-01 & US-02 (6 TCs PASS).
- [**Bằng chứng Batch 2 (`evidence/RUN-20261009-213800/`)**](evidence/RUN-20261009-213800/execution-summary.md): US-03, US-04 & US-05 (10 TCs PASS).
- [**Bằng chứng Batch 3 (`evidence/RUN-20261009-214300/`)**](evidence/RUN-20261009-214300/execution-summary.md): US-06 & US-07 (7 TCs PASS).
- [**Bằng chứng Batch 4 (`evidence/RUN-20261009-214700/`)**](evidence/RUN-20261009-214700/execution-summary.md): US-08, US-09 & US-10 (9 TCs PASS).
- [**Bằng chứng Batch 5 (`evidence/RUN-20261009-215300/`)**](evidence/RUN-20261009-215300/execution-summary.md): GOV-01 & GOV-02 (5 TCs PASS).

---

## 3. Tóm Tắt Tình Trạng Chất Lượng Hệ Thống (Quality Status Summary)

| Chỉ số Chất lượng | Giá trị Thực tế | Tỷ lệ Đạt | Đánh giá |
| :--- | :---: | :---: | :---: |
| **Test Cases Thiết kế** | 34 / 34 TCs | **100%** | Bao phủ 100% Acceptance Criteria của 12 US |
| **Test Cases Tự động hóa** | 34 / 34 TCs PASS | **100%** | Hoàn thành trọn vẹn qua 5 batch kiểm thử tự động |
| **Tổng số Backend Tests** | 53 / 53 Tests PASS | **100%** | Chạy trong 0.224s, 0 lỗi hồi quy (Zero Regression) |
| **Frontend Production Build** | PASS (31.57s) | **100%** | Đóng gói thành công bundle `FE/dist/` |
| **Release Blockers** | **1 Blocker** (`BUG-0001`) | — | Đang ở trạng thái `TRIAGED`, chờ phê duyệt sửa code |
