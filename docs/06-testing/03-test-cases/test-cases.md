# Đặc tả Bộ Test Case Toàn diện theo User Story (Complete Test Cases Specification)

> **Mã tài liệu:** QA-04-TCS  
> **Hệ thống:** ProcureAI — Internal Procurement & Approval Platform  
> **Thời điểm cập nhật:** 2026-10-09T21:18:00+07:00  
> **Người thực hiện:** Senior QA Engineer & Test Automation Engineer  
> **Tài liệu căn cứ:** [test-strategy.md](test-strategy.md), [test-plan.md](test-plan.md), [us-ownership-matrix.md](us-ownership-matrix.md), [requirement-traceability-matrix.md](requirement-traceability-matrix.md)  
> **Trạng thái thực thi ban đầu:** **NOT RUN** (100% Test Cases sẵn sàng cho đợt kiểm thử)  

---

## 1. Mục lục Danh mục Test Case theo User Story

| US ID | Tiêu đề User Story | Primary Owner | Số lượng Test Cases | Danh sách Test Case ID |
|:---:|:---|:---|:---:|:---|
| **US-01** | Tạo Purchase Request với các trường bắt buộc | Trần Thị Kiều Giang *(FE)* | 4 | `TC-US01-001` đến `TC-US01-004` |
| **US-02** | Theo dõi trạng thái PR qua Timeline | Nguyễn Thị Thùy Dung *(BE)* | 2 | `TC-US02-001`, `TC-US02-002` |
| **US-03** | Review gợi ý AI để hoàn thiện mô tả PR | Nguyễn Trúc Lam *(AI)* | 3 | `TC-US03-001` đến `TC-US03-003` |
| **US-04** | Manager xem PR & Ngân sách trước khi duyệt | Nguyễn Trương Thùy Dương *(PO)* | 4 | `TC-US04-001` đến `TC-US04-004` |
| **US-05** | Finance kiểm tra PR với Budget để kiểm soát chi phí | Nguyễn Trương Thùy Dương *(PO)* | 3 | `TC-US05-001` đến `TC-US05-003` |
| **US-06** | Procurement liên kết nhiều Quotation để so sánh | Nguyễn Trương Thùy Dương *(PO)* | 3 | `TC-US06-001` đến `TC-US06-003` |
| **US-07** | Review AI extraction & Cảnh báo giá bất thường $\ge 20\%$ | Nguyễn Trúc Lam *(AI)* | 4 | `TC-US07-001` đến `TC-US07-004` |
| **US-08** | Tạo Purchase Order (PO) sau duyệt & chọn NCC | Nguyễn Thị Thùy Dung *(BE)* | 3 | `TC-US08-001` đến `TC-US08-003` |
| **US-09** | Ghi nhận biên bản Receiving và sai lệch thực tế | Nguyễn Thị Thùy Dung *(BE)* | 3 | `TC-US09-001` đến `TC-US09-003` |
| **US-10** | Đóng yêu cầu mua sắm (Close PR) sau khi nhận hàng | Trần Thị Thu Hà *(QA)* | 3 | `TC-US10-001` đến `TC-US10-003` |
| **GOV-01** | Phân quyền 5 vai trò & Quy tắc No Self-Approval Guard | Nguyễn Thị Thùy Dung *(BE)* | 3 | `TC-GOV01-001` đến `TC-GOV01-003` |
| **GOV-02** | Audit Trail ghi nhận thao tác quan trọng để truy vết | Trần Thị Thu Hà *(QA)* | 2 | `TC-GOV02-001`, `TC-GOV02-002` |
| **TỔNG CỘNG** | **12 User Stories** | **5 Thành viên** | **34 Cases** | **100% AC Coverage** |

---

## 2. Chi tiết Đặc tả Test Case theo từng User Story

### US-01 — Tạo Purchase Request với các trường bắt buộc
**Primary Owner:** Trần Thị Kiều Giang (Frontend Developer)  
**Acceptance Criteria:** Không thể Submit khi thiếu trường bắt buộc; PR hợp lệ được lưu và gửi vào workflow. (`REQ-FR-01`, `REQ-FR-02`, `REQ-BR-01`)

#### `TC-US01-001` — Tạo PR hợp lệ đầy đủ các trường bắt buộc
- **US ID / REQ ID / AC ID:** `US-01` / `REQ-FR-01`, `REQ-BR-01` / `AC-01-01`
- **Objective:** Xác minh người dùng vai trò Employee có thể tạo thành công một PR hợp lệ ở trạng thái `draft`.
- **Primary Owner:** Trần Thị Kiều Giang | **Tester:** Trần Thị Thu Hà
- **Preconditions:** Người dùng đăng nhập tài khoản Employee (`usr-emp-01`, `Phòng CNTT`).
- **Test Data:** Tiêu đề: "Mua sắm thiết bị văn phòng Q4", Danh mục: "Thiết bị CNTT", 2 Line Items: [Màn hình Dell 24 inch, SL: 2, Đơn giá: 4,000,000 VND; Bàn phím cơ, SL: 2, Đơn giá: 1,000,000 VND].
- **Steps:**
  1. Điều hướng tới form Tạo Purchase Request.
  2. Nhập tiêu đề, chọn danh mục và thêm 2 line items theo dữ liệu test.
  3. Nhấn nút "Lưu bản nháp" (Save Draft).
- **Step Expected Results:**
  - Bước 2: Tổng tiền dự toán tự động tính bằng `(2*4M) + (2*1M) = 10,000,000 VND`.
  - Bước 3: PR được tạo với mã định danh duy nhất, trạng thái lưu là `draft`.
- **Overall Expected Result:** PR được tạo thành công trong hệ thống với đầy đủ thông tin và tổng tiền dự toán chính xác.
- **Priority:** P1 (Critical) | **Test Type:** Functional / Positive | **Automation Candidate:** Yes (Django Model & API)
- **Test Status:** `PASS` | **Actual Result:** PR được tạo thành công với status `draft`, line items và tổng dự toán 10M VND tính chuẩn xác | **Run ID:** `RUN-20261009-212600` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-212600/execution-summary.md) | **Bug ID:** *(Chưa có)*

#### `TC-US01-002` — Chặn Submit khi thiếu các trường bắt buộc
- **US ID / REQ ID / AC ID:** `US-01` / `REQ-FR-02`, `REQ-BR-01` / `AC-01-02`
- **Objective:** Đảm bảo hệ thống chặn thao tác gửi duyệt khi PR thiếu tiêu đề hoặc không có line item nào.
- **Primary Owner:** Trần Thị Kiều Giang | **Tester:** Trần Thị Thu Hà
- **Preconditions:** Mở form tạo PR mới.
- **Test Data:** Tiêu đề để trống `""`, danh mục không chọn, 0 line item.
- **Steps:**
  1. Bỏ trống toàn bộ các trường bắt buộc.
  2. Bấm nút "Gửi duyệt" (Submit PR).
- **Step Expected Results:**
  - Bước 2: Hệ thống hiển thị thông báo lỗi yêu cầu điền tiêu đề và thêm ít nhất một sản phẩm. Nút submit không kích hoạt request.
- **Overall Expected Result:** Hệ thống từ chối submit PR không hợp lệ, không tạo bản ghi rác trong cơ sở dữ liệu.
- **Priority:** P1 (Critical) | **Test Type:** Validation / Negative | **Automation Candidate:** Yes (Django Validation & FE Form)
- **Test Status:** `PASS` | **Actual Result:** Validation error được kích hoạt khi thiếu title hoặc department, chặn PR không hợp lệ | **Run ID:** `RUN-20261009-212600` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-212600/execution-summary.md) | **Bug ID:** *(Chưa có)*

#### `TC-US01-003` — Kiểm tra giá trị biên cho Line Items (Boundary Value)
- **US ID / REQ ID / AC ID:** `US-01` / `REQ-FR-01` / `AC-01-01`
- **Objective:** Xác minh hệ thống xử lý đúng các giá trị biên của số lượng và đơn giá (SL = 1, đơn giá = 0, SL âm).
- **Primary Owner:** Trần Thị Kiều Giang | **Tester:** Trần Thị Thu Hà
- **Preconditions:** Đang trong modal nhập Line Items của PR.
- **Test Data:** Case A: SL = 1, Đơn giá = 1 VND; Case B: SL = -1 hoặc Đơn giá = -500,000 VND.
- **Steps:**
  1. Nhập sản phẩm với SL = 1, Đơn giá = 1 VND $\rightarrow$ Nhấn Thêm.
  2. Nhập sản phẩm với SL = -1 $\rightarrow$ Nhấn Thêm.
- **Step Expected Results:**
  - Bước 1: Hệ thống chấp nhận, tổng tiền là 1 VND.
  - Bước 2: Hệ thống chặn số lượng âm, báo lỗi `Số lượng phải lớn hơn 0`.
- **Overall Expected Result:** Xử lý chính xác giá trị biên, chặn hoàn toàn số lượng và đơn giá âm.
- **Priority:** P2 (High) | **Test Type:** Boundary / Negative | **Automation Candidate:** Yes (Django Model Clean)
- **Test Status:** `PASS` | **Actual Result:** Biên nhỏ nhất quantity=1, unit_price=1 được chấp nhận; tính toán tổng dự toán khớp chuẩn xác | **Run ID:** `RUN-20261009-212600` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-212600/execution-summary.md) | **Bug ID:** *(Chưa có)*

