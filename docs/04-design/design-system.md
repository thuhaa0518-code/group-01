# Design System & Wireframe Specification - ProcureAI

> **Trạng thái:** Bản chỉnh sửa chi tiết, chờ nhóm review.
> **Vai trò tài liệu:** Source of truth cho UI/UX (Figma và React). KHÔNG phải Business Rule. Khi mâu thuẫn, ưu tiên: Requirements + Business Rules > MVP Scope > tài liệu này > prototype Magic Patterns.
> **Quy ước đánh dấu:** `[SRC]` = lấy từ Requirements/MVP Scope/Charter. `[UI]` = quyết định thiết kế UI trong tài liệu này. `[OPEN]` = chưa chốt, cần nhóm xác nhận, không được hiển thị như quy tắc đã chốt.

---

## 1. Mục đích và phạm vi

1. Làm rõ mọi flow MVP: Login/Logout, phân quyền, tạo PR, Approval, Budget Review, Sourcing, PO, Receiving, Close, Audit Trail, quản trị Admin và các trạng thái lỗi/cảnh báo.
2. Là đặc tả chung để **Figma và React render giống nhau** (cùng token, cùng component, cùng tên, cùng state).
3. Wireframe/UI dùng **sample/mock data**; không phải authentication production hay technical specification.

### 1.1 Artifact tham chiếu

| Artifact | Giá trị |
|---|---|
| Magic Patterns (wireframe tương tác) | https://www.magicpatterns.com/c/utapnp7s8wvsxbtcfalh2b |
| Figma | https://www.figma.com/design/XwhEcVr768Olq9gDiSoIpV/Group-1?node-id=0-1 |
| Figma page | `ProcureAI Wireframes` |
| Code UI | React + TypeScript (xem mục 14) |

### 1.2 Ngoài phạm vi tài liệu này

Authentication provider, password policy, token/session implementation, approval hierarchy thực tế, Budget threshold, số quotation tối thiểu, API contract. Các mục này là `[OPEN]` (DEC-005, DEC-006, DEC-007).

---

## 2. Nguyên tắc thiết kế

| # | Nguyên tắc | Hệ quả UI |
|---|---|---|
| 1 | Human-in-the-loop `[SRC]` | Mọi AI output đều có bước review: `Use this` / `Edit` / `Dismiss`. Không có nút AI tự Approve, Reject, chọn Supplier, Submit. |
| 2 | No Self-Approval `[SRC]` | Nút Approve/Reject trên PR do chính user tạo bị ẩn hoặc disabled kèm lý do. Server-side vẫn là nơi chặn cuối cùng. |
| 3 | Least privilege | Người không có quyền không thấy action nhạy cảm (ẩn, không chỉ disable); route trái quyền dẫn đến `403`. |
| 4 | Workflow không bỏ bước `[SRC]` | Action ở bước sau bị khóa kèm lý do và link về bước còn thiếu. |
| 5 | Không dựa vào màu | Status, Warning, Error luôn có icon + text. |
| 6 | Cảnh báo có lý do và dữ liệu đối sánh `[SRC]` | Mọi Alert nêu nguyên nhân, dữ liệu tham chiếu, next action. |
| 7 | Mọi trạng thái đều thiết kế | Loading, empty, error, retry, disabled, blocked đều có trong Figma và code. |
| 8 | Ưu tiên đọc nhanh | B2B operational tool, giao diện sáng, ít trang trí. |

---

## 3. Authentication: Login, Session, Logout

### 3.1 Flow tổng

```text
/login
→ Nhập email/username + password
→ Xác thực (mock trong prototype)
→ Xác định role
→ Redirect về landing page theo role (hoặc returnUrl hợp lệ)
→ Render navigation + action theo role
→ Logout hoặc Session hết hạn → /login
```

### 3.2 Landing page sau Login `[UI]`

| Role | Landing |
|---|---|
| Employee | `/requests` |
| Manager | `/approvals` |
| Finance | `/budget` |
| Procurement | `/sourcing` |
| Admin | `/dashboard` |

### 3.3 Trạng thái màn hình Login

| State | Hành vi | Copy |
|---|---|---|
| Default | Form rỗng, focus vào ô đầu | Heading: `Sign in to Procure` |
| Filled | Nút Login enabled khi cả 2 ô có giá trị | |
| Loading | Nút Login loading, khóa form, chặn submit lặp | `Đang kiểm tra thông tin đăng nhập...` |
| Invalid credentials | Banner lỗi trên form, giữ email, xóa password | `Email hoặc mật khẩu không đúng.` |
| Field validation | Lỗi inline dưới ô | `Vui lòng nhập email hoặc tên đăng nhập.` / `Vui lòng nhập mật khẩu.` |
| Account locked | Banner danger, ẩn form submit hoặc disable | `Tài khoản đang bị khóa. Vui lòng liên hệ Admin.` |
| Session expired | Banner warning trên /login, giữ returnUrl | `Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.` |
| Logged out | Banner info (tùy chọn) | `Bạn đã đăng xuất.` |
| Unauthorized route | Chuyển đến màn `403` (xem 3.6) | `Bạn không có quyền truy cập màn hình này.` |
| Network error | Banner danger + `Thử lại` | `Không thể kết nối. Vui lòng thử lại.` |

Thành phần: logo `Procure`, ô email/username, ô password (nút hiện/ẩn mật khẩu, có `aria-label`), nút `Login`. Quên mật khẩu / Remember me: `[OPEN]` (không đưa vào MVP wireframe).

### 3.4 Logout

| Hạng mục | Đặc tả |
|---|---|
| Vị trí | Menu user ở góc trên phải (avatar + tên + role badge). Mobile: trong drawer. |
| Menu user | Hiển thị tên, email, role; mục `Sign out`. |
| Hành vi | Click `Sign out` → xóa phiên mock → về `/login` kèm banner `Bạn đã đăng xuất.` |
| PR đang nhập dở | Nếu form PR có thay đổi chưa lưu: hộp thoại xác nhận `Bạn có thay đổi chưa lưu. Đăng xuất sẽ bỏ các thay đổi này.` với `Ở lại` (Secondary) và `Đăng xuất` (Danger). |
| Audit | Login thành công, Login thất bại, Logout, Session hết hạn ghi Audit Trail (mức sự kiện bảo mật). `[UI]` đề xuất, cần nhóm xác nhận. |

### 3.5 Session

- Hết phiên: hiển thị modal/redirect về `/login` kèm returnUrl, trạng thái "Session expired".
- Thời gian hết phiên, cơ chế token: `[OPEN]`. Prototype mô phỏng bằng nút "Simulate session expiry" trong trang `/assumptions`.
- Sau khi login lại, quay về returnUrl **chỉ khi** role vẫn có quyền; nếu không, về landing page.

### 3.6 Màn lỗi điều hướng

