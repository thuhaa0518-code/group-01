# 📡 Tài Liệu Giao Diện Lập Trình (API Documentation & REST Endpoints)

---

## 1. Tổng Quan REST API

Hệ thống **ProcureAI Backend** cung cấp bộ API RESTful dạng JSON hỗ trợ đầy đủ các thao tác đồng bộ trạng thái, chuẩn hóa dữ liệu AI và truy vấn thông tin toàn hệ thống.

- **Base URL:** `https://procure-ai-app-topaz.vercel.app/api/v1/`
- **Content-Type:** `application/json; charset=utf-8`
- **Xử lý CORS:** Hỗ trợ Cross-Origin Resource Sharing cho phép Frontend React kết nối an toàn.

---

## 2. Chi Tiết Danh Sách API Endpoints

### 2.1 API Lấy Trạng Thái Toàn Hệ Thống (`GET /api/v1/state/`)
Trả về toàn bộ cây dữ liệu `ProcurementState` đồng bộ từ MongoDB Atlas Cloud Database.

- **HTTP Method:** `GET`
- **Response Format:** `200 OK`
- **Example Response:**
```json
{
  "users": [...],
  "requests": [...],
  "quotations": [...],
  "suppliers": [...],
  "orders": [...],
  "receivings": [...],
  "budgets": [...],
  "categories": [...],
  "audit": [...]
}
```

---

### 2.2 API Đồng Bộ Thay Đổi Dữ Liệu (`POST /api/v1/sync/`)
Nhận payload `ProcurementState` từ Client khi có bất kỳ thao tác tạo/sửa/duyệt đơn nào và lưu tức thì vào MongoDB Atlas Cloud.

- **HTTP Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:** Complete `ProcurementState` JSON Object.
- **Response Format:** `200 OK` (Trả về state JSON đã cập nhật).

---

### 2.3 API AI Chuẩn Hóa Đề Xuất (`POST /api/v1/ai/standardize/`)
Gọi Google Gemini API để phân tích đoạn văn bản tiếng Việt tự do và tự điền 9 trường dữ liệu vào Form Purchase Request.

- **HTTP Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "text": "Công ty cần mua gấp 5 laptop Dell XPS 15 inch cho phòng IT, giao trước 20/10 tại tầng 5"
}
```
- **Response Format (`200 OK`):**
```json
{
  "ok": true,
  "source": "gemini",
  "suggestion": {
    "title": "Mua 5 laptop Dell XPS 15 inch cho phòng IT",
    "category": "Thiết bị CNTT",
    "justification": "Cung cấp máy làm việc cấu hình cao cho nhân sự phòng IT",
    "requiredBy": "2026-10-20",
    "deliveryLocation": "Tòa nhà Tầng 5",
    "costCenter": "CC-IT-01",
    "budgetCode": "BGT-IT-2026",
    "items": [
      {
        "id": "i1",
        "name": "Laptop Dell XPS 15 inch",
        "specs": "Cấu hình chuẩn phòng CNTT, bảo hành >= 12 tháng",
        "quantity": 5,
        "unit": "chiếc",
        "estUnitPrice": 35000000
      }
    ]
  }
}
```

---

## 3. Mã Lỗi HTTP & Xử Lý Ngoại Lệ (Error Codes & Exception Handling)

| HTTP Status Code | Ý Nghĩa | Nguyên Nhân & Cách Xử Lý |
| :---: | :--- | :--- |
| `200 OK` | Thành công | Request đã được xử lý hoàn tất. |
| `400 Bad Request` | Dữ liệu không hợp lệ | Payload JSON bị hỏng hoặc thiếu các trường bắt buộc. |
| `403 Forbidden` | Thiếu quyền truy cập | Người dùng không có quyền (ví dụ: Employee cố bấm duyệt đơn). |
| `500 Internal Error` | Lỗi Server nội bộ | Mất kết nối MongoDB Atlas tạm thời hoặc Gemini API rate limit. |
