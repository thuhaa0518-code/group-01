# Kịch Bản Trình Diễn Kiểm Thử Trực Tiếp (Live Testing Demo Script) — Red / Green / Regression

> **Dự án:** ProcureAI — Internal Procurement & Approval Platform  
> **Tài liệu:** Kịch bản demo kiểm thử tự động trực tiếp trước Giảng viên / Hội đồng phản biện  
> **Mục tiêu:** Chứng minh tính hiệu quả của bộ kiểm thử bằng phương pháp **Mutation Testing** qua 3 trạng thái thực tế: **PASS (Đúng) $\rightarrow$ FAIL (Lỗi có kiểm soát) $\rightarrow$ PASS (Khôi phục) $\rightarrow$ REGRESSION (Toàn diện)**.  
> **Thời lượng khuyến nghị:** 3 – 5 phút  
> **Người thực hiện đề xuất:** Trần Thị Thu Hà (Senior QA Lead) hoặc Nguyễn Thị Thùy Dung (Backend Lead)

---

## 1. Chuẩn Bị Trước Khi Demo (Pre-Demo Setup)

1. Mở sẵn cửa sổ **Terminal / PowerShell** tại thư mục gốc của dự án: `d:\LTUD\group-01 - LTUDDN`.
2. Mở sẵn cửa sổ **VS Code** trỏ vào 2 file:
   - File test: [`procurement/test_gov01_gov02.py:196`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/test_gov01_gov02.py#L196) (Phương thức `test_tc_gov01_002_prevent_bypass_and_verify_bug_sec_01`).
   - File xử lý backend: [`procurement/views.py:91`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/views.py#L91) (Guard kiểm tra `No Self-Approval`).
3. Chuẩn bị thư mục cô lập tạm thời nếu muốn thao tác trực tiếp, hoặc sử dụng các lệnh chuẩn bị sẵn bên dưới.

---

## 2. Kịch Bản Lời Thoại & Thao Tác Chi Tiết 4 Bước (Step-by-Step Walkthrough)

### BƯỚC 1: GIỚI THIỆU & PHASE A — BASELINE (GREEN) (~1 phút)

* **Lời thoại người trình bày:**
  > 🎙️ *"Kính thưa Thầy/Cô, một bộ kiểm thử tự động tốt không chỉ là chạy ra kết quả màu xanh (PASS), mà quan trọng hơn là: **Khi có lập trình viên vô tình làm sai logic hoặc tắt bỏ chốt chặn bảo mật, bộ kiểm thử đó phải lập tức phát hiện và báo lỗi (FAIL) ngay lập tức!**
  > 
  > Để chứng minh tính tin cậy tuyệt đối của hệ thống kiểm thử ProcureAI, sau đây em xin thực hiện một thí nghiệm **Mutation Testing trực tiếp trước mắt Thầy/Cô** trên test case bảo mật trọng yếu: `test_tc_gov01_002_prevent_bypass_and_verify_bug_sec_01` — bảo vệ quy tắc No Self-Approval tại API `/api/v1/sync/`.
  > 
  > Đầu tiên, em xin chạy test ở trạng thái logic gốc hiện tại:"*

* **Thao tác Terminal:**
  ```bash
  python manage.py test procurement.test_gov01_gov02.Gov01Gov02AutomatedTests.test_tc_gov01_002_prevent_bypass_and_verify_bug_sec_01 -v 2
  ```

* **Chỉ vào màn hình:**
  > 🎙️ *"Thầy/Cô thấy rõ: Test chạy qua 4 kịch bản bypass và kết thúc với kết quả **`ok` (PASS) trong 0.037 giây**."*

---

### BƯỚC 2: PHASE B — CỐ TÌNH TẠO LỖI CÓ KIỂM SOÁT (CONTROLLED RED) (~1.5 phút)

* **Lời thoại người trình bày:**
  > 🎙️ *"Bây giờ, em xin đặt mình vào vị trí một lập trình viên bất cẩn. Em sẽ tạo một **lỗi đột biến (Mutation) tối thiểu** trong logic backend: Em tạm thời vô hiệu hóa guard kiểm tra No Self-Approval bằng cách thêm điều kiện `False and ...` tại file xử lý `views.py`.
  > 
  > Em xin nhấn mạnh: **Mã nguồn test được giữ nguyên 100%, không hề thay đổi assertion hay expected result.**"*

* **Thao tác trên màn hình (hoặc script):**
  - Mở file `views.py:91`, chỉ vào dòng:
    ```python
    # Sửa tạm thời:
    if False and new_status == 'approved' and pr.status != 'approved':
    ```
  - Chạy lại lệnh test trên Terminal:
    ```bash
    python manage.py test procurement.test_gov01_gov02.Gov01Gov02AutomatedTests.test_tc_gov01_002_prevent_bypass_and_verify_bug_sec_01 -v 2
    ```

* **Chỉ vào màn hình:**
  > 🎙️ *"Thầy/Cô có thể thấy kết quả ngay lập tức: **`FAIL` (Đỏ)!**
  > 
  > Hãy nhìn vào chi tiết lỗi:
  > ```text
  > self.assertEqual(resp_session.status_code, 403)
  > AssertionError: 200 != 403
  > ```
  > Khi chốt chặn bị tắt, server trả về mã `HTTP 200` thay vì mã cấm `HTTP 403`. Bài test lập tức bắt trọn lỗi này với vi phạm assertion nghiệp vụ. Điều này khẳng định bài test thực sự kiểm tra logic nghiệp vụ chứ không phải 'chạy cho có'!"*

---

### BƯỚC 3: PHASE C — KHÔI PHỤC LOGIC CHUẨN (RESTORE TO GREEN) (~1 phút)

* **Lời thoại người trình bày:**
  > 🎙️ *"Sau khi phát hiện lỗi, lập trình viên khôi phục lại chốt chặn bảo mật về đúng nguyên trạng ban đầu."*

* **Thao tác:**
  - Khôi phục dòng code `views.py:91` bỏ `False and`.
  - Chạy lại lệnh test:
    ```bash
    python manage.py test procurement.test_gov01_gov02.Gov01Gov02AutomatedTests.test_tc_gov01_002_prevent_bypass_and_verify_bug_sec_01 -v 2
    ```

* **Chỉ vào màn hình:**
  > 🎙️ *"Màn hình lập tức quay trở lại trạng thái **`ok` (GREEN)**, hoàn thành chỉ trong 0.036 giây!"*

---

### BƯỚC 4: PHASE D — KIỂM THỬ HỒI QUY TOÀN BỘ HỆ THỐNG (REGRESSION) (~1 phút)

* **Lời thoại người trình bày:**
  > 🎙️ *"Và cuối cùng, một nguyên tắc bất di bất dịch của QA là: Sau mỗi lần sửa đổi mã nguồn, chúng ta bắt buộc phải chạy **kiểm thử hồi quy toàn diện (Full Regression Testing)** để đảm bảo sự thay đổi không làm gãy đổ bất kỳ tính năng nào khác của 10 User Stories.
  > 
  > Em xin chạy toàn bộ 53 bài kiểm thử của toàn bộ hệ thống:"*

* **Thao tác Terminal:**
  ```bash
  python manage.py test -v 2
  ```

* **Chỉ vào màn hình kết quả:**
  > 🎙️ *"Thầy/Cô có thể quan sát kết quả thực tế trên màn hình:
  > - **Ran 53 tests in 0.299s — OK!**
  > - Toàn bộ **53/53 bài kiểm thử** bao phủ từ tạo PR, duyệt ngân sách, bóc tách AI, so sánh báo giá, phát hành PO, nhận hàng và đối soát 3-Way Matching đều đạt **PASS 100%**.
  > - Tỷ lệ lỗi hồi quy là **Zero Regression (0%)**!"*

---

## 3. Bảng Dự Phòng Câu Hỏi Phản Biện Của Giảng Viên (Q&A Defense)

| Câu hỏi của Giảng viên | Câu trả lời chuẩn xác của sinh viên |
| :--- | :--- |
| *Tại sao test chạy nhanh như vậy (chỉ ~0.3s cho 53 test)? Liệu có thật sự kiểm tra cơ sở dữ liệu không?* | "Thưa Thầy/Cô, Django test runner sử dụng cơ sở dữ liệu SQLite in-memory (`file:memorydb_default?mode=memory&cache=shared`). Mọi bảng, ràng buộc khóa ngoại, migration và transaction đều được thực thi thật 100% trên RAM, đảm bảo vừa toàn vẹn dữ liệu vừa tối ưu tốc độ CI/CD." |
| *Lỗi Phase B có làm ảnh hưởng đến dữ liệu đang chạy demo web không?* | "Thưa Thầy/Cô là hoàn toàn không. Chúng em thực hiện thao tác trong môi trường cô lập, và Django test suite chạy trên database riêng trong RAM, hoàn toàn không chạm vào file dữ liệu `db.sqlite3` của máy chủ demo web." |
