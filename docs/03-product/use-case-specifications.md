# BỘ ĐẶC TẢ CHI TIẾT USE CASE (USE CASE SPECIFICATION)
## HỆ THỐNG MUA SẮM & PHÊ DUYỆT THÔNG MINH - PROCUREAI PLATFORM

> **Hệ thống:** ProcureAI - Intelligent Internal Procurement & Approval Platform  
> **Phiên bản:** v1.0.0-final  
> **Trạng thái:** Confirmed & Fully Implemented  

---

## 📋 NGUYÊN TẮC QUY TRÌNH & THÀNH PHẦN HỆ THỐNG

### 1. Luồng xử lý nghiệp vụ chuẩn (Critical Workflow)
```text
Purchase Request (Tạo & AI Chuẩn hóa) 
   └─► Phê duyệt (Manager / Finance) 
         └─► Collect Quotations (Thu thập báo giá) 
               └─► Compare Quotations (AI hỗ trợ so sánh & Cảnh báo) 
                     └─► Chọn Supplier & Tạo PO 
                           └─► Receiving (Ghi nhận giao hàng) 
                                 └─► Close (Đóng PR & Đối soát 3 bên)
```

### 2. Danh sách 5 Vai trò phân quyền (RBAC Roles)
1. **Employee (Nhân viên yêu cầu):** Tạo PR, nhận gợi ý AI, theo dõi tiến độ công việc.
2. **Manager (Quản lý trực tiếp):** Phê duyệt/Từ chối PR phòng ban, duyệt chuyển Finance (Bắt buộc quy tắc *No Self-Approval*).
3. **Finance (Tài chính / Kế toán):** Kiểm tra ngân sách khả dụng, duyệt PR $> 50$ triệu VNĐ hoặc vượt budget, hạch toán và Close PR.
4. **Procurement (Bộ phận Mua sắm):** Quản lý nhà cung cấp, thu thập báo giá, chạy AI bóc tách/so sánh báo giá, chọn Supplier và phát hành PO.
5. **Admin (Quản trị hệ thống):** Quản lý tài khoản, phân quyền RBAC, xem nhật ký vết Audit Trail.

---

## 📌 EPIC E-01: PURCHASE REQUEST (TẠO & QUẢN LÝ YÊU CẦU MUA SẮM)

### 🔹 UC-01: Tạo và AI Chuẩn hóa Purchase Request (US-01, US-03)
* **User Story:**
  * **US-01:** Là Employee, tôi muốn tạo PR với các trường bắt buộc để gửi yêu cầu hợp lệ.
  * **US-03:** Là Employee, tôi muốn review gợi ý AI để hoàn thiện mô tả PR.
* **Actor chính:** Employee, AI Assistant.
* **Tiền điều kiện:** Employee đã đăng nhập thành công vào hệ thống.
* **Input (Đầu vào):**
  * `title` *(String)*: Tiêu đề yêu cầu mua sắm.
  * `category` *(String)*: Danh mục sản phẩm/dịch vụ (VD: `IT Equipment`, `Office Supplies`).
  * `department_id` *(UUID)*: ID phòng ban yêu cầu.
  * `requester_id` *(UUID)*: ID người tạo.
  * `items` *(Array)*: Danh sách chi tiết các mặt hàng (`item_name`, `quantity`, `unit_price`).
  * `due_date` *(Date)* & Lý do mua sắm.
* **Main Flow (Luồng xử lý chính):**
  1. Employee truy cập trang *"Tạo Purchase Request"* và nhập thông tin thô của nhu cầu mua sắm.
  2. Employee nhấn *"AI Chuẩn hóa"* (hoặc hệ thống tự động gọi AI Standardizer).
  3. AI Assistant phân tích nội dung, đưa ra gợi ý chuẩn hóa danh mục (`category`), tên/thông số mặt hàng (`ai_normalized_notes`) và phát hiện các trường thông tin còn thiếu.
  4. Employee kiểm tra, chỉnh sửa hoặc chấp nhận các thông tin do AI gợi ý (*Human-in-the-loop*).
  5. Hệ thống kiểm tra điều kiện dữ liệu bắt buộc (Validation: tiêu đề, số lượng $\ge 1$, lý do, bộ phận).
  6. Employee nhấn **Submit PR**.