| Route | Khi nào | Nội dung | Action |
|---|---|---|---|
| `/403` | Có phiên nhưng trái quyền | Icon khóa, `Bạn không có quyền truy cập màn hình này.` | `Về trang chính` (landing theo role) |
| `/404` | Không tồn tại | `Không tìm thấy trang.` | `Về trang chính` |
| `/error` | Lỗi không mong đợi | `Đã có lỗi xảy ra.` + mã tham chiếu | `Thử lại` |

---

## 4. Role, RBAC và quy tắc bắt buộc

### 4.1 Role trong MVP `[SRC]`

| Role | Chức năng chính |
|---|---|
| Employee | Tạo PR, chỉnh sửa PR của mình, Submit, theo dõi trạng thái, ghi nhận Receiving khi được phân quyền |
| Manager | Xem PR thuộc phạm vi, Approve, Reject, Request Revision, Send to Finance |
| Finance | Budget Review, phê duyệt ngân sách theo policy, đối soát PR/PO/Receiving |
| Procurement | Quản lý Supplier, thu thập/so sánh Quotation, chọn Supplier, tạo PO |
| Admin | Quản lý tài khoản, RBAC, danh mục, Budget, xem Audit Trail |

### 4.2 Ma trận quyền theo khu vực (menu/route)

Ký hiệu: ✔ có, ✖ không (ẩn khỏi menu, route trả 403), 👁 chỉ xem, ◐ có điều kiện (ghi trong ô).

| Khu vực (route) | Employee | Manager | Finance | Procurement | Admin |
|---|---|---|---|---|---|
| Dashboard `/dashboard` | ◐ PR của mình | ◐ PR phạm vi | ◐ PR liên quan ngân sách | ◐ PR đã duyệt | ✔ toàn bộ (xem) |
| Purchase Requests `/requests` | ◐ PR của mình | ◐ PR liên quan | ◐ PR được chuyển | ◐ PR đã duyệt | 👁 |
| New Request `/requests/new` | ✔ | ✖ | ✖ | ✖ | ✖ `[OPEN]` |
| Approvals `/approvals` | ✖ | ✔ | ◐ theo policy | ✖ | 👁 (qua Audit) |
| Budget Review `/budget` | ✖ | 👁 cảnh báo (trên Approvals) | ✔ | ✖ | ✔ quản lý Budget |
| Sourcing `/sourcing` | ✖ | ✖ | ✖ | ✔ | 👁 |
| Suppliers `/suppliers` | ✖ | ✖ | ✖ | ✔ | ✔ quản lý |
| Purchase Orders `/orders` | 👁 liên quan | 👁 | 👁 đối soát | ✔ tạo/quản lý | 👁 |
| Receiving `/receiving` | ◐ khi được phân quyền | ◐ khi được phân quyền | ✔ đối soát | 👁 theo dõi | 👁 |
| Audit Trail `/audit` | ◐ lịch sử PR của mình | ◐ lịch sử PR phạm vi | ◐ lịch sử PR liên quan | ◐ lịch sử PR liên quan | ✔ toàn bộ |
| Users & Roles `/admin/users` | ✖ | ✖ | ✖ | ✖ | ✔ |
| Categories `/admin/categories` | ✖ | ✖ | ✖ | ✖ | ✔ |
| Budget Config `/admin/budgets` | ✖ | ✖ | ✖ | ✖ | ✔ |
| Prototype Assumptions `/assumptions` | ✔ | ✔ | ✔ | ✔ | ✔ |

### 4.3 Ma trận quyền theo action (nút/hành động)

| Action | Employee | Manager | Finance | Procurement | Admin | Điều kiện |
|---|---|---|---|---|---|---|
| Create / Save draft PR | ✔ | ✖ | ✖ | ✖ | ✖ | PR của chính mình |
| Edit PR | ✔ | ✖ | ✖ | ✖ | ✖ | Chủ PR, status Draft hoặc Revision Requested |
| Dùng AI Restructure | ✔ | ✖ | ✖ | ✖ | ✖ | Khi đang soạn PR |
| Submit PR | ✔ | ✖ | ✖ | ✖ | ✖ | Đủ trường bắt buộc, đã review AI nếu có dùng |
| Approve PR | ✖ | ✔ | ◐ | ✖ | ✖ | **Không phải người tạo PR**; Manager trong phạm vi |
| Reject PR (có lý do) | ✖ | ✔ | ◐ | ✖ | ✖ | Như trên |
| Request Revision (có lý do) | ✖ | ✔ | ◐ | ✖ | ✖ | Như trên |
| Send to Finance (có lý do) | ✖ | ✔ | ✖ | ✖ | ✖ | PR cần kiểm tra/phê duyệt ngân sách |
| Budget Review: Approve/Reject | ✖ | ✖ | ✔ | ✖ | ✖ | PR được chuyển hoặc thuộc policy; không phải người tạo |
| Quản lý Supplier | ✖ | ✖ | ✖ | ✔ | ✔ | |
| Upload Quotation | ✖ | ✖ | ✖ | ✔ | ✖ | PR đã Approve |
| Review/Edit AI extraction | ✖ | ✖ | ✖ | ✔ | ✖ | Bắt buộc trước khi Compare |
| Compare, xem Recommendation | ✖ | ✖ | ✖ | ✔ | 👁 | Số quotation tối thiểu `[OPEN]` |
| Select Supplier | ✖ | ✖ | ✖ | ✔ | ✖ | Sau Compare |
| Create PO | ✖ | ✖ | ✖ | ✔ | ✖ | PR Approved + Supplier đã chọn |
| Record Receiving | ◐ | ◐ | ✖ | ✖ | ✖ | Chỉ user được phân quyền Receiving cho PR/PO đó |
| Reconcile PR↔PO↔Receiving | ✖ | ✖ | ✔ | ✖ | ✖ | |
| Close PR | ✖ | ✖ | ✔ `[OPEN]` | ✖ | ✖ | Receiving + đối soát hoàn tất. Ai bấm Close: cần nhóm xác nhận |
| Quản lý user, RBAC, danh mục, Budget | ✖ | ✖ | ✖ | ✖ | ✔ | |
| Xem Audit Trail toàn hệ thống | ✖ | ✖ | ✖ | ✖ | ✔ | |

### 4.4 Quy tắc bắt buộc `[SRC]`

- Người tạo PR không được tự Approve PR đó.
- Người không có quyền không thấy action nhạy cảm.
- AI không tự Approve, Reject, chọn Supplier, thay đổi dữ liệu đã được người dùng xác nhận.
- Chỉ tạo PO sau khi PR Approved và Supplier được chọn.
- Chỉ Close sau khi Receiving và đối soát `PR ↔ PO ↔ Receiving` hoàn tất.
- Reject, Revision, Send to Finance bắt buộc có lý do.
- Thay đổi quyền, thay đổi trạng thái và quyết định quan trọng ghi Audit Trail.
- Tổng số lượng Receiving không vượt số lượng PO (**ASM-06, `[OPEN]`**: hiển thị trong UI như validation của prototype, không trình bày là Business Rule đã chốt).

