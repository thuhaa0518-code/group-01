# ProcureAI AI Feature Specification & Benchmark Evaluation

> **Hệ thống:** ProcureAI - Internal Procurement & Approval Platform  
> **Dịch vụ AI:** Gemini API (với Structured Output Schema & Fallback Parser)  
> **Thành viên phụ trách:** Nguyễn Trúc Lam (AI Vault)  
> **Đường dẫn file:** `docs/07-ai/ai-feature-spec.md`  
> **Trạng thái:** Confirmed  

---

## 1. Business Value & Governance

AI trong ProcureAI đóng vai trò **hỗ trợ ra quyết định (Decision Support Assistant)**, giúp:
1. Giảm **40% - 50%** tỷ lệ PR bị trả về do thiếu/sai thông số kỹ thuật (PR Standardizer).
2. Tự động hóa trích xuất dữ liệu Báo giá PDF/Excel, giảm **80%** thời gian nhập liệu thủ công.
3. Tự động lập ma trận so sánh báo giá đa tiêu chí và cảnh báo đơn giá bất thường (chênh lệch `≥ 20%` so với trung bình lịch sử).

> [!IMPORTANT]
> **Nguyên tắc AI Governance (Human-in-the-loop - BR-08 / CON-03):**
> - AI chỉ đưa ra gợi ý và bảng tổng hợp dữ liệu.
> - AI **tuyệt đối không tự động Approve/Reject PR** hoặc tự chọn Nhà cung cấp thay cho con người.
> - Người dùng **bắt buộc phải xem xét (Review)** và xác nhận dữ liệu AI trích xuất trước khi lưu chính thức.

---

## 2. Structured JSON Schemas & Prompts

### 2.1 Feature 1: PR Standardizer (`POST /api/ai/normalize-pr`)
- **System Prompt:**
  ```text
  You are an AI Procurement Assistant. Analyze the user's purchase request title and raw items.
  Provide normalized item names, suggest an official category (IT Equipment, Office Supplies, Maintenance, etc.),
  and list any missing required fields. Return ONLY a JSON object matching the requested schema.
  ```
- **Response Schema:**
  ```json
  {
    "type": "object",
    "properties": {
      "suggestedCategory": { "type": "string" },
      "normalizedTitle": { "type": "string" },
      "missingFields": { "type": "array", "items": { "type": "string" } },
      "items": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "itemName": { "type": "string" },
            "quantity": { "type": "integer" },
            "suggestedUnitPrice": { "type": "number" }
          },
          "required": ["itemName", "quantity"]
        }
      }
    },
    "required": ["suggestedCategory", "normalizedTitle", "missingFields", "items"]
  }
  ```

### 2.2 Feature 2: Quotation Extraction & Comparison Matrix (`POST /api/ai/compare-quotations`)
- **Response Schema:**
  ```json
  {
    "type": "object",
    "properties": {
      "recommendedQuotationId": { "type": "string" },
      "recommendationReason": { "type": "string" },
      "anomalyAlerts": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "quotationId": { "type": "string" },
            "alertType": { "type": "string" },
            "message": { "type": "string" }
          },
          "required": ["quotationId", "alertType", "message"]
        }
      },
      "comparisonMatrix": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "supplierName": { "type": "string" },
            "totalAmount": { "type": "number" },
            "warrantyMonths": { "type": "integer" },
            "deliveryDays": { "type": "integer" },
            "priceVarianceFromHistoryPercent": { "type": "number" }
          },
          "required": ["supplierName", "totalAmount", "warrantyMonths", "deliveryDays"]
        }
      }
    },
    "required": ["recommendedQuotationId", "recommendationReason", "anomalyAlerts", "comparisonMatrix"]
  }
  ```

---

## 3. Fallback Mechanism & Validation

Khi gọi Gemini API bị lỗi mạng, Rate Limit (`429`), hoặc trả về JSON không đúng Schema:
1. **Zod Schema Validation:** Kiểm tra cú pháp response JSON. Nếu validate thất bại, chuyển sang bước Fallback Parser.
2. **Deterministic Regex Fallback Parser:** Trích xuất các số liệu đơn giá, tổng tiền, bảo hành từ văn bản bằng Regex quy chuẩn.
3. **Mock Data Fallback:** Nếu API sập hoàn toàn (`500/503`), hệ thống phục vụ dữ liệu mock đã được định nghĩa sẵn, thông báo hiển thị banner `AI service is currently operating in offline/cached mode.` giúp workflow không bị gián đoạn.

---

## 4. Benchmark Evaluation Set (20 Test Cases)

| ID | Test Case Category | Input Summary | Expected AI Output | Pass Criteria | Status |
|:---:|:---|:---|:---|:---|:---:|
| **TC-AI-01** | PR Normalization | "cần mua 3 cái lap dell" | Category: `IT Equipment`, Title: `Mua sắm 03 Laptop Dell`, Quantity: 3 | Category & Qty correct | PASS |
| **TC-AI-02** | PR Normalization | "mua giấy in" | MissingFields: `["Giấy in khổ nào (A4/A3)", "Định lượng (70/80gsm)", "Số lượng ream"]` | Identifies missing info | PASS |
| **TC-AI-03** | Quotation Extraction | PDF Báo giá Công ty Phong Vũ | `totalAmount: 126000000`, `warrantyMonths: 24` | Extraction accuracy ≥85% | PASS |
| **TC-AI-04** | Anomaly Price Alert | Đơn giá 72M vs Lịch sử 59.2M (+21.6%) | Trigger alert `PRICE_ANOMALY` (báo chênh lệch > 20%) | Alert generated with reason | PASS |
| **TC-AI-05** | Anomaly Price Alert | Đơn giá 61M vs Lịch sử 59.2M (+3.0%) | No anomaly alert triggered | No false positive alert | PASS |
| **TC-AI-06** | Quote Comparison | 3 Báo giá Phong Vũ, FPT, Nguyễn Kim | Recommend Phong Vũ (chi phí thấp nhất + bảo hành 24t) | Valid matrix & reason | PASS |
| **TC-AI-07** | Fallback Test | API Key bị vô hiệu hóa / Disconnected | Banner Offline Mode, Fallback Regex/Mock active | Workflow non-blocking | PASS |
| **TC-AI-08** | Edge Case | File báo giá bị mờ / thiếu thông tin thuế | Trích xuất các số liệu khả dụng + flag `missing_tax_info` | Human review requested | PASS |
| **TC-AI-09** | Edge Case | Báo giá dùng tiền tệ USD | AI đổi tỷ giá quy đổi VNĐ kèm ghi chú tỷ giá | Currency converted | PASS |
| **TC-AI-10** | Edge Case | 2 Supplier có giá bằng nhau | AI so sánh theo thời gian giao hàng và thời hạn bảo hành | Secondary criteria used | PASS |
| **TC-AI-11..20**| Mixed Batch Tests | 10 mẫu báo giá PDF/Excel thực tế | Trích xuất chính xác `unit_price`, `total_amount`, `supplier_name` | Overall Precision ≥ 80% | PASS |
