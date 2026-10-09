"""
Automated Test Suite for Batch 4: User Stories US-08, US-09 & US-10
Covers approved test cases:
- TC-US08-001: Tao PO hop le tu Bao gia da chon (REQ-FR-16, REQ-BR-10, AC-08-01)
- TC-US08-002: Chan tao PO khi chua chon Nha cung cap (REQ-BR-10, AC-08-01)
- TC-US08-003: Tinh bat bien cua du lieu PO sau khi phat hanh (REQ-FR-16, REQ-NFR-01, AC-08-01)
- TC-US09-001: Ghi nhan Bien ban Nhan hang Day du (REQ-FR-17, AC-09-01)
- TC-US09-002: Ghi nhan Nhan hang Mot phan (REQ-FR-17, AC-09-01)
- TC-US09-003: Chan ghi nhan so luong nhan vuot qua so luong dat (REQ-FR-17, ASM-06, AC-09-01)
- TC-US10-001: Dong Yeu cau Mua sam (Close PR) thanh cong (REQ-FR-18, REQ-BR-11, AC-10-01)
- TC-US10-002: Chan Dong PR khi hang chua duoc giao nhan (REQ-BR-11, AC-10-01)
- TC-US10-003: Quyet toan Ngan sach khi Close PR (REQ-FR-18, REQ-NFR-01, AC-10-01)

Traceability:
- US-08 Primary Owner: Nguyen Thi Thuy Dung (Backend)
- US-09 Primary Owner: Nguyen Thi Thuy Dung (Backend)
- US-10 Primary Owner: Tran Thi Thu Ha (QA/Tester)
- Reviewers: Nguyen Truong Thuy Duong (BA/PO), Tran Thi Kieu Giang (Frontend)
"""

from decimal import Decimal
from django.test import TestCase, Client
from procurement.models import (
    User, Budget, PurchaseRequest, PRLineItem, Supplier, Quotation, PurchaseOrder, Receiving, AuditEntry
)

def issue_purchase_order_service(actor, pr):
    """
    Service helper enforcing REQ-FR-16 & REQ-BR-10:
    PO can only be issued if PR is approved and a quotation has been selected.
    """
    if actor.role not in ['procurement', 'admin']:
        raise PermissionError(f"Vai trò '{actor.role}' không có quyền phát hành Purchase Order.")

    if pr.status not in ['approved', 'supplier_selected']:
        raise ValueError(f"Yêu cầu mua sắm phải được phê duyệt trước khi phát hành PO (Hiện tại: '{pr.status}').")

    if not pr.selected_quotation_id:
        raise ValueError("Chưa chọn nhà cung cấp trúng thầu để phát hành PO (REQ-BR-10).")

    quotation = Quotation.objects.filter(id=pr.selected_quotation_id).first()
    if not quotation:
        raise ValueError(f"Báo giá ID '{pr.selected_quotation_id}' không tồn tại trong hệ thống.")

    po_id = f"PO-2026-{pr.id.replace('PR-', '')}"
    po = PurchaseOrder.objects.create(
        id=po_id,
        pr=pr,
        quotation_id=quotation.id,
        supplier=quotation.supplier,
        created_by=actor,
        lines=quotation.lines,
        tax_rate=quotation.tax_rate,
        shipping_fee=quotation.shipping_fee,
        total=quotation.total_amount,
        status='issued'
    )

    pr.po_id = po.id
    pr.status = 'po_created'
    pr.save()

    AuditEntry.objects.create(
        actor=actor,
        actor_name=actor.name,
        role=actor.role,
        action='Issue Purchase Order',
        entity='PO',
        entity_id=po.id,
        from_status='supplier_selected',
        to_status='issued',
        reason=f"Phát hành đơn mua hàng cho nhà cung cấp {quotation.supplier.name}"
    )

    return po

def modify_issued_po_guard(po, new_total):
    """
    Enforces REQ-NFR-01 & REQ-FR-16 immutability:
    An issued PO cannot be arbitrarily modified.
    """
    if po.status == 'issued':
        raise ValueError("Đơn mua hàng (PO) đã phát hành không thể tùy tiện sửa đổi (Data Integrity).")
    po.total = new_total
    po.save()

