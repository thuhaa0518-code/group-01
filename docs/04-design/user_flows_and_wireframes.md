# 🗺️ ProcureAI - User Flows & Wireframe Specifications (Luồng Trải Nghiệm & Bố Cục Wireframe)

> **Dự án:** ProcureAI - AI-Assisted Procurement & Purchase Approval System  
> **Figma Source:** [Figma Design Prototype - Group 1 (Node: 0-1)](https://www.figma.com/design/Nc2pw0GQqNe3EzENakz79z/Group-1?node-id=0-1&p=f&t=FaKBsIFcslHisgTk-0)  
> **Quy trình chuẩn:** 7 Bước khép kín: `Request ➔ Approve ➔ Collect ➔ Compare ➔ PO ➔ Receive ➔ Close`  
> **Tài liệu liên quan:** [`figma_specifications.md`](./figma_specifications.md), [`ui_component_library.md`](./ui_component_library.md), [`design_tokens_and_styleguide.md`](./design_tokens_and_styleguide.md)

---

## 1. Sơ Đồ Quy Trình Tổng Thể (End-to-End Workflow Flowchart)

Hệ thống ProcureAI vận hành dựa trên sự phối hợp đồng bộ giữa **5 vai trò người dùng** và **Động cơ hỗ trợ AI**.

```mermaid
flowchart TD
    subgraph Employee["1. Employee (Nhân viên yêu cầu)"]
        A1[Đăng nhập] --> A2[Tạo yêu cầu mua sắm mới /requests/new]
        A2 --> A3[Nhập mô tả tự do & Click 'AI Restructure']
        A3 --> A4{Review gợi ý AI}
        A4 -->|Chấp nhận| A5[Điền form tự động]
        A4 -->|Bỏ qua / Sửa| A6[Nhập thủ công]
        A5 --> A7[Gửi yêu cầu - Submit PR]
        A6 --> A7
    end

    subgraph Manager["2. Manager (Quản lý trực tiếp)"]
        A7 --> B1[Hàng chờ phê duyệt /approvals]
        B1 --> B2[Xem chi tiết PR & Khung Budget]
        B2 --> B3{Quyết định của Quản lý}
        B3 -->|Đủ ngân sách: Approve| C1[Trạng thái: Approved]
        B3 -->|Cần chỉnh sửa| B4[Nhập lý do ➔ Trả về Employee]
        B4 --> A2
        B3 -->|Vượt ngân sách / Nghi ngờ| B5[Chuyển phòng Tài chính]
        B3 -->|Không hợp lệ: Reject| B6[Nhập lý do ➔ Từ chối PR]
    end

    subgraph Finance["3. Finance (Phòng Tài chính)"]
        B5 --> F1[Hàng chờ thẩm định /budget]
        F1 --> F2[Phân tích hạn mức ngân sách]
        F2 -->|Phê duyệt ngoại lệ| C1
        F2 -->|Từ chối cấp thêm| B6
    end

    subgraph Procurement["4. Procurement (Chuyên viên mua sắm)"]
        C1 --> P1[Hàng chờ Sourcing /sourcing]
        P1 --> P2[Tải lên Báo giá PDF/Excel của các NCC]
        P2 --> P3[AI OCR trích xuất dữ liệu tự động]
        P3 --> P4[Xác thực & So khớp dữ liệu (Split-view)]
        P4 --> P5[Xem Ma trận so sánh đa tiêu chí & Cảnh báo giá]
        P5 --> P6[Xem Đề xuất AI ➔ Chọn Nhà Cung Cấp]
        P6 --> P7[Phát hành Đơn đặt hàng - Issue PO]
    end

    subgraph Receiving["5. Warehouse / Receiving & Close"]
        P7 --> R1[Nhà cung cấp giao hàng đến kho]
        R1 --> R2[Ghi nhận biên bản nhận hàng GRN /receiving]
        R2 --> R3{Kiểm tra đối soát 3 bên}
        R3 -->|Sai lệch số lượng| R4[Lập biên bản bất thường - Exception]
        R4 --> R2
        R3 -->|Khớp 100% PR ⟷ PO ⟷ GRN| R5[Finance / Procurement bấm CLOSE PR]
        R5 --> R6[Lưu trữ hồ sơ & Ghi Audit Log toàn vẹn]
    end
```

---

## 2. Chi Tiết Luồng Tương Tác Theo Từng Vai Trò (Detailed Role User Flows)

### 2.1 Luồng 1: Nhân Viên Tạo Yêu Cầu (Employee Flow)

- **Mục tiêu:** Soạn thảo yêu cầu mua sắm nhanh chóng, chuẩn xác và đúng quy chuẩn với sự hỗ trợ của AI.
- **Các bước thao tác trên giao diện:**
  1. Người dùng đăng nhập hệ thống, được điều hướng về Landing page cá nhân: `/requests`.
  2. Bấm nút Primary `+ Tạo Yêu Cầu Mới` ➔ Chuyển sang `/requests/new`.
  3. **Tương tác với AI Standardizer:**
     - Người dùng gõ đoạn văn tự do vào ô *Ghi chú tự do (Free-text note)*:  
       *Ví dụ: "Cần mua gấp 3 chiếc laptop màn hình 15 inch cho lập trình viên mới vào team Frontend, ngân sách tầm 25 triệu/máy."*
     - Bấm nút `✨ Chuẩn hóa bằng AI`.
     - Panel AI bên phải chuyển trạng thái `Loading Shimmer` trong ~1.5 giây.
     - Panel hiển thị kết quả phân tích: Danh mục (Thiết bị IT), Thông số kỹ thuật đề xuất, Mã ngân sách gợi ý, Dự toán chi phí.
     - Người dùng bấm nút `Use this`: Toàn bộ các ô tương ứng bên cột form bên trái tự động được điền dữ liệu.
  4. Người dùng kiểm tra lại thông tin, điền ngày cần giao hàng (`Required-by Date`), đính kèm tài liệu nếu có.
  5. Bấm nút `Gửi yêu cầu (Submit PR)`: Hệ thống chuyển trạng thái PR thành `Pending Approval` và điều hướng về trang chi tiết `/requests/:id` kèm thông báo Toast màu xanh lá.

---

### 2.2 Luồng 2: Quản Lý Phê Duyệt (Manager Approval Flow)

- **Mục tiêu:** Xem xét tính hợp lý của yêu cầu, kiểm soát ngân sách phòng ban và đưa ra quyết định minh bạch.
- **Quy tắc bắt buộc:**
  - **No Self-Approval:** Nếu Quản lý chính là người tạo PR đó, các nút `Phê duyệt` và `Từ chối` sẽ tự động bị ẩn. Giao diện hiển thị Banner thông tin: *"Bạn là người tạo yêu cầu này nên không thể tự phê duyệt."*
- **Các bước thao tác trên giao diện:**
  1. Đăng nhập với quyền Manager ➔ Vào danh sách `/approvals`.
  2. Chọn một PR đang chờ duyệt ➔ Vào trang chi tiết `/approvals/:id`.
  3. Giao diện hiển thị hai phân vùng trực quan:
     - **Cột trái:** Nội dung PR chi tiết, bảng danh mục mặt hàng, lý do mua sắm.
     - **Cột phải:** Khung **Budget Visibility Panel** hiển thị ngân sách phòng ban:
       - Hạn mức được giao: `400.000.000 ₫`
       - Đã chi tiêu: `310.000.000 ₫`
       - Còn lại trước duyệt: `90.000.000 ₫`
       - Giá trị PR này: `75.000.000 ₫`
       - Dự kiến còn lại sau duyệt: `15.000.000 ₫` (Trạng thái: An toàn / Xanh lá).
  4. **Các lựa chọn quyết định:**
     - **Lựa chọn A (Phê duyệt):** Bấm nút xanh `Phê duyệt (Approve)`. Modal xác nhận hiện ra ➔ Bấm xác nhận ➔ PR chuyển thành `Approved`.
     - **Lựa chọn B (Yêu cầu chỉnh sửa):** Bấm nút `Yêu cầu chỉnh sửa` ➔ Modal bắt buộc nhập lý do (tối thiểu 10 ký tự) ➔ PR chuyển thành `Revision Requested`, quay lại cho Employee sửa.
     - **Lựa chọn C (Chuyển phòng Tài chính):** Bấm nút vàng `Chuyển Finance` ➔ Nhập ghi chú giải trình ➔ PR chuyển sang phân hệ của Finance.
     - **Lựa chọn D (Từ chối):** Bấm nút đỏ `Từ chối (Reject)` ➔ Bắt buộc nhập lý do từ chối ➔ PR kết thúc với trạng thái `Rejected`.

---

### 2.3 Luồng 3: Chuyên Viên Mua Sắm & Báo Giá (Procurement Sourcing Flow)

- **Mục tiêu:** Thu thập báo giá từ nhiều nhà cung cấp, kiểm tra đối soát OCR, so sánh ma trận và chọn NCC tối ưu.
- **Các bước thao tác trên giao diện:**
  1. Vào danh mục `/sourcing` ➔ Chọn PR đã được phê duyệt.
  2. **Tải lên báo giá (Quotation Upload):**
     - Kéo thả 3 file báo giá PDF/Excel từ các NCC A, NCC B, NCC C vào khu vực tải lên.
     - Hệ thống kích hoạt OCR trích xuất thông tin tự động.
  3. **Kiểm tra dữ liệu trích xuất (OCR Verification Split-Screen):**
     - Màn hình chia đôi: Nửa trái xem bản scan gốc, nửa phải là bảng số liệu có thể chỉnh sửa.
     - Người dùng rà soát đơn giá, thuế VAT, thời gian giao, ấn `Xác nhận dữ liệu`.
  4. **Ma trận so sánh & Đề xuất AI (Comparison Matrix):**
     - Chuyển sang tab `So sánh báo giá`.
     - Ma trận thể hiện song song 3 nhà cung cấp với các thông số trọng yếu.
     - **AI Recommendation:** Hệ thống làm nổi bật NCC B với đánh giá điểm tổng hợp cao nhất (giá cạnh tranh, giao hàng nhanh).
     - **Anomaly Alert:** Nếu phát hiện mặt hàng nào có giá chênh lệch **≥ 20%** so với trung bình lịch sử mua sắm, hệ thống hiển thị banner cảnh báo màu vàng/đỏ:  
       *Ví dụ: "Cảnh báo: Đơn giá màn hình tại NCC A cao hơn 22% so với giá mua trung bình quý trước (3.200.000 ₫ vs 2.620.000 ₫)."*
  5. **Chọn NCC & Phát hành PO:**
     - Chuyên viên bấm nút `Chọn Nhà Cung Cấp Này` tại cột của NCC B.
     - Nhập lý do lựa chọn (ghi vào Audit Log).
     - Bấm `Phát hành Đơn đặt hàng (Issue PO)`: Đơn hàng chính thức được tạo lập, gửi thông báo đến các bên.

---

### 2.4 Luồng 4: Giao Nhận Hàng & Đóng Hồ Sơ (Receiving & Closure Flow)

- **Mục tiêu:** Ghi nhận thực nhận hàng hóa tại kho và đối soát 3 bên trước khi tất toán hồ sơ.
- **Các bước thao tác:**
  1. Hàng được giao tới kho ➔ Thủ kho/Người phụ trách mở trang `/receiving/:poId`.
  2. Form ghi nhận hiển thị bảng hàng hóa:
     - Số lượng đặt trên PO.
     - Số lượng đã nhận các đợt trước.
     - Ô nhập: `Số lượng thực nhận đợt này` (Validation: Tổng nhận không được vượt quá số lượng đặt).
  3. Nếu hàng đủ và đạt chuẩn ➔ Trạng thái chuyển thành `Received`.
  4. Nếu thiếu hoặc hỏng ➔ Chọn trạng thái `Phát hiện sai lệch (Variance Exception)` kèm hình ảnh/biên bản đính kèm.
  5. **Đối Soát 3 Chiều (Three-Way Match Reconciliation):**
     - Tại giao diện `/receiving/:poId/match`, hệ thống tự động chạy thuật toán đối soát 3 bên:
       - **PR (Yêu cầu):** 10 máy tính x 25.000.000 ₫ = 250.000.000 ₫
       - **PO (Đơn hàng):** 10 máy tính x 25.000.000 ₫ = 250.000.000 ₫
       - **GRN (Thực nhận):** 10 máy tính đã nhập kho đủ
     - Khi cả 3 chứng từ khớp 100%: Nút `Đóng Hồ Sơ Mua Sắm (Close PR)` được kích hoạt.
     - Người có thẩm quyền bấm `Close PR` ➔ Hồ sơ hoàn tất, khóa chỉnh sửa vĩnh viễn.

---

## 3. Bản Vẽ Bố Cục Wireframe (Wireframe Schematics)

Dưới đây là sơ đồ cấu trúc trực quan (ASCII Art Wireframes) của các màn hình quan trọng nhất trong ứng dụng:

### 3.1 Wireframe: Màn Hình Tạo PR Mới (`/requests/new`)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  [ProcureAI Logo]   Dashboard   Requests(Active)   Approvals   Sourcing    [Bell] [User: Hai (EMP)]│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│  ← Quay lại danh sách yêu cầu                                                                   │
│  Tạo Yêu Cầu Mua Sắm Mới (New Purchase Request)                                                  │
├────────────────────────────────────────────────────────┬─────────────────────────────────────────┤
│  CỘT TRÁI: FORM NHẬP LIỆU CHÍNH (FORM INPUTS)          │  CỘT PHẢI: AI ASSISTANT & CHECKLIST    │
│                                                        │                                         │
│  Tiêu đề yêu cầu (*):                                  │  ┌────────────────────────────────────┐ │
│  [ Trang bị máy tính cho team Frontend Q1/2026       ] │  │ ✨ AI Restructure Assistant        │ │
│                                                        │  ├────────────────────────────────────┤ │
│  Phòng ban (*):               Mã ngân sách (*):        │  │ Nhập mô tả tự do của bạn:          │ │
│  [ Khối Công Nghệ Thông Tin ▼] [ BDG-IT-2026-Q1      ▼] │  │ [ Cần 3 laptop cấu hình mạnh cho ] │ │
│                                                        │  │ [ dev làm việc React/Node...     ] │ │
│  Mục đích kinh doanh (*):                              │  │                                    │ │
│  [ Đáp ứng nhân sự mới tuyển dụng dự án FinTech      ] │  │ [ ✨ Chuẩn hóa bằng AI ]           │ │
│                                                        │  │                                    │ │
│  DANH MỤC HÀNG HÓA (LINE ITEMS):                       │  │ Gợi ý từ AI:                       │ │
│  ┌───────────────────────┬────┬───────────┬──────────┐ │  │ • Danh mục: IT Hardware           │ │
│  │ Mặt hàng              │ SL │ Đơn giá   │ Thành tiền│ │  │ • Đơn giá TB: 25.000.000 ₫        │ │
│  ├───────────────────────┼────┼───────────┼──────────┤ │  │                                    │ │
│  │ Laptop Dell Precision │ 03 │ 25.000.000│ 75.000.00│ │  │ [ ✔ Dùng gợi ý ]   [ Bỏ qua ]     │ │
│  └───────────────────────┴────┴───────────┴──────────┘ │  └────────────────────────────────────┘ │
│  [ + Thêm dòng hàng ]                                  │                                         │
│                                                        │  CHECKLIST ĐIỀU KIỆN GỬI:               │
│  Tổng dự toán: 75.000.000 ₫                            │  [✔] Đã điền tiêu đề và phòng ban       │
│                                                        │  [✔] Đã có ít nhất 1 mặt hàng           │
│  ┌──────────────────────────────────────────────────┐  │  [✔] Đã chọn mã ngân sách               │
│  │ [ Lưu bản nháp (Draft) ]   [ Gửi duyệt (Submit) ]│  │                                         │
│  └──────────────────────────────────────────────────┘  │                                         │
└────────────────────────────────────────────────────────┴─────────────────────────────────────────┘
```

---

### 3.2 Wireframe: Màn Hình Quản Lý Phê Duyệt (`/approvals/:id`)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  [ProcureAI Logo]   Dashboard   Requests   Approvals(Active)   Sourcing   [Bell] [User: Minh(MGR)]│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│  ← Quay lại hàng chờ duyệt                                                                       │
│  PR-2026-0042: Trang bị máy tính cho team Frontend Q1    [ Huy hiệu: Pending Approval ]          │
│  Người gửi: Nguyễn Hải (IT Dept)  •  Ngày gửi: 10/10/2026 09:30  •  Tổng tiền: 75.000.000 ₫     │
├────────────────────────────────────────────────────────┬─────────────────────────────────────────┤
│  STEPPER TIẾN TRÌNH:                                                                             │
│  (1) Tạo yêu cầu [✔] ─── (2) Phê duyệt [●] ─── (3) Báo giá [ ] ─── (4) PO [ ] ─── (5) Nhận hàng[ ]│
├────────────────────────────────────────────────────────┬─────────────────────────────────────────┤
│  CHI TIẾT MẶT HÀNG:                                    │  KHUNG KIỂM SOÁT NGÂN SÁCH (BUDGET):    │
│  • Laptop Dell Precision 5570 (Số lượng: 03)           │  ┌────────────────────────────────────┐ │
│    Đơn giá: 25.000.000 ₫  |  Thành tiền: 75.000.000 ₫  │  │ Ngân sách IT Quý 1 (BDG-IT-2026-Q1)│ │
│  • Ghi chú: Kèm bảo hành 3 năm chính hãng ProSupport   │  ├────────────────────────────────────┤ │
│                                                        │  │ Hạn mức được cấp:   400.000.000 ₫  │ │
│  LÝ DO KINH DOANH:                                     │  │ Đã chi tiêu:        310.000.000 ₫  │ │
│  "Cung cấp thiết bị làm việc cho 3 kỹ sư phần mềm..."  │  │ Khả dụng hiện tại:   90.000.000 ₫  │ │
│                                                        │  │ Trị giá PR này:      75.000.000 ₫  │ │
│  TÀI LIỆU ĐÍNH KÈM:                                    │  │ ────────────────────────────────── │ │
│  📄 specification_frontend_stack.pdf (1.2 MB)          │  │ Khả dụng sau duyệt:  15.000.000 ₫  │ │
│                                                        │  │ [====================------] (83%) │ │
│                                                        │  │ Trạng thái: Trong hạn mức an toàn  │ │
│                                                        │  └────────────────────────────────────┘ │
│                                                        │                                         │
│                                                        │  THAO TÁC QUẢN LÝ (ACTIONS):            │
│                                                        │  [ ✔ PHÊ DUYỆT (Approve)              ] │
│                                                        │  [ ↺ Yêu cầu chỉnh sửa (Revision)     ] │
│                                                        │  [ ⚠ Chuyển phòng Tài chính           ] │
│                                                        │  [ ✕ Từ chối yêu cầu (Reject)         ] │
└────────────────────────────────────────────────────────┴─────────────────────────────────────────┘
```

---

### 3.3 Wireframe: Ma Trận So Sánh Báo Giá & Đề Xuất AI (`/sourcing/:id/compare`)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  MA TRẬN SO SÁNH BÁO GIÁ NHÀ CUNG CẤP (QUOTATION COMPARISON MATRIX)                              │
├──────────────────────┬─────────────────────┬──────────────────────┬──────────────────────────────┤
│ TIÊU CHÍ SO SÁNH     │ NCC A (TechZone)    │ NCC B (FPT Synnex) ⭐ │ NCC C (CMC Telecom)          │
├──────────────────────┼─────────────────────┼──────────────────────┼──────────────────────────────┤
│ Tổng giá trước thuế  │ 76.500.000 ₫        │ 72.000.000 ₫ (Thấp)  │ 78.000.000 ₫                 │
│ Thuế VAT (10%)       │ 7.650.000 ₫         │ 7.200.000 ₫          │ 7.800.000 ₫                  │
│ TỔNG THANH TOÁN      │ 84.150.000 ₫        │ 79.200.000 ₫         │ 85.800.000 ₫                 │
│ Thời gian giao hàng  │ 7 ngày làm việc     │ 3 ngày làm việc      │ 10 ngày làm việc             │
│ Điều khoản trả tiền  │ Thanh toán ngay 100%│ Net 30 ngày          │ Trả trước 50%                │
│ Thời gian bảo hành   │ 24 tháng            │ 36 tháng tận nơi     │ 24 tháng                     │
├──────────────────────┼─────────────────────┼──────────────────────┼──────────────────────────────┤
│ ĐÁNH GIÁ TỔNG THỂ    │ Giá trung bình      │ Tối ưu nhất          │ Giá cao, giao lâu            │
├──────────────────────┼─────────────────────┼──────────────────────┼──────────────────────────────┤
│ THAO TÁC LỰA CHỌN    │ [ Chọn NCC A ]      │ [ ✔ CHỌN NCC NÀY ]   │ [ Chọn NCC C ]               │
└──────────────────────┴─────────────────────┴──────────────────────┴──────────────────────────────┘
 ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
 │ ✨ AI RECOMMENDATION & ANOMALY ALERT:                                                          │
 │ • Đề xuất: Nên chọn NCC B (FPT Synnex) vì tiết kiệm 5.8% chi phí và thời gian giao sớm hơn 4 ngày.│
 │ • Cảnh báo giá: Mặt hàng RAM 32GB tại NCC C có giá cao hơn 21.4% so với lịch sử thị trường!   │
 └────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Xử Lý Các Trường Hợp Ngoại Lệ & Góc Khuất (Edge Cases & Exception Flows)

| Tình Huống Ngoại Lệ | Phản Ứng Giao Diện Phía Client | Giải Pháp Nghiệp Vụ |
| :--- | :--- | :--- |
| **Cố tình tự phê duyệt (Self-Approval)** | Ẩn toàn bộ nút duyệt, thay bằng thông báo lỗi màu xanh cảnh báo | Người tạo không được phép tự duyệt; PR phải được gửi lên cấp cao hơn. |
| **Mất kết nối mạng khi AI đang phân tích** | Panel AI hiển thị icon thử lại kèm nút "Tiếp tục nhập thủ công" | Quy trình không bao giờ bị nghẽn (Block); người dùng luôn có quyền nhập tay. |
| **Ngân sách phòng ban bị vượt quá hạn mức** | Nút `Approve` hiển thị viền cảnh báo, làm nổi bật nút `Chuyển Finance` | Quản lý có thể chuyển quyền quyết định ngoại lệ lên phòng Tài chính. |
| **Sai lệch hàng hóa khi nhận (Hỏng/Thiếu)** | Bảng đối soát hiện dòng đỏ, vô hiệu hóa nút `Close Request` | Bắt buộc lập biên bản và cập nhật đợt giao bổ sung trước khi đóng hồ sơ. |
