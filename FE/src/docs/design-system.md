# Design Wireframe

## 1. Mục đích

Prototype Magic Patterns là wireframe tương tác dùng để làm rõ các flow quan trọng của ProcureAI. Wireframe tập trung kiểm tra Login, phân quyền, tạo Purchase Request, Approval, Budget Review, Sourcing, Purchase Order, Receiving và các trạng thái lỗi/cảnh báo.

Wireframe không phải UI final, technical specification hoặc cơ chế authentication production.

## 2. Prototype Reference

- Magic Patterns: https://www.magicpatterns.com/c/utapnp7s8wvsxbtcfalh2b
- Loại artifact: Interactive wireframe
- Dữ liệu: Sample/mock data
- Figma URL: https://www.figma.com/design/XwhEcVr768Olq9gDiSoIpV/Group-1?node-id=0-1
- Figma page: `ProcureAI Wireframes`

Prototype chỉ dùng để kiểm tra flow và thông tin cần hiển thị. Visual design system, technical architecture và API contract cần được xác nhận ở artifact riêng.

## 3. Login và phân quyền

### 3.1 Login flow

```text
Login
→ Xác thực tài khoản
→ Xác định role
→ Hiển thị navigation và action theo quyền
→ Truy cập màn hình được phép
```

Login wireframe cần thể hiện username/email, password, Login, loading, sai thông tin, tài khoản bị khóa, session hết hạn và Logout.

### 3.2 Role trong MVP

| Role | Chức năng chính |
|---|---|
| Employee | Tạo PR, chỉnh sửa PR của mình, Submit và theo dõi trạng thái |
| Manager | Xem PR liên quan, Approve, Reject, yêu cầu Revision hoặc chuyển Finance |
| Finance | Kiểm tra Budget và xử lý PR được chuyển sang Finance |
| Procurement | Quản lý Supplier, Quotation, so sánh, chọn Supplier và tạo PO |
| Admin | Quản lý RBAC, danh mục, Budget và Audit Trail |

### 3.3 Quyền và quy tắc bắt buộc

| Khu vực | Employee | Manager | Finance | Procurement | Admin |
|---|---:|---:|---:|---:|---:|
| Purchase Requests | PR của mình | PR liên quan | PR được chuyển | PR đã duyệt | Xem |
| New Request | Có | Không phải flow chính | Không phải flow chính | Không phải flow chính | Có thể quản trị |
| Approvals | Không | Có | Theo policy | Không | Xem Audit |
| Budget Review | Không | Xem cảnh báo | Có | Không | Quản lý Budget |
| Sourcing / Suppliers | Không | Không | Không | Có | Xem/quản lý |
| Purchase Orders | Xem liên quan | Xem | Xem/đối soát | Tạo/quản lý | Xem |
| Receiving | Khi được phân quyền | Khi được phân quyền | Đối soát | Theo dõi | Xem |

- Người tạo PR không được tự Approve PR đó.
- Người không có quyền không được thấy action nhạy cảm.
- AI không được tự Approve, Reject hoặc chọn Supplier.
- Chỉ tạo PO sau khi PR được Approve và Supplier được chọn.
- Chỉ Close sau khi Receiving và đối soát `PR ↔ PO ↔ Receiving` hoàn tất.
- Reject, Revision và chuyển Finance phải có lý do.
- Thay đổi quyền và trạng thái quan trọng phải có Audit Trail.

## 4. Wireframe screens

| Route | Screen | Nội dung chính |
|---|---|---|
| `/requests` | Purchase Requests | Danh sách PR, filter, search, status, budget warning và error alert |
| `/requests/new` | New Purchase Request | Free-text note, AI restructure, required fields, line items, tổng tiền và checklist |
| `/approvals` | Approvals | Hàng chờ Manager, Budget còn lại, Approve/Reject/Revision/Finance |
| `/budget` | Budget Review | PR được chuyển Finance, allocated/available/used và lý do vượt Budget |
| `/sourcing` | Sourcing | Collect quotations, comparison và AI recommendation |
| `/suppliers` | Suppliers | Danh sách và quản lý Supplier theo quyền Procurement |
| `/orders` | Purchase Orders | PO đang giao, Received chờ Close và Closed |
| `/assumptions` | Prototype Assumptions | Sample data và các giới hạn của prototype |

### 4.1 New Purchase Request