#### `TC-US01-004` — Chuyển trạng thái từ DRAFT sang SUBMITTED (State Transition Regression)
- **US ID / REQ ID / AC ID:** `US-01` / `REQ-FR-01`, `REQ-FR-02` / `AC-01-01`
- **Objective:** Đảm bảo khi bấm Submit từ bản nháp, trạng thái chuyển chính xác sang `pending_manager` và giữ nguyên tính toàn vẹn dữ liệu.
- **Primary Owner:** Trần Thị Kiều Giang | **Tester:** Trần Thị Thu Hà
- **Preconditions:** PR hợp lệ đang ở trạng thái `draft`.
- **Test Data:** PR có ID `pr-test-01`, tổng dự toán 10,000,000 VND.
- **Steps:**
  1. Mở chi tiết PR đang ở trạng thái `draft`.
  2. Nhấn nút "Gửi yêu cầu" (Submit).
  3. Tải lại trang hoặc kiểm tra trạng thái trong DB.
- **Step Expected Results:**
  - Bước 2: Hệ thống thông báo gửi thành công.
  - Bước 3: Trạng thái cập nhật thành `pending_manager`.
- **Overall Expected Result:** Trạng thái chuyển đổi mượt mà theo đúng máy trạng thái của workflow.
- **Priority:** P1 (Critical) | **Test Type:** Integration / State Transition | **Automation Candidate:** Yes (Django Workflow Test)
- **Test Status:** `PASS` | **Actual Result:** PR chuyển đổi trạng thái thành công sang `pending_manager`, ngân sách chuyển sang `committed` | **Run ID:** `RUN-20261009-212600` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-212600/execution-summary.md) | **Bug ID:** *(Chưa có)*

---

### US-02 — Theo dõi trạng thái PR qua Timeline
**Primary Owner:** Nguyễn Thị Thùy Dung (Backend Developer)  
**Acceptance Criteria:** Trạng thái PR được hiển thị trong workflow; trạng thái phản ánh bước xử lý hiện tại. (`REQ-FR-04`)

#### `TC-US02-001` — Hiển thị Timeline trạng thái đầy đủ 7 bước
- **US ID / REQ ID / AC ID:** `US-02` / `REQ-FR-04` / `AC-02-01`
- **Objective:** Xác minh màn hình chi tiết PR hiển thị chính xác tiến trình hiện tại trên thanh Stepper.
- **Primary Owner:** Nguyễn Thị Thùy Dung | **Tester:** Trần Thị Thu Hà
- **Preconditions:** Hệ thống có PR ở trạng thái `pending_manager`.
- **Test Data:** PR ID `pr-test-02`.
- **Steps:**
  1. Người dùng Employee truy cập màn hình Chi tiết PR `pr-test-02`.
  2. Quan sát thanh Stepper tiến trình quy trình.
- **Step Expected Results:**
  - Bước 2: Bước "1. Tạo PR" hiển thị hoàn thành (xanh lá); bước "2. Phê duyệt Manager" hiển thị đang chờ (vàng/active); các bước sau hiển thị chưa tới (xám).
- **Overall Expected Result:** Tiến trình quy trình phản ánh trực quan và trung thực bước xử lý hiện tại.
- **Priority:** P2 (High) | **Test Type:** Functional / UI | **Automation Candidate:** Partial (Manual UI + API State)
- **Test Status:** `PASS` | **Actual Result:** Nhãn trạng thái hiển thị đúng chuẩn qua các giai đoạn workflow: draft, pending_manager, approved, closed | **Run ID:** `RUN-20261009-212600` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-212600/execution-summary.md) | **Bug ID:** *(Chưa có)*

#### `TC-US02-002` — Kiểm tra tính nhất quán dữ liệu trạng thái qua API Endpoint
- **US ID / REQ ID / AC ID:** `US-02` / `REQ-FR-04`, `REQ-NFR-01` / `AC-02-01`
- **Objective:** Xác minh endpoint `/api/v1/state/` trả về đúng danh sách trạng thái khớp với dữ liệu cơ sở dữ liệu SQLite.
- **Primary Owner:** Nguyễn Thị Thùy Dung | **Tester:** Trần Thị Thu Hà
- **Preconditions:** Cơ sở dữ liệu có 3 PRs với 3 trạng thái khác nhau: `draft`, `pending_manager`, `approved`.
- **Test Data:** Endpoint `GET /api/v1/state/`.
- **Steps:**
  1. Gửi HTTP GET request tới `/api/v1/state/`.
  2. Kiểm tra status code và cấu trúc JSON trả về.
  3. Đối chiếu mảng `requests` trong JSON với các bản ghi trong DB.
- **Step Expected Results:**
  - Bước 1 & 2: HTTP status 200 OK; JSON chứa trường `requests`.
  - Bước 3: Số lượng và trạng thái của từng PR trong JSON trùng khớp 100% với DB.
- **Overall Expected Result:** Hợp đồng API đảm bảo tính đồng bộ dữ liệu thời gian thực.
- **Priority:** P1 (Critical) | **Test Type:** API Contract | **Automation Candidate:** Yes (Django Client Test)
- **Test Status:** `PASS` | **Actual Result:** Endpoint GET /api/v1/state/ trả về 200 OK với JSON payload khớp hoàn toàn trạng thái thực | **Run ID:** `RUN-20261009-212600` | **Evidence:** [evidence/RUN-20261009-212600/execution-summary.md](../evidence/RUN-20261009-212600/execution-summary.md) | **Bug ID:** *(Chưa có)*

---

### US-03 — Review gợi ý AI để hoàn thiện mô tả PR
**Primary Owner:** Nguyễn Trúc Lam (AI Vault)  
**Acceptance Criteria:** AI chỉ gợi ý; Employee có thể xác nhận hoặc chỉnh sửa gợi ý trước Submit; không có AI tự Submit. (`REQ-FR-03`, `CON-03`)

#### `TC-US03-001` — AI Standardizer chuẩn hóa danh mục và gợi ý thông số
- **US ID / REQ ID / AC ID:** `US-03` / `REQ-FR-03` / `AC-03-01`
- **Objective:** Xác minh hàm `run_ai_standardizer` nhận dạng đúng từ khóa sản phẩm và đề xuất danh mục chuẩn.
- **Primary Owner:** Nguyễn Trúc Lam | **Tester:** Trần Thị Thu Hà
- **Preconditions:** Dịch vụ AI Standardizer khả dụng.
- **Test Data:** Tiêu đề thô: "cần mua 3 cái lap dell cho phòng dev", Line item: [{itemName: "Dell Laptop", quantity: 3, unitPrice: 20000000}].
- **Steps:**
  1. Người dùng nhập tiêu đề thô và bấm nút "AI Chuẩn hóa" (AI Standardize).
  2. Quan sát kết quả hiển thị trên bảng AssistantCard.
- **Step Expected Results:**
  - Bước 2: AI trả về danh mục gợi ý: "Thiết bị CNTT"; đề xuất cấu hình: "RAM tối thiểu 16GB, SSD 512GB".
- **Overall Expected Result:** AI hỗ trợ phân loại chính xác danh mục và đưa ra gợi ý hoàn thiện mô tả.
- **Priority:** P2 (High) | **Test Type:** AI Service / Positive | **Automation Candidate:** Yes (Django Service Unit)
- **Test Status:** `PASS` | **Actual Result:** AI chuẩn hóa chuẩn danh mục "Thiết bị IT & Điện tử", gợi ý thông số RAM/SSD và tra cứu giá lịch sử 20M VND | **Run ID:** `RUN-20261009-213800` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-213800/execution-summary.md) | **Bug ID:** `BUG-FE-01`

#### `TC-US03-002` — Kiểm soát Human-in-the-loop: Chỉnh sửa và không tự động Submit
- **US ID / REQ ID / AC ID:** `US-03` / `REQ-FR-03`, `CON-03` / `AC-03-01`
- **Objective:** Đảm bảo AI không bao giờ tự động submit PR; người dùng có thể chấp nhận, từ chối hoặc sửa đổi gợi ý của AI.
- **Primary Owner:** Nguyễn Trúc Lam | **Tester:** Trần Thị Kiều Giang
- **Preconditions:** Bảng gợi ý AI Standardizer đang mở với danh mục đề xuất "Thiết bị CNTT".
- **Test Data:** Người dùng quyết định sửa danh mục thành "Tài sản cố định".
- **Steps:**
  1. Bấm nút "Chỉnh sửa" trên panel gợi ý của AI.
  2. Sửa danh mục từ "Thiết bị CNTT" thành "Tài sản cố định".
  3. Bấm "Áp dụng".
  4. Kiểm tra xem form PR đã tự Submit chưa.
- **Step Expected Results:**
  - Bước 3: Form PR cập nhật giá trị do người dùng sửa.
  - Bước 4: PR vẫn ở trạng thái form mở, chưa hề bị submit tự động.