* **Output (Đầu ra):**
  * Bản ghi `PurchaseRequest` được tạo với `pr_number` tự sinh (VD: `PR-2026-001`), trạng thái `status = 'SUBMITTED'`.
  * Tự động tính tổng tiền dự kiến:
    $$\text{total\_estimated\_amount} = \sum (\text{quantity} \times \text{unit\_price})$$
  * Các bản ghi `PRItem` được lưu trong CSDL.
  * Cập nhật ngân sách tạm giữ: `Budget.reserved_amount` tăng thêm một khoản bằng `total_estimated_amount`.
  * Ghi bản ghi khởi tạo vào `AuditLog`.

---

### 🔹 UC-02: Theo dõi Tiến độ Purchase Request (US-02)
* **User Story:** Là Employee, tôi muốn theo dõi trạng thái PR để biết yêu cầu đang ở bước nào.
* **Actor chính:** Employee.
* **Tiền điều kiện:** PR đã được khởi tạo trong hệ thống.
* **Input (Đầu vào):**
  * `requester_id` *(UUID)* hoặc `department_id` *(UUID)* của người dùng.
  * Bộ lọc tìm kiếm: `pr_number`, `status`, khoảng thời gian tạo.
* **Main Flow (Luồng xử lý chính):**
  1. Employee truy cập danh sách PR cá nhân / phòng ban.
  2. Hệ thống truy vấn CSDL và hiển thị danh sách PR thỏa mãn điều kiện tìm kiếm.
  3. Employee chọn một PR cụ thể để xem chi tiết.
  4. Hệ thống hiển thị thanh tiến trình trực quan (Stepper UI) và chi tiết lịch sử xử lý.
* **Output (Đầu ra):**
  * Giao diện Stepper UI biểu diễn trạng thái hiện tại (`DRAFT` ➔ `SUBMITTED` ➔ `APPROVED` ➔ `QUOTATION_COLLECTED` ➔ `PO_CREATED` ➔ `RECEIVED` ➔ `CLOSED`).
  * Bảng `ApprovalHistory` hiển thị người duyệt, thời gian, hành động và lý do từ chối (nếu có).

---

## 📌 EPIC E-02: APPROVAL & BUDGET CONTROL (PHÊ DUYỆT & NGÂN SÁCH)

### 🔹 UC-03: Phê duyệt Purchase Request bởi Manager (US-04)
* **User Story:** Là Manager, tôi muốn xem PR và Budget trước khi quyết định.
* **Actor chính:** Manager.
* **Tiền điều kiện:** PR ở trạng thái `Manager Review`. Manager không phải là người tạo PR (*Quy tắc No Self-Approval*).
* **Input (Đầu vào):**
  * `pr_id` *(UUID)*: ID của PR cần duyệt.
  * `manager_id` *(UUID)*: ID của Manager thực hiện.
  * `action` *(Enum)*: Quyết định chọn (`APPROVE`, `REJECT`, `REQUEST_EDIT`, `TRANSFER_TO_FINANCE`).
  * `comments` / `rejection_reason` *(String)*: Lý do (bắt buộc khi Reject/Request Edit).
* **Main Flow (Luồng xử lý chính):**
  1. Manager mở danh sách PR cần duyệt và chọn PR để xem chi tiết kèm báo cáo ngân sách phòng ban.
  2. Manager chọn một trong các hành động xử lý:
     * **Approve:** Nếu trong hạn mức ngân sách phòng ban.
     * **Transfer to Finance:** Nếu cần kiểm tra ngân sách sâu hơn hoặc giá trị PR $> 50$ triệu VNĐ.
     * **Request Edit:** Nhập nội dung yêu cầu điều chỉnh.
     * **Reject:** Nhập lý do từ chối bắt buộc.
  3. Manager bấm **Xác nhận**.
