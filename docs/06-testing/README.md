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
├── final-test-report.md           (Báo cáo kiểm thử cuối cùng sau đợt Retest & Regression QA-10)
├── release-readiness.md           (Đánh giá mức độ sẵn sàng phát hành & Cổng chất lượng Release Gates)
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
├── evidence/                      <-- BẰNG CHỨNG THỰC THI KIỂM THỬ THEO RUN ID
│   ├── RUN-20261010-011000/       (QA-12A Thẩm Định Độc Lập — Local Service PASS / UI Interaction NOT VERIFIED)
│   ├── RUN-20261010-004600/       (QA-12 Local Demo Smoke Test Runtime Contracts & Manual Checklist)
│   ├── RUN-20261010-000500/       (QA-10 Retest BUG-0001 & Regression Verification — 53 Tests PASS)
│   ├── RUN-20261009-220000/       (QA-07 Master Full Suite Execution — 53 Tests PASS)
│   ├── RUN-20261009-215300/       (Batch 5: GOV-01, GOV-02 — 5 TCs PASS)
│   ├── RUN-20261009-214700/       (Batch 4: US-08, US-09, US-10 — 9 TCs PASS)
│   ├── RUN-20261009-214300/       (Batch 3: US-06, US-07 — 7 TCs PASS)
│   ├── RUN-20261009-213800/       (Batch 2: US-03, US-04, US-05 — 10 TCs PASS)
│   ├── RUN-20261009-212600/       (Batch 1: US-01, US-02 — 6 TCs PASS)
│   ├── run-20261009-144500/       (Historical Baseline Run)
│   └── run-20261009-remediation-group1/ (Historical Remediation Run)
```

---

## 2. Bảng Chỉ Mục Tài Liệu Chi Tiết (Detailed Documentation Map)

### 📌 Tài liệu Bàn Giao Phát Hành (Release Deliverables)
- [**Báo cáo Kiểm thử Cuối cùng (`final-test-report.md`)**](final-test-report.md): Tổng hợp kết quả retest, ma trận đối chiếu lệnh thực tế, đánh giá hồi quy toàn diện.
- [**Đánh giá Sẵn sàng Phát hành (`release-readiness.md`)**](release-readiness.md): Đánh giá 7 cổng chất lượng kỹ thuật, phân biệt BUILD PASS vs RELEASE READY, điều kiện nghiệm thu Staging/Production.

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
- [**Sổ Theo dõi Khiếm khuyết Chính thức (`BUG_TRACKER.md`)**](04-defects/BUG_TRACKER.md): Đăng ký và theo dõi toàn diện 9 defects (4 closed, 4 triaged, 1 verified) với đầy đủ 18 trường thông tin IEEE 1044.
- [**Báo cáo Phân loại & Sàng lọc Lỗi (`bug-triage-report.md`)**](04-defects/bug-triage-report.md): Đánh giá Release Blocker (`BUG-0001`), phân tích RCA và kế hoạch giải quyết.

### 📌 Phân hệ 05: Bằng Chứng Thực Thi (`evidence/`)
- [**Bằng chứng Thẩm định Độc lập QA-12A (`evidence/RUN-20261010-011000/`)**](evidence/RUN-20261010-011000/execution-summary.md): Thẩm định live server HTTP, phát hiện asset script 404, hiệu chỉnh manual checklist MC-01..MC-06 sang NOT RUN / NOT VERIFIED.
- [**Bằng chứng Smoke Test Local Demo QA-12 (`evidence/RUN-20261010-004600/`)**](evidence/RUN-20261010-004600/execution-summary.md): Khởi chạy máy chủ cục bộ 127.0.0.1:8000, 6 HTTP contracts PASS, bảng kiểm thử thủ công UI 6 kịch bản.
- [**Bằng chứng Retest & Regression QA-10 (`evidence/RUN-20261010-000500/`)**](evidence/RUN-20261010-000500/execution-summary.md): Xác minh thành công BUG-0001, full regression 53/53 tests PASS.
- [**Bằng chứng Tổng hợp Đợt chạy QA-07 (`evidence/RUN-20261009-220000/`)**](evidence/RUN-20261009-220000/execution-summary.md): Master run 53/53 tests PASS, kết quả lint, typecheck và production build.
- [**Bằng chứng Batch 1 đến 5 (`evidence/RUN-20261009-212600/` .. `215300/`)**](evidence/RUN-20261009-215300/execution-summary.md): Toàn bộ 5 đợt triển khai automated tests theo từng batch.

---

## 3. Tóm Tắt Tình Trạng Chất Lượng Hệ Thống (Quality Status Summary)

| Chỉ số Chất lượng | Giá trị Thực tế | Tỷ lệ Đạt | Đánh giá |
| :--- | :--- | :---: | :---: |
| **Test Cases Thiết kế** | 34 / 34 TCs | **100%** | Bao phủ 100% Acceptance Criteria của 12 US |
| **Test Cases Tự động hóa** | 34 / 34 TCs PASS | **100%** | Hoàn thành trọn vẹn qua 5 batch kiểm thử tự động |
| **Tổng số Backend Tests** | 53 / 53 Tests PASS | **100%** | Chạy trong 0.275s, 0 lỗi hồi quy (Zero Regression) |
| **Frontend Production Build** | PASS (34.83s) | **100%** | Đóng gói thành công bundle `FE/dist/` (cần rebuild để sync asset mới) |
| **Release Blockers** | **0 Blocker Active** | — | `BUG-0001` đã được sửa và **VERIFIED** thành công |
| **Quyết định Phát hành** | • **Dịch vụ Backend:** `LOCAL SERVICE SMOKE PASS`<br/>• **Giao diện Demo:** `LOCAL DEMO NOT VERIFIED`<br/>• **Staging / UAT:** `NOT VERIFIED`<br/>• **Production:** `BLOCKED / NOT READY` | — | Phân định ranh giới nghiêm ngặt giữa Service API và Browser UI (QA-12A) |