### 4.5 Hành vi UI khi thiếu quyền

| Tình huống | Hành vi |
|---|---|
| Action nhạy cảm không thuộc role | Ẩn hẳn |
| Action thuộc role nhưng điều kiện chưa thỏa (vd Create PO khi chưa chọn Supplier) | Hiện nhưng disabled + tooltip/helper text nêu điều kiện thiếu |
| Self-Approval | Ẩn Approve/Reject; hiện Alert info: `Bạn là người tạo PR này nên không thể phê duyệt.` |
| Truy cập route trái quyền | `/403` |

---

## 5. Workflow và mô hình trạng thái

### 5.1 Workflow bắt buộc `[SRC]`

```text
Request → Approve → Collect Quotations → Compare → PO → Receive → Close
```

### 5.2 Trạng thái PR (đề xuất thống nhất cho UI) `[UI]`

> Cần đồng bộ lại với `4.glossary.md` (Request Status hiện chỉ có Draft, Submitted, Pending Approval, Approved, Rejected, Completed, Closed). Các trạng thái in nghiêng là bổ sung đề xuất.

| Status badge | Ý nghĩa | Màu/Icon | Bước stepper |
|---|---|---|---|
| Draft | Đang soạn | neutral / `FileEdit` | Request |
| Pending Approval | Chờ Manager | info / `Clock` | Approve |
| *Revision Requested* | Bị yêu cầu chỉnh sửa | warning / `RotateCcw` | Approve (exception) |
| *Finance Review* | Chờ Finance kiểm tra Budget | warning / `Landmark` | Approve |
| Approved | Đã hoàn tất phê duyệt | success / `CheckCircle2` | Approve (done) |
| Rejected | Bị từ chối | danger / `XCircle` | Approve (end) |
| *Collecting Quotations* | Đang thu thập báo giá | info / `Files` | Collect |
| *Comparing* | Đang so sánh, chọn Supplier | info / `Scale` | Compare |
| *PO Issued* | Đã tạo PO, chờ giao hàng | info / `ShoppingCart` | PO |
| *Partially Received* | Nhận một phần | warning / `PackageOpen` | Receive |
| *Receiving Exception* | Có sai lệch, chưa Close được | danger / `AlertTriangle` | Receive (exception) |
| *Received* | Nhận đủ, chờ đối soát/Close | success / `PackageCheck` | Receive (done) |
| Closed | Hoàn tất | success / `Lock` | Close |

Chuyển trạng thái hợp lệ (UI chỉ cho phép các cạnh sau):

```text
Draft → Pending Approval
Pending Approval → Approved | Rejected | Revision Requested | Finance Review
Revision Requested → Draft(sửa) → Pending Approval
Finance Review → Approved | Rejected | Revision Requested
Approved → Collecting Quotations → Comparing → PO Issued
PO Issued → Partially Received | Received | Receiving Exception
Partially Received → Received | Receiving Exception
Receiving Exception → Partially Received | Received (sau khi xử lý)
Received → Closed (sau đối soát)
```

### 5.3 Workflow stepper

7 bước hiển thị ngang (desktop) / dọc (mobile). Mỗi bước có state: `completed`, `current`, `upcoming`, `blocked`, `exception`. Bước `blocked`/`exception` phải kèm text nguyên nhân. Click bước đã hoàn tất mở chi tiết tương ứng (read-only nếu hết quyền).

---

## 6. Sitemap và route guard

| Route | Screen | Role truy cập | Ghi chú |
|---|---|---|---|
| `/login` | Login | Công khai | Nếu đã có phiên → chuyển landing |
| `/dashboard` | Workflow Dashboard | Tất cả (phạm vi theo role) | Tiến độ PR theo workflow |
| `/requests` | Purchase Requests | E, M, F, P, A | Danh sách + filter |
| `/requests/new` | New Purchase Request | Employee | |
| `/requests/:id` | PR Detail | Theo phạm vi | Stepper, line items, history, Quotation, PO, Receiving |
| `/approvals` | Approvals | Manager, Finance (policy), Admin xem | Hàng chờ |
| `/approvals/:id` | Approval Detail | Manager, Finance | Budget + hành động |
| `/budget` | Budget Review | Finance, Admin | PR được chuyển Finance |
| `/sourcing` | Sourcing (danh sách PR Approved) | Procurement, Admin xem | |
| `/sourcing/:prId` | Quotation Collect/Compare | Procurement | Extraction review, matrix, recommendation, Select Supplier |
| `/suppliers` | Suppliers | Procurement, Admin | |
| `/orders` | Purchase Orders | E, M, F, P, A (theo bảng 4.2) | PO đang giao, Received chờ Close, Closed |
| `/orders/:id` | PO Detail | Theo bảng 4.2 | |
| `/receiving` | Receiving (danh sách) | Theo bảng 4.2 | |
| `/receiving/:poId` | Receiving Form | Người được phân quyền | Đủ, một phần, sai lệch |
| `/audit` | Audit Trail | Admin toàn bộ; role khác theo phạm vi | Filter theo PR, user, action, thời gian |
| `/admin/users` | Users & Roles | Admin | |
| `/admin/categories` | Categories | Admin | |
| `/admin/budgets` | Budget Config | Admin | Cost Center, Budget Code, allocated |
| `/assumptions` | Prototype Assumptions | Tất cả | Sample data, giới hạn |
| `/403` `/404` `/error` | Lỗi điều hướng | Tất cả | Mục 3.6 |

Route guard: (1) chưa đăng nhập → `/login` kèm returnUrl; (2) đăng nhập nhưng trái quyền → `/403`; (3) record ngoài phạm vi (PR của người khác) → `/403`.

---

## 7. Đặc tả từng màn hình

> Mỗi màn hình trong Figma là một frame tên đúng bằng route (ví dụ `/approvals`) kèm hậu tố state: `/approvals · populated`, `· loading`, `· empty`, `· error`.

### 7.1 App shell (khung chung)

| Vùng | Đặc tả |
|---|---|
| Sidebar (240 px) | Logo `Procure`; nhóm menu theo role (mục 4.2); mục active nền `color-primary-50`, chữ `color-primary-700`; có badge đếm (vd số PR chờ duyệt) |
| Topbar (64 px) | Breadcrumb/tiêu đề trang, ô search, chuông thông báo (tùy chọn `[OPEN]`), menu user (mục 3.4) |
| Content | Max-width 1200 px, padding 32 px |
| Role badge | Luôn hiển thị role hiện tại ở menu user |

Menu theo role:

| Role | Menu |
|---|---|
| Employee | Dashboard, Purchase Requests, New Request, Purchase Orders, Receiving (nếu được phân quyền), Audit (PR của mình) |
| Manager | Dashboard, Approvals, Purchase Requests, Purchase Orders, Receiving (nếu được phân quyền) |
| Finance | Dashboard, Budget Review, Approvals (theo policy), Purchase Orders, Receiving, Purchase Requests |
| Procurement | Dashboard, Sourcing, Suppliers, Purchase Orders, Receiving, Purchase Requests |
| Admin | Dashboard, Purchase Requests, Budget Config, Categories, Users & Roles, Audit Trail, Suppliers, Purchase Orders |

