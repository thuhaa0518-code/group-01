# 🔄 Luồng Trải Nghiệm & Sơ Đồ Giao Diện (User Flows & Wireframe Specs)

---

## 1. Sơ Đồ Luồng Tổng Thể (End-to-End Procurement User Flow)

```mermaid
flowchart TD
    subgraph Employee["Employee (Người tạo đơn)"]
        A1["Nhập nhu cầu mua sắm bằng AI hoặc thủ công"] --> A2["Kiểm tra Form & Gửi đề xuất (Submit PR)"]
    end

    subgraph Manager["Manager (Trưởng phòng)"]
        B1["Nhận thông báo PR mới ở trạng thái 'pending_manager'"] --> B2{"Kiểm tra giá trị PR"}
        B2 -->|PR <= 50 triệu| B3["Manager Approve -> Chuyển bước Approved"]
        B2 -->|PR > 50 triệu| B4["Manager Approve & Chuyển Finance -> Trạng thái 'finance_review'"]
    end

    subgraph Finance["Finance (Kế toán / Ngân sách)"]
        C1["Kiểm tra Budget khả dụng & Hợp lệ"] --> C2["Finance Approve -> Chuyển bước Approved"]
    end

    subgraph Procurement["Procurement (Thu mua)"]
        D1["Tải tệp báo giá & AI Trích xuất (Collect Quotations)"] --> D2["Đối chiếu & Xác nhận dữ liệu báo giá"]
        D2 --> D3["Xem AI Recommendation & Chọn Nhà cung cấp (Select Supplier)"]
        D3 --> D4["Phát hành Đơn đặt hàng (Purchase Order - PO)"]
        D4 --> D5["Ghi nhận Nhận hàng (Receiving) & Khóa PR (Close)"]
    end

    A2 --> B1
    B4 --> C1
    B3 --> D1
    C2 --> D1
```

---

## 2. Luồng Trải Nghiệm Chi Tiết Theo Vai Trò (Role-based Journeys)

1. **Employee Journey:** Dashboard $\rightarrow$ Click "Tạo đề xuất" $\rightarrow$ Nhập text tự do vào AI PR Standardizer $\rightarrow$ Click "Use this" $\rightarrow$ Kiểm tra thông tin $\rightarrow$ Submit PR $\rightarrow$ Theo dõi trạng thái trên Dashboard.
2. **Manager Journey:** WorkQueue Dashboard $\rightarrow$ Mở PR chờ duyệt $\rightarrow$ Xem Budget khả dụng $\rightarrow$ Click "Approve & Chuyển Finance" (với PR > 50tr) hoặc "Approve" (với PR $\le 50$tr).
3. **Finance Journey:** Mở danh sách đơn ở bước `Finance Review` $\rightarrow$ Kiểm tra hạn mức ngân sách $\rightarrow$ Nhập ghi chú duyệt $\rightarrow$ Click "Phê duyệt ngân sách".
4. **Procurement Journey:** Sourcing Page $\rightarrow$ Chọn PR đã Approve $\rightarrow$ Upload file Quotation (PDF/Excel) $\rightarrow$ Review AI extraction $\rightarrow$ Bấm Xác nhận $\rightarrow$ So sánh ma trận $\rightarrow$ Chọn NCC $\rightarrow$ Tạo PO $\rightarrow$ Ghi nhận Receiving.