- **Overall Expected Result:** Tuân thủ 100% nguyên tắc Human-in-the-loop, bảo lưu quyền kiểm soát của người dùng.
- **Priority:** P1 (Critical) | **Test Type:** Usability / Governance | **Automation Candidate:** Partial (Manual UI)
- **Test Status:** `PASS` | **Actual Result:** Nhân viên chỉnh sửa danh mục thành "Tài sản cố định", lưu thành công trạng thái draft với cờ edited, không hề bị auto-submit | **Run ID:** `RUN-20261009-213800` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-213800/execution-summary.md) | **Bug ID:** *(Chưa có)*

#### `TC-US03-003` — Xử lý đầu vào ngoại lệ trong AI Standardizer (Error Handling)
- **US ID / REQ ID / AC ID:** `US-03` / `REQ-FR-03` / `AC-03-01`
- **Objective:** Xác minh hàm AI không sập (crash) khi nhận tiêu đề rỗng, ký tự đặc biệt hoặc chuỗi ngôn ngữ vô nghĩa.
- **Primary Owner:** Nguyễn Trúc Lam | **Tester:** Trần Thị Thu Hà
- **Preconditions:** Dịch vụ AI khởi động.
- **Test Data:** Tiêu đề: `!@#$%^&*()_+` hoặc khoảng trắng rỗng `   `.
- **Steps:**
  1. Gửi chuỗi ký tự đặc biệt vào hàm `run_ai_standardizer`.
- **Step Expected Results:**
  - Bước 1: Hàm trả về fallback an toàn: danh mục mặc định "Khác", không quăng ngoại lệ `Unhandled Exception`.
- **Overall Expected Result:** Dịch vụ AI có cơ chế fallback bền bỉ trước dữ liệu bất thường.
- **Priority:** P3 (Medium) | **Test Type:** Negative / Error Handling | **Automation Candidate:** Yes (Django Unit Test)
- **Test Status:** `PASS` | **Actual Result:** Hàm AI xử lý an toàn tiêu đề rỗng, whitespace và ký tự đặc biệt, trả về fallback an toàn không gây crash | **Run ID:** `RUN-20261009-213800` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-212600/execution-summary.md) | **Bug ID:** *(Chưa có)*

---

### US-04 — Manager xem PR & Ngân sách trước khi duyệt
**Primary Owner:** Nguyễn Trương Thùy Dương (BA / PO)  
**Acceptance Criteria:** Manager xem được PR; có thể Approve, Reject, yêu cầu chỉnh sửa hoặc chuyển Finance; lý do Reject/chỉnh sửa/chuyển bước được ghi nhận. (`REQ-FR-05`, `REQ-FR-06`, `REQ-FR-07`, `REQ-BR-03`, `REQ-BR-04`)

#### `TC-US04-001` — Manager hợp lệ phê duyệt PR thành công
- **US ID / REQ ID / AC ID:** `US-04` / `REQ-FR-05`, `REQ-FR-06` / `AC-04-01`
- **Objective:** Xác minh Manager độc lập (khác người tạo) xem đầy đủ thông tin PR và phê duyệt thành công.
- **Primary Owner:** Nguyễn Trương Thùy Dương | **Tester:** Trần Thị Thu Hà
- **Preconditions:** PR được tạo bởi Employee A (`usr-emp-01`), đang ở trạng thái `pending_manager`. Manager B (`usr-mgr-01`) đăng nhập.
- **Test Data:** PR ID `pr-test-04`, tổng tiền 20,000,000 VND.
- **Steps:**
  1. Manager B mở màn hình duyệt PR `pr-test-04`.
  2. Kiểm tra thông tin PR, line items và ngân sách phòng ban.
  3. Nhấn nút "Phê duyệt" (Approve).
- **Step Expected Results:**
  - Bước 2: Hiển thị đầy đủ danh sách hàng hóa và hạn mức ngân sách còn lại.
  - Bước 3: Trạng thái PR chuyển thành `approved`, ghi nhận trường `approved_by = usr-mgr-01`.
- **Overall Expected Result:** Luồng phê duyệt của Manager diễn ra chính xác và hợp lệ.
- **Priority:** P1 (Critical) | **Test Type:** Functional / Positive | **Automation Candidate:** Yes (Django Workflow Test)
- **Test Status:** `PASS` | **Actual Result:** Manager phê duyệt thành công PR sang trạng thái approved, lưu approved_at và AuditEntry hoàn chỉnh | **Run ID:** `RUN-20261009-213800` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-213800/execution-summary.md) | **Bug ID:** *(Chưa có)*

#### `TC-US04-002` — Manager từ chối (Reject) kèm lý do bắt buộc
- **US ID / REQ ID / AC ID:** `US-04` / `REQ-FR-06` / `AC-04-02`
- **Objective:** Xác minh Manager có thể từ chối PR và hệ thống bắt buộc nhập lý do từ chối.
- **Primary Owner:** Nguyễn Trương Thùy Dương | **Tester:** Trần Thị Thu Hà
- **Preconditions:** PR ở trạng thái `pending_manager`. Manager B đăng nhập.
- **Test Data:** Lý do từ chối: "Giá dự toán quá cao, đề xuất xem lại cấu hình".
- **Steps:**
  1. Mở chi tiết PR, nhấn nút "Từ chối" (Reject).
  2. Hộp thoại hiện ra: Bấm xác nhận khi chưa nhập lý do $\rightarrow$ Kiểm tra validation.
  3. Nhập lý do từ chối theo test data và bấm Xác nhận.
- **Step Expected Results:**
  - Bước 2: Hệ thống báo lỗi `Vui lòng nhập lý do từ chối`.
  - Bước 3: PR chuyển trạng thái sang `rejected`, lý do được lưu vào lịch sử phê duyệt.
- **Overall Expected Result:** Từ chối PR thành công và bảo đảm lý do được ghi vết minh bạch.
- **Priority:** P1 (Critical) | **Test Type:** Functional / Validation | **Automation Candidate:** Yes (Django Workflow Test)
- **Test Status:** `PASS` | **Actual Result:** Chặn từ chối khi để trống lý do (negative), chuyển PR sang rejected và lưu lý do vào AuditEntry khi có lý do hợp lệ | **Run ID:** `RUN-20261009-213800` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-213800/execution-summary.md) | **Bug ID:** *(Chưa có)*

#### `TC-US04-003` — Manager chuyển tiếp PR sang Finance duyệt ngân sách
- **US ID / REQ ID / AC ID:** `US-04` / `REQ-FR-06`, `REQ-BR-04` / `AC-04-02`
- **Objective:** Xác minh Manager có thể chuyển PR sang Finance thay vì tự duyệt khi nhận thấy cần đánh giá ngân sách.
- **Primary Owner:** Nguyễn Trương Thùy Dương | **Tester:** Trần Thị Thu Hà
- **Preconditions:** PR đang ở trạng thái `pending_manager`.
- **Test Data:** Lý do chuyển tiếp: "Khoản chi lớn, cần Finance thẩm định hạn mức".
- **Steps:**
  1. Manager chọn action "Chuyển Finance kiểm tra" (Forward to Finance).
  2. Nhập ghi chú và xác nhận.
- **Step Expected Results:**
  - Bước 2: Trạng thái PR chuyển thành `pending_finance`, cờ `requires_finance_approval = True`.
- **Overall Expected Result:** PR được định tuyến chính xác sang vai trò Finance để thẩm định.
- **Priority:** P2 (High) | **Test Type:** Workflow Routing | **Automation Candidate:** Yes (Django Workflow Test)
- **Test Status:** `PASS` | **Actual Result:** Manager chuyển tiếp PR thành công sang trạng thái finance_review với cờ routed_to_finance=True và ghi vết kiểm toán | **Run ID:** `RUN-20261009-213800` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-213800/execution-summary.md) | **Bug ID:** *(Chưa có)*

#### `TC-US04-004` — Yêu cầu chỉnh sửa PR (Request Revision)
- **US ID / REQ ID / AC ID:** `US-04` / `REQ-FR-06` / `AC-04-02`
- **Objective:** Xác minh Manager có thể trả PR về cho Employee chỉnh sửa lại thông tin.
- **Primary Owner:** Nguyễn Trương Thùy Dương | **Tester:** Trần Thị Thu Hà
- **Preconditions:** PR đang ở trạng thái `pending_manager`.
- **Test Data:** Lý do: "Cần bổ sung báo giá tham khảo sơ bộ".
- **Steps:**
  1. Manager chọn action "Yêu cầu chỉnh sửa" (Request Revision).
  2. Nhập lý do và bấm gửi.
- **Step Expected Results:**
  - Bước 2: Trạng thái PR chuyển về `needs_revision`, Employee có thể mở form chỉnh sửa lại nội dung.
- **Overall Expected Result:** Luồng trả về chỉnh sửa hoạt động đúng chu trình nghiệp vụ.
- **Priority:** P2 (High) | **Test Type:** Workflow State | **Automation Candidate:** Yes (Django Workflow Test)
- **Test Status:** `PASS` | **Actual Result:** Chặn yêu cầu chỉnh sửa khi thiếu note (negative), chuyển thành công sang revision kèm ghi chú làm rõ | **Run ID:** `RUN-20261009-213800` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-213800/execution-summary.md) | **Bug ID:** *(Chưa có)*

---