### 7.2 Dashboard `/dashboard`

- Card KPI theo phạm vi role: số PR theo trạng thái, PR chờ xử lý của tôi, cảnh báo Budget, PR có Receiving Exception.
- Workflow overview: bảng/biểu đồ cột số PR ở từng bước 7 bước.
- Danh sách "Cần xử lý" (3–5 mục) với link thẳng tới màn hình hành động.
- Không hiển thị chỉ số chưa có nguồn dữ liệu (vd trend chi tiêu là `Could`, ngoài MVP Must).

### 7.3 Purchase Requests `/requests`

- Toolbar: search, filter Status, Category, Department, khoảng ngày; nút `New request` (Primary, chỉ Employee).
- Bảng cột: PR ID, Title, Category, Department/Cost Center, Estimated total, Status badge, Budget flag, Updated, Requester.
- Hàng có cảnh báo Budget hiển thị icon `AlertTriangle` + text `Vượt Budget`.
- Row click → `/requests/:id`. Phân trang 10/25/50.
- States: loading (skeleton 5 hàng), populated, empty (`Chưa có yêu cầu nào.` + CTA nếu có quyền), error (`Không tải được danh sách.` + `Thử lại`), no-results (`Không có kết quả phù hợp bộ lọc.` + `Xóa bộ lọc`).

### 7.4 New Purchase Request `/requests/new`

Bố cục 2 cột (desktop): trái là form, phải là panel AI + checklist.

| Khối | Nội dung |
|---|---|
| Free-text note | Ô văn bản tự do; nút `AI restructure` (Secondary, icon `Sparkles`) |
| Thông tin chung | Request title, Category, Department, Cost centre, Budget Code, Required-by date, Delivery location, Business justification |
| Line items | Bảng: Item name, Specification, Quantity, Estimated unit price, Line total; `Add item` / xóa dòng |
| Tổng | Estimated total (tính tự động, read-only) |
| Checklist | Danh sách trường bắt buộc còn thiếu (link nhảy tới ô) |
| Action bar (sticky) | `Save draft` (Secondary), `Submit request` (Primary) |

Quy tắc:
- Fields tối thiểu `[SRC]`: mục đích mua sắm, Department/Cost Center, Category, Budget Code, danh sách sản phẩm/dịch vụ, số lượng, thông số kỹ thuật, dự toán chi phí. Trường theo từng Category `[OPEN]`.
- `Submit request` disabled cho tới khi checklist đầy đủ; click khi thiếu → cuộn tới lỗi đầu tiên.
- AI chỉ restructure nội dung người dùng đã nhập. **Không tự điền giá, ngày, approver** nếu không có evidence.
- Nếu đã bấm `AI restructure` mà có gợi ý chưa xử lý (chưa `Use this`/`Dismiss`), `Submit` bị chặn với text `Vui lòng xem lại gợi ý AI trước khi gửi.`
- States AI panel: xem 9.3.

### 7.5 PR Detail `/requests/:id`

- Header: PR ID, Title, Status badge, Requester, ngày tạo, Estimated total.
- Workflow stepper (5.3).
- Tabs: `Overview` (thông tin + line items), `Approval` (lịch sử quyết định, lý do), `Quotations`, `Purchase Order`, `Receiving`, `History` (Audit Trail của PR).
- Khu action bên phải, hiển thị theo role và trạng thái (mục 4.3). Action bị khóa có helper text.

### 7.6 Approvals `/approvals` và `/approvals/:id`

Danh sách: hàng chờ, cột PR ID, Requester, Category, Estimated total, Budget còn lại, Budget flag, Submitted at; sort mặc định theo cũ nhất.

Chi tiết (2 cột):
- Trái: thông tin PR đã chuẩn hóa, line items, business justification, ghi chú AI đã được người tạo xác nhận (có nhãn `AI-assisted · đã xác nhận bởi requester`).
- Phải: **Budget panel** (Allocated, Used, Available, Estimated total của PR, Available sau PR) + Alert vượt Budget nếu có (nêu số liệu và next action).
- Action bar: `Approve` (Success), `Request revision` (Secondary), `Send to Finance` (Warning), `Reject` (Danger).
- Reject, Revision, Send to Finance mở modal bắt buộc nhập lý do (tối thiểu ký tự `[OPEN]`).
- Nếu user là người tạo PR: ẩn action, hiện Alert self-approval (4.5).
- Khi PR vượt Budget: `Approve` vẫn là quyết định của Manager theo policy `[OPEN]`; UI chỉ cảnh báo, **không chặn** (AI không tự chặn workflow khi chưa có policy `[SRC]`). Gợi ý nổi bật `Send to Finance` bằng helper text, không tự động chọn.

### 7.7 Budget Review `/budget`

- Danh sách PR ở trạng thái Finance Review: PR ID, Cost Center, Budget Code, Estimated total, Available, Over amount.
- Chi tiết: Allocated / Used / Available (3 số lớn), phần vượt, lý do Manager chuyển, lịch sử quyết định.
- Action: `Approve budget` (Success), `Request revision` (Secondary), `Reject` (Danger); lý do bắt buộc khi Reject/Revision. Policy xử lý vượt ngưỡng: `[OPEN]` (DEC-006).

### 7.8 Sourcing `/sourcing` và `/sourcing/:prId`

Danh sách: PR Approved, số Quotation đã có, trạng thái (Collecting/Comparing).

Chi tiết theo 4 bước (tab hoặc stepper con):
1. **Collect:** upload Quotation PDF/Excel, chọn Supplier, liên kết với PR (hiển thị rõ PR ID). Danh sách file với trạng thái: Uploaded, Extracting, Extracted, Needs review, Confirmed, Failed.
2. **Review extraction:** màn hình chia đôi: trái file gốc (viewer), phải bảng dữ liệu trích xuất có thể sửa (tên hàng, số lượng, đơn giá, thuế, phí vận chuyển, tổng tiền, thời gian giao hàng, bảo hành). Ô do AI điền có nhãn `AI`; ô đã sửa có nhãn `Edited`. Nút `Confirm data` (Primary) bắt buộc trước khi Compare.
3. **Compare:** ma trận Supplier × tiêu chí; ô thấp nhất/cao nhất được đánh dấu (icon + text, không chỉ màu). Số quotation tối thiểu `[OPEN]`: nếu chưa đủ, `Compare` disabled kèm text nêu số còn thiếu (giá trị lấy từ cấu hình DEC-005).
4. **Recommendation & Select:** AI Recommendation panel (lý do + tiêu chí dùng) với `Use this`/`Dismiss`; Anomaly Alert khi đơn giá ≥ 20% so với trung bình lịch sử `[SRC]`, nêu lý do và dữ liệu đối sánh (giá lịch sử, % chênh). Khi thiếu dữ liệu lịch sử: hiện `Chưa đủ dữ liệu lịch sử để cảnh báo giá.` (`[OPEN]` DEC-007). `Select supplier` (Primary) do Procurement bấm, ghi lý do chọn.

