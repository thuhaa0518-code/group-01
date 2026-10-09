# ProcureAI - Tài Liệu Kỹ Thuật Backend (Backend Technical Documentation)

Tài liệu này tổng hợp toàn bộ thông tin kiến trúc, quy trình phát triển, cơ sở dữ liệu, API RESTful, tích hợp AI Gemini và quy trình triển khai (Deployment) của hệ thống **ProcureAI Backend**.

---

## 📂 Danh Mục Tài Liệu Kỹ Thuật (Table of Contents)

| Tên Tài Liệu | Nội Dung Chính | Đường Dẫn |
| :--- | :--- | :--- |
| **01. Kiến Trúc Backend** | Tổng quan kiến trúc Django REST + Vercel Serverless + MongoDB Cloud DB | [`backend_architecture.md`](file:///d:/LTUDDN/group-01%20-%20LTUDDN/docs/technical/backend_architecture.md) |
| **02. Thiết Kế CSDL** | Cấu trúc dữ liệu MongoDB Atlas Cloud DB & SQLite, cơ chế Smart Sync | [`database_design.md`](file:///d:/LTUDDN/group-01%20-%20LTUDDN/docs/technical/database_design.md) |
| **03. Tài Liệu API REST** | Đầy đủ thông số API (`/api/v1/state/`, `/api/v1/sync/`, `/api/v1/ai/standardize/`) | [`api_documentation.md`](file:///d:/LTUDDN/group-01%20-%20LTUDDN/docs/technical/api_documentation.md) |
| **04. Tích Hợp AI Gemini** | Tích hợp Google Gemini API, Chuẩn hóa PR tự động & AI Recommendation Engine | [`ai_gemini_integration.md`](file:///d:/LTUDDN/group-01%20-%20LTUDDN/docs/technical/ai_gemini_integration.md) |
| **05. Triển Khai & DevOps** | Hướng dẫn cấu hình Vercel Serverless, biến môi trường & CI/CD | [`deployment_and_devops.md`](file:///d:/LTUDDN/group-01%20-%20LTUDDN/docs/technical/deployment_and_devops.md) |

---

## 🚀 Điểm Nổi Bật Của Hệ Thống Backend

1. **Enterprise Cloud Single Source of Truth:**
   - Kết nối trực tiếp **MongoDB Atlas Cloud Database** (`cluster0.bz9z4o7.mongodb.net`), đảm bảo dữ liệu mua sắm được đồng bộ thời gian thực giữa 5 vai trò (Employee, Manager, Finance, Procurement, Admin).
2. **Serverless Optimized:**
   - Tương thích 100% với **Vercel Serverless Functions** (AWS Lambda) thông qua WSGI Handler `api/index.py`.
3. **Multimodal AI Power:**
   - Tích hợp **Google Gemini 2.0 / 1.5 Flash API** với hệ thống tự động nhận diện Key API nhiều biến thể và fallback endpoint đa cấp.
4. **Smart State Merging:**
   - Kết hợp mượt mà giữa Client State (`localStorage`) và Server Polling 5s, ngăn chặn mất dữ liệu do ngắt kết nối mạng.
