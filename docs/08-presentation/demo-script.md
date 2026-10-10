# Kịch Bản Trình Diễn Trực Tiếp (Live Demo Script) — ProcureAI

> **Dự án:** ProcureAI — Internal Procurement & Approval Platform  
> **Tài liệu:** Kịch bản Demo Chi tiết từng bước, Dữ liệu chuẩn bị & Phương án dự phòng  
> **Thời lượng demo:** 8 – 10 phút  
> **Người thực hiện demo:** Demo Operator (Nguyễn Văn Nam / Thành viên nhóm)  
> **URL máy chủ demo:** `http://127.0.0.1:8000/`  

---

## 1. Điều Kiện Tiên Quyết Trước Khi Demo (Pre-Demo Setup)

### Bước 1: Khắc phục đồng bộ Asset Frontend (Giải quyết phát hiện QA-12A)
Trước khi mở trình duyệt, Demo Operator cần chạy một lệnh build để đồng bộ mã nguồn Frontend vào `FE/dist/assets/`:
```powershell
# Chạy tại thư mục FE:
cd d:\LTUD\group-01 - LTUDDN\FE
npm run build
cd ..
```
*Lưu ý:* Thao tác này sinh lại file bundle mới tương thích 100% với `FE/dist/index.html`, loại bỏ nguy cơ gặp lỗi 404 script đã được cảnh báo trong báo cáo QA-12A.

### Bước 2: Khởi động Máy chủ Backend & Web Server
```powershell
# Tại thư mục gốc dự án:
python manage.py runserver 127.0.0.1:8000
```
Kiểm tra dòng thông báo: `Starting development server at http://127.0.0.1:8000/`.

### Bước 3: Mở trình duyệt Web
Mở Google Chrome hoặc Microsoft Edge ở chế độ cửa sổ đầy đủ (Full screen / F11), truy cập:
👉 **`http://127.0.0.1:8000/`**

---

## 2. Bảng Dữ Liệu Tài Khoản Phục Vụ Demo

| STT | Vai trò | Username | Password | Tên người dùng | Phòng ban | Trách nhiệm trong Demo |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Nhân viên (Employee)** | `u-nam` | `123` | Nguyễn Văn Nam | Phòng CNTT | Tạo PR, nhờ AI chuẩn hóa, nhận hàng |
| 2 | **Trưởng phòng (Manager)** | `u-vietanh` | `123` | Trần Việt Anh | Phòng CNTT | Kiểm tra ngân sách phòng, phê duyệt PR |
| 3 | **Chuyên viên Mua sắm (Procurement)** | `u-lan` | `123` | Lê Thị Lan | Phòng Thu mua | Nhập báo giá, so sánh AI, tạo PO |
| 4 | **Kế toán (Finance)** | `u-huong` | `123` | Phạm Mai Hương | Phòng Tài chính | Duyệt vượt ngân sách, đối soát 3 chiều, đóng PO |
| 5 | **Quản trị viên (Admin)** | `u-tuan` | `123` | Vũ Đức Tuấn | Ban Quản trị | Xem toàn cảnh Audit Log hệ thống |

---

## 3. Kịch Bản Thao Tác Chi Tiết 6 Bước (Step-by-Step Flow)

### Kịch bản 1: Đăng nhập & Tạo Yêu cầu Mua sắm thông minh với AI (Actor: `u-nam`)
* **Thời gian:** 2 phút
* **Thao tác:**
  1. Tại màn hình Đăng nhập / Chọn vai trò, chọn tài khoản **Nguyễn Văn Nam (Employee)**.
  2. Bấm nút **"+ Tạo yêu cầu mua sắm"** (New Request).
  3. Tại khung nhập nhanh ngôn ngữ tự nhiên (AI Prompt Bar), gõ dòng chữ sau:
     > *"Cần mua gấp 02 Màn hình chuyên đồ họa Dell UltraSharp 27 inch 4K cho dự án thiết kế, cần giao trước ngày 25/11/2026 tại Tầng 4 Keangnam."*
  4. Bấm nút **"Phân tích với AI"** (Magic Wand icon).
  5. **Quan sát kết quả:** Trợ lý Gemini AI tự động điền:
     - Tên sản phẩm: *Màn hình Dell UltraSharp 27 inch 4K*
     - Số lượng: *2* | Đơn vị: *cái*
     - Ngày cần hàng: *2026-11-25*
     - Địa điểm giao hàng: *Tầng 4 Keangnam*
     - Mã ngân sách tự chọn: *`BGT-IT-2026` (Ngân sách Thiết bị CNTT 2026)*
  6. Hệ thống hiển thị widget ngân sách: *Đã phân bổ 500.000.000 VNĐ - Còn khả dụng 450.000.000 VNĐ*.
  7. Bấm **"Gửi yêu cầu phê duyệt"** (Submit Request). Yêu cầu chuyển sang trạng thái `pending_manager`.

