# Báo Cáo Tóm Tắt Thực Thi (Execution Summary) — QA Live Demo Red/Green/Regression

> **Run ID:** `DEMO-RED-GREEN-20261010-015500`  
> **Thời gian thực hiện:** 2026-10-10T01:55:00+07:00  
> **Người thực hiện:** Senior QA Engineer  
> **Đối tượng:** `test_tc_gov01_002_prevent_bypass_and_verify_bug_sec_01` (Bảo mật No Self-Approval / `BUG-0001`)  
> **Kết luận chung:** **DEMO VERIFICATION HOÀN HẢO (RED / GREEN / RESTORE / REGRESSION THÀNH CÔNG 100%)**

---

## 1. Bảng Đối Chiếu Kết Quả Thực Thi 4 Giai Đoạn (Phase A $\rightarrow$ Phase D)

| Giai đoạn | Mục tiêu thử nghiệm | Môi trường thực thi | Lệnh chạy | Thời gian | Exit Code | Kết quả thực tế | Trạng thái |
| :---: | :--- | :---: | :--- | :---: | :---: | :--- | :---: |
| **Phase A**<br/>*(Baseline)* | Xác minh trạng thái gốc khi logic đúng | Workspace chính | `python manage.py test ...test_tc_gov01_002... -v 2` | 0.037s | **0** | `Ran 1 test ... ok` | **PASS** |
| **Phase B**<br/>*(Controlled Failure)* | Tạo mutation vô hiệu hóa guard bảo mật No Self-Approval | Môi trường cô lập (`demo_env/`) | `python manage.py test ...test_tc_gov01_002... -v 2` | 0.022s | **1** | `AssertionError: 200 != 403`<br/>(Tại dòng 213 test file) | **FAIL<br/>(Dự kiến)** |
| **Phase C**<br/>*(Restore)* | Khôi phục logic đúng từ bản backup `views.py.good` | Môi trường cô lập (`demo_env/`) | `python manage.py test ...test_tc_gov01_002... -v 2` | 0.036s | **0** | `Ran 1 test ... ok` | **PASS** |
| **Phase D**<br/>*(Regression)* | Chạy toàn bộ 53 bài test hồi quy của hệ thống | Workspace chính | `python manage.py test -v 2` | 0.299s | **0** | `Ran 53 tests in 0.299s ... OK` | **PASS 100%<br/>(53/53)** |

---

## 2. Phân Tích Kỹ Thuật Chi Tiết Từng Giai Đoạn

### Giai đoạn A — Baseline (Logic Chuẩn Đạt PASS)
* Lệnh thực thi:
  ```bash
  python manage.py test procurement.test_gov01_gov02.Gov01Gov02AutomatedTests.test_tc_gov01_002_prevent_bypass_and_verify_bug_sec_01 -v 2
  ```
* **Kết quả:** Test khởi tạo in-memory database, áp dụng 18 migration, kiểm tra 4 kịch bản bypass (qua Session, qua JSON `actorId`, duyệt ẩn danh không Actor, và duyệt hợp lệ bởi Admin). Toàn bộ 4 kịch bản đều khớp với mã lỗi HTTP và trạng thái mong đợi. Test kết thúc thành công với mã thoát `Exit Code 0` sau `0.037s`.

### Giai đoạn B — Controlled Failure (Lỗi Có Kiểm Soát)
> [!IMPORTANT]
> **Lưu ý minh bạch:** Thất bại trong Phase B là do **cố tình tạo lỗi có kiểm soát (Controlled Mutation)** trong môi trường demo cô lập `demo_env/` để chứng minh năng lực phát hiện lỗi của bộ test suite cho Giảng viên. Đây **KHÔNG PHẢI** là bug thực tế mới phát sinh của phiên bản chính.

* **Mutation áp dụng:** Sửa điều kiện kích hoạt guard bảo mật tại `demo_env/procurement/views.py:91`:
  ```python
  # Trước khi sửa:
  if new_status == 'approved' and pr.status != 'approved':
  
  # Sau khi sửa (Mutation):
  if False and new_status == 'approved' and pr.status != 'approved':
  ```
* **Giữ nguyên 100% test code:** Không can thiệp bất kỳ dòng code hay assertion nào trong `test_gov01_gov02.py`.
* **Kết quả thực tế:**
  * Lệnh thoát với `Exit Code 1`.
  * Lỗi ghi nhận:
    ```text
    FAIL: test_tc_gov01_002_prevent_bypass_and_verify_bug_sec_01
    Traceback (most recent call last):
      File "...\test_gov01_gov02.py", line 213, in test_tc_gov01_002_prevent_bypass_and_verify_bug_sec_01
        self.assertEqual(resp_session.status_code, 403)
    AssertionError: 200 != 403
    ```
  * **Đánh giá bản chất lỗi:** Test thất bại **100% do vi phạm assertion nghiệp vụ bảo mật (`AssertionError: 200 != 403`)**, tuyệt đối không phải lỗi cấu hình, cú pháp linter hay lỗi import runtime. Điều này chứng minh test case có độ nhạy bén rất cao, lập tức phát hiện ngay khi logic bảo vệ bị vô hiệu hóa.

### Giai đoạn C — Restore (Khôi Phục Logic Tốt)
* **Thao tác:** Khôi phục file `demo_env/procurement/views.py` từ tệp lưu dự phòng `views.py.good`.
* **Kết quả thực tế:**
  * Chạy lại test mục tiêu `test_tc_gov01_002_prevent_bypass_and_verify_bug_sec_01`.
  * Test lập tức chuyển từ **RED** sang **GREEN** (`Ran 1 test in 0.036s ... OK`, `Exit Code 0`).
* **Dọn dẹp môi trường:** Thư mục cô lập `demo_env/` được xóa hoàn toàn bằng PowerShell `Remove-Item -Recurse -Force`.

### Giai đoạn D — Regression Test Suite (Kiểm Thử Hồi Quy Toàn Bộ Hệ Thống)
* **Lệnh thực thi tại Workspace chính:**
  ```bash
  python manage.py test -v 2
  ```
* **Kết quả đo đạc thực tế:**
  * **Tổng số bài test chạy:** **53 tests**.
  * **Thời gian thực thi:** **0.299 giây**.
  * **Số lỗi (Errors):** **0**.
  * **Số thất bại (Failures):** **0**.
  * **Tỷ lệ hồi quy (Regression Rate):** **0% (Zero Regression)**.
  * **Trạng thái:** **`OK (PASS 100%)`**.

---

## 3. Xác Minh Tính Toàn Vẹn Của Workspace Chính

Kiểm tra lệnh `git status --short` tại thư mục gốc dự án sau khi hoàn tất toàn bộ 4 giai đoạn:
```text
 M docs/02-vault/AI_USAGE_LOG.md
 M docs/06-testing/README.md
 M docs/06-testing/evidence/RUN-20261010-004600/execution-summary.md
 M docs/06-testing/evidence/RUN-20261010-004600/manual-smoke-checklist.md
 M docs/06-testing/final-test-report.md
 M docs/06-testing/release-readiness.md
?? docs/06-testing/evidence/RUN-20261010-011000/
?? docs/08-presentation/
```
* **Kết luận an toàn:** Toàn bộ mã nguồn ứng dụng (`procurement/`, `config/`, `manage.py`) hoàn toàn nguyên vẹn 100%. Không có bất kỳ commit, push, hay mã nguồn lỗi nào bị rò rỉ vào hệ thống chính.