* **Output (Đầu ra):**
  * Cập nhật trạng thái `PurchaseRequest.status`:
    * `APPROVE` ➔ `status = 'APPROVED'` (hoặc `QUOTATION_COLLECTED`).
    * `TRANSFER_TO_FINANCE` ➔ `requires_finance_approval = TRUE`.
    * `REJECT` ➔ `status = 'REJECTED'`. Đồng thời giải phóng ngân sách tạm giữ: `Budget.reserved_amount -= total_estimated_amount`.
    * `REQUEST_EDIT` ➔ `status = 'DRAFT'`.
  * Bản ghi mới được thêm vào `ApprovalHistory` và ghi vết `AuditLog`.

---

### 🔹 UC-04: Kiểm tra Ngân sách & Phê duyệt bởi Finance (US-05)
* **User Story:** Là Finance, tôi muốn kiểm tra PR với Budget để kiểm soát chi phí.
* **Actor chính:** Finance.
* **Tiền điều kiện:** PR ở trạng thái `Finance Review`.
* **Input (Đầu vào):**
  * `pr_id` *(UUID)*: ID của PR cần duyệt ngân sách.
  * `finance_user_id` *(UUID)*: ID người duyệt thuộc phòng Finance.
  * Dữ liệu ngân sách phòng ban (`Budget.allocated_amount`, `spent_amount`, `reserved_amount`).
  * `action` *(Enum)*: `APPROVE` hoặc `REJECT`.
* **Main Flow (Luồng xử lý chính):**
  1. Finance mở danh sách PR chờ duyệt ngân sách và bấm chọn PR.
  2. Hệ thống kiểm tra số liệu: Nếu `total_estimated_amount > (allocated_amount - spent_amount - reserved_amount)`, hệ thống hiển thị cảnh báo đỏ **"PR vượt ngân sách khả dụng"**.
  3. Finance xem xét chính sách tài chính và đưa ra quyết định (`APPROVE` hoặc `REJECT`).
  4. Finance bấm **Xác nhận**.
* **Output (Đầu ra):**
  * Cập nhật `PurchaseRequest.status = 'APPROVED'` (nếu duyệt) hoặc `'REJECTED'` (nếu từ chối).
  * Thêm bản ghi duyệt ngân sách vào `ApprovalHistory` và ghi vết `AuditLog`.

---

## 📌 EPIC E-03: SUPPLIER & QUOTATION (THU THẬP BÁO GIÁ)

### 🔹 UC-05: Thu thập & Liên kết Báo giá (US-06)
* **User Story:** Là Procurement, tôi muốn liên kết nhiều Quotation với PR để so sánh.
* **Actor chính:** Procurement.
* **Tiền điều kiện:** PR đã ở trạng thái được phê duyệt (`Quotation Collection`).
* **Input (Đầu vào):**
  * `pr_id` *(UUID)*: ID của PR đã duyệt.
  * `supplier_id` *(UUID)*: ID Nhà cung cấp tương ứng.
  * `file_url` *(String)*: File đính kèm báo giá (PDF/Excel).
  * Thông tin cơ bản: `total_amount`, `valid_until` (hạn báo giá).
* **Main Flow (Luồng xử lý chính):**
  1. Procurement mở PR đã duyệt và chọn tính năng *"Thêm báo giá mới"*.
  2. Procurement chọn/nhập Supplier, tải lên file báo giá gốc và nhập thông tin tổng quan.
  3. Hệ thống lưu tệp báo giá và thiết lập liên kết với PR.
  4. Procurement hoàn tất việc thu thập báo giá.
* **Output (Đầu ra):**
  * Các bản ghi `Quotation` mới được tạo trong CSDL gắn với `pr_id` và `supplier_id`.
  * Cập nhật `PurchaseRequest.status = 'QUOTATION_COLLECTED'`.
  * Hiển thị danh sách báo giá trên màn hình so sánh của PR.

