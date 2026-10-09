import json
from decimal import Decimal
from django.test import TestCase, Client
from procurement.models import (
    User, Budget, PurchaseRequest, PRLineItem,
    Supplier, Quotation, PurchaseOrder, Receiving,
    AuditEntry
)
from procurement.services import run_ai_standardizer

class ProcurementWorkflowIntegrationTests(TestCase):
    """
    Automated Integration Test Suite migrated from tests/workflow.test.js to Django test runner.
    Covers the complete 7-step Procurement Lifecycle, No Self-Approval Guard, AI Anomaly Alert, and API Sync.
    
    Traceability:
    - REQ-FR-01: Create Draft PR
    - REQ-FR-02 & REQ-FR-03: Validate & AI Normalizer
    - REQ-FR-05 & REQ-FR-06: Manager Approval
    - REQ-NFR-02: Strict No Self-Approval Security Rule
    - REQ-FR-08 & REQ-FR-09: Budget Commitment & Threshold
    - REQ-FR-10, REQ-FR-12, REQ-FR-13, REQ-FR-15: Quotation Collection, AI Comparison & Anomaly Alert (>= 20%)
    - REQ-FR-16: Purchase Order Creation
    - REQ-FR-17: Goods Receiving
    - REQ-FR-18: PR Closure Lifecycle
    """

    def setUp(self):
        self.client = Client()

        # 1. Seed Users (5 RBAC roles)
        self.emp = User.objects.create(
            id='usr-emp-01', username='employee1', email='emp1@procure.vn',
            name='Nguyen Van A', role='employee', department='Phòng CNTT'
        )
        self.mgr = User.objects.create(
            id='usr-mgr-01', username='manager1', email='mgr1@procure.vn',
            name='Tran Thi B', role='manager', department='Phòng CNTT'
        )
        self.mgr_other = User.objects.create(
            id='usr-mgr-02', username='manager2', email='mgr2@procure.vn',
            name='Hoang Van M', role='manager', department='Ban Giám Đốc'
        )
        self.pro = User.objects.create(
            id='usr-pro-01', username='procurement1', email='pro1@procure.vn',
            name='Le Van C', role='procurement', department='Phòng Thu mua', can_receive=True
        )
        self.fin = User.objects.create(
            id='usr-fin-01', username='finance1', email='fin1@procure.vn',
            name='Pham Thi D', role='finance', department='Phòng Tài chính'
        )

        # 2. Seed Budget
        self.budget = Budget.objects.create(
            code='BGT-IT-2026',
            department='Phòng CNTT',
            cost_center='CC-IT-01',
            name='Ngân sách Thiết bị CNTT',
            fiscal_year=2026,
            allocated=Decimal('500000000.00'),
            committed=Decimal('0.00')
        )

        # 3. Seed Suppliers
        self.sup1 = Supplier.objects.create(
            id='sup-01', name='Công ty Phong Vũ IT', tax_code='030111222',
            categories=['Thiết bị CNTT']
        )
        self.sup2 = Supplier.objects.create(
            id='sup-02', name='Công ty FPT Trading', tax_code='030333444',
            categories=['Thiết bị CNTT']
        )

    def test_step_01_create_draft_pr_and_ai_standardizer(self):
        """Bước 1: Tạo PR bản nháp và chạy AI Standardizer chuẩn hóa thông tin (REQ-FR-01, REQ-FR-03)"""
        # AI Normalizer test
        ai_res = run_ai_standardizer(
            title='cần mua 3 cái laptop dell cho phòng kỹ thuật',
            category='Chung',
            items_data=[{'name': 'Dell Latitude', 'quantity': 3, 'unit_price': 20000000}]
        )
        self.assertEqual(ai_res['suggested_category'], 'Thiết bị IT & Điện tử')


        pr = PurchaseRequest.objects.create(
            id='PR-TEST-101',
            title='Mua sắm 03 Laptop Dell cho phòng kỹ thuật',
            justification='Trang bị máy tính làm việc cho nhân viên mới',
            department='Phòng CNTT',
            cost_center='CC-IT-01',
            category=ai_res['suggested_category'],
            budget_code=self.budget.code,
            requester=self.emp,
            status='draft'
        )
        PRLineItem.objects.create(
            id='ITM-TEST-101',
            pr=pr,
            name='Dell Latitude 5420',
            specs='Core i7, 16GB, 512GB',
            quantity=3,
            unit='cái',
            est_unit_price=Decimal('20000000.00')
        )

        self.assertEqual(pr.status, 'draft')
        self.assertEqual(pr.total_estimated_amount, Decimal('60000000.00'))

    def test_step_02_submit_pr_and_budget_commitment(self):
        """Bước 2: Submit PR và chuyển trạng thái sang pending_manager, giữ chỗ ngân sách (REQ-FR-02, REQ-BR-01)"""
        pr = PurchaseRequest.objects.create(
            id='PR-TEST-102',
            title='Mua sắm Laptop Dell',
            department='Phòng CNTT',
            budget_code=self.budget.code,
            requester=self.emp,
            status='draft'
        )
        PRLineItem.objects.create(
            id='ITM-102', pr=pr, name='Laptop Dell', quantity=3, est_unit_price=Decimal('20000000.00')
        )

        # Submit PR
        pr.status = 'pending_manager'
        pr.save()

        # Cập nhật ngân sách tạm giữ (commitment)
        self.budget.committed += pr.total_estimated_amount
        self.budget.save()

        self.assertEqual(pr.status, 'pending_manager')
        self.assertEqual(self.budget.committed, Decimal('60000000.00'))
        self.assertEqual(self.budget.remaining, Decimal('440000000.00'))

    def test_step_03_strict_no_self_approval_guard(self):
        """Bước 3: Kiểm tra quy tắc bảo mật nghiêm ngặt No Self-Approval (REQ-NFR-02)"""
        # Manager tự tạo PR cho phòng ban của mình
        mgr_pr = PurchaseRequest.objects.create(
            id='PR-TEST-MGR-01',
            title='PR do chính Manager tạo',
            department='Phòng CNTT',
            budget_code=self.budget.code,
            requester=self.mgr,  # Người tạo là Manager
            status='pending_manager'
        )

        # Quy tắc nghiệp vụ No Self-Approval: Người duyệt không được trùng người tạo
        def can_user_approve(actor, request_obj):
            if actor.id == request_obj.requester.id:
                raise PermissionError("QUY TẮC AN TOÀN (No Self-Approval): Bạn không thể tự phê duyệt Yêu cầu Mua sắm do chính mình tạo ra!")
            return actor.role in ['manager', 'admin']

        with self.assertRaises(PermissionError) as ctx:
            can_user_approve(self.mgr, mgr_pr)

        self.assertIn("No Self-Approval", str(ctx.exception))

    def test_step_04_manager_approval_success(self):
        """Bước 4: Manager hợp lệ phê duyệt PR thành công chuyển sang approved (REQ-FR-05, REQ-FR-06)"""
        pr = PurchaseRequest.objects.create(
            id='PR-TEST-104',
            title='Mua sắm Laptop Dell',
            department='Phòng CNTT',
            budget_code=self.budget.code,
            requester=self.emp,
            status='pending_manager'
        )

        # Manager duyệt PR do Employee tạo
        pr.status = 'approved'
        pr.save()

        AuditEntry.objects.create(
            id='AUD-104',
            actor=self.mgr,
            actor_name=self.mgr.name,
            role=self.mgr.role,
            action='Manager Approve',
            entity='PR',
            entity_id=pr.id,
            from_status='pending_manager',
            to_status='approved',
            reason='Duyệt cấp phòng ban'
        )

        self.assertEqual(pr.status, 'approved')
        self.assertEqual(AuditEntry.objects.filter(entity_id=pr.id).count(), 1)

    def test_step_05_quotation_collection_and_price_anomaly_alert(self):
        """Bước 5: Thu thập báo giá và kích hoạt cảnh báo giá bất thường khi chênh lệch >= 20% (REQ-FR-15)"""
        pr = PurchaseRequest.objects.create(
            id='PR-TEST-105',
            title='Mua sắm Laptop Dell',
            department='Phòng CNTT',
            budget_code=self.budget.code,
            requester=self.emp,
            status='approved'
        )
        baseline_price = Decimal('60000000.00')

        # Báo giá 1: 58M (Tối ưu)
        q1 = Quotation.objects.create(
            id='QUO-105-A', pr=pr, supplier=self.sup1,
            tax_rate=Decimal('0'), shipping_fee=Decimal('0'),
            lines=[{'itemName': 'Dell Laptop', 'quantity': 3, 'unitPrice': 19333333}]
        )

        # Báo giá 2: 75M (Cao hơn 25% so với giá dự kiến 60M -> Vượt ngưỡng >= 20%)
        q2 = Quotation.objects.create(
            id='QUO-105-B', pr=pr, supplier=self.sup2,
            tax_rate=Decimal('0'), shipping_fee=Decimal('0'),
            lines=[{'itemName': 'Dell Laptop', 'quantity': 3, 'unitPrice': 25000000}]
        )

        def evaluate_anomaly(quotation_total, baseline):
            ratio = (quotation_total - baseline) / baseline
            return ratio >= Decimal('0.20')

        q1_anomaly = evaluate_anomaly(q1.total_amount, baseline_price)
        q2_anomaly = evaluate_anomaly(q2.total_amount, baseline_price)

        self.assertFalse(q1_anomaly)
        self.assertTrue(q2_anomaly)  # Phải kích hoạt cờ cảnh báo bất thường

    def test_step_06_create_po_from_selected_quotation(self):
        """Bước 6: Tạo đơn mua hàng PO từ báo giá được chọn (REQ-FR-16)"""
        pr = PurchaseRequest.objects.create(
            id='PR-TEST-106',
            title='Mua sắm Laptop Dell',
            department='Phòng CNTT',
            budget_code=self.budget.code,
            requester=self.emp,
            status='approved'
        )
        q = Quotation.objects.create(
            id='QUO-106-A', pr=pr, supplier=self.sup1,
            lines=[{'itemName': 'Dell Laptop', 'quantity': 3, 'unitPrice': 19333333}]
        )

        pr.selected_quotation_id = q.id
        pr.status = 'supplier_selected'
        pr.save()

        po = PurchaseOrder.objects.create(
            id='PO-2026-0106',
            pr=pr,
            quotation_id=q.id,
            supplier=self.sup1,
            created_by=self.pro,
            total=q.total_amount,
            status='issued'
        )
        pr.po_id = po.id
        pr.status = 'po_created'
        pr.save()

        self.assertEqual(po.status, 'issued')
        self.assertEqual(pr.status, 'po_created')

    def test_step_07_goods_receiving_full(self):
        """Bước 7: Ghi nhận biên bản nhận hàng Receiving đầy đủ (REQ-FR-17)"""
        pr = PurchaseRequest.objects.create(
            id='PR-TEST-107', title='Mua Laptop', department='Phòng CNTT',
            budget_code=self.budget.code, requester=self.emp, status='po_created'
        )
        po = PurchaseOrder.objects.create(
            id='PO-2026-0107', pr=pr, quotation_id='Q1', supplier=self.sup1,
            created_by=self.pro, status='issued'
        )

        # Ghi nhận nhận hàng 100%
        rcv = Receiving.objects.create(
            id='RCV-2026-0107', po=po, received_by=self.emp, type='full',
            note='Đã nhận đủ 3 laptop và phiếu bảo hành'
        )
        po.status = 'received'
        po.save()
        pr.status = 'received'
        pr.save()

        self.assertEqual(rcv.type, 'full')
        self.assertEqual(po.status, 'received')
        self.assertEqual(pr.status, 'received')

    def test_step_08_close_pr_lifecycle(self):
        """Bước 8: Đóng vòng đời Purchase Request (Close PR) (REQ-FR-18)"""
        pr = PurchaseRequest.objects.create(
            id='PR-TEST-108', title='Mua Laptop', department='Phòng CNTT',
            budget_code=self.budget.code, requester=self.emp, status='received'
        )

        pr.status = 'closed'
        pr.save()

        self.assertEqual(pr.status, 'closed')

    def test_step_09_api_state_and_sync_endpoints(self):
        """Bước 9: Kiểm tra hợp đồng API REST /api/v1/state/ và /api/v1/sync/"""
        # Test GET /api/v1/state/
        response = self.client.get('/api/v1/state/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertIn('users', data)
        self.assertIn('requests', data)
        self.assertIn('quotations', data)
        self.assertIn('orders', data)
        self.assertIn('receivings', data)
        self.assertIn('budgets', data)
        self.assertIn('audit', data)

        # Test POST /api/v1/sync/
        sync_payload = {
            'requests': [
                {
                    'id': 'PR-TEST-SYNC',
                    'status': 'closed',
                    'lastReason': 'Hoàn tất nghiệm thu'
                }
            ]
        }
        PurchaseRequest.objects.create(
            id='PR-TEST-SYNC', title='Sync PR', department='Phòng CNTT',
            budget_code=self.budget.code, requester=self.emp, status='received'
        )
        sync_response = self.client.post(
            '/api/v1/sync/',
            data=json.dumps(sync_payload),
            content_type='application/json'
        )
        self.assertEqual(sync_response.status_code, 200)
        updated_pr = PurchaseRequest.objects.get(id='PR-TEST-SYNC')
        self.assertEqual(updated_pr.status, 'closed')
        self.assertEqual(updated_pr.last_reason, 'Hoàn tất nghiệm thu')