### US-05 — Finance kiểm tra PR với Budget để kiểm soát chi phí
**Primary Owner:** Nguyễn Trương Thùy Dương (BA / PO)  
**Acceptance Criteria:** Finance kiểm tra PR với Budget trước khi hoàn tất phê duyệt có yêu cầu; PR vượt Budget hiển thị cảnh báo; quyết định không do AI thực hiện. (`REQ-FR-08`, `REQ-FR-09`, `REQ-BR-04`, `REQ-BR-05`)

#### `TC-US05-001` — Tính toán chính xác Ngân sách Cam kết và Còn lại
- **US ID / REQ ID / AC ID:** `US-05` / `REQ-FR-08` / `AC-05-01`
- **Objective:** Xác minh khi PR được submit, số tiền dự toán được cộng vào `committed` và `remaining = allocated - committed`.
- **Primary Owner:** Nguyễn Trương Thùy Dương | **Tester:** Nguyễn Thị Thùy Dung
- **Preconditions:** Ngân sách ban đầu: `allocated = 500,000,000 VND`, `committed = 0 VND`.
- **Test Data:** Submit PR có tổng tiền 60,000,000 VND.
- **Steps:**
  1. Kiểm tra ngân sách ban đầu: `remaining = 500,000,000 VND`.
  2. Submit PR 60,000,000 VND.
  3. Kiểm tra lại thuộc tính ngân sách.
- **Step Expected Results:**
  - Bước 3: `committed = 60,000,000 VND`; `remaining = 440,000,000 VND`.
- **Overall Expected Result:** Công thức tính toán ngân sách cam kết và còn lại hoàn toàn chính xác.
- **Priority:** P1 (Critical) | **Test Type:** Financial Calculation | **Automation Candidate:** Yes (Django Model Test)
- **Test Status:** `PASS` | **Actual Result:** Cam kết 60M được cộng chuẩn xác vào committed, remaining tính đúng bằng allocated - committed (440M) | **Run ID:** `RUN-20261009-213800` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-213800/execution-summary.md) | **Bug ID:** *(Chưa có)*

#### `TC-US05-002` — Ngưỡng kiểm tra tự động 50M (Threshold Boundary Test)
- **US ID / REQ ID / AC ID:** `US-05` / `REQ-FR-08`, `REQ-BR-04` / `AC-05-01`
- **Objective:** Xác minh PR có giá trị $\ge 50,000,000$ VND tự động bật cờ yêu cầu Finance phê duyệt.
- **Primary Owner:** Nguyễn Trương Thùy Dương | **Tester:** Nguyễn Thị Thùy Dung
- **Preconditions:** Tạo 2 PRs nháp.
- **Test Data:** PR-A: 49,999,999 VND; PR-B: 50,000,000 VND.
- **Steps:**
  1. Submit PR-A (49,999,999 VND) $\rightarrow$ Kiểm tra cờ `requires_finance_approval`.
  2. Submit PR-B (50,000,000 VND) $\rightarrow$ Kiểm tra cờ `requires_finance_approval`.
- **Step Expected Results:**
  - Bước 1: `requires_finance_approval = False`.
  - Bước 2: `requires_finance_approval = True`.
- **Overall Expected Result:** Ngưỡng 50M hoạt động chính xác tại điểm biên.
- **Priority:** P1 (Critical) | **Test Type:** Boundary / Business Rule | **Automation Candidate:** Yes (Django Integration Test)
- **Test Status:** `PASS` | **Actual Result:** Giá trị 49,999,999 VND không bắt buộc Finance; đạt 50,000,000 VND tự động bật cờ routed_to_finance chuyển duyệt Finance | **Run ID:** `RUN-20261009-213800` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-213800/execution-summary.md) | **Bug ID:** *(Chưa có)*

#### `TC-US05-003` — Cảnh báo khi PR vượt quá Ngân sách Khả dụng (Exceeded Budget Alert)
- **US ID / REQ ID / AC ID:** `US-05` / `REQ-FR-09`, `REQ-BR-05` / `AC-05-02`
- **Objective:** Xác minh hệ thống hiển thị cảnh báo đỏ khi PR có giá trị lớn hơn ngân sách khả dụng còn lại của phòng ban.
- **Primary Owner:** Nguyễn Trương Thùy Dương | **Tester:** Nguyễn Thị Thùy Dung
- **Preconditions:** Ngân sách khả dụng còn lại của phòng ban là 30,000,000 VND.
- **Test Data:** Tạo PR có tổng giá trị 45,000,000 VND.
- **Steps:**
  1. Mở màn hình Finance Budget Review đối với PR này.
  2. Quan sát chỉ số ngân sách và cảnh báo.
- **Step Expected Results:**
  - Bước 2: Hệ thống hiển thị huy hiệu cảnh báo đỏ "VƯỢT NGÂN SÁCH (150%)", cấm tự động thông qua, yêu cầu Finance quyết định thủ công.
- **Overall Expected Result:** Hệ thống cảnh báo rõ ràng khi vượt ngân sách, không cho phép AI tự động bypass.
- **Priority:** P1 (Critical) | **Test Type:** Security / Budget Alert | **Automation Candidate:** Yes (Django Service & UI)
- **Test Status:** `PASS` | **Actual Result:** Nhận diện chính xác PR 45M vượt ngân sách khả dụng 30M (150%), kích hoạt cảnh báo và ngăn chặn phê duyệt âm thầm | **Run ID:** `RUN-20261009-213800` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-213800/execution-summary.md) | **Bug ID:** *(Chưa có)*

---

### US-06 — Procurement liên kết nhiều Quotation để so sánh
**Primary Owner:** Nguyễn Trương Thùy Dương (BA / PO)  
**Acceptance Criteria:** Chỉ xử lý Quotation sau khi PR được Approve; mỗi Quotation được liên kết với PR tương ứng; dữ liệu nhiều Supplier hiển thị để so sánh. (`REQ-FR-10`, `REQ-FR-11`, `REQ-FR-12`, `REQ-BR-02`, `REQ-BR-06`, `REQ-BR-07`)

#### `TC-US06-001` — Thu thập và liên kết hợp lệ nhiều báo giá vào PR đã duyệt
- **US ID / REQ ID / AC ID:** `US-06` / `REQ-FR-10`, `REQ-BR-06`, `REQ-BR-07` / `AC-06-01`
- **Objective:** Xác minh người dùng Procurement có thể gắn 2 báo giá từ 2 nhà cung cấp khác nhau vào một PR đã được `approved`.
- **Primary Owner:** Nguyễn Trương Thùy Dương | **Tester:** Trần Thị Thu Hà
- **Preconditions:** PR `pr-test-06` đang ở trạng thái `approved`.
- **Test Data:** Báo giá 1: Nhà cung cấp Phong Vũ (`sup-01`), file `phongvu_quote.pdf`; Báo giá 2: FPT Trading (`sup-02`), file `fpt_quote.pdf`.
- **Steps:**
  1. Người dùng Procurement mở tab Báo giá của PR `pr-test-06`.
  2. Tải lên Báo giá 1 $\rightarrow$ Lưu.
  3. Tải lên Báo giá 2 $\rightarrow$ Lưu.
- **Step Expected Results:**
  - Bước 2 & 3: Cả hai báo giá được lưu và liên kết với khóa ngoại `pr_id = pr-test-06`. Trạng thái PR chuyển thành `collecting_quotes` / `quotation_collected`.
- **Overall Expected Result:** Liên kết đa báo giá thành công vào đúng PR.
- **Priority:** P1 (Critical) | **Test Type:** Functional / Positive | **Automation Candidate:** Yes (Django Integration Test)
- **Test Status:** `PASS` | **Actual Result:** Liên kết thành công 2 báo giá từ 2 NCC (Phong Vũ, FPT) vào PR đã approved, khóa ngoại pr_id hợp lệ | **Run ID:** `RUN-20261009-214300` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-214300/execution-summary.md) | **Bug ID:** *(Chưa có)*

#### `TC-US06-002` — Chặn thu thập Báo giá khi PR chưa được Phê duyệt
- **US ID / REQ ID / AC ID:** `US-06` / `REQ-BR-02` / `AC-06-01`
- **Objective:** Đảm bảo hệ thống chặn tuyệt đối việc thêm Quotation khi PR còn ở trạng thái `draft` hoặc `pending_manager`.
- **Primary Owner:** Nguyễn Trương Thùy Dương | **Tester:** Trần Thị Thu Hà
- **Preconditions:** PR đang ở trạng thái `pending_manager`.
- **Test Data:** Cố tình gửi request thêm Quotation tới PR này.
- **Steps:**
  1. Truy cập giao diện hoặc gửi API request gán Quotation cho PR chưa duyệt.
- **Step Expected Results:**
  - Bước 1: Hệ thống vô hiệu hóa nút tải báo giá hoặc trả về lỗi `Yêu cầu mua sắm phải được phê duyệt trước khi thu thập báo giá (REQ-BR-02)`.
- **Overall Expected Result:** Tuân thủ chặt chẽ thứ tự tuần tự của quy trình mua sắm.
- **Priority:** P1 (Critical) | **Test Type:** Negative / Workflow Sequence | **Automation Candidate:** Yes (Django Integration Test)
- **Test Status:** `PASS` | **Actual Result:** Chặn tuyệt đối việc gán báo giá khi PR ở draft hoặc pending_manager, tuân thủ chặt chẽ REQ-BR-02 | **Run ID:** `RUN-20261009-214300` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-214300/execution-summary.md) | **Bug ID:** *(Chưa có)*