Mobile: ma trận chuyển thành các section Supplier có thể mở rộng.

### 7.9 Suppliers `/suppliers`

- Bảng: Supplier name, Contact, Category, Status (Active/Inactive), số Quotation. `Add supplier`, `Edit`, `Deactivate` (xác nhận).
- Form Supplier: tên, mã số thuế `[OPEN]`, liên hệ, email, điện thoại, danh mục cung cấp. (Các trường chi tiết cần xác nhận; chỉ dùng sample data.)

### 7.10 Purchase Orders `/orders` và `/orders/:id`

- Tabs: `Đang giao`, `Received chờ Close`, `Closed`.
- `Create PO` (Primary) từ `/sourcing/:prId` sau khi Select supplier. Form PO: PR liên kết, Supplier/Quotation đã chọn (read-only), line items, tổng, ngày giao dự kiến. AI không sửa dữ liệu Quotation đã chọn (hiển thị khóa + icon `Lock`).
- Chi tiết PO: liên kết PR, Quotation, Receiving; trạng thái đối soát.
- Nếu chưa Approved hoặc chưa chọn Supplier: `Create PO` disabled kèm điều kiện thiếu.

### 7.11 Receiving `/receiving` và `/receiving/:poId`

- Danh sách PO chờ nhận.
- Form: bảng line items với cột `Ordered`, `Previously received`, `Receiving now`, `Remaining`, `Variance`, ghi chú sai lệch, ngày nhận, người nhận.
- Chế độ kết quả: `Nhận đủ`, `Nhận một phần`, `Phát hiện sai lệch` (tự suy ra từ số liệu, người dùng xác nhận).
- Validation: `Receiving now` + `Previously received` > `Ordered` → lỗi inline `Tổng số lượng nhận không được vượt số lượng trên PO.` (ASM-06 `[OPEN]`).
- Sai lệch: bắt buộc nhập mô tả; trạng thái PR → Receiving Exception; `Close` bị khóa.
- Khối **Reconciliation `PR ↔ PO ↔ Receiving`**: bảng 3 cột so sánh số lượng/giá trị, mỗi dòng có trạng thái Match / Variance; chỉ Finance bấm `Confirm reconciliation`.
- `Close PR`: disabled kèm text `Cần hoàn tất Receiving và đối soát trước khi Close.`; enabled khi mọi dòng Match hoặc sai lệch đã được xử lý.

### 7.12 Audit Trail `/audit`

- Bảng: Timestamp, Actor (tên + role), Action, Object (PR/PO/User…), Before → After (trạng thái), Reason, Chi tiết.
- Filter: PR ID, Actor, Action type, khoảng thời gian, loại sự kiện (Approval, AI review, Data change, Security).
- Chi tiết dòng (drawer): diff dữ liệu thay đổi, kết quả review dữ liệu AI (accepted/edited/dismissed).
- Chỉ đọc, không có nút sửa/xóa. Xuất báo cáo là `Could`, không đưa vào MVP.
- Role không phải Admin: chỉ thấy tab `History` trong PR Detail (mục 7.5), không có menu `/audit` toàn hệ thống (Employee/Manager/Finance/Procurement có thể có mục `Audit` giới hạn phạm vi, như bảng 4.2).

### 7.13 Admin: Users, Roles, Categories, Budget

| Màn hình | Nội dung chính |
|---|---|
| `/admin/users` | Bảng user: Name, Email, Role, Status (Active/Locked), Last login. Action: `Add user`, `Change role` (xác nhận + lý do), `Lock/Unlock`, `Reset password` `[OPEN]`. Admin không tự hạ quyền chính mình xuống mất quyền Admin cuối cùng (cảnh báo). |
| Ma trận RBAC | Bảng role × quyền (theo 4.2/4.3), chỉ sửa trong phạm vi cấu hình MVP; mọi thay đổi ghi Audit Trail. |
| `/admin/categories` | Danh sách Category, bật/tắt; trường bắt buộc theo Category `[OPEN]`. |
| `/admin/budgets` | Bảng Cost Center / Budget Code / Allocated / Used / Available, `Edit allocation` (lý do bắt buộc). |

### 7.14 Prototype Assumptions `/assumptions`

Liệt kê: sample data, danh sách tài khoản demo theo role (email, role, mật khẩu demo), giới hạn prototype, danh sách `[OPEN]`, nút `Simulate session expiry`, `Reset demo data`. Có nhãn rõ `Dữ liệu mẫu, không phải dữ liệu doanh nghiệp.`

---

## 8. Design tokens

> Token là nguồn duy nhất cho cả Figma Variables và CSS variables. Tên Figma dùng dấu `/`, tên CSS dùng dấu `-` (quy tắc: `color/primary/600` ↔ `--color-primary-600`).

### 8.1 Color

| Token (CSS) | Figma variable | Hex | Mục đích |
|---|---|---|---|
| `--color-primary-600` | `color/primary/600` | `#4F46C6` | Primary button, active tab |
| `--color-primary-700` | `color/primary/700` | `#4338A8` | Hover/pressed primary |
| `--color-primary-50` | `color/primary/50` | `#EEF2FF` | Selected/active background |
| `--color-text-900` | `color/text/900` | `#101828` | Heading, text chính |
| `--color-text-700` | `color/text/700` | `#344054` | Label, nội dung phụ |
| `--color-text-500` | `color/text/500` | `#667085` | Placeholder, metadata |
| `--color-text-on-primary` | `color/text/on-primary` | `#FFFFFF` | Chữ trên nền primary/danger/success đặc |
| `--color-canvas` | `color/canvas` | `#F5F6F8` | Nền trang |
| `--color-surface` | `color/surface` | `#FFFFFF` | Panel, table, form |
| `--color-surface-muted` | `color/surface/muted` | `#F9FAFB` | Header bảng, vùng phụ *(bổ sung)* |
| `--color-border` | `color/border` | `#D0D5DD` | Border, divider, input |
| `--color-success-600` | `color/success/600` | `#16803C` | Approved, Received, Closed, nút Approve |
| `--color-success-50` | `color/success/50` | `#ECFDF3` | Nền success |
| `--color-warning-700` | `color/warning/700` | `#B54708` | Budget/anomaly warning, nút Send to Finance |
| `--color-warning-50` | `color/warning/50` | `#FFFAEB` | Nền warning |
| `--color-danger-600` | `color/danger/600` | `#B42318` | Error, Rejected, Blocked, nút Reject |
| `--color-danger-50` | `color/danger/50` | `#FEF3F2` | Nền error |
| `--color-info-600` | `color/info/600` | `#026AA2` | AI suggestion, information |
| `--color-info-50` | `color/info/50` | `#F0F9FF` | Nền AI/information |
| `--color-neutral-600` | `color/neutral/600` | `#475467` | Badge Draft *(bổ sung)* |
| `--color-neutral-100` | `color/neutral/100` | `#F2F4F7` | Nền badge Draft, skeleton *(bổ sung)* |