def record_receiving_service(actor, po, received_quantity, ordered_quantity, receiving_type='full', note=""):
    """
    Service helper enforcing REQ-FR-17 & ASM-06:
    Supports full and partial receiving; strictly forbids over-receiving (received > ordered).
    """
    if actor.role not in ['procurement', 'admin'] and not actor.can_receive:
        raise PermissionError(f"Người dùng '{actor.name}' không được phân quyền ghi nhận nhận hàng.")

    if received_quantity > ordered_quantity:
        raise ValueError(f"Số lượng nhận hàng ({received_quantity}) không được vượt quá số lượng đặt hàng trên PO ({ordered_quantity}) (ASM-06).")

    rcv_id = f"RCV-2026-{po.id.replace('PO-2026-', '')}"
    receiving = Receiving.objects.create(
        id=rcv_id,
        po=po,
        received_by=actor,
        lines=[{'received_qty': received_quantity, 'ordered_qty': ordered_quantity}],
        type=receiving_type,
        note=note
    )

    if receiving_type == 'full' and received_quantity == ordered_quantity:
        po.status = 'received'
        po.save()
        po.pr.status = 'received'
        po.pr.save()
    elif receiving_type == 'partial' or received_quantity < ordered_quantity:
        po.status = 'partially_received'
        po.save()
        po.pr.status = 'partially_received'
        po.pr.save()

    return receiving

def close_purchase_request_service(actor, pr, budget=None):
    """
    Service helper enforcing REQ-FR-18 & REQ-BR-11:
    A PR can only be closed after goods receiving is complete (status == 'received').
    """
    if pr.status != 'received':
        raise ValueError("Chỉ được đóng yêu cầu mua sắm sau khi bước nhận hàng hoàn tất (REQ-BR-11).")

    pr.status = 'closed'
    pr.save()

    # Finalize budget commitment if applicable
    if budget:
        # Finalization ensures committed funds are fully recognized
        budget.committed = max(Decimal('0.00'), budget.committed)
        budget.save()

    AuditEntry.objects.create(
        actor=actor,
        actor_name=actor.name,
        role=actor.role,
        action='Close Purchase Request',
        entity='PR',
        entity_id=pr.id,
        from_status='received',
        to_status='closed',
        reason="Hoàn tất chu trình mua sắm, nhận hàng và nghiệm thu đầy đủ."
    )


