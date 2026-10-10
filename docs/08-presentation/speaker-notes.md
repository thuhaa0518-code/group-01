# Ghi Chú Phối Hợp Trình Diễn Trực Tiếp (Live Demo & Screen Cue Notes) — ProcureAI
> **HÌNH THỨC THỰC HIỆN:** **TRÌNH DIỄN TRỰC TIẾP TRÊN PHẦN MỀM THẬT & MÃ NGUỒN (KHÔNG SỬ DỤNG SLIDE)**  
> **Dự án:** ProcureAI — Nền tảng Quản lý Mua sắm & Phê duyệt Nội bộ Thông minh  
> **Tài liệu:** Bảng điều phối màn hình, phân bổ thời gian và tín hiệu chuyển giao (Cues) giữa 5 thành viên  
> **Tổng thời lượng:** 12 – 15 phút trình diễn + 10 phút Vấn đáp Hội đồng

---

## 1. BẢNG PHÂN BỔ THỜI GIAN & ĐIỀU PHỐI MÀN HÌNH

| Chặng | Thời lượng | Người trình bày & Vai trò | User Story | Màn hình phần mềm hiển thị | Hành vi thao tác trực tiếp (Live Action) |
| :---: | :---: | :--- | :---: | :--- | :--- |
| **1** | **2.5 phút** | **Trần Thị Kiều Giang**<br/>*(Frontend Lead)* | `US-01` | Trình duyệt Web (`/requests/new`)<br/>Tài khoản `u-nam` | • Cố tình bấm Submit khi thiếu trường $\rightarrow$ Hiện lỗi đỏ.<br/>• Chọn danh mục IT $\rightarrow$ Widget ngân sách `BGT-IT-2026` hiện số dư. |
| **2** | **3.0 phút** | **Nguyễn Trúc Lam**<br/>*(AI Specialist)* | `US-03`<br/>`US-07` | Trình duyệt (AI Prompt & Báo giá)<br/>+ VS Code (`gemini_service.py`) | • Gõ prompt văn bản tự do $\rightarrow$ Bấm AI bóc tách JSON.<br/>• Mở VS Code chỉ code Heuristic Regex Fallback.<br/>• Mở bảng so sánh báo giá, chỉ cảnh báo lệch $\ge 20\%$. |
| **3** | **3.0 phút** | **Nguyễn Trương Thùy Dương**<br/>*(BA / Product Owner)* | `US-04`<br/>`US-05`<br/>`US-06` | Trình duyệt Web<br/>Đổi vai: `u-vietanh` $\rightarrow$ `u-lan` $\rightarrow$ `u-huong` | • Manager xem hạn mức phòng ban $\rightarrow$ Duyệt PR $> 50M$ tự sang Finance.<br/>• Finance thẩm định số dư ngân sách $\rightarrow$ Chấp thuận.<br/>• Procurement nạp đồng thời 2 báo giá cạnh tranh. |
| **4** | **3.5 phút** | **Nguyễn Thị Thùy Dung**<br/>*(Backend Lead)* | `US-02`<br/>`US-08`<br/>`US-09`<br/>`GOV-01` | Trình duyệt (`u-huong`, `u-tuan`)<br/>+ **Terminal / Postman (Tấn công)**<br/>+ VS Code (`views.py`) | • Tạo PO-2026-0001 từ báo giá đã duyệt.<br/>• Kho tạo biên bản nhận hàng có sai lệch.<br/>• **Gửi request tự duyệt PR $\rightarrow$ Server chặn HTTP 403 `SELF_APPROVAL_FORBIDDEN`**.<br/>• Mở VS Code chỉ hàm chặn Actor ID ở backend. |
| **5** | **3.5 phút** | **Trần Thị Thu Hà**<br/>*(Senior QA Lead)* | `US-10`<br/>`GOV-02`<br/>Tổng kết QA | Trình duyệt (3-Way Match & Audit)<br/>+ **Terminal Console (Test Suite)** | • Đối soát 3 bên PR-PO-Kho $\rightarrow$ Đóng đơn thành công.<br/>• Mở Audit Trail chỉ toàn bộ vết thao tác vừa diễn ra.<br/>• **Gõ chạy `python manage.py test -v 2` $\rightarrow$ Hiện 53/53 tests PASS trong 0.27s**.<br/>• Báo cáo trung thực về bản build và nghiệm thu hệ thống. |

---

## 2. KỊCH BẢN CHUYỂN GIAO TÍN HIỆU (HANDOVER CUES) GIỮA CÁC THÀNH VIÊN

### Từ Chặng 1 sang Chặng 2 (Kiều Giang $\rightarrow$ Trúc Lam)
* **Hành động kết thúc của Kiều Giang:** Dừng lại tại ô nhập liệu Form PR, trỏ chuột vào nút "AI Assistant".
* **Câu thoại chuyển giao (Cue):**  
  > 🎙️ *"Như Thầy/Cô thấy, form đã được kiểm soát dữ liệu rất chặt chẽ. Nhưng để tối ưu hóa thời gian cho nhân viên, nhóm em đã tích hợp trợ lý AI thông minh để tự động điền form chỉ bằng một câu nói. Sau đây, em xin chuyển quyền điều khiển và micro cho bạn **Nguyễn Trúc Lam** — phụ trách giải pháp AI của nhóm!"*