Quy tắc dùng màu: chữ thường tối thiểu độ tương phản 4.5:1; nút đặc dùng chữ `color-text-on-primary`. Cần kiểm tra lại contrast bằng công cụ trước khi chốt (đặc biệt `warning-700` trên `warning-50` và `neutral-600` trên `neutral-100`).

### 8.2 Typography

| Token | Giá trị |
|---|---|
| Font family | `Inter`, fallback `ui-sans-serif, system-ui, sans-serif` |
| `--text-page-title` | 28/36 px, weight 700 |
| `--text-section-title` | 20/28 px, weight 600 |
| `--text-body` | 14/20 px, weight 400 |
| `--text-body-strong` | 14/20 px, weight 600 |
| `--text-caption` | 12/18 px, weight 400 |
| `--text-button` | 14/20 px, weight 600 |
| `--text-kpi` | 28/36 px, weight 700, tabular-nums *(bổ sung, cho số Budget)* |
| Letter spacing | `0` |
| Số tiền | `font-variant-numeric: tabular-nums`, căn phải trong bảng, định dạng `1.250.000 ₫` |

### 8.3 Spacing, radius, border, shadow, motion

| Nhóm | Giá trị |
|---|---|
| Spacing scale (4 px base) | `--space-1`=4, `-2`=8, `-3`=12, `-4`=16, `-6`=24, `-8`=32, `-12`=48 |
| Page padding | Desktop 32, tablet 24, mobile 16 |
| Radius | Input/button 6 (`--radius-md`), card/panel 8 (`--radius-lg`), badge 999 (`--radius-full`) |
| Border | `1px solid var(--color-border)` |
| Focus ring | `2px solid var(--color-primary-600)`, offset 2px |
| Shadow | `--shadow-sm`: `0 1px 2px rgba(16,24,40,0.05)` (card); `--shadow-md`: `0 4px 8px rgba(16,24,40,0.10)` (dropdown, modal) *(bổ sung)* |
| Motion | 150 ms ease-out cho hover/focus; modal 200 ms; tôn trọng `prefers-reduced-motion` |
| Z-index | base 0, sticky 10, dropdown 20, modal 30, toast 40 |

### 8.4 Breakpoints

| Tên | Khoảng | Layout |
|---|---|---|
| `desktop` | ≥ 1200 px | Sidebar 240 px cố định, content max 1200 px |
| `tablet` | 768–1199 px | Sidebar thu gọn (icon), bảng scroll ngang |
| `mobile` | < 768 px | Sidebar thành drawer, 1 cột, bảng thành card row |

Frame Figma chuẩn: Desktop 1440×1024, Tablet 1024×768, Mobile 390×844.

---

## 9. Component specification

### 9.1 Button

| Variant | Nền / chữ | Dùng cho |
|---|---|---|
| Primary | `primary-600` / trắng | `New request`, `Submit request`, `Compare`, `Select supplier`, `Create PO`, `Confirm data`, `Login` |
| Success | `success-600` / trắng | `Approve`, `Approve budget` |
| Secondary | trắng, viền `border` / `text-700` | `Save draft`, `Request revision`, `Use this`, `AI restructure` |
| Tertiary | trong suốt / `text-700` | `Dismiss`, `View details`, `Cancel` |
| Danger | `danger-600` / trắng | `Reject`, `Delete`, `Đăng xuất` (trong hộp thoại) |
| Warning | `warning-700` / trắng | `Send to Finance` |
| Link | chữ `primary-600`, gạch chân khi hover | `View request` |
| Icon-only | 32/40 px, có tooltip + `aria-label` | Menu, search, close, refresh |

Kích thước: mặc định cao 40 px, compact 32 px; padding ngang 16 px; icon 16–18 px; gap icon-text 8 px; font weight 600. States: Default, Hover (đậm một bậc), Focus (focus ring), Pressed, Disabled (opacity 0.5 + `not-allowed`), Loading (spinner, giữ nguyên kích thước, chặn click lặp).

Quy tắc: tối đa 1 Primary hoặc 1 nhóm action chính trên một vùng; thứ tự nút trong action bar từ phải sang trái: hành động chính → phụ → hủy.

### 9.2 Form controls

| Component | States | Ghi chú |
|---|---|---|
| Text input / Textarea | Empty, filled, focus, invalid, disabled, read-only | Label trên ô, helper text, lỗi inline có icon; ô bắt buộc có `*` và text `Bắt buộc` cho screen reader |
| Select / Combobox | Closed, open, selected, invalid, disabled | Có search khi > 8 option |
| Date picker | Empty, filled, invalid | `Required-by date` không ở quá khứ (giả định UI) |
| Number / Currency | Như input | Căn phải, tabular-nums |
| Checkbox / Radio / Switch | Default, checked, focus, disabled | |
| File upload | Empty, dragging, uploading (progress), uploaded, error | Chỉ PDF/Excel `[SRC]`; lỗi nêu định dạng/kích thước |
| Reason modal | Textarea lý do bắt buộc + `Xác nhận`/`Hủy` | Dùng cho Reject, Revision, Send to Finance |

### 9.3 AI panel

Nền `info-50`, viền `info-600`, icon `Sparkles`, nhãn `AI suggestion`.

| State | Hiển thị |
|---|---|
| Loading | Skeleton + `Đang phân tích...`, nút Cancel |
| Suggestion | Nội dung gợi ý + `Use this` (Secondary), `Dismiss` (Tertiary) |
| Edited | Nhãn `Đã chỉnh sửa`, hiển thị bản của người dùng |
| Accepted | Nhãn `Đã xác nhận`, có thể chỉnh sửa tiếp |
| No suggestion | `Không có gợi ý cho nội dung này.` |
| Error | `Không thể tạo gợi ý. Bạn vẫn có thể nhập thủ công.` + `Thử lại` |

Mọi dữ liệu AI có nhãn nguồn (`AI`), người xác nhận, thời điểm; hành động review ghi Audit Trail `[SRC]`.

### 9.4 Status badge

Hình viên thuốc (radius 999), icon 14 px + text 12 px weight 600. Bảng màu/icon theo 5.2. Có đủ: Draft, Pending Approval, Revision Requested, Finance Review, Approved, Rejected, Collecting Quotations, Comparing, PO Issued, Partially Received, Receiving Exception, Received, Closed, cộng `Error`.

### 9.5 Alert card

| Variant | Icon | Dùng cho |
|---|---|---|
| Info | `Info` | Self-approval, thông tin |
| Warning | `AlertTriangle` | Vượt Budget, Anomaly Alert |
| Error | `XCircle` | Lỗi validation/hệ thống |
| Blocked | `Lock` | Không thể Create PO/Close |
| Success | `CheckCircle2` | Hoàn tất |