AI chỉ restructure nội dung do người dùng nhập. Người dùng phải review, chỉnh sửa hoặc xác nhận trước Submit. Không tự điền giá, ngày hoặc approver nếu không có evidence.

Fields tối thiểu: Request title, Category, Department, Cost centre, Required-by date, Delivery location, Business justification, Line items, Quantity và Estimated unit price.

### 4.2 Approval và Budget

Manager nhìn thấy thông tin PR đã chuẩn hóa, Budget còn lại và cảnh báo vượt Budget. Manager có thể Approve, Reject, yêu cầu Revision hoặc chuyển Finance. Finance thực hiện Budget Review khi được định tuyến.

### 4.3 Sourcing và PO

Procurement thu thập nhiều Quotation, review dữ liệu extraction, chỉnh sửa nếu cần, xem comparison và AI recommendation. Procurement là người chọn Supplier. PO chỉ được tạo từ PR đã Approve và Supplier đã chọn.

### 4.4 Receiving và Close

Receiving hỗ trợ nhận đủ, nhận một phần và sai lệch. Tổng số lượng không được vượt PO. Close bị block nếu Receiving hoặc đối soát `PR ↔ PO ↔ Receiving` chưa hoàn tất.

## 5. Visual/UI Specification

### 5.1 Visual direction

- B2B operational tool, ưu tiên đọc nhanh và xử lý công việc.
- Giao diện sáng, nền trung tính, tương phản rõ.
- Ít trang trí; tập trung vào status, Budget, Approval và workflow.
- Primary action dùng indigo.
- Warning và Error luôn có icon và text, không chỉ dùng màu.

### 5.2 Color tokens

| Token | Hex | Mục đích |
|---|---|---|
| `color-primary-600` | `#4F46C6` | Primary button, active tab |
| `color-primary-700` | `#4338A8` | Hover/focus primary |
| `color-primary-50` | `#EEF2FF` | Selected/active background |
| `color-text-900` | `#101828` | Heading và text chính |
| `color-text-700` | `#344054` | Nội dung phụ, label |
| `color-text-500` | `#667085` | Placeholder, metadata |
| `color-canvas` | `#F5F6F8` | Nền toàn trang |
| `color-surface` | `#FFFFFF` | Panel, table, form |
| `color-border` | `#D0D5DD` | Border, divider, input |
| `color-success-600` | `#16803C` | Approved, Received, Closed |
| `color-success-50` | `#ECFDF3` | Nền success |
| `color-warning-700` | `#B54708` | Budget/anomaly warning |
| `color-warning-50` | `#FFFAEB` | Nền warning |
| `color-danger-600` | `#B42318` | Error, Rejected, Blocked |
| `color-danger-50` | `#FEF3F2` | Nền error |
| `color-info-600` | `#026AA2` | AI suggestion, information |
| `color-info-50` | `#F0F9FF` | Nền AI/information |

### 5.3 Typography và spacing

- Font: `Inter`, fallback `ui-sans-serif, sans-serif`.
- Page title: 28/36 px; Section title: 20/28 px; Body: 14/20 px; Caption: 12/18 px.
- Letter spacing: `0`.
- Base spacing: 4 px; scale: 4, 8, 12, 16, 24, 32, 48 px.
- Desktop page padding: 32 px; tablet: 24 px; mobile: 16 px.
- Input/button radius: 6 px; card/panel radius: 8 px; badge radius: 999 px.
- Border: `1 px solid #D0D5DD`.
- Focus ring: `2 px solid #4F46C6` với offset 2 px.

### 5.4 Layout

- Desktop từ 1200 px: sidebar khoảng 240 px và content max-width 1200 px.
- Tablet 768–1199 px: sidebar có thể thu gọn; table cho phép scroll ngang.
- Mobile dưới 768 px: sidebar thành drawer, content một cột, header giữ nút mở navigation.
- Form chuyển từ hai cột sang một cột khi không đủ chiều rộng.
- Table chuyển thành list/card row trên mobile.
- Quotation comparison chuyển thành từng Supplier section có thể mở rộng.
- Không ẩn Budget warning, workflow status hoặc action quan trọng trên mobile.

### 5.5 Button specification