---

## 📌 EPIC E-04: AI COMPARISON (SO SÁNH BÁO GIÁ & AI CẢNH BÁO)

### 🔹 UC-06: AI Trích xuất, So sánh Báo giá & Chọn Supplier (US-07)
* **User Story:** Là Procurement, tôi muốn review dữ liệu AI extraction để sửa lỗi trước khi chọn Supplier.
* **Actor chính:** Procurement, AI Assistant.
* **Tiền điều kiện:** PR đã có danh sách Quotation đính kèm (`Quotation Collection`).
* **Input (Đầu vào):**
  * Danh sách file/bản ghi `Quotation` thuộc `pr_id`.
  * Dữ liệu giá lịch sử sản phẩm (`PRItem.historical_avg_price`).
* **Main Flow (Luồng xử lý chính):**
  1. Procurement chọn tính năng *"Phân tích & So sánh Báo giá"*.
  2. AI Assistant bóc tách dữ liệu từ các file báo giá (đơn giá, số lượng, thời gian giao, bảo hành).
  3. AI Assistant kiểm tra giá lịch sử: Nếu đơn giá báo $\ge 1.2 \times \text{historical\_avg\_price}$ (cao hơn $\ge 20\%$) ➔ Gắn thẻ **Price Anomaly Warning** (Cảnh báo giá bất thường).
  4. AI Assistant tổng hợp Ma trận so sánh và gợi ý Nhà cung cấp tối ưu (**AI Recommendation**).
  5. Procurement kiểm tra dữ liệu trích xuất với file gốc, chỉnh sửa nếu AI bóc tách sai (*Human-in-the-loop*).
  6. Procurement chọn Supplier chiến thắng và bấm **Xác nhận chọn Supplier**.
* **Output (Đầu ra):**
  * Dữ liệu bóc tách được lưu dạng JSON trong `Quotation.ai_extracted_json`.
  * Cập nhật cờ `Quotation.is_selected = TRUE` cho báo giá của Supplier được chọn.
  * Cập nhật `PurchaseRequest.status = 'SUPPLIER_SELECTED'`.

---

## 📌 EPIC E-05: PURCHASE ORDER (ĐƠN ĐẶT HÀNG MUA)

### 🔹 UC-07: Khởi tạo Purchase Order (US-08)
* **User Story:** Là Procurement, tôi muốn tạo PO từ PR đã duyệt và Supplier đã chọn.
* **Actor chính:** Procurement.
* **Tiền điều kiện:** PR ở trạng thái `SUPPLIER_SELECTED`.
* **Input (Đầu vào):**
  * `pr_id` *(UUID)*: ID của PR đã duyệt & chọn Supplier.
  * `quotation_id` *(UUID)*: ID của Báo giá chiến thắng được chọn.
  * `procurement_user_id` *(UUID)*: ID người lập PO.
  * Ngày dự kiến giao hàng, điều khoản thanh toán.
* **Main Flow (Luồng xử lý chính):**
  1. Procurement chọn *"Tạo Purchase Order"*.
  2. Hệ thống tự động tổng hợp dữ liệu từ PR và Quotation được chọn để dựng bản nháp PO.
  3. Procurement kiểm tra lại các điều khoản đơn hàng và chọn **Issue PO** (Phát hành PO).
  4. Hệ thống sinh mã PO và gửi đơn đặt hàng.
* **Output (Đầu ra):**
  * Bản ghi `PurchaseOrder` mới được tạo với `po_number` tự sinh (VD: `PO-2026-001`), `status = 'ISSUED'`.
  * Cập nhật `PurchaseRequest.status = 'PO_CREATED'`.
  * File PO chính thức được khởi tạo và ghi log Audit.

---

## 📌 EPIC E-06: RECEIVING & CLOSE (NHẬN HÀNG & ĐÓNG YÊU CẦU)