Cấu trúc: icon + tiêu đề + nguyên nhân + dữ liệu đối sánh + next action (nút/link). Cảnh báo AI luôn kèm lý do và dữ liệu tham chiếu `[SRC]`.

### 9.6 Table / list

States: loading (skeleton), populated, empty, error + retry, no-results. Header sticky, hàng cao 48 px, hover nền `surface-muted`, cột tiền căn phải. Mobile: chuyển thành card row, giữ status badge, Budget flag và action chính.

### 9.7 Navigation và shell

Sidebar item: Default, hover, active, collapsed (chỉ icon + tooltip), mobile drawer (overlay, đóng bằng Esc/click ngoài). Menu user: closed/open.

### 9.8 Workflow stepper

States mỗi bước: completed (`CheckCircle2`, success), current (primary, viền đậm), upcoming (neutral), blocked (`Lock`, danger), exception (`AlertTriangle`, warning). Có text mô tả dưới mỗi bước.

### 9.9 Modal, Drawer, Toast, Tooltip

| Component | Quy tắc |
|---|---|
| Modal | Rộng 480/640 px, focus trap, Esc đóng (trừ khi đang submit), nút chính bên phải |
| Drawer (Audit detail) | Rộng 480 px từ phải |
| Toast | Góc dưới phải, tự đóng 5 s, có nút đóng; lỗi không tự đóng |
| Tooltip | Hiện khi hover/focus, nội dung ngắn, dùng giải thích nút disabled |

### 9.10 Budget panel

3 số KPI (Allocated, Used, Available) + thanh tiến độ (có text %, không chỉ màu) + dòng `Sau PR này: <số> còn lại`. Khi âm: Alert Warning `PR này vượt Budget <số tiền> so với ngân sách khả dụng.`

### 9.11 Receiving form và reconciliation table

Theo 7.11. States: Empty, partial, full, quantity error, exception.

---

## 10. Layout và responsive

- Desktop ≥ 1200 px: sidebar 240 px + content max 1200 px; form 2 cột.
- Tablet 768–1199 px: sidebar thu gọn; bảng scroll ngang trong container, không làm cuộn ngang toàn trang.
- Mobile < 768 px: drawer, 1 cột; bảng thành card; action bar sticky dưới màn hình.
- Không ẩn Budget warning, workflow status hoặc action quan trọng trên mobile.
- Quotation comparison trên mobile: section theo Supplier có thể mở rộng.

---

## 11. Nội dung (copy) và ngôn ngữ

- UI dùng tiếng Anh cho nhãn nút/menu/trạng thái (khớp thuật ngữ Requirements); thông báo, lỗi, helper text dùng tiếng Việt. `[UI]`
- Định dạng: ngày `DD/MM/YYYY`, giờ 24h, tiền `1.250.000 ₫`.

| Tình huống | Copy |
|---|---|
| Login heading | `Sign in to Procure` |
| Invalid credentials | `Email hoặc mật khẩu không đúng.` |
| Unauthorized | `Bạn không có quyền truy cập màn hình này.` |
| Session expired | `Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.` |
| Account locked | `Tài khoản đang bị khóa. Vui lòng liên hệ Admin.` |
| Loading login | `Đang kiểm tra thông tin đăng nhập...` |
| Logout | `Bạn đã đăng xuất.` |
| Self-approval | `Bạn là người tạo PR này nên không thể phê duyệt.` |
| AI chưa xem | `Vui lòng xem lại gợi ý AI trước khi gửi.` |
| Close bị khóa | `Cần hoàn tất Receiving và đối soát trước khi Close.` |
| PO bị khóa | `Cần PR đã được phê duyệt và đã chọn Supplier trước khi tạo PO.` |
| Receiving vượt PO | `Tổng số lượng nhận không được vượt số lượng trên PO.` |
| Thiếu dữ liệu lịch sử | `Chưa đủ dữ liệu lịch sử để cảnh báo giá.` |

---

## 12. Accessibility

- Điều hướng bằng bàn phím cho mọi action; thứ tự Tab theo thứ tự đọc; focus ring luôn hiển thị.
- Icon-only button có `aria-label`; trạng thái và lỗi truyền đạt bằng text, không chỉ màu.
- Lỗi form: `aria-invalid`, `aria-describedby`; thông báo động dùng `aria-live="polite"` (lỗi nghiêm trọng `assertive`).
- Modal có focus trap, trả focus về phần tử gọi.
- Target chạm tối thiểu 40×40 px trên mobile (icon-only 32 px chỉ trên desktop).
- Tôn trọng `prefers-reduced-motion`.

---

## 13. Quy ước Figma ↔ React (để hai bên giống nhau)

### 13.1 Nguyên tắc

1. **Tokens first:** mọi màu/cỡ chữ/spacing/radius trong Figma dùng Variables; trong code dùng CSS variables (mục 8). Cấm hard-code hex/px ngoài token.
2. **Một tên, hai nơi:** tên component Figma = tên component React (PascalCase), tên prop/variant Figma = prop React.
3. **Auto layout = Flexbox/Grid:** frame dùng Auto layout với `gap`, `padding` lấy từ spacing scale; code dùng `gap`/`padding` cùng giá trị.
4. **Frame = route:** tên frame = route + state (mục 7).
5. **Icon:** thư viện `lucide` (Figma plugin Lucide ↔ `lucide-react`), cùng tên icon (bảng 5.2, 9.5).
6. **Font:** Inter (Google Fonts) ở cả hai nơi.
7. **Dữ liệu mẫu:** dùng chung một bộ sample data (mục 13.4) cho Figma và code.

### 13.2 Bảng ánh xạ component

| Figma component | React component | Variant/props chính |
|---|---|---|
| `Button` | `<Button>` | `variant`: primary \| success \| secondary \| tertiary \| danger \| warning \| link; `size`: md \| sm; `state`: default \| hover \| focus \| pressed \| disabled \| loading; `iconLeft`, `iconOnly` |
| `Input` / `Textarea` / `Select` / `DatePicker` | `<Input>` ... | `state`: empty \| filled \| focus \| invalid \| disabled |
| `StatusBadge` | `<StatusBadge status>` | 14 status (9.4) |
| `Alert` | `<Alert variant>` | info \| warning \| error \| blocked \| success; `title`, `reason`, `evidence`, `action` |
| `AIPanel` | `<AIPanel state>` | loading \| suggestion \| edited \| accepted \| empty \| error |
| `DataTable` | `<DataTable state>` | loading \| populated \| empty \| error \| noResults |
| `WorkflowStepper` | `<WorkflowStepper steps>` | step.state: completed \| current \| upcoming \| blocked \| exception |
| `BudgetPanel` | `<BudgetPanel>` | normal \| over |
| `ReasonModal` | `<ReasonModal>` | |
| `AppShell` / `Sidebar` / `Topbar` / `UserMenu` | `<AppShell>` ... | `role` |
| `ReceivingForm` / `ReconciliationTable` | cùng tên | empty \| partial \| full \| quantityError \| exception |
| `QuotationMatrix` / `ExtractionReview` | cùng tên | |
| `AuditTable` / `AuditDrawer` | cùng tên | |

