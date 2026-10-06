# ProcureAI RESTful API Specification & OpenAPI Contract

> **Hệ thống:** ProcureAI - Internal Procurement & Approval Platform  
> **Kiểu kiến trúc:** RESTful JSON API  
> **Thành viên phụ trách:** Nguyễn Thị Thùy Dung (Backend Developer)  
> **Đường dẫn file:** `docs/06-technical/API.md`  
> **Trạng thái:** Confirmed  

---

## 1. Global API Standards

- **Base URL:** `http://localhost:5000/api` (Local Dev) / `/api`
- **Content-Type:** `application/json`
- **Authentication:** `Authorization: Bearer <JWT_TOKEN>`
- **Error Response Standard Format:**
  ```json
  {
    "success": false,
    "error": {
      "code": "INSUFFICIENT_PERMISSIONS",
      "message": "User with role EMPLOYEE cannot perform manager approval.",
      "details": []
    }
  }
  ```

---

## 2. API Endpoints Map & RBAC Rules

| Endpoint | Method | Allowed Roles | Description |
|:---|:---:|:---|:---|
| `/auth/login` | `POST` | Public | Đăng nhập hệ thống, nhận JWT Token |
| `/auth/me` | `GET` | All Roles | Lấy thông tin user hiện tại |
| `/purchase-requests` | `GET` | All Roles | Danh sách PR (phân quyền xem theo bộ phận/role) |
| `/purchase-requests` | `POST` | `EMPLOYEE`, `ADMIN` | Tạo Purchase Request mới |
| `/purchase-requests/:id` | `GET` | All Roles | Chi tiết PR + Items + History + Quotations |
| `/purchase-requests/:id/submit` | `POST` | `EMPLOYEE`, `ADMIN` | Gửi PR để bắt đầu quy trình phê duyệt |
| `/purchase-requests/:id/approve` | `POST` | `MANAGER`, `FINANCE`, `ADMIN` | Phê duyệt PR |
| `/purchase-requests/:id/reject` | `POST` | `MANAGER`, `FINANCE`, `ADMIN` | Từ chối PR |
| `/purchase-requests/:id/forward-finance`| `POST` | `MANAGER`, `ADMIN` | Chuyển PR sang Finance thẩm định budget |
| `/purchase-requests/:id/quotations` | `POST` | `PROCUREMENT`, `ADMIN` | Upload/thêm báo giá của Supplier |
| `/purchase-orders` | `POST` | `PROCUREMENT`, `ADMIN` | Tạo Purchase Order sau khi chọn báo giá |
| `/purchase-orders/:id/receive` | `POST` | `EMPLOYEE`, `PROCUREMENT`, `ADMIN` | Ghi nhận biên bản nhận hàng |
| `/purchase-requests/:id/close` | `POST` | `PROCUREMENT`, `ADMIN` | Đóng hoàn tất PR |
| `/ai/normalize-pr` | `POST` | `EMPLOYEE`, `ADMIN` | AI chuẩn hóa & gợi ý thông tin PR |
| `/ai/extract-quotation` | `POST` | `PROCUREMENT`, `ADMIN` | AI trích xuất thông tin báo giá PDF/Excel |
| `/ai/compare-quotations` | `POST` | `PROCUREMENT`, `ADMIN` | AI lập ma trận so sánh & đưa gợi ý |

---

## 3. Detailed Request & Response Examples

### 3.1 Authentication: `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "manager.it@company.com",
    "password": "password123"
  }
  ```
- **Response 200 OK:**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "usr-mgr-001",
        "email": "manager.it@company.com",
        "fullName": "Nguyen Van A",
        "role": "MANAGER",
        "departmentCode": "IT"
      }
    }
  }
  ```

### 3.2 Create Purchase Request: `POST /api/purchase-requests`
- **Header:** `Authorization: Bearer <JWT_TOKEN>`
- **Request Body:**
  ```json
  {
    "title": "Mua sắm Laptop đồ họa cho phòng IT",
    "category": "IT Equipment",
    "items": [
      {
        "itemName": "MacBook Pro M3 Max 36GB",
        "quantity": 2,
        "unitPrice": 65000000
      }
    ]
  }
  ```
- **Response 201 Created:**
  ```json
  {
    "success": true,
    "data": {
      "id": "pr-88912",
      "prNumber": "PR-2026-0042",
      "status": "DRAFT",
      "totalEstimatedAmount": 130000000,
      "requiresFinanceApproval": true,
      "createdAt": "2026-09-23T22:00:00.000Z"
    }
  }
  ```

### 3.3 AI Quotation Comparison: `POST /api/ai/compare-quotations`
- **Request Body:**
  ```json
  {
    "prId": "pr-88912",
    "quotationIds": ["quote-001", "quote-002", "quote-003"]
  }
  ```
- **Response 200 OK (Structured JSON Output):**
  ```json
  {
    "success": true,
    "data": {
      "recommendedQuotationId": "quote-002",
      "recommendationReason": "Nhà cung cấp Phong Vũ có tổng chi phí thấp hơn 8% và thời gian bảo hành 24 tháng.",
      "anomalyAlerts": [
        {
          "quotationId": "quote-001",
          "alertType": "PRICE_ANOMALY",
          "message": "Đơn giá 72.000.000đ cao hơn 21.5% so với đơn giá lịch sử trung bình (59.200.000đ)."
        }
      ],
      "comparisonMatrix": [
        {
          "supplierName": "Phong Vũ IT",
          "totalAmount": 126000000,
          "warrantyMonths": 24,
          "deliveryDays": 3,
          "priceVarianceFromHistoryPercent": 6.4
        }
      ]
    }
  }
  ```

### 3.4 Manager Approve PR: `POST /api/purchase-requests/:id/approve`
- **Response 200 OK:**
  ```json
  {
    "success": true,
    "data": {
      "prId": "pr-88912",
      "previousStatus": "SUBMITTED",
      "newStatus": "APPROVED",
      "approvedBy": "usr-mgr-001",
      "financeReviewRequired": true,
      "auditLogId": "audit-99120"
    }
  }
  ```

---

## 4. Error Codes & Handling Matrix

| HTTP Status | Error Code | Nguyên nhân |
|:---:|:---|:---|
| `400` | `INVALID_INPUT` | Thiếu trường bắt buộc hoặc dữ liệu sai định dạng |
| `401` | `UNAUTHORIZED` | Token JWT thiếu, hết hạn hoặc không hợp lệ |
| `403` | `FORBIDDEN` | User không có Role được phép gọi API này |
| `422` | `WORKFLOW_STATE_INVALID` | Thao tác sai thứ tự (Ví dụ: Tạo PO khi PR chưa Approve) |
| `422` | `BUDGET_EXCEEDED_WARNING` | Cảnh báo vượt ngân sách phòng ban |
| `500` | `INTERNAL_SERVER_ERROR` | Lỗi phía Server hoặc lỗi kết nối Gemini API |