---

### Kịch bản 2: Trình Diễn Kiểm Chứng Bảo Mật "No Self-Approval" (Actor: `u-nam`)
* **Thời gian:** 1.5 phút
* **Mục đích:** Thuyết phục hội đồng về tính nghiêm ngặt của cơ chế kiểm soát gian lận (`BUG-0001` fix).
* **Thao tác:**
  1. Vẫn đang đăng nhập với tư cách nhân viên tạo PR (`u-nam`), bấm vào chi tiết PR vừa tạo.
  2. **Quan sát giao diện:** Nút "Phê duyệt" (Approve) hoàn toàn bị vô hiệu hóa hoặc ẩn đi đối với người tạo đề xuất.
  3. *(Tùy chọn chứng minh kỹ thuật nâng cao):* Bật DevTools (F12) Console, giải thích:
     > *"Nếu một kẻ tấn công cố tình giả lập request POST `/api/v1/sync/` để tự đổi trạng thái PR thành `approved`, máy chủ Django sẽ lập tức bắt được Actor ID trùng Requester ID và trả về mã lỗi HTTP 403 Forbidden kèm code `SELF_APPROVAL_FORBIDDEN`."*

---

### Kịch bản 3: Trưởng phòng Thẩm định & Phê duyệt Hợp lệ (Actor: `u-vietanh`)
* **Thời gian:** 1.5 phút
* **Thao tác:**
  1. Bấm nút chuyển đổi vai trò ở góc phải trên, chọn **Trần Việt Anh (Manager)**.
  2. Vào mục **"Chờ tôi phê duyệt"** (Pending Approvals). PR của `u-nam` lập tức xuất hiện ở đầu danh sách.
  3. Bấm xem chi tiết PR. Manager nhìn thấy: Mô tả mặt hàng, số dư ngân sách CNTT còn lại, lý do mua sắm.
  4. Bấm nút **"Phê duyệt"** (Approve) kèm lời nhắn: *"Đồng ý mua sắm phục vụ dự án mới"*.
  5. **Quan sát kết quả:** Trạng thái PR chuyển thành công sang **`approved`** (nếu dưới 50 triệu) và được tự động chuyển tiếp tới hàng đợi của bộ phận Mua sắm.

---

### Kịch bản 4: Chuyên viên Mua sắm Tiếp nhận & So sánh Báo giá bằng AI (Actor: `u-lan`)
* **Thời gian:** 2 phút
* **Thao tác:**
  1. Đổi vai trò sang **Lê Thị Lan (Procurement)**.
  2. Vào phân hệ **"Sourcing & Báo giá"**.
  3. Chọn PR vừa được duyệt. Bấm nạp báo giá từ các nhà cung cấp mẫu:
     - *Báo giá 1:* Công ty Phong Vũ (Đơn giá 14.500.000 VNĐ, bảo hành 36 tháng, giao hàng 3 ngày).
     - *Báo giá 2:* FPT Synnex (Đơn giá 15.200.000 VNĐ, bảo hành 24 tháng, giao hàng 1 ngày).
  4. Bấm nút **"Kích hoạt Phân tích & Đề xuất AI"**.
  5. **Quan sát kết quả:** Hệ thống vẽ ra ma trận so sánh trực quan, tính toán tổng chi phí sau thuế và highlight đề xuất: *"Phong Vũ có tổng giá rẻ hơn 1.4 triệu và bảo hành lâu hơn 12 tháng"*.
  6. Chọn nhà cung cấp **Phong Vũ** và bấm **"Chấp thuận báo giá"**.

---

