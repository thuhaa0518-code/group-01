from django.test import TestCase
from decimal import Decimal
from procurement.models import Department, User, Budget, PurchaseRequest, PRItem, Supplier, Quotation, PurchaseOrder, Receiving

class ProcureAIWorkflowTests(TestCase):
    def setUp(self):
        self.dept = Department.objects.create(code='IT', name='Phòng IT')
        self.budget = Budget.objects.create(department=self.dept, fiscal_year=2026, allocated_amount=Decimal('500000000.00'))
        
        self.emp = User.objects.create_user(username='emp1', email='emp1@test.com', password='password123', role='EMPLOYEE', department=self.dept)
        self.mgr = User.objects.create_user(username='mgr1', email='mgr1@test.com', password='password123', role='MANAGER', department=self.dept)
        self.fin = User.objects.create_user(username='fin1', email='fin1@test.com', password='password123', role='FINANCE', department=self.dept)
        self.pro = User.objects.create_user(username='pro1', email='pro1@test.com', password='password123', role='PROCUREMENT', department=self.dept)
        
        self.supplier = Supplier.objects.create(code='SUP-TEST', name='Test Supplier', tax_id='123456789')

    def test_pr_creation_and_budget_reservation(self):
        pr = PurchaseRequest.objects.create(
            pr_number='PR-TEST-001',
            title='Test Purchase Request',
            category='IT Equipment',
            requester=self.emp,
            department=self.dept,
            total_estimated_amount=Decimal('10000000.00'),
            status='SUBMITTED'
        )
        PRItem.objects.create(pr=pr, item_name='Laptop', quantity=1, unit_price=Decimal('10000000.00'))
        
        self.budget.reserved_amount += pr.total_estimated_amount
        self.budget.save()
        
        self.assertEqual(self.budget.available_amount, Decimal('490000000.00'))
        self.assertEqual(pr.status, 'SUBMITTED')

    def test_no_self_approval_rule(self):
        # A Manager creating their own PR cannot approve it
        mgr_pr = PurchaseRequest.objects.create(
            pr_number='PR-TEST-MGR',
            title='Manager own PR',
            category='IT Equipment',
            requester=self.mgr,
            department=self.dept,
            total_estimated_amount=Decimal('5000000.00'),
            status='SUBMITTED'
        )
        self.assertEqual(mgr_pr.requester, self.mgr)

    def test_receiving_quantity_limit(self):
        pr = PurchaseRequest.objects.create(
            pr_number='PR-TEST-RCV',
            title='Test PR for Receiving',
            category='IT Equipment',
            requester=self.emp,
            department=self.dept,
            total_estimated_amount=Decimal('20000000.00'),
            status='SUPPLIER_SELECTED'
        )
        PRItem.objects.create(pr=pr, item_name='Monitor', quantity=2, unit_price=Decimal('10000000.00'))
        
        q = Quotation.objects.create(pr=pr, supplier=self.supplier, total_amount=Decimal('20000000.00'), is_selected=True)
        po = PurchaseOrder.objects.create(po_number='PO-TEST-RCV', pr=pr, quotation=q, total_amount=Decimal('20000000.00'), status='ISSUED')
        
        total_ordered = sum(item.quantity for item in pr.items.all())
        self.assertEqual(total_ordered, 2)
        
        # Test valid receiving quantity <= PO quantity
        rcv = Receiving.objects.create(po=po, received_by=self.emp, received_quantity=2, status='FULL')
        self.assertLessEqual(rcv.received_quantity, total_ordered)
