# 🖼️ Thông Số Thiết Kế Figma (Figma Specifications & Canvas Frames)

---

## 1. Thông Tin File Figma Chính Thức

- **Tên Dự Án Figma:** ProcureAI - Enterprise Procurement Management System
- **Figma Design URL:** [https://www.figma.com/design/Nc2pw0GQqNe3EzENakz79z/Group-1?node-id=0-1](https://www.figma.com/design/Nc2pw0GQqNe3EzENakz79z/Group-1?node-id=0-1)
- **Node ID:** `0-1`
- **Khung hình hiển thị chuẩn:** Desktop 1440px $\times$ 900px, Mobile 375px $\times$ 812px.

---

## 2. Danh Sách Khung Mẫu Giao Diện (Frames & Screen Specs)

| Frame ID | Tên Màn Hình (Screen Name) | Mục Đích & Thành Phần Chính |
| :--- | :--- | :--- |
| `frame-01` | **Dashboard (Tổng Quan)** | Thống kê Budget khả dụng, danh sách PR chờ xử lý, WorkQueue cá nhân hóa. |
| `frame-02` | **Request Form & AI Standardizer** | Form nhập nhu cầu mua sắm bằng NLP, bảng gợi ý AI auto-fill 9 trường dữ liệu. |
| `frame-03` | **Request Detail & Approval Panel** | Xem chi tiết PR, bộ đếm tiến trình WorkflowStepper, DecisionPanel phê duyệt Manager/Finance. |
| `frame-04` | **Sourcing & Quotation Matrix** | Danh sách PR đã Approve, Ma trận so sánh báo giá (ComparisonMatrix) & AI Recommendation. |
| `frame-05` | **PO Creation & Receiving** | Tạo Đơn đặt hàng (Purchase Order), ghi nhận nhận hàng (Receiving) và đối soát 3 bên. |
| `frame-06` | **Admin Users & Audit Trail** | Quản lý người dùng, phân quyền RBAC và xem nhật ký vết truy xuất hệ thống. |

---

## 3. Quy Chuẩn Responsive Grid Layout

- **Desktop (>= 1024px):** 12 Columns, Margin 32px, Gutter 24px, Max Width 1280px.
- **Tablet (768px - 1023px):** 8 Columns, Margin 24px, Gutter 16px.
- **Mobile (< 768px):** 4 Columns, Margin 16px, Gutter 12px.
