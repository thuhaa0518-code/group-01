from django.core.management.base import BaseCommand
from procurement.models import (
    User, Budget, PurchaseRequest, PRLineItem,
    Supplier, Quotation, PurchaseOrder, Receiving,
    PriceReference, AuditEntry
)
from decimal import Decimal

class Command(BaseCommand):
    help = 'Seed 100% complete initial data for ProcureAI matching FE data models'

    def handle(self, *args, **options):
        self.stdout.write("Seeding ProcureAI complete data...")

        # Clear existing
        AuditEntry.objects.all().delete()
        Receiving.objects.all().delete()
        PurchaseOrder.objects.all().delete()
        Quotation.objects.all().delete()
        Supplier.objects.all().delete()
        PRLineItem.objects.all().delete()
        PurchaseRequest.objects.all().delete()
        Budget.objects.all().delete()
        User.objects.all().delete()
        PriceReference.objects.all().delete()

        DEMO_PW = '123'

        # 1. Users (1 per role)
        users_data = [
            ('u-nam', 'employee1', 'Lê Hoàng Nam', 'nam.le@procure.vn', 'employee', 'Công nghệ thông tin', 'Kỹ sư phần mềm', False, False),
            ('u-vietanh', 'manager1', 'Trần Việt Anh', 'vietanh.tran@procure.vn', 'manager', 'Công nghệ thông tin', 'Trưởng phòng CNTT', False, False),
            ('u-phuong', 'procurement1', 'Nguyễn Mai Phương', 'phuong.nguyen@procure.vn', 'procurement', 'Thu mua', 'Chuyên viên thu mua', False, True),
            ('u-ha', 'finance1', 'Phạm Thanh Hà', 'ha.pham@procure.vn', 'finance', 'Tài chính', 'Kiểm soát ngân sách', False, False),
            ('u-thang', 'admin1', 'Vũ Đức Thắng', 'thang.vu@procure.vn', 'admin', 'Quản trị hệ thống', 'Quản trị hệ thống', False, False),
        ]

        user_objects = {}
        for uid, uname, name, email, role, dept, title, locked, can_rcv in users_data:
            u = User(
                id=uid,
                username=uname,
                email=email,
                name=name,
                role=role,
                department=dept,
                title=title,
                locked=locked,
                can_receive=can_rcv,
                is_staff=(role == 'admin'),
                is_superuser=(role == 'admin')
            )
            u.set_password(DEMO_PW)
            u.save()
            user_objects[uid] = u

        # 2. Budgets
        budgets_data = [
            ('BGT-IT-2026', 'Công nghệ thông tin', 'CC-IT-01', 'Ngân sách thiết bị & hạ tầng CNTT 2026', 2026, Decimal('500000000.00'), Decimal('184000000.00')),
            ('BGT-MKT-2026', 'Marketing', 'CC-MKT-01', 'Ngân sách in ấn & truyền thông 2026', 2026, Decimal('200000000.00'), Decimal('184500000.00')),
            ('BGT-OPS-2026', 'Vận hành', 'CC-OPS-01', 'Ngân sách thiết bị văn phòng 2026', 2026, Decimal('150000000.00'), Decimal('32000000.00')),
            ('BGT-HR-2026', 'Nhân sự', 'CC-HR-01', 'Ngân sách đào tạo & sự kiện 2026', 2026, Decimal('120000000.00'), Decimal('15000000.00')),
        ]
        for code, dept, cc, name, fy, alloc, comm in budgets_data:
            Budget.objects.create(code=code, department=dept, cost_center=cc, name=name, fiscal_year=fy, allocated=alloc, committed=comm)

        # 3. Suppliers
        suppliers_data = [
            ('sup-hanoi-tech', 'Công ty TNHH Thiết bị Công nghệ Hà Nội', '0102345678', 'Nguyễn Văn Hùng', 'hung.nv@hanoitech.com.vn', '024-3852-1122', ['Thiết bị CNTT', 'Phần mềm & Dịch vụ']),
            ('sup-viet-int', 'Công ty CP Đầu tư & Thương mại Việt Quốc tế', '0108765432', 'Trần Thị Mai', 'mai.tt@vietquocte.vn', '024-3974-5566', ['Thiết bị CNTT', 'Thiết bị phòng họp']),
            ('sup-minh-an', 'Công ty TNHH Truyền thông & In ấn Minh An', '0105678901', 'Phạm Minh An', 'an.pm@minhanmedia.vn', '024-3512-8899', ['In ấn & Marketing']),
            ('sup-tan-phat', 'Công ty CP Nội thất Văn phòng Tân Phát', '0104321098', 'Lê Tấn Phát', 'phat.lt@tanphatfurniture.vn', '024-3628-4433', ['Nội thất văn phòng']),
        ]
        supplier_objects = {}
        for sid, name, tax, contact, email, phone, cats in suppliers_data:
            s = Supplier.objects.create(id=sid, name=name, tax_code=tax, contact_name=contact, email=email, phone=phone, categories=cats, status='active')
            supplier_objects[sid] = s

        # 4. Price References
        refs_data = [
            ('ref-laptop-i7-14', 'Laptop văn phòng 14" i7/32GB/1TB', ['laptop', 'i7', '32gb', '1tb', '14"'], Decimal('23500000.00'), 12, '6 tháng'),
            ('ref-monitor-27-2k', 'Màn hình 27" 2K IPS', ['màn hình', '27', '2k', 'ips'], Decimal('6200000.00'), 15, '6 tháng'),
            ('ref-combo-kb-mouse', 'Bộ bàn phím + chuột không dây', ['bàn phím', 'chuột', 'không dây', 'combo'], Decimal('1150000.00'), 20, '6 tháng'),
            ('ref-ergonomic-chair', 'Ghế công thái học lưng lưới', ['ghế', 'công thái học', 'lưới'], Decimal('4800000.00'), 8, '6 tháng'),
        ]
        for key, lbl, kw, avg, smp, pd in refs_data:
            PriceReference.objects.create(key=key, label=lbl, keywords=kw, avg_unit_price=avg, samples=smp, period=pd)

        # 5. Purchase Requests & Line Items
        reqs_data = [
            {
                'id': 'PR-2026-0103', 'title': 'Bộ bàn phím và chuột không dây cho phòng họp', 'justification': 'Trang bị bàn phím, chuột không dây cho 3 phòng họp để trình chiếu và demo sản phẩm.',
                'department': 'Công nghệ thông tin', 'cost_center': 'CC-IT-01', 'category': 'Thiết bị CNTT', 'budget_code': 'BGT-IT-2026',
                'required_by': '2026-10-15', 'delivery_location': 'Tầng 8, Tòa nhà Sông Đà, 18 Phạm Hùng, Hà Nội',
                'requester_id': 'u-vietanh', 'status': 'pending_manager', 'routed_to_finance': False, 'ai_review': 'accepted',
                'items': [
                    {'id': 'i1', 'name': 'Bộ bàn phím và chuột không dây', 'specs': 'Kết nối Bluetooth + USB receiver, layout US, pin sạc', 'quantity': 3, 'unit': 'bộ', 'est_unit_price': Decimal('1200000')}
                ]
            },
            {
                'id': 'PR-2026-0102', 'title': 'Màn hình 27 inch cho nhóm QA', 'justification': 'Nhóm QA cần màn hình thứ hai để chạy song song test case và công cụ theo dõi lỗi.',
                'department': 'Công nghệ thông tin', 'cost_center': 'CC-IT-01', 'category': 'Thiết bị CNTT', 'budget_code': 'BGT-IT-2026',
                'required_by': '2026-10-12', 'delivery_location': 'Tầng 8, Tòa nhà Sông Đà, 18 Phạm Hùng, Hà Nội',
                'requester_id': 'u-nam', 'status': 'pending_manager', 'routed_to_finance': False, 'ai_review': 'edited',
                'items': [
                    {'id': 'i1', 'name': 'Màn hình 27 inch 2K', 'specs': 'Tấm nền IPS, độ phân giải 2560×1440, cổng HDMI + USB-C, chân xoay dọc', 'quantity': 4, 'unit': 'chiếc', 'est_unit_price': Decimal('6500000')}
                ]
            },
            {
                'id': 'PR-2026-0101', 'title': 'Laptop cho nhóm phát triển Backend', 'justification': 'Bổ sung laptop cho 5 kỹ sư mới onboard tháng 10, cần cấu hình đủ để chạy Docker và IDE.',
                'department': 'Công nghệ thông tin', 'cost_center': 'CC-IT-01', 'category': 'Thiết bị CNTT', 'budget_code': 'BGT-IT-2026',
                'required_by': '2026-10-20', 'delivery_location': 'Tầng 8, Tòa nhà Sông Đà, 18 Phạm Hùng, Hà Nội',
                'requester_id': 'u-nam', 'status': 'pending_manager', 'routed_to_finance': False, 'ai_review': 'accepted',
                'items': [
                    {'id': 'i1', 'name': 'Laptop văn phòng 14" hiệu năng cao', 'specs': 'CPU Intel Core i7-1355U, RAM 32GB, SSD 1TB, màn hình 14" 2.8K, bảo hành 24 tháng', 'quantity': 5, 'unit': 'chiếc', 'est_unit_price': Decimal('24000000')}
                ]
            },
            {
                'id': 'PR-2026-0104', 'title': 'In ấn ấn phẩm sự kiện ra mắt sản phẩm Q4', 'justification': 'Ấn phẩm phục vụ sự kiện ra mắt sản phẩm ngày 30/10 với khoảng 1.500 khách mời.',
                'department': 'Marketing', 'cost_center': 'CC-MKT-01', 'category': 'In ấn & Marketing', 'budget_code': 'BGT-MKT-2026',
                'required_by': '2026-10-25', 'delivery_location': 'Trung tâm Hội nghị Quốc gia, Hà Nội',
                'requester_id': 'u-nam', 'status': 'finance_review', 'routed_to_finance': True, 'ai_review': 'accepted',
                'last_reason': 'PR vượt Budget khả dụng của phòng Marketing (còn 15,5 tr). Đề nghị Finance xem xét điều chỉnh ngân sách sự kiện.',
                'items': [
                    {'id': 'i1', 'name': 'Brochure A4 gấp 3', 'specs': 'Giấy C150, in 4 màu 2 mặt, cán mờ', 'quantity': 2000, 'unit': 'tờ', 'est_unit_price': Decimal('9000')},
                    {'id': 'i2', 'name': 'Standee cuốn 80×200cm', 'specs': 'Bạt Hiflex, khung nhôm, in UV', 'quantity': 10, 'unit': 'bộ', 'est_unit_price': Decimal('1500000')},
                    {'id': 'i3', 'name': 'Backdrop sân khấu 6×3m', 'specs': 'Khung sắt, bạt in UV, lắp đặt tại chỗ', 'quantity': 1, 'unit': 'bộ', 'est_unit_price': Decimal('5000000')}
                ]
            },
            {
                'id': 'PR-2026-0098', 'title': 'Ghế công thái học cho phòng CNTT', 'justification': 'Thay thế 10 ghế đã xuống cấp, giảm đau lưng cho nhân sự ngồi làm việc liên tục.',
                'department': 'Công nghệ thông tin', 'cost_center': 'CC-IT-01', 'category': 'Nội thất văn phòng', 'budget_code': 'BGT-IT-2026',
                'required_by': '2026-10-10', 'delivery_location': 'Tầng 8, Tòa nhà Sông Đà, 18 Phạm Hùng, Hà Nội',
                'requester_id': 'u-nam', 'status': 'approved', 'routed_to_finance': False, 'ai_review': 'accepted',
                'items': [
                    {'id': 'i1', 'name': 'Ghế công thái học lưng lưới', 'specs': 'Tựa đầu, tay 4D, đệm ngồi trượt, chịu tải 120kg', 'quantity': 10, 'unit': 'chiếc', 'est_unit_price': Decimal('5000000')}
                ]
            }
        ]

        for rd in reqs_data:
            items_data = rd.pop('items')
            req_user_id = rd.pop('requester_id')
            req_user = user_objects.get(req_user_id, user_objects['u-nam'])
            
            pr = PurchaseRequest.objects.create(
                requester=req_user,
                **rd
            )
            for idx, it in enumerate(items_data, 1):
                it['id'] = f"{pr.id}-i{idx}"
                PRLineItem.objects.create(pr=pr, **it)

        # 6. Quotations
        q1 = Quotation.objects.create(
            id='q-0098-a',
            pr_id='PR-2026-0098',
            supplier_id='sup-tan-phat',
            file_name='BaoGia_GheCongThaiHoc_TanPhat.pdf',
            file_type='pdf',
            status='extracted',
            ai_confidence=Decimal('0.98'),
            lines=[{'itemId': 'i1', 'name': 'Ghế công thái học lưng lưới TP-E08', 'quantity': 10, 'unitPrice': 4800000}],
            tax_rate=Decimal('0.10'),
            shipping_fee=Decimal('500000'),
            delivery_days=3,
            warranty_months=24
        )

        # 7. Orders
        po1 = PurchaseOrder.objects.create(
            id='PO-2026-0042',
            pr_id='PR-2026-0098',
            quotation_id='q-0098-a',
            supplier_id='sup-tan-phat',
            created_by=user_objects['u-phuong'],
            lines=[{'itemId': 'i1', 'name': 'Ghế công thái học lưng lưới TP-E08', 'quantity': 10, 'unitPrice': 4800000}],
            tax_rate=Decimal('0.10'),
            shipping_fee=Decimal('500000'),
            total=Decimal('53300000'),
            status='issued'
        )

        # 8. Audit Logs
        AuditEntry.objects.create(
            id='aud-101',
            actor=user_objects['u-nam'],
            actor_name='Lê Hoàng Nam',
            role='employee',
            action='Submit PR',
            entity='PR',
            entity_id='PR-2026-0101',
            from_status='draft',
            to_status='pending_manager',
            details='Tạo và submit PR mua 5 Laptop Backend'
        )

        self.stdout.write(self.style.SUCCESS("ProcureAI 100% complete data seeded successfully!"))