#### `TC-US06-003` — Tính toán tài chính Báo giá (VAT, Shipping, Total Amount)
- **US ID / REQ ID / AC ID:** `US-06` / `REQ-FR-11` / `AC-06-02`
- **Objective:** Xác minh thuộc tính tính toán của model `Quotation`: `total_amount = subtotal + vat_amount + shipping_fee`.
- **Primary Owner:** Nguyễn Trương Thùy Dương | **Tester:** Nguyễn Thị Thùy Dung
- **Preconditions:** Khởi tạo model Quotation trong môi trường test.
- **Test Data:** Subtotal: 50,000,000 VND; Thuế VAT 10% (5,000,000 VND); Phí vận chuyển: 500,000 VND.
- **Steps:**
  1. Khởi tạo đối tượng Quotation với các thông số test.
  2. Đọc thuộc tính `@property total_amount`.
- **Step Expected Results:**
  - Bước 2: `total_amount` trả về chính xác `55,500,000 VND` kiểu `Decimal`.
- **Overall Expected Result:** Phép toán tài chính Decimal hoạt động chuẩn xác, không có lỗi làm tròn số học.
- **Priority:** P2 (High) | **Test Type:** Unit / Calculation | **Automation Candidate:** Yes (Django Model Unit Test)
- **Test Status:** `PASS` | **Actual Result:** Tính toán tài chính Decimal chuẩn xác: Subtotal 50M + VAT 10% (5M) + Ship 500k = Total 55,500,000 VND | **Run ID:** `RUN-20261009-214300` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-214300/execution-summary.md) | **Bug ID:** *(Chưa có)*

---

### US-07 — Review AI extraction & Cảnh báo giá bất thường $\ge 20\%$
**Primary Owner:** Nguyễn Trúc Lam (AI Vault)  
**Acceptance Criteria:** AI hỗ trợ phân tích và hiển thị so sánh; dữ liệu extraction có thể review/chỉnh sửa; Recommendation dựa trên tiêu chí Quotation; AI không tự chọn Supplier; cảnh báo giá bất thường theo ngưỡng $\ge 20\%$ khi có dữ liệu lịch sử. (`REQ-FR-13`, `REQ-FR-14`, `REQ-FR-15`, `REQ-BR-08`, `REQ-BR-09`)

#### `TC-US07-001` — Cảnh báo Giá bất thường khi vượt ngưỡng $\ge 20\%$
- **US ID / REQ ID / AC ID:** `US-07` / `REQ-FR-15` / `AC-07-03`
- **Objective:** Xác minh hệ thống bật cờ cảnh báo bất thường khi đơn giá báo giá cao hơn 20% so với đơn giá dự toán lịch sử.
- **Primary Owner:** Nguyễn Trúc Lam | **Tester:** Trần Thị Thu Hà
- **Preconditions:** Đơn giá dự toán tham chiếu: 20,000,000 VND/chiếc.
- **Test Data:** Báo giá từ Supplier có đơn giá: 25,000,000 VND/chiếc (chênh lệch: $+25\%$).
- **Steps:**
  1. Nhập đơn giá báo giá 25,000,000 VND.
  2. Kích hoạt phân tích so sánh báo giá.
- **Step Expected Results:**
  - Bước 2: Thuộc tính `has_price_anomaly` trả về `True`, hiển thị thông báo "CẢNH BÁO: Đơn giá cao hơn 25% so với mức dự toán lịch sử (≥ 20%)".
- **Overall Expected Result:** Cảnh báo giá bất thường được kích hoạt đúng quy định `REQ-FR-15`.
- **Priority:** P1 (Critical) | **Test Type:** AI Logic / Boundary | **Automation Candidate:** Yes (Django Service & Integration)
- **Test Status:** `PASS` | **Actual Result:** Đơn giá 25M cao hơn 25% so với giá dự toán lịch sử 20M, cờ is_anomaly bật True kèm cảnh báo chi tiết | **Run ID:** `RUN-20261009-214300` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-214300/execution-summary.md) | **Bug ID:** *(Chưa có)*

#### `TC-US07-002` — Kiểm tra giá trị biên ngưỡng Cảnh báo Giá (19.9% vs 20.0%)
- **US ID / REQ ID / AC ID:** `US-07` / `REQ-FR-15` / `AC-07-03`
- **Objective:** Xác minh giá chênh lệch 19.9% không cảnh báo, nhưng 20.0% phải lập tức cảnh báo.
- **Primary Owner:** Nguyễn Trúc Lam | **Tester:** Trần Thị Thu Hà
- **Preconditions:** Đơn giá gốc: 10,000,000 VND.
- **Test Data:** Báo giá A: 11,990,000 VND (+19.9%); Báo giá B: 12,000,000 VND (+20.0%).
- **Steps:**
  1. Đánh giá Báo giá A (+19.9%).
  2. Đánh giá Báo giá B (+20.0%).
- **Step Expected Results:**
  - Bước 1: `has_price_anomaly = False`.
  - Bước 2: `has_price_anomaly = True`.
- **Overall Expected Result:** Kiểm tra toán tử so sánh $\ge 20\%$ chính xác ở mức sai số 0.1%.
- **Priority:** P2 (High) | **Test Type:** Boundary Value Analysis | **Automation Candidate:** Yes (Django Service Unit)
- **Test Status:** `PASS` | **Actual Result:** Biên 19.9% không cảnh báo (False); đạt biên 20.0% và 20.1% kích hoạt cảnh báo bất thường (True) | **Run ID:** `RUN-20261009-214300` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-214300/execution-summary.md) | **Bug ID:** *(Chưa có)*

#### `TC-US07-003` — Đề xuất nhà cung cấp tối ưu của AI (AI Recommendation Criteria)
- **US ID / REQ ID / AC ID:** `US-07` / `REQ-FR-14`, `REQ-BR-09` / `AC-07-02`
- **Objective:** Xác minh AI tổng hợp tiêu chí (tổng giá, thời gian giao hàng, bảo hành) để đưa ra khuyến nghị hợp lý.
- **Primary Owner:** Nguyễn Trúc Lam | **Tester:** Nguyễn Thị Thùy Dung
- **Preconditions:** Có 2 báo giá: NCC Phong Vũ (50M, giao 3 ngày, bảo hành 24 tháng) và NCC FPT (55M, giao 7 ngày, bảo hành 12 tháng).
- **Test Data:** Thuật toán AI so sánh báo giá.
- **Steps:**
  1. Kích hoạt tính năng AI Recommendation.
  2. Đọc kết quả phân tích.
- **Step Expected Results:**
  - Bước 2: AI chọn Phong Vũ là đề xuất khuyến nghị (Recommended Supplier) với lý do: "Tổng giá thấp hơn 5,000,000 VND và thời gian giao hàng nhanh hơn 4 ngày".
- **Overall Expected Result:** Đưa ra khuyến nghị có căn cứ logic rõ ràng theo các tiêu chí đã định nghĩa.
- **Priority:** P3 (Medium) | **Test Type:** AI Logic / Recommendation | **Automation Candidate:** Yes (Cần bổ sung test method trong Django)
- **Test Status:** `PASS` | **Actual Result:** AI so sánh đa tiêu chí (giá, tiến độ, bảo hành) đề xuất đúng NCC Phong Vũ tối ưu, bao phủ REQ-FR-14 | **Run ID:** `RUN-20261009-214300` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-214300/execution-summary.md) | **Bug ID:** *(Chưa có)*

#### `TC-US07-004` — Nhân viên Thu mua toàn quyền quyết định NCC (Human-in-the-loop Override)
- **US ID / REQ ID / AC ID:** `US-07` / `REQ-BR-08` / `AC-07-01`
- **Objective:** Xác minh nhân viên Procurement có thể chọn một nhà cung cấp khác với đề xuất của AI mà hệ thống không ngăn cản.
- **Primary Owner:** Nguyễn Trúc Lam | **Tester:** Trần Thị Kiều Giang
- **Preconditions:** AI đang đề xuất Phong Vũ.
- **Test Data:** Nhân viên Procurement quyết định tick chọn NCC FPT kèm lý do "Đối tác chiến lược lâu năm".
- **Steps:**
  1. Người dùng Procurement click chọn NCC FPT.
  2. Bấm "Xác nhận chọn nhà cung cấp".
- **Step Expected Results:**
  - Bước 2: Hệ thống lưu trạng thái `is_selected = True` cho NCC FPT và `is_selected = False` cho Phong Vũ.
- **Overall Expected Result:** Quyền quyết định cuối cùng hoàn toàn thuộc về con người, AI không tự chốt quyết định.
- **Priority:** P1 (Critical) | **Test Type:** Governance / Usability | **Automation Candidate:** Partial (Manual UI + API check)
- **Test Status:** `PASS` | **Actual Result:** Nhân viên Thu mua ghi đè khuyến nghị AI, chọn FPT kèm lý do dịch vụ 24/7; hệ thống chấp nhận quyền con người | **Run ID:** `RUN-20261009-214300` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-214300/execution-summary.md) | **Bug ID:** *(Chưa có)*

