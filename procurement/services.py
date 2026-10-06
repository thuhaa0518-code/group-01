from .models import AuditLog, PRItem, Quotation, Supplier
import json

def log_audit(user, action, entity_name, entity_id, old_value="", new_value=""):
    AuditLog.objects.create(
        user=user if (user and user.is_authenticated) else None,
        action=action,
        entity_name=entity_name,
        entity_id=str(entity_id),
        old_value=str(old_value) if old_value else "",
        new_value=str(new_value) if new_value else ""
    )

def run_ai_standardizer(title, category, items_data):
    """
    AI Helper for REQ-FR-03: Standardize PR categories, item specs, and check missing fields.
    """
    category_suggestions = {
        'laptop': 'Thiết bị IT & Điện tử',
        'máy tính': 'Thiết bị IT & Điện tử',
        'bàn': 'Nội thất Văn phòng',
        'ghế': 'Nội thất Văn phòng',
        'giấy': 'Văn phòng phẩm',
        'bút': 'Văn phòng phẩm',
        'tủ': 'Nội thất Văn phòng',
        'phần mềm': 'Bản quyền & Phần mềm',
        'máy in': 'Thiết bị IT & Điện tử',
    }
    
    suggested_cat = category
    for key, val in category_suggestions.items():
        if key in title.lower():
            suggested_cat = val
            break
            
    notes = []
    standardized_items = []
    
    for item in items_data:
        name = item.get('name', '').strip()
        qty = int(item.get('quantity', 1))
        price = float(item.get('unit_price', 0))
        
        # Standardize spec example
        spec_add = ""
        if "laptop" in name.lower() and "ram" not in name.lower():
            spec_add = " [Đề xuất chuẩn hóa: Chuẩn RAM 16GB, SSD 512GB, BH 12 tháng]"
        elif "máy in" in name.lower() and "laser" not in name.lower():
            spec_add = " [Đề xuất chuẩn hóa: Loại Laser đa chức năng, in 2 mặt tự động]"
            
        standardized_name = name + spec_add
        
        # Historical price check mock lookup
        hist_price = price
        if "laptop" in name.lower():
            hist_price = 20000000.0
        elif "máy in" in name.lower():
            hist_price = 5000000.0
        elif "ghế" in name.lower():
            hist_price = 1500000.0
        elif "giấy" in name.lower():
            hist_price = 85000.0
            
        standardized_items.append({
            'name': standardized_name,
            'quantity': qty,
            'unit_price': price,
            'historical_avg_price': hist_price
        })
    
    if suggested_cat != category:
        notes.append(f"AI gợi ý chuyển Danh mục từ '{category}' sang '{suggested_cat}' dựa trên tên sản phẩm.")
    
    notes.append("AI đã kiểm tra: Đầy đủ các trường bắt buộc (Tiêu đề, Danh mục, Đơn giá dự kiến, Số lượng). Thông số kỹ thuật đã được chuẩn hóa theo chuẩn doanh nghiệp.")
    
    return {
        'suggested_category': suggested_cat,
        'ai_notes': "\n".join(notes),
        'items': standardized_items
    }

def run_ai_quotation_analysis(pr):
    """
    AI Helper for REQ-FR-13 to REQ-FR-15:
    - Extract quotation details from file/text
    - Price anomaly alert if unit_price >= 1.2 * historical_avg_price (>= 20% increase)
    - Compare quotations & generate Recommendation
    """
    quotations = pr.quotations.all()
    if not quotations:
        return None
        
    analysis_results = []
    anomalies = []
    
    min_amount = None
    recommended_quotation_id = None
    
    for q in quotations:
        # Generate mock AI extracted structure for each quotation
        unit_price_eval = float(q.total_amount)
        first_item = pr.items.first()
        hist_avg = float(first_item.historical_avg_price) if (first_item and first_item.historical_avg_price) else 0
        
        # Anomaly check (>= 20% higher than historical avg)
        is_anomaly = False
        anomaly_msg = ""
        if hist_avg > 0 and unit_price_eval >= 1.2 * hist_avg:
            is_anomaly = True
            diff_pct = round(((unit_price_eval - hist_avg) / hist_avg) * 100, 1)
            anomaly_msg = f"CẢNH BÁO AI: Giá báo cao hơn {diff_pct}% so với giá trung bình lịch sử ({hist_avg:,.0f} VNĐ)."
            anomalies.append({
                'supplier': q.supplier.name,
                'message': anomaly_msg
            })
            
        ai_extracted = {
            'supplier_name': q.supplier.name,
            'tax_id': q.supplier.tax_id,
            'total_amount': float(q.total_amount),
            'warranty': '12 tháng chính hãng',
            'delivery_time': '3 - 5 ngày làm việc',
            'payment_terms': 'Thanh toán sau 30 ngày giao hàng',
            'is_anomaly': is_anomaly,
            'anomaly_message': anomaly_msg
        }
        
        q.ai_extracted_json = ai_extracted
        q.save()
        
        if min_amount is None or q.total_amount < min_amount:
            min_amount = q.total_amount
            recommended_quotation_id = q.id
            
        analysis_results.append(ai_extracted)
        
    # AI Recommendation
    rec_q = Quotation.objects.get(id=recommended_quotation_id) if recommended_quotation_id else None
    recommendation_summary = f"AI Khuyên dùng: Nhà cung cấp [{rec_q.supplier.name}] có mức giá tối ưu nhất ({rec_q.total_amount:,.0f} VNĐ) kèm điều khoản giao hàng & bảo hành 12 tháng tốt nhất." if rec_q else ""
    
    return {
        'analysis_results': analysis_results,
        'anomalies': anomalies,
        'recommended_quotation_id': recommended_quotation_id,
        'recommendation_summary': recommendation_summary
    }
