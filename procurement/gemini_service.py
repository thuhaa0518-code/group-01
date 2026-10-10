import os
import json
import urllib.request
from django.conf import settings

def call_gemini_standardize(text):
    api_key = (
        getattr(settings, 'GEMINI_API_KEY', '') or
        os.getenv('GEMINI_API_KEY', '') or
        os.getenv('Gemini_API_Key', '') or
        os.getenv('gemini_api_key', '')
    )
    if not api_key:
        return None
    
    prompt = f"""
    Bạn là Trợ lý AI Chuyên viên Thu mua doanh nghiệp ProcureAI.
    Nhiệm vụ: Phân tích đoạn văn bản yêu cầu mua sắm thô của người dùng và trích xuất TOÀN BỘ các thông tin có thể có trong văn bản thành duy nhất 1 JSON hợp lệ.

    Cấu trúc JSON bắt buộc:
    {{
      "title": "Tiêu đề yêu cầu mua sắm ngắn gọn (ví dụ: Mua sofa tiếp khách phòng Giám đốc)",
      "category": "Chọn CHÍNH XÁC 1 trong 6 danh mục sau tùy theo sản phẩm/dịch vụ:
        - 'Nội thất văn phòng' (dành cho sofa, salon, bàn, ghế, tủ, kệ, đồ gỗ, rèm, thảm, vách ngăn...)
        - 'Thiết bị CNTT' (dành cho laptop, máy tính, màn hình, chuột, bàn phím, ram, ssd, máy in, server...)
        - 'Văn phòng phẩm' (dành cho bút, giấy, sổ, mực, kéo, kẹp, bìa, ghim...)
        - 'Thiết bị phòng họp' (dành cho máy chiếu, loa, micro, tivi phòng họp, màn chiếu...)
        - 'In ấn & Marketing' (dành cho in brochure, standee, poster, băng rôn, tờ rơi...)
        - 'Phần mềm & Dịch vụ' (dành cho phần mềm, bản quyền, license, cloud, hosting, vps, bảo trì, tư vấn, dịch vụ...)",
      "justification": "Mục đích sử dụng / lý do mua sắm được viết lại chuyên nghiệp, rõ ràng",
      "items": [
        {{
          "name": "Tên sản phẩm chuẩn (ví dụ: Bộ ghế sofa văn phòng tiếp khách)",
          "specs": "Thông số kỹ thuật chi tiết",
          "quantity": 1,
          "unit": "chiếc hoặc bộ",
          "estUnitPrice": 0
        }}
      ],
      "requiredBy": "Định dạng YYYY-MM-DD nếu văn bản có nêu ngày/thời hạn cần hàng (ví dụ: '2026-10-16'), nếu không nêu thì để null",
      "deliveryLocation": "Địa điểm giao hàng đầy đủ nếu văn bản có nêu (ví dụ: 'Tầng 8 tòa nhà An Phát'), nếu không nêu thì để null",
      "budgetCode": "Mã ngân sách nếu văn bản có nêu (ví dụ: 'BGT-OPS-2026'), nếu không nêu thì để null",
      "costCenter": "Trung tâm chi phí nếu văn bản có nêu (ví dụ: 'CC-OPS-01'), nếu không nêu thì để null",
      "missing": [
        "Cảnh báo các thông tin quan trọng còn thiếu (ví dụ: chưa có Đơn giá dự toán từng dòng...)"
      ]
    }}

    Văn bản yêu cầu mua sắm thô từ người dùng:
    "{text}"
    """
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json"}
    }

    models_to_try = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash"]
    for model in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
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
            print(f"Gemini API Error with model {model}: {e}")
            continue
    return None
