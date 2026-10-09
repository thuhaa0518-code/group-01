import os
import json
import urllib.request
from django.conf import settings

def call_gemini_standardize(text):
    api_key = getattr(settings, 'GEMINI_API_KEY', os.getenv('GEMINI_API_KEY', ''))
    if not api_key:
        return None
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    prompt = f"""
    Bạn là Trợ lý AI Chuyên viên Thu mua doanh nghiệp ProcureAI.
    Nhiệm vụ: Phân tích đoạn văn bản yêu cầu mua sắm thô sau và trả về duy nhất 1 JSON hợp lệ theo cấu trúc:
    {{
      "title": "Tiêu đề yêu cầu mua sắm ngắn gọn (ví dụ: Mua Laptop cho nhóm Backend)",
      "category": "Chọn 1 trong các danh mục: Thiết bị CNTT, In ấn & Marketing, Phần mềm & Dịch vụ, Nội thất văn phòng, Văn phòng phẩm, Thiết bị phòng họp",
      "justification": "Mục đích sử dụng được viết lại chuyên nghiệp, rõ ràng",
      "items": [
        {{
          "name": "Tên sản phẩm chuẩn",
          "specs": "Thông số kỹ thuật chi tiết",
          "quantity": 1,
          "unit": "chiếc",
          "estUnitPrice": 0
        }}
      ],
      "missing": ["Cảnh báo các thông tin còn thiếu nếu người dùng chưa nêu (như ngày cần hàng, địa điểm giao hàng)"]
    }}

    Văn bản yêu cầu mua sắm:
    "{text}"
    """
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json"}
    }
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            candidate_text = res_data['candidates'][0]['content']['parts'][0]['text']
            return json.loads(candidate_text)
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return None