### 🔹 UC-08: Ghi nhận Giao hàng - Receiving (US-09)
* **User Story:** Là người có quyền, tôi muốn ghi nhận Receiving và sai lệch thực tế.
* **Actor chính:** Storekeeper / Procurement / Employee.
* **Tiền điều kiện:** PO đã ở trạng thái phát hành (`PO Created`).
* **Input (Đầu vào):**
  * `po_id` *(UUID)*: ID đơn đặt hàng.
  * `received_by_id` *(UUID)*: ID người nhận hàng.
  * `received_quantity` *(Integer)*: Số lượng thực nhận.
  * `received_date` *(DATETIME)*: Ngày giờ nhận hàng.
  * `notes` *(String)*: Ghi chú tình trạng hàng hóa (hỏng hóc/thiếu hụt nếu có).
* **Main Flow (Luồng xử lý chính):**
  1. Người dùng chọn PO tương ứng và chọn **"Tạo biên bản nhận hàng" (Create Receiving Note)**.
  2. Nhập số lượng thực nhận, ngày nhận và kiểm tra hàng hóa.
  3. Hệ thống thực hiện Validation Rule (Quy tắc ASM-06): Tổng số lượng nhận tích lũy $\le$ Số lượng ghi trên PO.
  4. Người dùng bấm **Hoàn tất nhận hàng**.
* **Output (Đầu ra):**
  * Bản ghi `Receiving` mới được lưu với `status = 'FULL'` (nhận đủ) hoặc `'PARTIAL'` (nhận một phần).
  * Cập nhật `PurchaseOrder.status = 'FULFILLED'` nếu đã nhận đủ 100%.
  * Phát sinh cảnh báo `Receiving Exception` nếu có sai lệch số lượng/chất lượng.

---

### 🔹 UC-09: Đóng Purchase Request - Close PR (US-10)
* **User Story:** Là Finance, tôi muốn Close chỉ xảy ra sau khi Receiving hoàn tất.
* **Actor chính:** Finance / Người có thẩm quyền.
* **Tiền điều kiện:** Biên bản Receiving đã được xác nhận hoàn tất.
* **Input (Đầu vào):**
  * `pr_id` *(UUID)*: ID của PR cần đóng.
  * `user_id` *(UUID)*: ID người thực hiện đóng PR.
* **Main Flow (Luồng xử lý chính):**
  1. Finance mở PR và chọn **Close PR**.
  2. Hệ thống thực hiện kiểm tra đối soát 3 bên: `PR ↔ PO ↔ Receiving` (Nếu chưa nhận đủ hoặc chưa xử lý xong sai lệch ➔ Hệ thống chặn không cho Close).
  3. Nếu điều kiện đối soát hoàn toàn hợp lệ, hệ thống thực hiện chuyển trạng thái đóng.
* **Output (Đầu ra):**
  * Cập nhật `PurchaseRequest.status = 'CLOSED'`.
  * Cập nhật chính thức số liệu kế toán trong bảng `Budget`:
    * `spent_amount += PurchaseOrder.total_amount` (Ghi nhận chi tiêu thực tế).
    * `reserved_amount -= PurchaseRequest.total_estimated_amount` (Giải phóng khoản giữ chỗ).
  * Chuyển toàn bộ dữ liệu của PR sang chế độ Chỉ đọc (ReadOnly) và lưu bản ghi `AuditLog` kết thúc quy trình.

---

## 📌 EPIC E-07: GOVERNANCE, AUDIT, AUTHENTICATION & ACCOUNT MANAGEMENT

### 🔹 UC-10: Kiểm soát Phân quyền (RBAC) & Audit Trail
* **Actor chính:** System, Admin.
* **Scope:** Chạy ngầm / Xuyên suốt toàn bộ hệ thống.
* **Input (Đầu vào):**
  * Thông tin User Session (`user_id`, `role`).
  * Mọi sự kiện tác động dữ liệu: Tạo, Sửa, Duyệt, Upload, Chọn Supplier, Chỉnh sửa gợi ý AI, Close.
