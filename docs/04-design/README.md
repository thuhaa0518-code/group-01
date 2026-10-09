# 🎨 ProcureAI - Tài Liệu Thiết Kế UI/UX (UI/UX Design Documentation)

Tài liệu này tổng hợp toàn bộ hệ thống thiết kế (Design System), quy chuẩn giao diện (UI Specs), Luồng trải nghiệm người dùng (User Flows), Thư viện thành phần (Component Library), Bộ Tokens chuẩn và liên kết mẫu Figma chính thức của ứng dụng **ProcureAI**.

---

## 🔗 Liên Kết Figma Prototype Chính Thức (Official Figma Link)

- **Figma Design File & Prototype:** [ProcureAI Group-1 Figma Design](https://www.figma.com/design/Nc2pw0GQqNe3EzENakz79z/Group-1?node-id=0-1&p=f&t=FaKBsIFcslHisgTk-0)
- **Node ID Gốc:** `0:1`
- **Tác giả:** Group-1 Design Team
- **Công nghệ Frontend mục tiêu:** React 18+ / TypeScript / Tailwind CSS / Lucide Icons

---

## 📂 Danh Mục Tài Liệu Thiết Kế (Table of Contents)

| STT | Tài Liệu | Nội Dung Chính | Đường Dẫn |
| :---: | :--- | :--- | :--- |
| **01** | **Tổng Quan Figma Specs** | Cấu trúc File Figma, danh sách Màn hình, Khung mẫu Design, Auto Layout & Frame Specs | [`figma_specifications.md`](./figma_specifications.md) |
| **02** | **Design Tokens & Styleguide** | Bảng màu ngữ nghĩa (Color Tokens), Typography, Grid 4px, Spacing, Radius, Shadows & Chuẩn WCAG | [`design_tokens_and_styleguide.md`](./design_tokens_and_styleguide.md) |
| **03** | **Thư Viện UI Components** | Thông số kỹ thuật các Component: Buttons, Badges, Modals, Stepper, AI Panel, Budget Panel, Quotation Matrix | [`ui_component_library.md`](./ui_component_library.md) |
| **04** | **Luồng Trải Nghiệm (User Flow)** | Sơ đồ luồng 5 vai trò (Employee, Manager, Finance, Procurement, Admin), Wireframe bố cục & Xử lý ngoại lệ | [`user_flows_and_wireframes.md`](./user_flows_and_wireframes.md) |
| **05** | **Đặc Tả Chi Tiết Design System** | Source of truth chi tiết giữa Figma và React (Sitemap, Ma trận RBAC, Route Guard, Trạng thái) | [`design-system.md`](./design-system.md) |
| **06** | **Tệp Dữ Liệu Token (Machine-readable)** | Cấu hình Design Tokens chuẩn W3C / Tokens Studio phục vụ import tự động | [`tokens.json`](./tokens.json) |

---

## 🎯 Triết Lý Thiết Kế Cốt Lõi (Core Design Philosophy)

1. **Enterprise-Grade Efficiency (Tối ưu hiệu suất làm việc doanh nghiệp):**
   - Giao diện sạch sẽ, trực quan, cô đọng thông tin quan trọng giúp người dùng ra quyết định mua sắm và phê duyệt nhanh chóng.
   - Bố cục nhất quán trên toàn bộ các phân hệ từ Request đến Close.
2. **AI-Assisted Human-in-the-loop (AI Hỗ trợ & Con người quyết định):**
   - Các gợi ý AI (Chuẩn hóa form, Cảnh báo giá bất thường, Đề xuất NCC) được thiết kế nổi bật nhưng con người luôn giữ quyền quyết định cuối cùng (`Use this` / `Edit` / `Dismiss`).
   - Tuyệt đối không để AI tự động thực hiện các hành động nhạy cảm (Approve, Reject, Đặt hàng).
3. **Accessibility & Multi-Role Clarity (Truy cập thuận tiện & Rõ ràng phân quyền):**
   - Đạt chuẩn tương phản **WCAG 2.1 AA** (tối thiểu 4.5:1).
   - Không dựa duy nhất vào màu sắc để truyền tải trạng thái; luôn kết hợp **Icon + Nhãn chữ rõ ràng**.
   - Cơ chế chặn tự phê duyệt (**No Self-Approval**) và ẩn hành động nhạy cảm với người không có quyền (**Least Privilege**).
