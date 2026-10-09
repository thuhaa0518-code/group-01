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
    Nhiệm vụ: Phân tích đoạn văn bản yêu cầu mua sắm thô của người dùng và trích xuất TOÀN BỘ các thông tin có thể có trong văn bản thành duy nhất 1 JSON hợp lệ.

    Cấu trúc JSON bắt buộc:
    {{
      "title": "Tiêu đề yêu cầu mua sắm ngắn gọn (ví dụ: Mua Laptop cho nhóm Backend)",
      "category": "Chọn 1 trong các danh mục chính xác: Thiết bị CNTT, In ấn & Marketing, Phần mềm & Dịch vụ, Nội thất văn phòng, Văn phòng phẩm, Thiết bị phòng họp",
      "justification": "Mục đích sử dụng / lý do mua sắm được viết lại chuyên nghiệp, rõ ràng",
      "items": [
        {{
          "name": "Tên sản phẩm chuẩn",
          "specs": "Thông số kỹ thuật chi tiết",
          "quantity": 1,
          "unit": "chiếc",
          "estUnitPrice": 0
        }}
      ],
      "requiredBy": "Định dạng YYYY-MM-DD nếu văn bản có nêu ngày/thời hạn cần hàng (ví dụ: '2026-10-20'), nếu không nêu thì để null",
      "deliveryLocation": "Địa điểm giao hàng đầy đủ nếu văn bản có nêu (ví dụ: 'Tầng 5, Keangnam, Hà Nội'), nếu không nêu thì để null",
      "budgetCode": "Mã ngân sách nếu văn bản có nêu (ví dụ: 'BGT-IT-2026'), nếu không nêu thì để null",
      "costCenter": "Trung tâm chi phí nếu văn bản có nêu (ví dụ: 'CC-IT-01'), nếu không nêu thì để null",
      "missing": [
        "Cảnh báo các thông tin quan trọng còn thiếu (ví dụ: chưa có Ngày cần hàng, chưa có Địa điểm giao hàng...)"
      ]
    }}

    Văn bản yêu cầu mua sắm thô từ người dùng:
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
