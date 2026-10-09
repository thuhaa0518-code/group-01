from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from procurement.models import (
    User, Budget, PurchaseRequest, PRLineItem,
    Supplier, Quotation, PurchaseOrder, Receiving,
    PriceReference, AuditEntry
)
from procurement.services import run_ai_standardizer

class ProcurementUnitModelTests(TestCase):
    """
    Unit tests for Procurement domain models, calculations, and AI services.
    Ensures model integrity and business logic alignment with requirements.
    """

    def setUp(self):
        # 1. Setup Users for all 5 RBAC roles
        self.emp = User.objects.create(
            id='usr-emp-01', username='emp1', email='emp1@procure.vn',
            name='Nguyen Van A', role='employee', department='Phòng CNTT'
        )
        self.mgr = User.objects.create(
            id='usr-mgr-01', username='mgr1', email='mgr1@procure.vn',
            name='Tran Thi B', role='manager', department='Phòng CNTT'
        )
        self.pro = User.objects.create(
            id='usr-pro-01', username='pro1', email='pro1@procure.vn',
            name='Le Van C', role='procurement', department='Phòng Thu mua'
        )
        self.fin = User.objects.create(
            id='usr-fin-01', username='fin1', email='fin1@procure.vn',
            name='Pham Thi D', role='finance', department='Phòng Tài chính'
        )
        self.adm = User.objects.create(
            id='usr-adm-01', username='adm1', email='adm1@procure.vn',
            name='Vu Duc E', role='admin', department='Ban Quản trị'
        )

        # 2. Setup Budget
        self.budget = Budget.objects.create(
            code='BGT-IT-2026',
            department='Phòng CNTT',
            cost_center='CC-IT-01',
            name='Ngân sách Thiết bị CNTT 2026',
            fiscal_year=2026,
            allocated=Decimal('500000000.00'),
            committed=Decimal('0.00')
        )

        # 3. Setup Supplier
        self.supplier = Supplier.objects.create(
            id='sup-01',
            name='Công ty Công nghệ Phong Vũ',
            tax_code='0301234567',
            contact_name='Nguyen Phong',
            email='sales@phongvu.vn',
            phone='19001800',
            categories=['Thiết bị CNTT']
        )

    def test_user_roles_and_properties(self):
        """Kiểm tra thuộc tính người dùng và 5 vai trò RBAC"""
        self.assertEqual(self.emp.role, 'employee')
        self.assertEqual(self.mgr.role, 'manager')
        self.assertEqual(self.pro.role, 'procurement')
        self.assertEqual(self.fin.role, 'finance')
        self.assertEqual(self.adm.role, 'admin')
        self.assertEqual(self.emp.full_name, 'Nguyen Van A')

    def test_budget_remaining_calculation(self):
        """Kiểm tra tính toán ngân sách còn lại: remaining = allocated - committed"""
        self.assertEqual(self.budget.remaining, Decimal('500000000.00'))
        self.budget.committed = Decimal('60000000.00')
        self.budget.save()
        self.assertEqual(self.budget.remaining, Decimal('440000000.00'))

    def test_pr_creation_and_estimated_amount(self):
        """Kiểm tra tạo PR, thêm PRLineItem và tính tổng tiền dự toán"""
        pr = PurchaseRequest.objects.create(
            id='PR-2026-0001',
            title='Mua sắm Laptop cho phòng CNTT',
            justification='Cấp mới thiết bị cho nhân viên kỹ thuật',
            department='Phòng CNTT',
            cost_center='CC-IT-01',
            category='Thiết bị CNTT',
            budget_code=self.budget.code,
            requester=self.emp,
            status='draft'
        )

        PRLineItem.objects.create(
            id='ITM-001',
            pr=pr,
            name='Laptop Dell Latitude 5420',
            specs='Core i7, 16GB RAM, 512GB SSD',
            quantity=2,
            unit='cái',
            est_unit_price=Decimal('25000000.00')
        )

        self.assertEqual(pr.items.count(), 1)
        self.assertEqual(pr.total_estimated_amount, Decimal('50000000.00'))
        self.assertEqual(pr.status, 'draft')

    def test_quotation_calculations(self):
        """Kiểm tra tính toán tiền báo giá: subtotal, VAT và total_amount"""
        pr = PurchaseRequest.objects.create(
            id='PR-2026-0002',
            title='Mua máy in văn phòng',
            department='Phòng CNTT',
            budget_code=self.budget.code,
            requester=self.emp,
            status='approved'
        )

        quotation = Quotation.objects.create(
            id='QUO-2026-0001',
            pr=pr,
            supplier=self.supplier,
            lines=[
                {'itemName': 'Máy in Laser HP', 'quantity': 1, 'unitPrice': 10000000}
            ],
            tax_rate=Decimal('0.10'),
            shipping_fee=Decimal('500000.00'),
            delivery_days=3,
            warranty_months=12
        )

        self.assertEqual(quotation.subtotal, 10000000)
        # 10M + 10% tax (1M) + 500k shipping = 11.5M
        self.assertEqual(quotation.total_amount, Decimal('11500000.00'))

    def test_purchase_order_and_receiving(self):
        """Kiểm tra tạo PO và ghi nhận biên bản nhận hàng Receiving"""
        pr = PurchaseRequest.objects.create(
            id='PR-2026-0003',
            title='Mua bàn làm việc',
            department='Phòng CNTT',
            budget_code=self.budget.code,
            requester=self.emp,
            status='supplier_selected'
        )

        po = PurchaseOrder.objects.create(
            id='PO-2026-0001',
            pr=pr,
            quotation_id='QUO-2026-0001',
            supplier=self.supplier,
            created_by=self.pro,
            total=Decimal('10000000.00'),
            status='issued'
        )

        receiving = Receiving.objects.create(
            id='RCV-2026-0001',
            po=po,
            received_by=self.emp,
            type='full',
            note='Đã nhận đủ hàng hóa'
        )

        self.assertEqual(po.status, 'issued')
        self.assertEqual(receiving.type, 'full')
        self.assertEqual(receiving.po, po)

    def test_audit_entry_logging(self):
        """Kiểm tra ghi nhận AuditEntry đầy đủ trường thông tin"""
        entry = AuditEntry.objects.create(
            id='AUD-TEST-001',
            actor=self.mgr,
            actor_name=self.mgr.name,
            role=self.mgr.role,
            action='Manager Approve',
            entity='PR',
            entity_id='PR-2026-0001',
            from_status='pending_manager',
            to_status='approved',
            reason='Đồng ý phê duyệt'
        )

        self.assertEqual(entry.action, 'Manager Approve')
        self.assertEqual(entry.to_status, 'approved')
        self.assertEqual(entry.actor, self.mgr)

    def test_ai_standardizer_service(self):
        """Kiểm tra AI Standardizer chuẩn hóa danh mục và gợi ý thông số"""
        res = run_ai_standardizer(
            title='Cần mua 3 cái laptop văn phòng',
            category='Chung',
            items_data=[{'name': 'laptop dell', 'quantity': 3, 'unit_price': 20000000}]
        )

        self.assertIn('Thiết bị IT & Điện tử', res['suggested_category'])
        self.assertTrue(len(res['items']) > 0)
        self.assertIn('RAM', res['items'][0]['name'])