| Variant | Sử dụng | Ví dụ |
|---|---|---|
| Primary | Hành động chính | `New request`, `Submit request` |
| Secondary | Hành động bổ trợ | `Save draft`, `Review` |
| Tertiary | Hành động ít ưu tiên | `View details`, `Dismiss` |
| Danger | Hành động có hậu quả | `Reject`, `Delete` |
| Warning | Định tuyến rủi ro | `Send to Finance` |
| Link | Điều hướng | `View request` |
| Icon-only | Menu, search, close, refresh | Có tooltip |

Button mặc định cao 40 px, compact 32 px, padding ngang 16 px, icon 16–18 px, gap icon/text 8 px và font weight 600. Mỗi button có Default, Hover, Focus, Pressed, Disabled và Loading state. Khi Loading phải giữ nguyên kích thước và chặn click lặp.

Quy tắc flow:

- `New request`, `Submit request`, `Compare`, `Select supplier`, `Create PO`: Primary.
- `Approve`: Success/Primary action.
- `Reject`: Danger.
- `Request revision`: Secondary.
- `Send to Finance`: Warning.
- `Use this`: Secondary compact; `Dismiss`: Tertiary.
- `Close` chỉ enabled khi Receiving và đối soát hoàn tất.

### 5.6 Components và states

| Component | States bắt buộc |
|---|---|
| Navigation | Default, active, collapsed, mobile drawer |
| Input | Empty, filled, focus, invalid, disabled |
| Button | Default, hover, focus, disabled, loading |
| Status badge | Draft, Pending, Approved, Rejected, Revision, Finance Review, Error, Closed |
| Alert card | Warning, error, blocked, actionable |
| AI panel | Loading, suggestion, edited, accepted, no suggestion, error |
| Table/list | Loading, populated, empty, error, retry |
| Workflow stepper | Current, completed, blocked, exception |
| Receiving form | Empty, partial, full, quantity error, exception |

Status badge luôn có icon và text. Alert phải nêu nguyên nhân và next action. AI panel dùng nền `color-info-50`, có `Use this` và `Dismiss`, cho phép chỉnh sửa sau khi áp dụng.

## 6. Login UI

- Desktop: form ở giữa surface rộng tối đa 420 px.
- Mobile: form full-width với padding 16 px.
- Thành phần: logo `Procure`, email/username, password và Login.
- States: default, loading, invalid credentials, account locked, session expired và unauthorized route.

Copy đề xuất:

| Tình huống | Copy |
|---|---|
| Login heading | `Sign in to Procure` |
| Invalid credentials | `Email hoặc mật khẩu không đúng.` |
| Unauthorized | `Bạn không có quyền truy cập màn hình này.` |
| Session expired | `Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.` |
| Account locked | `Tài khoản đang bị khóa. Vui lòng liên hệ Admin.` |
| Loading | `Đang kiểm tra thông tin đăng nhập...` |

## 7. Traceability và giới hạn

Flow wireframe:

```text
Login
→ Purchase Request
→ AI review
→ Manager Approval
→ Finance Budget Check nếu cần
→ Collect Quotations
→ Compare Quotations
→ Select Supplier
→ Create PO
→ Receiving
→ Close
```

Wireframe phải tuân thủ `REQ-FR-01` đến `REQ-FR-18`, `REQ-NFR-02`, `REQ-NFR-03`, `REQ-BR-01` đến `REQ-BR-11` và `CON-01` đến `CON-04`.

Wireframe chưa chốt authentication provider, password policy, session/token implementation, approval hierarchy thực tế, Budget threshold, số quotation tối thiểu hoặc Figma component library. Receiving và Audit Trail cần được bổ sung/kiểm tra thêm nếu chưa có màn hình chi tiết riêng.

## 8. Điều kiện kiểm tra

- Login dẫn đến đúng navigation và action theo role.
- Self-Approval bị chặn.
- PR vượt Budget được cảnh báo hoặc chuyển Finance.
- AI suggestion/extraction luôn có human review.
- Có loading, error và empty states.
- Có nhánh Reject, Revision, Finance Review và Receiving Exception.
- Không bỏ qua Approval, Supplier Selection, PO hoặc Receiving.
- Prototype không được trình bày như Business Rule hoặc technical implementation đã chốt.

**Trạng thái:** Wireframe scope và UI specification đã được người dùng duyệt để lưu. Figma page `ProcureAI Wireframes` đã có đủ 8 nhóm frame: Login, Purchase Requests, New Purchase Request, Manager Approvals, Finance Budget Review, Sourcing, Purchase Orders và Components. Các frame là static wireframe states; chưa phải UI final hoặc production prototype.