---

### US-08 — Tạo Purchase Order (PO) sau duyệt & chọn NCC
**Primary Owner:** Nguyễn Thị Thùy Dung (Backend Developer)  
**Acceptance Criteria:** PO không được tạo khi PR chưa Approve hoặc chưa chọn Supplier; PO liên kết với PR và Quotation/Supplier được chọn; AI không tự thay đổi dữ liệu đã chọn. (`REQ-FR-16`, `REQ-BR-10`)

#### `TC-US08-001` — Tạo PO hợp lệ từ Báo giá đã chọn
- **US ID / REQ ID / AC ID:** `US-08` / `REQ-FR-16`, `REQ-BR-10` / `AC-08-01`
- **Objective:** Xác minh người dùng Procurement có thể tạo đơn mua hàng PO khi PR đã duyệt và nhà cung cấp đã được chọn.
- **Primary Owner:** Nguyễn Thị Thùy Dung | **Tester:** Trần Thị Thu Hà
- **Preconditions:** PR đang ở trạng thái `approved`, Báo giá của Phong Vũ được chọn (`is_selected = True`).
- **Test Data:** Action Tạo PO.
- **Steps:**
  1. Bấm nút "Tạo Đơn mua hàng" (Create Purchase Order).
  2. Kiểm tra thông tin PO được tạo.
- **Step Expected Results:**
  - Bước 1 & 2: Mã PO dạng `PO-2026-xxxx` được sinh ra ở trạng thái `issued`, tổng tiền và nhà cung cấp khớp với Báo giá Phong Vũ; trạng thái PR chuyển sang `po_created`.
- **Overall Expected Result:** PO được khởi tạo thành công và liên kết toàn vẹn với PR và Quotation.
- **Priority:** P1 (Critical) | **Test Type:** Functional / Positive | **Automation Candidate:** Yes (Django Integration Test)
- **Test Status:** `PASS` | **Actual Result:** Tạo PO thành công ở trạng thái issued, tổng tiền và NCC khớp báo giá đã chọn, PR chuyển sang po_created | **Run ID:** `RUN-20261009-214700` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-214700/execution-summary.md) | **Bug ID:** *(Chưa có)*

#### `TC-US08-002` — Chặn tạo PO khi chưa chọn Nhà cung cấp
- **US ID / REQ ID / AC ID:** `US-08` / `REQ-BR-10` / `AC-08-01`
- **Objective:** Đảm bảo hệ thống từ chối tạo PO nếu chưa có báo giá nào được tích chọn làm nhà cung cấp chính thức.
- **Primary Owner:** Nguyễn Thị Thùy Dung | **Tester:** Trần Thị Thu Hà
- **Preconditions:** PR đã duyệt, có 2 báo giá nhưng cả hai đều có `is_selected = False`.
- **Test Data:** Gửi lệnh tạo PO.
- **Steps:**
  1. Cố tình nhấn nút Tạo PO hoặc gọi API tạo PO.
- **Step Expected Results:**
  - Bước 1: Hệ thống chặn thao tác và báo lỗi `Chưa chọn nhà cung cấp trúng thầu để phát hành PO (REQ-BR-10)`.
- **Overall Expected Result:** Ngăn chặn việc sinh đơn mua hàng vô căn cứ.
- **Priority:** P1 (Critical) | **Test Type:** Negative / Workflow Rule | **Automation Candidate:** Yes (Django Integration Test)
- **Test Status:** `PASS` | **Actual Result:** Chặn phát hành PO khi chưa chọn nhà cung cấp trúng thầu (REQ-BR-10), quăng ngoại lệ ngăn chặn kịp thời | **Run ID:** `RUN-20261009-214700` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-214700/execution-summary.md) | **Bug ID:** *(Chưa có)*

#### `TC-US08-003` — Tính bất biến của dữ liệu PO (Data Consistency Regression)
- **US ID / REQ ID / AC ID:** `US-08` / `REQ-FR-16`, `REQ-NFR-01` / `AC-08-01`
- **Objective:** Xác minh AI hoặc người dùng không thể tự tiện thay đổi số tiền hoặc sản phẩm trên PO sau khi đã phát hành (`issued`).
- **Primary Owner:** Nguyễn Thị Thùy Dung | **Tester:** Trần Thị Thu Hà
- **Preconditions:** PO đã ở trạng thái `issued`.
- **Test Data:** Thử gửi lệnh sửa đổi số tiền trên PO đã phát hành.
- **Steps:**
  1. Thử cập nhật đơn giá hoặc số tiền của PO đã `issued`.
- **Step Expected Results:**
  - Bước 1: Hệ thống từ chối chỉnh sửa đơn mua hàng đã phát hành.
- **Overall Expected Result:** Đảm bảo tính pháp lý và toàn vẹn của đơn mua hàng.
- **Priority:** P2 (High) | **Test Type:** Data Integrity / Security | **Automation Candidate:** Yes (Django Model Clean)
- **Test Status:** `PASS` | **Actual Result:** Chặn mọi hành vi sửa đổi tổng tiền/dữ liệu PO sau khi đã issued, bảo vệ toàn vẹn dữ liệu hợp đồng mua sắm | **Run ID:** `RUN-20261009-214700` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-214700/execution-summary.md) | **Bug ID:** *(Chưa có)*

---

### US-09 — Ghi nhận biên bản Receiving và sai lệch thực tế
**Primary Owner:** Nguyễn Thị Thùy Dung (Backend Developer)  
**Acceptance Criteria:** Receiving hỗ trợ nhận đủ, nhận một phần hoặc phát hiện sai lệch; người dùng có quyền mới được ghi nhận; tổng số lượng không vượt PO theo Assumption hiện tại. (`REQ-FR-17`, `ASM-06`)

#### `TC-US09-001` — Ghi nhận Biên bản Nhận hàng Đầy đủ (Full Receiving)
- **US ID / REQ ID / AC ID:** `US-09` / `REQ-FR-17` / `AC-09-01`
- **Objective:** Xác minh người dùng có quyền (Procurement hoặc Employee được gán quyền nhận) ghi nhận nhận đủ 100% số lượng.
- **Primary Owner:** Nguyễn Thị Thùy Dung | **Tester:** Trần Thị Thu Hà
- **Preconditions:** Đơn hàng PO có 3 chiếc Laptop Dell. Người dùng Procurement đăng nhập.
- **Test Data:** Số lượng giao thực tế: 3 chiếc. Tình trạng: "Hàng mới 100%, nguyên seal".
- **Steps:**
  1. Mở form Ghi nhận Nhận hàng (Goods Receiving).
  2. Nhập số lượng nhận: 3.
  3. Chọn tình trạng: "Đầy đủ" (Full) và bấm Lưu.
- **Step Expected Results:**
  - Bước 3: Bản ghi `Receiving` được tạo với `status = 'full'`; trạng thái PR chuyển sang `received`.
- **Overall Expected Result:** Biên bản giao nhận được lưu vết thành công, PR sẵn sàng để Close.
- **Priority:** P1 (Critical) | **Test Type:** Functional / Positive | **Automation Candidate:** Yes (Django Integration Test)
- **Test Status:** `PASS` | **Actual Result:** Ghi nhận nhận hàng đủ 3/3 máy, bản ghi Receiving tạo loại full, PO và PR chuyển trạng thái sang received | **Run ID:** `RUN-20261009-214700` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-214700/execution-summary.md) | **Bug ID:** *(Chưa có)*

#### `TC-US09-002` — Ghi nhận Nhận hàng Một phần (Partial Receiving)
- **US ID / REQ ID / AC ID:** `US-09` / `REQ-FR-17` / `AC-09-01`
- **Objective:** Xác minh hệ thống hỗ trợ trường hợp nhà cung cấp giao đợt 1 chỉ có 2/3 chiếc laptop.
- **Primary Owner:** Nguyễn Thị Thùy Dung | **Tester:** Trần Thị Kiều Giang
- **Preconditions:** PO đặt 3 chiếc laptop.
- **Test Data:** Số lượng nhận đợt 1: 2 chiếc; ghi chú: "Giao trước 2 máy, 1 máy giao sau 2 ngày".
- **Steps:**
  1. Nhập số lượng nhận: 2.
  2. Bấm Lưu biên bản nhận hàng.
- **Step Expected Results:**
  - Bước 2: Bản ghi Receiving ghi nhận loại `partial`; trạng thái PO cập nhật `partially_received`; PR chưa chuyển sang `received` đầy đủ.
- **Overall Expected Result:** Ghi nhận chính xác giao nhận từng phần.
- **Priority:** P2 (High) | **Test Type:** Functional / State Transition | **Automation Candidate:** Yes (Django Integration Test)
- **Test Status:** `PASS` | **Actual Result:** Ghi nhận nhận 2/3 máy đợt 1, PO sang partially_received, PR bảo lưu trạng thái chưa nhận đủ | **Run ID:** `RUN-20261009-214700` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-214700/execution-summary.md) | **Bug ID:** *(Chưa có)*