* **Main Flow (Luồng xử lý chính):**
  1. Khi người dùng thực hiện bất kỳ hành động nào, hệ thống đối chiếu `role` với bảng phân quyền RBAC (5 vai trò: `EMPLOYEE`, `MANAGER`, `PROCUREMENT`, `FINANCE`, `ADMIN`).
  2. Hệ thống áp dụng quy tắc kiểm soát bắt buộc: **No Self-Approval** (Tự động chặn nếu người duyệt chính là người tạo PR).
  3. Khi thao tác hợp lệ và thành công, hệ thống tự động trích xuất metadata của sự kiện và lưu vào nhật ký hệ thống.
* **Output (Đầu ra):**
  * Cho phép thực thi hoặc từ chối hành động kèm thông báo lỗi phân quyền.
  * Bản ghi `AuditLog` mới chứa đầy đủ: `timestamp`, `user_id`, `action`, `entity_name`, `entity_id`, `old_value`, `new_value`, `ip_address`.

---

### 🔹 UC-11: Đăng nhập Hệ thống (User Login)
* **User Story:** Là người dùng hệ thống, tôi muốn đăng nhập bằng tài khoản và mật khẩu của mình để truy cập các chức năng tương ứng với vai trò (RBAC).
* **Actor chính:** User (Employee, Manager, Procurement, Finance, Admin).
* **Tiền điều kiện:** Tài khoản người dùng đã được khởi tạo trong CSDL và đang ở trạng thái hoạt động (`is_active = True`).
* **Input (Đầu vào):**
  * `username` *(String)*: Tên đăng nhập hoặc Email.
  * `password` *(String)*: Mật khẩu xác thực.
* **Main Flow (Luồng xử lý chính):**
  1. Người dùng truy cập trang Đăng nhập (`/login/`).
  2. Nhập `username` và `password`, sau đó bấm nút **"Đăng Nhập Hệ Thống"**.
  3. Hệ thống thực hiện xác thực thông tin tài khoản (Authentication):
     * Kiểm tra sự tồn tại của `username`.
     * Đối chiếu mật khẩu mã hóa (Django Password Hasher / Bcrypt).
     * Kiểm tra trạng thái tài khoản (`is_active`).
  4. Nếu thông tin đăng nhập chính xác, hệ thống khởi tạo Session đăng nhập, thiết lập thông tin vai trò (`role`) và ngôn ngữ ưu tiên (`language`) trong Session.
  5. Hệ thống điều hướng người dùng tới **Bảng Điều Khiển (Dashboard)** tương ứng với vai trò của họ.
* **Output (Đầu ra):**
  * Session đăng nhập hợp lệ được khởi tạo (`request.user` được xác thực).
  * Cập nhật nhật ký đăng nhập và thời gian `last_login`.
  * Điều hướng thành công tới `/dashboard/`.
  * Thêm bản ghi sự kiện *"Đăng nhập thành công"* vào `AuditLog`.

---

### 🔹 UC-12: Đăng xuất Hệ thống (User Logout)
* **User Story:** Là người dùng đang đăng nhập, tôi muốn đăng xuất khỏi hệ thống để bảo vệ an toàn tài khoản.
* **Actor chính:** User đã đăng nhập.
* **Tiền điều kiện:** Người dùng đang ở trong phiên làm việc (Authenticated Session).
* **Input (Đầu vào):**
  * `user_id` *(UUID)*: ID của người dùng hiện tại trong Session.
  * Yêu cầu Đăng xuất (bấm nút *"Đăng Xuất"* trên thanh Header).