### Từ Chặng 2 sang Chặng 3 (Trúc Lam $\rightarrow$ Thùy Dương)
* **Hành động kết thúc của Trúc Lam:** Nhấn xác nhận hoàn tất form PR, mở màn hình danh sách PR ở trạng thái `pending_manager`.
* **Câu thoại chuyển giao (Cue):**  
  > 🎙️ *"Yêu cầu mua sắm sau khi được AI chuẩn hóa đã sẵn sàng để trình duyệt. Nhưng làm sao để người quản lý phê duyệt không phải là 'ký mù'? Em xin kính mời bạn **Nguyễn Trương Thùy Dương** — Product Owner của nhóm — đăng nhập tài khoản Quản lý để trình bày quy trình phê duyệt gắn liền ngân sách thời gian thực!"*

### Từ Chặng 3 sang Chặng 4 (Thùy Dương $\rightarrow$ Thùy Dung)
* **Hành động kết thúc của Thùy Dương:** Chọn xong báo giá trúng thầu và chuyển sang trạng thái sẵn sàng phát hành đơn đặt hàng.
* **Câu thoại chuyển giao (Cue):**  
  > 🎙️ *"Sau khi báo giá tối ưu được lựa chọn, đơn hàng sẽ được phát hành và kiểm soát chặt chẽ ở tầng Backend máy chủ. Em xin chuyển giao cho bạn **Nguyễn Thị Thùy Dung** — Backend Lead của dự án — trình bày về quy trình phát hành PO, nhận hàng và cơ chế bảo mật then chốt của hệ thống!"*

### Từ Chặng 4 sang Chặng 5 (Thùy Dung $\rightarrow$ Thu Hà)
* **Hành động kết thúc của Thùy Dung:** Kết thúc màn thử nghiệm tấn công bảo mật trên Terminal/Postman với mã lỗi `HTTP 403 Forbidden`.
* **Câu thoại chuyển giao (Cue):**  
  > 🎙️ *"Lỗ hổng tự duyệt đã được bảo vệ tuyệt đối ở tầng API máy chủ. Khi hàng hóa đã về kho đầy đủ, quy trình sẽ bước sang khâu đối soát tài chính cuối cùng. Em xin kính mời bạn **Trần Thị Thu Hà** — Senior QA Lead của dự án — thực hiện đối soát 3-Way Matching và chạy bộ kiểm thử toàn diện trước Hội đồng!"*

---

## 3. QUY TẮC PHỐI HỢP KỸ THUẬT & PHÒNG NGỪA RỦI RO TRÊN SÂN KHẤU (LIVE CONTINGENCY)

### Quy tắc Điều phối Thiết bị
1. **Một máy tính chủ điều khiển chiếu lên màn chiếu lớn:**
   - Cửa sổ 1 (Trình duyệt): Mở sẵn `http://127.0.0.1:8000/` với thanh Switch Role ở góc trên cùng.
   - Cửa sổ 2 (VS Code): Mở sẵn các file quan trọng: [`views.py`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/views.py), [`gemini_service.py`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/gemini_service.py), [`test_gov01_gov02.py`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/test_gov01_gov02.py).
   - Cửa sổ 3 (Terminal): Mở sẵn thư mục gốc dự án, sẵn sàng gõ lệnh test và xem log server.
2. **Thao tác liền mạch:** Thành viên đứng thuyết trình có thể tự thao tác chuột/phím hoặc phân công một bạn trợ lý bấm máy (Operator), người nói chỉ cần dùng laser pointer hoặc trỏ chuột vào vị trí tương ứng.

### Kế hoạch Dự phòng Khi Gặp Sự Cố (Fallback Protocols)

| Sự cố phát sinh | Nguyên nhân | Phương án xử lý ngay lập tức |
| :--- | :--- | :--- |
| **API Gemini bị trễ hoặc mất mạng** | Mạng phòng hội trường yếu hoặc vượt quota | Trúc Lam chuyển ngay sang trình diễn **Heuristic NLP Fallback Engine**: *"Thưa Thầy/Cô, đúng như thiết kế chịu lỗi của nhóm, khi mạng ngoài mất kết nối, hệ thống lập tức tự kích hoạt Regex Fallback nội bộ vẫn trích xuất chính xác 100%!"* |
| **Asset giao diện báo 404 sau khi git pull** | Bundle cũ chưa được compile đồng bộ | Chạy sẵn lệnh `npm run build` trong thư mục `FE` trước giờ bảo vệ. Nếu cần, mở Terminal chạy lại `npm run build` (khoảng 30 giây). |
| **Server Django bị ngắt đột ngột** | Tiến trình tắt ngoài ý muốn | Bật lại ngay bằng lệnh: `python manage.py runserver 127.0.0.1:8000 --noreload` (dữ liệu trong `db.sqlite3` được bảo toàn nguyên vẹn). |
| **Lỗi thao tác dữ liệu trùng lặp** | Mã PR hoặc PO đã tồn tại | Sử dụng danh sách mã mới được chuẩn bị sẵn: `PR-2026-DEMO`, `PO-2026-DEMO` hoặc xóa dữ liệu test bằng lệnh reset cục bộ. |
