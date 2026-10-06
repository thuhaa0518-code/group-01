# procurement/context_processors.py

def user_language(request):
    lang = 'vi'
    if request.user.is_authenticated and hasattr(request.user, 'language'):
        lang = request.user.language
    elif 'language' in request.session:
        lang = request.session['language']
    
    # Dictionary for translations if needed
    translations = {
        'vi': {
            'app_title': 'ProcureAI - Mua Sắm Thông Minh',
            'dashboard': 'Bảng Điều Khiển',
            'my_prs': 'PR Của Tôi',
            'create_pr': 'Tạo Yêu Cầu (PR)',
            'manager_approvals': 'Duyệt Quản Lý',
            'finance_approvals': 'Duyệt Tài Chính',
            'quotation_collection': 'Thu Thập Báo Giá',
            'quotation_comparison': 'So Sánh Báo Giá & AI',
            'po_list': 'Đơn Hàng (PO)',
            'receiving_list': 'Biên Bản Nhận Hàng',
            'settings': 'Cài Đặt Cá Nhân',
            'audit_logs': 'Nhật Ký Vết (Audit Trail)',
            'logout': 'Đăng Xuất',
            'login': 'Đăng Nhập',
            'language': 'Ngôn Ngữ',
            'save_changes': 'Lưu Thay Đổi',
            'profile_info': 'Thông Tin Cá Nhân',
        },
        'en': {
            'app_title': 'ProcureAI - Intelligent Procurement',
            'dashboard': 'Dashboard',
            'my_prs': 'My Purchase Requests',
            'create_pr': 'Create Request (PR)',
            'manager_approvals': 'Manager Approvals',
            'finance_approvals': 'Finance Approvals',
            'quotation_collection': 'Quotation Collection',
            'quotation_comparison': 'Quotation Comparison & AI',
            'po_list': 'Purchase Orders (PO)',
            'receiving_list': 'Goods Receiving',
            'settings': 'Personal Settings',
            'audit_logs': 'Audit Logs',
            'logout': 'Logout',
            'login': 'Login',
            'language': 'Language',
            'save_changes': 'Save Changes',
            'profile_info': 'Personal Profile',
        }
    }

    return {
        'current_lang': lang,
        'txt': translations.get(lang, translations['vi'])
    }