* **Main Flow (Luồng xử lý chính):**
  1. Người dùng nhấn nút **"Đăng Xuất"** trên giao diện thanh điều hướng Header.
  2. Hệ thống thực hiện hủy phiên làm việc hiện tại (Session destruction / flush).
  3. Hệ thống xóa toàn bộ dữ liệu xác thực lưu trữ trên Session của người dùng.
  4. Hệ thống điều hướng người dùng quay trở lại trang Đăng nhập (`/login/`) kèm thông báo *"Bạn đã đăng xuất khỏi hệ thống"*.
* **Output (Đầu ra):**
  * Session người dùng bị hủy hoàn toàn.
  * Điều hướng tới trang `/login/`.
  * Thêm bản ghi sự kiện *"Đăng xuất"* vào `AuditLog`.

---

### 🔹 UC-13: Quản lý Tài khoản & Phân quyền Người dùng (Account & Role Management)
* **User Story:** Là Admin, tôi muốn xem danh sách, khởi tạo, cập nhật thông tin và phân quyền (RBAC) cho người dùng để kiểm soát quyền truy cập hệ thống.
* **Actor chính:** Admin.
* **Tiền điều kiện:** Admin đã đăng nhập thành công vào hệ thống với vai trò `role = 'ADMIN'`.
* **Input (Đầu vào):**
  * `username` *(String)*: Tên đăng nhập duy nhất của người dùng.
  * `email` *(String)*: Địa chỉ email công vụ (`unique`).
  * `full_name` *(String)*: Họ và tên đầy đủ của nhân viên.
  * `role` *(Enum)*: Vai trò phân quyền hệ thống (`EMPLOYEE`, `MANAGER`, `PROCUREMENT`, `FINANCE`, `ADMIN`).
  * `department_id` *(UUID/ID)*: ID phòng ban công tác (`IT`, `HR`, `FIN`, `PRO`).
  * `is_active` *(Boolean)*: Trạng thái tài khoản (`True` = Hoạt động, `False` = Khóa).
  * `password` / `new_password` *(String)*: Mật khẩu khởi tạo hoặc mật khẩu mới khi đặt lại.
* **Main Flow (Luồng xử lý chính):**
  1. **Admin** truy cập vào mục *"Quản lý Tài khoản"* (`/users/`).
  2. **Hệ thống** hiển thị bảng danh sách tất cả tài khoản người dùng trong doanh nghiệp kèm theo các thông tin: Tên đăng nhập, Họ tên, Email, Phòng ban, Vai trò hiện tại và Trạng thái.
  3. **Admin** chọn một trong các thao tác nghiệp vụ:
     * **Tạo tài khoản mới:** Admin bấm **"Tạo Tài Khoản Mới"**, nhập `username`, `email`, `full_name`, chọn `role`, gán `department`, nhập `password` ban đầu và chọn `is_active`.
     * **Cập nhật thông tin & Phân quyền (RBAC):** Admin bấm **"Sửa / Phân Quyền"**, thay đổi vai trò `role`, cập nhật phòng ban hoặc thông tin cá nhân.
     * **Khóa hoặc Mở khóa tài khoản:** Admin điều chỉnh cờ `is_active` để vô hiệu hóa hoặc kích hoạt lại quyền truy cập.
     * **Đặt lại mật khẩu (Reset Password):** Admin nhập mật khẩu mới để cấp lại quyền cho người dùng khi có sự cố.
  4. **Hệ thống** kiểm tra Validation (`username` và `email` không trùng lặp, thông tin vai trò/phòng ban hợp lệ).
  5. **Admin** nhấn **"Lưu Thông Tin Tài Khoản"**.
* **Output (Đầu ra):**
  * Bản ghi trong bảng `User` được lưu mới hoặc cập nhật thông tin trong cơ sở dữ liệu.
  * Quyền hạn vai trò mới (`role`) có hiệu lực ngay lập tức ở phiên làm việc tiếp theo.
  * Hệ thống hiển thị thông báo thành công và điều hướng về trang danh sách tài khoản `/users/`.
  * Tự động ghi bản ghi nhật ký vết vào `AuditLog` (chứa Admin thực hiện, ID tài khoản bị tác động, vai trò cũ và mới).