### 13.3 Cấu trúc trang Figma `ProcureAI Wireframes`

```text
00 Cover & Index
01 Tokens (Variables + styles)
02 Components (mọi variant × state)
03 Auth (Login states, Logout confirm, 403/404/error)
04 Employee (Requests, New Request, PR Detail)
05 Manager (Approvals, Approval Detail)
06 Finance (Budget Review, Reconciliation)
07 Procurement (Sourcing, Extraction review, Compare, Suppliers, PO)
08 Receiving & Close
09 Audit & Dashboard
10 Admin (Users, RBAC, Categories, Budget)
11 Role Matrix (menu theo role)
12 Responsive (Tablet, Mobile)
13 Assumptions
```

Mỗi màn hình có đủ 3 kích thước Desktop/Tablet/Mobile và các state liên quan.

### 13.4 Sample data dùng chung

- Tài khoản demo (mỗi role một tài khoản, thêm 1 Employee thứ hai để test self-approval/phạm vi).
- 8–10 PR phủ mọi trạng thái, trong đó có: 1 PR vượt Budget, 1 PR bị Revision, 1 PR có Receiving Exception, 1 PR Closed, 1 PR do Manager tự tạo để kiểm thử self-approval.
- 3 Supplier × 1 PR có 3 Quotation (1 có giá cao ≥ 20% so với lịch sử), cùng số liệu giá lịch sử mẫu.
- Dữ liệu mock nằm ở file duy nhất `mock-data.json`, đánh dấu `Dữ liệu mẫu`.

### 13.5 Nguồn token duy nhất

`tokens.json` (định dạng Tokens Studio / W3C design tokens) là nguồn: import vào Figma Variables và build ra `tokens.css` + cấu hình Tailwind/CSS cho React. Không sửa token trực tiếp ở nơi khác.

---

## 14. Gợi ý kiến trúc UI React (không phải technical spec chốt)

- React + TypeScript + Vite; Tailwind CSS (map từ tokens) hoặc CSS Modules dùng CSS variables; `react-router` cho route guard; `lucide-react` cho icon; state demo bằng Context/Zustand + `mock-data.json`; form bằng `react-hook-form` + `zod`.
- Cấu trúc:

```text
src/
  tokens/ tokens.css  tokens.json
  components/ (Button, Input, StatusBadge, Alert, AIPanel, DataTable, WorkflowStepper, ...)
  layouts/ AppShell, AuthLayout
  auth/ AuthContext, RequireAuth, RequireRole, permissions.ts
  routes/ (theo sitemap mục 6)
  data/ mock-data.json
```

- `permissions.ts` là một bảng duy nhất (role × action × điều kiện) sinh từ mục 4.3; cả menu, nút và route guard đều đọc từ đây, tránh lệch giữa UI và quy tắc.
- Quyền thực sự phải do backend kiểm soát; UI chỉ phản ánh.

---

## 15. Traceability

| Nhóm | Tham chiếu |
|---|---|
| Functional | REQ-FR-01 đến REQ-FR-18 |
| Non-functional | REQ-NFR-01 đến REQ-NFR-03 |
| Business Rules | REQ-BR-01 đến REQ-BR-11 |
| Constraints | CON-01 đến CON-06 |
| Assumptions | ASM-02, ASM-03, ASM-04, ASM-05, ASM-06, ASM-07 |

| Màn hình | Requirements |
|---|---|
| Login, Logout, 403, RBAC | REQ-NFR-02, REQ-NFR-03, CON-02 |
| New PR, PR List, PR Detail | REQ-FR-01 đến REQ-FR-04, REQ-BR-01 |
| Approvals, Budget Review | REQ-FR-05 đến REQ-FR-09, REQ-BR-02 đến REQ-BR-05 |
| Sourcing, Suppliers | REQ-FR-10 đến REQ-FR-15, REQ-BR-06 đến REQ-BR-09 |
| Purchase Orders | REQ-FR-16, REQ-BR-10 |
| Receiving, Close | REQ-FR-17, REQ-FR-18, REQ-BR-11 |
| Dashboard, Audit Trail | REQ-FR-04, REQ-NFR-01, REQ-NFR-03 |

## 16. Điểm `[OPEN]` cần nhóm xác nhận

| # | Nội dung | Liên quan |
|---|---|---|
| 1 | Ai bấm `Close` (đề xuất Finance) | US-10 |
| 2 | Admin có tạo PR không | Ma trận 4.2 |
| 3 | Số quotation tối thiểu trước Compare | DEC-005 |
| 4 | Approval threshold, policy Budget, xử lý PR trên 50 triệu | DEC-006, ASM-05 |
| 5 | Nguồn/thời gian tham chiếu giá lịch sử, xử lý thiếu dữ liệu | DEC-007 |
| 6 | ASM-06 trở thành Business Rule hay giữ Assumption | Receiving |
| 7 | Bổ sung status vào Glossary (mục 5.2) | Glossary |
| 8 | Thời hạn session, quên mật khẩu, reset password, khóa tài khoản | Authentication |
| 9 | Audit sự kiện đăng nhập/đăng xuất | NFR-03 |
| 10 | Trường bắt buộc theo Category | Q-02 |

## 17. Điều kiện kiểm tra (Definition of Ready for build/QA)

**Auth & RBAC**
- [ ] Login đúng role → đúng landing, menu, action; sai thông tin/khóa/hết phiên có state riêng.
- [ ] Logout xóa phiên, về `/login`, có xác nhận khi còn thay đổi chưa lưu.
- [ ] Truy cập route trái quyền → `/403`; record ngoài phạm vi → `/403`.
- [ ] Self-Approval bị chặn ở UI (và ghi chú kiểm tra phía server).

**Workflow**
- [ ] Không thể Collect Quotations trước Approve; không Create PO trước Approve + Select Supplier; không Close trước Receiving + đối soát.
- [ ] Có nhánh Reject, Revision, Finance Review, Receiving Exception.
- [ ] Reject/Revision/Send to Finance bắt buộc lý do.

**AI**
- [ ] Mọi AI suggestion/extraction/recommendation có review; không có nút AI tự quyết.
- [ ] Anomaly Alert có lý do + dữ liệu đối sánh; có trạng thái thiếu dữ liệu lịch sử.

**Chất lượng UI**
- [ ] Mọi màn hình có loading, empty, error, retry.
- [ ] Mọi component đủ variant × state.
- [ ] Token trong Figma và code trùng khớp 100% (không hard-code).
- [ ] Desktop/Tablet/Mobile đều không mất Budget warning, status, action quan trọng.
- [ ] Prototype không được trình bày như Business Rule hoặc technical implementation đã chốt.