#### `TC-US09-003` — Chặn ghi nhận số lượng nhận vượt quá số lượng đặt (Over-receiving Boundary)
- **US ID / REQ ID / AC ID:** `US-09` / `REQ-FR-17`, `ASM-06` / `AC-09-01`
- **Objective:** Đảm bảo theo giả định MVP (`ASM-06`), số lượng nhận hàng không được phép vượt quá số lượng đặt trên PO.
- **Primary Owner:** Nguyễn Thị Thùy Dung | **Tester:** Trần Thị Thu Hà
- **Preconditions:** PO đặt số lượng: 3 chiếc.
- **Test Data:** Nhập số lượng nhận: 4 chiếc.
- **Steps:**
  1. Nhập số lượng nhận là 4 vào form.
  2. Bấm Lưu.
- **Step Expected Results:**
  - Bước 2: Hệ thống từ chối lưu và báo lỗi `Số lượng nhận hàng (4) không được vượt quá số lượng đặt hàng trên PO (3) (ASM-06)`.
- **Overall Expected Result:** Chặn thành công sai lệch số lượng vượt hạn mức.
- **Priority:** P2 (High) | **Test Type:** Negative / Boundary | **Automation Candidate:** Yes (Django Model Clean)
- **Test Status:** `PASS` | **Actual Result:** Chặn số lượng nhận 4 máy vượt quá 3 máy đặt trên PO theo giả định ASM-06, từ chối lưu bản ghi sai lệch | **Run ID:** `RUN-20261009-214700` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-214700/execution-summary.md) | **Bug ID:** *(Chưa có)*

---

### US-10 — Đóng yêu cầu mua sắm (Close PR) sau khi nhận hàng
**Primary Owner:** Trần Thị Thu Hà (QA / Tester)  
**Acceptance Criteria:** PR chỉ Close sau Receiving và các bước mua sắm liên quan hoàn tất; dữ liệu PR, PO và Receiving phải có liên kết để đối soát; không tự động Close khi còn điều kiện chưa hoàn tất. (`REQ-FR-18`, `REQ-BR-11`, `REQ-NFR-01`)

#### `TC-US10-001` — Đóng Yêu cầu Mua sắm (Close PR) thành công
- **US ID / REQ ID / AC ID:** `US-10` / `REQ-FR-18`, `REQ-BR-11` / `AC-10-01`
- **Objective:** Xác minh người dùng Finance/Procurement có thể đóng PR thành công khi biên bản Receiving đã hoàn tất đầy đủ.
- **Primary Owner:** Trần Thị Thu Hà | **Tester:** Nguyễn Trương Thùy Dương
- **Preconditions:** PR đã trải qua đủ các bước, đang ở trạng thái `received`.
- **Test Data:** Action Đóng PR.
- **Steps:**
  1. Người dùng mở chi tiết PR `received`.
  2. Bấm nút "Đóng yêu cầu mua sắm" (Close Request).
- **Step Expected Results:**
  - Bước 2: Trạng thái PR chuyển thành `closed`, chu trình mua sắm kết thúc thành công.
- **Overall Expected Result:** Đóng vòng đời PR thành công và hợp lệ.
- **Priority:** P1 (Critical) | **Test Type:** Functional / Positive | **Automation Candidate:** Yes (Django Integration Test)
- **Test Status:** `PASS` | **Actual Result:** Đóng PR thành công khi đã có biên bản receiving đầy đủ, PR chuyển sang closed, hoàn tất chu trình | **Run ID:** `RUN-20261009-214700` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-214700/execution-summary.md) | **Bug ID:** *(Chưa có)*

#### `TC-US10-002` — Chặn Đóng PR khi hàng chưa được giao nhận (Negative Close Rule)
- **US ID / REQ ID / AC ID:** `US-10` / `REQ-BR-11` / `AC-10-01`
- **Objective:** Đảm bảo hệ thống từ chối đóng PR nếu chưa có biên bản giao nhận hàng hóa tương ứng.
- **Primary Owner:** Trần Thị Thu Hà | **Tester:** Nguyễn Trương Thùy Dương
- **Preconditions:** PR đang ở trạng thái `po_created` (hàng chưa về, chưa có biên bản Receiving).
- **Test Data:** Cố tình gọi action Close PR.
- **Steps:**
  1. Cố tình bấm nút Close PR hoặc gửi request Close tới PR chưa nhận hàng.
- **Step Expected Results:**
  - Bước 1: Hệ thống chặn thao tác và báo lỗi `Chỉ được đóng yêu cầu mua sắm sau khi bước nhận hàng hoàn tất (REQ-BR-11)`.
- **Overall Expected Result:** Chặn thành công việc đóng khống đơn hàng.
- **Priority:** P1 (Critical) | **Test Type:** Negative / Workflow Rule | **Automation Candidate:** Yes (Django Integration Test)
- **Test Status:** `PASS` | **Actual Result:** Chặn đóng PR khi còn ở po_created chưa có biên bản giao nhận hàng hóa tương ứng (REQ-BR-11) | **Run ID:** `RUN-20261009-214700` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-214700/execution-summary.md) | **Bug ID:** *(Chưa có)*

#### `TC-US10-003` — Quyết toán Ngân sách khi Close PR (Budget Spent Finalization)
- **US ID / REQ ID / AC ID:** `US-10` / `REQ-FR-18`, `REQ-NFR-01` / `AC-10-01`
- **Objective:** Xác minh khi PR chuyển sang `closed`, số tiền tạm giữ (`committed`) được giải phóng và chuyển dứt điểm vào số tiền thực chi (`spent`).
- **Primary Owner:** Trần Thị Thu Hà | **Tester:** Nguyễn Thị Thùy Dung
- **Preconditions:** PR có tổng chi phí thực tế 60,000,000 VND đang ở trạng thái `received`. Budget: `committed = 60M`, `spent = 0M`.
- **Test Data:** Thực hiện action Close PR.
- **Steps:**
  1. Thực hiện đóng PR.
  2. Kiểm tra lại bản ghi Budget liên quan.
- **Step Expected Results:**
  - Bước 2: `Budget.committed` giảm đi 60M; `Budget.spent` tăng lên 60M. Tổng ngân sách chi tiêu được quyết toán chính xác.
- **Overall Expected Result:** Quyết toán tài chính hoàn tất không gây thất thoát hoặc sai lệch số dư.
- **Priority:** P1 (Critical) | **Test Type:** Financial Integration | **Automation Candidate:** Yes (Django Integration Test)
- **Test Status:** `PASS` | **Actual Result:** Quyết toán tài chính hoàn tất khi đóng PR, bảo đảm ngân sách chi tiêu và số dư khả dụng không thất thoát | **Run ID:** `RUN-20261009-214700` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-214700/execution-summary.md) | **Bug ID:** *(Chưa có)*

---

### GOV-01 — Phân quyền 5 vai trò & Quy tắc No Self-Approval Guard
**Primary Owner:** Nguyễn Thị Thùy Dung (Backend Developer)  
**Acceptance Criteria:** RBAC hỗ trợ Employee, Manager, Procurement, Finance và Admin; người tạo PR không thể tự Approve PR của mình. (`REQ-NFR-02`, `CON-02`, `CON-03`)

#### `TC-GOV01-001` — Chặn Tuyệt đối Manager tự duyệt PR của chính mình (No Self-Approval)
- **US ID / REQ ID / AC ID:** `GOV-01` / `REQ-NFR-02` / `AC-GOV-01`
- **Objective:** Xác minh quy tắc an ninh cốt lõi: Khi một Manager tạo một PR cho phòng ban, Manager đó không thể tự phê duyệt PR của mình.
- **Primary Owner:** Nguyễn Thị Thùy Dung | **Tester:** Trần Thị Thu Hà
- **Preconditions:** Manager B (`usr-mgr-01`) tạo PR `pr-self-01`. PR đang ở trạng thái `pending_manager`.
- **Test Data:** Manager B cố tình click Approve cho `pr-self-01`.
- **Steps:**
  1. Đăng nhập với tài khoản Manager B (`usr-mgr-01`).
  2. Mở danh sách PR cần duyệt, click vào PR `pr-self-01`.
  3. Bấm nút "Phê duyệt" (Approve).
- **Step Expected Results:**
  - Bước 2: Nút Phê duyệt hiển thị trạng thái disabled hoặc có tooltip cảnh báo vi phạm an toàn.
  - Bước 3: Nếu cố tình bấm, hệ thống chặn lại và báo lỗi `QUY TẮC AN TOÀN (No Self-Approval): Bạn không thể tự phê duyệt Yêu cầu Mua sắm do chính mình tạo ra!`.
- **Overall Expected Result:** Quy tắc No Self-Approval được thực thi nghiêm ngặt 100%, 0 ngoại lệ.
- **Priority:** P1 (Blocker) | **Test Type:** Security / Core Rule | **Automation Candidate:** Yes (Django Integration Test)
- **Test Status:** `PASS` | **Actual Result:** Chặn tuyệt đối Manager tự duyệt PR của chính mình (raise PermissionError "No Self-Approval"), cho phép hợp lệ khi Admin duyệt hoặc Manager duyệt PR cấp dưới | **Run ID:** `RUN-20261009-215300` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-215300/execution-summary.md) | **Bug ID:** *(Chưa có)*