### Kịch bản 5: Phát hành Đơn Hàng (PO) & Nghiệm Thu Nhận Hàng (Actor: `u-lan` & `u-nam`)
* **Thời gian:** 1.5 phút
* **Thao tác:**
  1. Với vai trò Procurement, bấm **"Khởi tạo Đơn Mua Hàng"** (Create Purchase Order). Hệ thống tự sinh mã `PO-2026-XXXX` từ báo giá đã chọn.
  2. Đổi vai trò sang **Nguyễn Văn Nam (Employee / Người nhận)**.
  3. Vào mục **"Nhận hàng"** (Receiving).
  4. Bấm **"Xác nhận nhận hàng"**: Chọn loại *Nhận đủ 100% (Full Delivery)*, tình trạng hàng hóa nguyên seal, kèm ghi chú *"Đã kiểm tra 02 màn hình hoạt động tốt"*.
  5. Bấm **"Lưu biên bản nhận hàng"**. Biên bản được liên kết tức thì với PO.

---

### Kịch bản 6: Đối Soát 3 Chiều & Đóng Đơn Hàng (Actor: `u-huong`)
* **Thời gian:** 1.5 phút
* **Thao tác:**
  1. Đổi vai trò sang **Phạm Mai Hương (Finance)**.
  2. Vào mục **"Đối soát & Thanh toán"** (3-Way Matching).
  3. Kế toán thấy bảng đối chiếu 3 chiều tự động:
     - Dữ liệu PR gốc (Yêu cầu 2 cái) $\equiv$ Dữ liệu PO (Đặt 2 cái) $\equiv$ Biên bản Nhận hàng (Thực nhận 2 cái).
  4. Hệ thống hiển thị huy hiệu xanh: **"3-Way Match Verified: 100% Khớp"**.
  5. Kế toán bấm **"Xác nhận thanh toán & Đóng đơn hàng"** (Close PO). Đơn hàng chính thức hoàn tất chu trình.
  6. Vào mục **Audit Log** để cho hội đồng thấy mọi bước thao tác từ đầu đến cuối đều được ghi nhận dấu vết thời gian và danh tính người thực hiện.

---

## 4. Phương Án Dự Phòng (Contingency & Fallback Plans)

Trong các buổi thuyết trình trực tiếp, sự cố kỹ thuật bất ngờ có thể xảy ra. Demo Operator cần nắm vững 3 kịch bản dự phòng sau:

### Tình huống 1: Mở trình duyệt bị lỗi trắng trang (Blank Screen do lỗi Asset 404)
* **Nguyên nhân:** File `FE/dist/index.html` gọi nhầm file JS chưa được build sau đợt git pull.
* **Cách xử lý trong 15 giây:**
  1. Mở PowerShell gõ ngay:
     ```powershell
     cd FE; npm run build; cd ..
     ```
  2. Nhấn `Ctrl + F5` (Hard Reload) trên trình duyệt. Ứng dụng sẽ hiển thị bình thường ngay lập tức.
* **Cách thuyết minh:** *"Kính thưa Thầy/Cô, do hệ thống vừa được kéo phiên bản cập nhật mới nhất từ Git, chúng em xin phép làm mới lại gói tài nguyên tĩnh trong 10 giây để nạp bundle mới nhất."*

### Tình huống 2: Mạng Internet tại phòng học mất kết nối (Không gọi được Gemini API)
* **Nguyên nhân:** Mất wifi hoặc mạng trường chặn cổng kết nối tới Google Generative AI.
* **Cách xử lý:** Không cần hoảng loạn! Hệ thống đã được tích hợp sẵn **Heuristic Fallback Engine** tại [`procurement/services.py`](file:///d:/LTUD/group-01%20-%20LTUDDN/procurement/services.py) và `FE/src/utils/aiStandardizer.ts`.
* **Cách thuyết minh:** *"Kính thưa Hội đồng, hệ thống của chúng em được thiết kế có khả năng chịu lỗi cao (Fault-tolerant). Ngay cả khi mất kết nối mạng ngoài, thuật toán phân tích Regex và NLP nội bộ vẫn tự động bóc tách được số lượng và ngày tháng để quy trình mua sắm không bao giờ bị đình trệ."*

### Tình huống 3: Server Django bị tắt hoặc lỗi cổng 8000
* **Cách xử lý:** Chạy lại lệnh dự phòng:
  ```powershell
  python manage.py runserver 127.0.0.1:8000
  ```
  Hoặc trình diễn trực tiếp qua kết quả kiểm thử tự động `python manage.py test -v 2` để chứng minh 53 tests nghiệp vụ trên backend vẫn chạy thông suốt.
