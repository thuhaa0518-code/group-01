# 🚀 Tài Liệu Triển Khai & DevOps (Deployment & DevOps Guide)

---

## 1. Tổng Quan Kiến Trúc Triển Khai (Deployment Architecture)

Ứng dụng **ProcureAI** được triển khai sản xuất trên nền tảng **Vercel Cloud Platform** tại địa chỉ:
🔗 **Production URL:** [https://procure-ai-app-topaz.vercel.app](https://procure-ai-app-topaz.vercel.app)

```mermaid
flowchart LR
    Git["GitHub Repository\n(branch: master)"] -->|Automated Trigger| VercelCI["Vercel Build Engine"]
    subgraph BuildEngine["Vercel Build Pipeline"]
        Vite["1. Vite Build (FE React TS)"]
        PyRuntime["2. Serverless Python 3.12 Setup"]
    end
    VercelCI --> Vite
    VercelCI --> PyRuntime
    Vite --> AssetDist["FE/dist Static Bundle"]
    PyRuntime --> ServerlessDeploy["AWS Lambda Serverless Functions"]
```

---

## 2. Cấu Hình Tệp Triển Khai (`vercel.json`)

Tệp [vercel.json](file:///d:/LTUDDN/group-01%20-%20LTUDDN/vercel.json) điều hướng toàn bộ lưu lượng web về WSGI Handler [api/index.py](file:///d:/LTUDDN/group-01%20-%20LTUDDN/api/index.py):

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.py"
    }
  ]
}
```

---

## 3. Biến Môi Trường Sản Xuất (Production Environment Variables)

Các biến môi trường được thiết lập trong **Vercel Project Settings**:

| Tên Biến | Giá Trị Mặc Định | Mô Tả |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://nguyenthuydung1022_db_user:...@cluster0.bz9z4o7.mongodb.net/procureai?retryWrites=true&w=majority` | Chuỗi kết nối CSDL MongoDB Atlas Cloud. |
| `MONGODB_DB_NAME` | `procureai` | Tên cơ sở dữ liệu trên Cloud DB. |
| `GEMINI_API_KEY` | *(Secret Key)* | API Key truy cập Google Gemini AI Service. |
| `DJANGO_SETTINGS_MODULE` | `config.settings` | Cấu hình Django Settings gốc. |

---

## 4. Danh Sách Phụ Thuộc Backend (`requirements.txt`)

Tệp [requirements.txt](file:///d:/LTUDDN/group-01%20-%20LTUDDN/requirements.txt) định nghĩa các gói phần mềm cần thiết cho môi trường Serverless:

```text
Django>=5.0,<6.2
asgiref
sqlparse
tzdata
openpyxl
reportlab
pillow
pymongo
dnspython
```

---

## 5. Quy Trình Cập Nhật & Kiểm Trợ Tự Động (CI/CD Pipeline)

1. Lập trình viên commit mã nguồn lên nhánh `master` của kho GitHub.
2. Vercel tự động kích hoạt tiến trình Build:
   - Biên dịch React Single Page App sang `FE/dist`.
   - Đóng gói các thư viện Python Serverless.
3. Kiểm tra kết nối MongoDB Atlas Cloud và cập nhật hệ thống thành công không gây trễ dịch vụ ($0\text{s}$ downtime).