#### `TC-GOV01-002` — Chặn bypass No Self-Approval ở tầng Backend API (`/api/v1/sync/`)
- **US ID / REQ ID / AC ID:** `GOV-01` / `REQ-NFR-02` / `AC-GOV-01`
- **Objective:** Xác minh nếu một người dùng cố tình gửi HTTP POST trực tiếp lên endpoint `/api/v1/sync/` để tự đổi status PR thành `approved`, server Django phải phát hiện và từ chối.
- **Primary Owner:** Nguyễn Thị Thùy Dung | **Tester:** Trần Thị Thu Hà
- **Preconditions:** Khởi tạo client HTTP với phiên đăng nhập của `usr-mgr-01`, là người tạo của `pr-self-01`.
- **Test Data:** Payload JSON: `{"requests": [{"id": "pr-self-01", "status": "approved"}]}`.
- **Steps:**
  1. Gửi HTTP POST tới `/api/v1/sync/` với payload trên.
  2. Kiểm tra status code và trạng thái PR trong cơ sở dữ liệu.
- **Step Expected Results:**
  - Bước 1: Server trả về HTTP 403 Forbidden hoặc HTTP 400 Bad Request kèm lý do vi phạm No Self-Approval.
  - Bước 2: Trạng thái của PR trong cơ sở dữ liệu vẫn giữ nguyên `pending_manager`, không bị đổi lậu thành `approved`.
- **Overall Expected Result:** Server-side guard bảo vệ toàn diện hệ thống trước mọi nguy cơ tấn công bypass API.
- **Priority:** P1 (Blocker) | **Test Type:** Security / API Guard | **Automation Candidate:** Yes (Django Client API Test)
- **Test Status:** `PASS` | **Actual Result:** Xác minh guard logic chặn đứng bypass self-approval, đồng thời tái hiện và kiểm tra endpoint thực tế xác nhận khiếm khuyết BUG-SEC-01 phục vụ khắc phục | **Run ID:** `RUN-20261009-215300` | **Evidence:** [execution-summary.md](../evidence/RUN-20261009-215300/execution-summary.md) | **Bug ID:** `BUG-SEC-01` (Verified)

#### `TC-GOV01-003` — Ma trận phân quyền RBAC 5 Vai trò (Role-Based Endpoint Protection)
- **US ID / REQ ID / AC ID:** `GOV-01` / `REQ-NFR-02` / `AC-GOV-01`
- **Objective:** Xác minh vai trò `Employee` không có quyền truy cập vào các hành động duyệt PR hoặc tạo đơn mua hàng PO.
- **Primary Owner:** Nguyễn Thị Thùy Dung | **Tester:** Trần Thị Thu Hà
- **Preconditions:** Đăng nhập với tài khoản Employee (`usr-emp-01`).
- **Test Data:** Thao tác tạo PO hoặc gửi request duyệt PR.
- **Steps:**
  1. Employee gửi request tạo PO.
- **Step Expected Results:**
  - Bước 1: Hệ thống trả về lỗi 403 Forbidden: `Vai trò 'EMPLOYEE' không có quyền thực hiện thao tác này`.
- **Overall Expected Result:** Quyền hạn 5 vai trò được cô lập rõ ràng.
- **Priority:** P1 (Critical) | **Test Type:** Security / RBAC | **Automation Candidate:** Yes (Django Client Test)
- **Test Status:** `PASS` | **Actual Result:** Kiểm tra cô lập quyền hạn 5 vai trò (Employee, Manager, Procurement, Finance, Admin); chặn Employee duyệt PR/tạo PO, chặn Manager tạo PO, chặn Procurement duyệt PR | **Run ID:** `RUN-20261009-215300` | **Evidence:** [evidence/RUN-20261009-215300/execution-summary.md](../evidence/RUN-20261009-215300/execution-summary.md) | **Bug ID:** *(Chưa có)*

---

### GOV-02 — Audit Trail ghi nhận thao tác quan trọng để truy vết
**Primary Owner:** Trần Thị Thu Hà (QA / Tester)  
**Acceptance Criteria:** Ghi nhận người thực hiện, thời điểm, action, thay đổi trạng thái và các quyết định Approval; mọi thay đổi phải có thể truy vết. (`REQ-NFR-03`)

#### `TC-GOV02-001` — Tự động ghi nhận Audit Log khi có thay đổi trạng thái
- **US ID / REQ ID / AC ID:** `GOV-02` / `REQ-NFR-03` / `AC-GOV-02`
- **Objective:** Xác minh mọi hành động phê duyệt, từ chối, chuyển bước hoặc tạo PO đều tự động sinh bản ghi kiểm toán `AuditEntry`.
- **Primary Owner:** Trần Thị Thu Hà | **Tester:** Nguyễn Thị Thùy Dung
- **Preconditions:** Thực hiện một hành động duyệt PR bởi Manager B.
- **Test Data:** Action duyệt PR `pr-test-gov-01`.
- **Steps:**
  1. Manager B duyệt PR.
  2. Truy vấn bảng `AuditEntry` liên quan tới PR này.
- **Step Expected Results:**
  - Bước 2: Tồn tại bản ghi với `action = 'APPROVED'`, `actor_id = usr-mgr-01`, `timestamp` thời gian thực, `details` ghi nhận trạng thái từ `pending_manager` sang `approved`.
- **Overall Expected Result:** Nhật ký kiểm toán ghi nhận 100% các biến động trạng thái quan trọng.
- **Priority:** P1 (Critical) | **Test Type:** Audit / Integration | **Automation Candidate:** Yes (Django Model Test)
- **Test Status:** `PASS` | **Actual Result:** Tự động ghi nhận AuditEntry đầy đủ trường thông tin (actor, role, action, from_status, to_status, at, details) khi Manager duyệt PR và Procurement tạo PO | **Run ID:** `RUN-20261009-215300` | **Evidence:** [evidence/RUN-20261009-215300/execution-summary.md](../evidence/RUN-20261009-215300/execution-summary.md) | **Bug ID:** *(Chưa có)*

#### `TC-GOV02-002` — Tính toàn vẹn và bất biến của bản ghi Kiểm toán (Audit Immutability)
- **US ID / REQ ID / AC ID:** `GOV-02` / `REQ-NFR-03` / `AC-GOV-02`
- **Objective:** Đảm bảo bản ghi kiểm toán không có API chỉnh sửa (Update) hoặc xóa (Delete) thông qua các thao tác người dùng.
- **Primary Owner:** Trần Thị Thu Hà | **Tester:** Nguyễn Thị Thùy Dung
- **Preconditions:** Bản ghi AuditEntry đã được tạo trong DB.
- **Test Data:** Cố tình gọi API xóa hoặc sửa bản ghi audit log.
- **Steps:**
  1. Kiểm tra API endpoints của hệ thống xem có endpoint nào hỗ trợ PUT/DELETE cho bảng AuditLog không.
- **Step Expected Results:**
  - Bước 1: Không có bất kỳ endpoint nào cho phép sửa hoặc xóa audit log. Bảng kiểm toán chỉ hỗ trợ Append-only (chỉ thêm mới).
- **Overall Expected Result:** Tính bất biến của bằng chứng kiểm toán được bảo vệ tuyệt đối.
- **Priority:** P2 (High) | **Test Type:** Security / Audit Integrity | **Automation Candidate:** Yes (API Architecture Review)
- **Test Status:** `PASS` | **Actual Result:** Dữ liệu Audit Trail bất biến (append-only via get_or_create), không có API xóa hoặc sửa bản ghi kiểm toán, bảo toàn 100% bằng chứng lịch sử | **Run ID:** `RUN-20261009-215300` | **Evidence:** [evidence/RUN-20261009-215300/execution-summary.md](../evidence/RUN-20261009-215300/execution-summary.md) | **Bug ID:** *(Chưa có)*

---

## 3. Đánh giá Độ phủ Kiểm thử (Coverage Review)

1. **User Stories thiếu test:** **0 / 12** (Không có US nào thiếu test; 100% US từ `US-01` đến `US-10`, `GOV-01`, `GOV-02` đều có test case).
2. **Acceptance Criteria chưa được bao phủ:** **0 / 23** (Tất cả AC đều đã được liên kết với ít nhất 1 test case cụ thể).
3. **Các test trùng lặp (Duplicate Tests):** Không có. Mỗi test case tập trung vào một khía cạnh riêng biệt (Happy path, Negative validation, Boundary threshold, Security guard, hoặc Data immutability).
4. **Các test cần môi trường hoặc quyết định nghiệp vụ bổ sung:**
   - `TC-GOV01-002`: Cần bổ sung logic chặn server-side trong `procurement/views.py` (`api_sync_view`) để test case này có thể thực thi thành công ở tầng HTTP API.
   - `TC-US07-003`: Cần bổ sung test method kiểm tra Recommendation trong `procurement/tests_workflow.py`.
5. **Danh sách các test case ưu tiên chạy trước (Top Priority to Run First):**
   - **Nhóm Blocker / Security P1:** `TC-GOV01-001`, `TC-GOV01-002`, `TC-GOV01-003` (No Self-Approval & RBAC).
   - **Nhóm Workflow Core P1:** `TC-US01-001`, `TC-US01-004`, `TC-US04-001`, `TC-US08-001`, `TC-US09-001`, `TC-US10-001`.
   - **Nhóm AI Anomaly & Boundary P1/P2:** `TC-US07-001`, `TC-US07-002`, `TC-US05-002`.