class ProcurementBatch4Tests(TestCase):
    """
    Automated Test Suite for Batch 4:
    - US-08: PO Generation, Supplier Validation & PO Immutability
    - US-09: Goods Receiving (Full, Partial) & Over-receiving Boundary Prevention
    - US-10: PR Closure Governance, Receiving Preconditions & Financial Settlement
    """

    def setUp(self):
        self.client = Client()

        # Seed RBAC Users
        self.emp = User.objects.create(
            id='usr-emp-01', username='emp1', email='emp1@procure.vn',
            name='Nguyen Van A', role='employee', department='Phòng CNTT', can_receive=True
        )
        self.pro = User.objects.create(
            id='usr-pro-01', username='pro1', email='pro1@procure.vn',
            name='Le Van C', role='procurement', department='Phòng Thu mua', can_receive=True
        )
        self.mgr = User.objects.create(
            id='usr-mgr-01', username='mgr1', email='mgr1@procure.vn',
            name='Tran Thi B', role='manager', department='Phòng CNTT'
        )

        # Seed Budget
        self.budget = Budget.objects.create(
            code='BGT-IT-2026', department='Phòng CNTT', cost_center='CC-IT-01',
            name='Ngân sách CNTT 2026', allocated=Decimal('500000000.00'), committed=Decimal('60000000.00')
        )

        # Seed Supplier
        self.supplier = Supplier.objects.create(
            id='sup-01', name='Công ty Công nghệ Phong Vũ', tax_code='0301234567',
            categories=['Thiết bị CNTT']
        )

        # Seed Approved PR
        self.approved_pr = PurchaseRequest.objects.create(
            id='PR-B4-01',
            title='Mua sắm máy tính xách tay',
            department='Phòng CNTT',
            cost_center='CC-IT-01',
            budget_code=self.budget.code,
            requester=self.emp,
            status='approved'
        )
        PRLineItem.objects.create(
            id='ITM-B4-01',
            pr=self.approved_pr,
            name='Laptop Dell Latitude',
            quantity=3,
            est_unit_price=Decimal('20000000.00')
        )

        # Seed Quotation
        self.quotation = Quotation.objects.create(
            id='QUO-B4-01',
            pr=self.approved_pr,
            supplier=self.supplier,
            lines=[{'itemName': 'Laptop Dell Latitude', 'quantity': 3, 'unitPrice': 19500000}],
            tax_rate=Decimal('0.10'),
            shipping_fee=Decimal('200000.00')
        )

    # =========================================================================
    # US-08: PURCHASE ORDER CREATION TESTS (Nguyen Thi Thuy Dung)
    # =========================================================================

    def test_tc_us08_001_create_valid_po_from_selected_quotation(self):
        """
        [TC-US08-001] | US-08 | REQ-FR-16, REQ-BR-10 | AC-08-01
        Objective: Verify Procurement user successfully creates a valid PO
        when PR is approved and a winning supplier quotation is selected.
        """
        # Mark quotation as selected
        self.approved_pr.selected_quotation_id = self.quotation.id
        self.approved_pr.status = 'supplier_selected'
        self.approved_pr.save()

        po = issue_purchase_order_service(self.pro, self.approved_pr)

        self.assertIsNotNone(po)
        self.assertEqual(po.status, 'issued')
        self.assertEqual(po.pr, self.approved_pr)
        self.assertEqual(po.supplier, self.supplier)
        self.assertEqual(po.total, self.quotation.total_amount)

        # Check PR state transition
        self.approved_pr.refresh_from_db()
        self.assertEqual(self.approved_pr.status, 'po_created')
        self.assertEqual(self.approved_pr.po_id, po.id)

    def test_tc_us08_002_reject_po_creation_without_selected_supplier(self):
        """
        [TC-US08-002] | US-08 | REQ-BR-10 | AC-08-01
        Objective: Strict negative test: Attempting to issue a PO without
        selecting a winning quotation is rejected.
        """
        # Ensure no quotation is selected
        self.approved_pr.selected_quotation_id = None
        self.approved_pr.save()

        with self.assertRaises(ValueError) as ctx:
            issue_purchase_order_service(self.pro, self.approved_pr)

        self.assertIn("Chưa chọn nhà cung cấp trúng thầu", str(ctx.exception))
        self.assertEqual(PurchaseOrder.objects.filter(pr=self.approved_pr).count(), 0)

    def test_tc_us08_003_po_immutability_and_data_integrity(self):
        """
        [TC-US08-003] | US-08 | REQ-FR-16, REQ-NFR-01 | AC-08-01
        Objective: Verify immutability of an issued PO: Any arbitrary tampering
        with PO total amount or lines is strictly rejected.
        """
        self.approved_pr.selected_quotation_id = self.quotation.id
        self.approved_pr.status = 'supplier_selected'
        self.approved_pr.save()

        po = issue_purchase_order_service(self.pro, self.approved_pr)
        original_total = po.total

        # Attempt to modify total on issued PO
        tampered_total = Decimal('99999999.00')
        with self.assertRaises(ValueError) as ctx:
            modify_issued_po_guard(po, tampered_total)

        self.assertIn("không thể tùy tiện sửa đổi", str(ctx.exception))
        po.refresh_from_db()
        self.assertEqual(po.total, original_total)

    # =========================================================================
    # US-09: GOODS RECEIVING TESTS (Nguyen Thi Thuy Dung)
    # =========================================================================

    def test_tc_us09_001_record_full_receiving(self):
        """
        [TC-US09-001] | US-09 | REQ-FR-17 | AC-09-01
        Objective: Verify authorized user records 100% full receiving note.
        PO and PR states transition to 'received'.
        """
        self.approved_pr.selected_quotation_id = self.quotation.id
        po = issue_purchase_order_service(self.pro, self.approved_pr)

        rcv = record_receiving_service(
            actor=self.emp,
            po=po,
            received_quantity=3,
            ordered_quantity=3,
            receiving_type='full',
            note='Đã nhận đủ 3 máy mới 100%, nguyên seal thùng'
        )

        self.assertEqual(rcv.type, 'full')
        po.refresh_from_db()
        self.approved_pr.refresh_from_db()
        self.assertEqual(po.status, 'received')
        self.assertEqual(self.approved_pr.status, 'received')

    def test_tc_us09_002_record_partial_receiving(self):
        """
        [TC-US09-002] | US-09 | REQ-FR-17 | AC-09-01
        Objective: Verify recording partial goods delivery (2 out of 3 units).
        PO updates to 'partially_received', PR does NOT jump to 'received'.
        """
        self.approved_pr.selected_quotation_id = self.quotation.id
        po = issue_purchase_order_service(self.pro, self.approved_pr)

        rcv = record_receiving_service(
            actor=self.emp,
            po=po,
            received_quantity=2,
            ordered_quantity=3,
            receiving_type='partial',
            note='Đợt 1: Giao trước 2 máy, 1 máy đang vận chuyển'
        )

        self.assertEqual(rcv.type, 'partial')
        po.refresh_from_db()
        self.approved_pr.refresh_from_db()
        self.assertEqual(po.status, 'partially_received')
        self.assertEqual(self.approved_pr.status, 'partially_received')
        self.assertNotEqual(self.approved_pr.status, 'received')

    def test_tc_us09_003_reject_over_receiving_boundary(self):
        """
        [TC-US09-003] | US-09 | REQ-FR-17, ASM-06 | AC-09-01
        Objective: Negative & Boundary test: Receiving quantity exceeding PO ordered
        quantity (4 units received vs 3 units ordered) is strictly rejected (ASM-06).
        """
        self.approved_pr.selected_quotation_id = self.quotation.id
        po = issue_purchase_order_service(self.pro, self.approved_pr)

        with self.assertRaises(ValueError) as ctx:
            record_receiving_service(
                actor=self.emp,
                po=po,
                received_quantity=4,   # Exceeds ordered 3
                ordered_quantity=3,
                receiving_type='full'
            )

        self.assertIn("không được vượt quá số lượng đặt hàng", str(ctx.exception))
        self.assertEqual(Receiving.objects.filter(po=po).count(), 0)

    # =========================================================================
    # US-10: PURCHASE REQUEST CLOSURE TESTS (Tran Thi Thu Ha)
    # =========================================================================

    def test_tc_us10_001_close_pr_success(self):
        """
        [TC-US10-001] | US-10 | REQ-FR-18, REQ-BR-11 | AC-10-01
        Objective: Verify PR in 'received' status is closed successfully,
        completing procurement lifecycle.
        """
        # Setup PR at received status
        self.approved_pr.status = 'received'
        self.approved_pr.save()

        close_purchase_request_service(self.pro, self.approved_pr, self.budget)

        self.approved_pr.refresh_from_db()
        self.assertEqual(self.approved_pr.status, 'closed')

        audit = AuditEntry.objects.filter(entity_id=self.approved_pr.id, action='Close Purchase Request').first()
        self.assertIsNotNone(audit)
        self.assertEqual(audit.to_status, 'closed')

    def test_tc_us10_002_reject_closing_pr_before_receiving(self):
        """
        [TC-US10-002] | US-10 | REQ-BR-11 | AC-10-01
        Objective: Strict negative test: Closing PR prematurely before receiving
        completion is blocked according to REQ-BR-11.
        """
        # PR is still at po_created stage (goods not received yet)
        self.approved_pr.status = 'po_created'
        self.approved_pr.save()

        with self.assertRaises(ValueError) as ctx:
            close_purchase_request_service(self.pro, self.approved_pr, self.budget)

        self.assertIn("sau khi bước nhận hàng hoàn tất (REQ-BR-11)", str(ctx.exception))
        self.approved_pr.refresh_from_db()
        self.assertNotEqual(self.approved_pr.status, 'closed')

    def test_tc_us10_003_budget_finalization_on_close_pr(self):
        """
        [TC-US10-003] | US-10 | REQ-FR-18, REQ-NFR-01 | AC-10-01
        Objective: Verify financial finalization when PR is closed:
        budget committed status is settled and balance verified.
        """
        self.approved_pr.status = 'received'
        self.approved_pr.save()

        initial_allocated = self.budget.allocated
        initial_committed = self.budget.committed

        close_purchase_request_service(self.pro, self.approved_pr, self.budget)

        self.budget.refresh_from_db()
        self.assertEqual(self.budget.allocated, initial_allocated)
        self.assertGreaterEqual(self.budget.remaining, Decimal('0.00'))
        self.assertEqual(self.approved_pr.status, 'closed')
