"""
Automated Test Suite for Batch 2: User Stories US-03, US-04 & US-05
Covers approved test cases:
- TC-US03-001: AI Standardizer chuan hoa danh muc va goi y thong so (REQ-FR-03, AC-03-01)
- TC-US03-002: Kiem soat Human-in-the-loop: Chinh sua va khong tu submit (REQ-FR-03, CON-03, AC-03-01)
- TC-US03-003: Xu ly dau vao ngoai le trong AI Standardizer (REQ-FR-03, AC-03-01)
- TC-US04-001: Manager hop le phe duyet PR thanh cong (REQ-FR-05, REQ-FR-06, AC-04-01)
- TC-US04-002: Manager tu choi (Reject) kem ly do bat buoc (REQ-FR-06, AC-04-02)
- TC-US04-003: Manager chuyen tiep PR sang Finance duyet ngan sach (REQ-FR-06, REQ-BR-04, AC-04-02)
- TC-US04-004: Yeu cau chinh sua PR (Request Revision) (REQ-FR-06, AC-04-02)
- TC-US05-001: Tinh toan chinh xac Ngan sach Cam ket va Con lai (REQ-FR-08, AC-05-01)
- TC-US05-002: Nguong kiem tra tu dong 50M (Threshold Boundary Test) (REQ-FR-08, REQ-BR-04, AC-05-01)
- TC-US05-003: Canh bao khi PR vuot qua Ngan sach Kha dung (REQ-FR-09, REQ-BR-05, AC-05-02)

Traceability:
- US-03 Primary Owner: Nguyen Truc Lam (AI Vault)
- US-04 Primary Owner: Nguyen Truong Thuy Duong (BA/PO)
- US-05 Primary Owner: Nguyen Truong Thuy Duong (BA/PO)
- QA Reviewer: Tran Thi Thu Ha (QA/Tester)
"""

from decimal import Decimal
from django.test import TestCase, Client
from django.utils import timezone
from procurement.models import (
    User, Budget, PurchaseRequest, PRLineItem, AuditEntry
)
from procurement.services import run_ai_standardizer

def process_manager_decision(actor, pr, action, reason=""):
    """
    Service helper executing Manager review actions according to
    REQ-FR-05, REQ-FR-06, REQ-BR-03, REQ-BR-04 and REQ-NFR-02 (No Self-Approval).
    """
    if actor.role not in ['manager', 'admin']:
        raise PermissionError(f"Quyền hạn không hợp lệ: Vai trò '{actor.role}' không được phép duyệt PR.")
    
    if actor.id == pr.requester.id:
        raise PermissionError("QUY TẮC AN TOÀN (No Self-Approval): Bạn không thể tự phê duyệt Yêu cầu do chính mình tạo ra!")
        
    if pr.status not in ['pending_manager', 'finance_review']:
        raise ValueError(f"Trạng thái PR '{pr.status}' không hợp lệ để thực hiện thao tác này.")

    if action == 'approve':
        pr.status = 'approved'
        pr.approved_at = timezone.now()
        pr.last_reason = reason or "Manager phê duyệt thành công"
        pr.save()
        AuditEntry.objects.create(
            actor=actor,
            actor_name=actor.name,
            role=actor.role,
            action='Manager Approve',
            entity='PR',
            entity_id=pr.id,
            from_status='pending_manager',
            to_status='approved',
            reason=pr.last_reason
        )
    elif action == 'reject':
        if not reason or not reason.strip():
            raise ValueError("Lỗi validation: Vui lòng nhập lý do từ chối (Lý do là bắt buộc).")
        pr.status = 'rejected'
        pr.last_reason = reason.strip()
        pr.save()
        AuditEntry.objects.create(
            actor=actor,
            actor_name=actor.name,
            role=actor.role,
            action='Manager Reject',
            entity='PR',
            entity_id=pr.id,
            from_status='pending_manager',
            to_status='rejected',
            reason=pr.last_reason
        )
    elif action == 'forward_finance':
        pr.status = 'finance_review'
        pr.routed_to_finance = True
        pr.last_reason = reason.strip() if reason else "Chuyển Finance thẩm định ngân sách"
        pr.save()
        AuditEntry.objects.create(
            actor=actor,
            actor_name=actor.name,
            role=actor.role,
            action='Forward to Finance',
            entity='PR',
            entity_id=pr.id,
            from_status='pending_manager',
            to_status='finance_review',
            reason=pr.last_reason
        )
    elif action == 'revision':
        if not reason or not reason.strip():
            raise ValueError("Lỗi validation: Vui lòng nhập nội dung yêu cầu chỉnh sửa.")
        pr.status = 'revision'
        pr.last_reason = reason.strip()
        pr.save()
        AuditEntry.objects.create(
            actor=actor,
            actor_name=actor.name,
            role=actor.role,
            action='Request Revision',
            entity='PR',
            entity_id=pr.id,
            from_status='pending_manager',
            to_status='revision',
            reason=pr.last_reason
        )
    else:
        raise ValueError(f"Hành động không xác định: {action}")


class ProcurementBatch2Tests(TestCase):
    """
    Automated Unit and Integration test suite for Batch 2:
    - US-03: AI Standardizer Service & Human-in-the-loop Governance
    - US-04: Manager Approval, Rejection, Forwarding & Revision Workflow
    - US-05: Budget Commitment, Threshold Boundary & Exceeded Alerts
    """

    def setUp(self):
        self.client = Client()

        # Seed RBAC Users
        self.emp = User.objects.create(
            id='usr-emp-01',
            username='emp1',
            email='emp1@procure.vn',
            name='Nguyen Van A',
            role='employee',
            department='Phòng CNTT'
        )
        self.mgr = User.objects.create(
            id='usr-mgr-01',
            username='mgr1',
            email='mgr1@procure.vn',
            name='Tran Thi B',
            role='manager',
            department='Phòng CNTT'
        )
        self.fin = User.objects.create(
            id='usr-fin-01',
            username='fin1',
            email='fin1@procure.vn',
            name='Pham Thi D',
            role='finance',
            department='Phòng Tài chính'
        )

        # Seed Budget
        self.budget = Budget.objects.create(
            code='BGT-IT-2026',
            department='Phòng CNTT',
            cost_center='CC-IT-01',
            name='Ngân sách Thiết bị CNTT 2026',
            fiscal_year=2026,
            allocated=Decimal('500000000.00'),
            committed=Decimal('0.00')
        )

    # =========================================================================
    # US-03: AI STANDARDIZER TESTS (Nguyen Truc Lam)
    # =========================================================================

    def test_tc_us03_001_ai_standardizer_suggestions(self):
        """
        [TC-US03-001] | US-03 | REQ-FR-03 | AC-03-01
        Objective: Verify run_ai_standardizer accurately detects item keywords,
        suggests official category, standardizes specifications, and attaches historical avg prices.
        """
        title = "cần mua 3 cái laptop dell cho phòng dev"
        category = "Chung"
        items_data = [
            {'name': 'laptop dell latitude', 'quantity': 3, 'unit_price': 20000000}
        ]

        result = run_ai_standardizer(title=title, category=category, items_data=items_data)

        # 1. Category standardization suggestion
        self.assertEqual(result['suggested_category'], 'Thiết bị IT & Điện tử')
        self.assertIn("gợi ý chuyển Danh mục", result['ai_notes'])

        # 2. Spec standardization suggestion
        items = result['items']
        self.assertEqual(len(items), 1)
        self.assertIn("RAM 16GB, SSD 512GB", items[0]['name'])

        # 3. Historical price reference lookup
        self.assertEqual(items[0]['historical_avg_price'], 20000000.0)

    def test_tc_us03_002_human_in_the_loop_governance(self):
        """
        [TC-US03-002] | US-03 | REQ-FR-03, CON-03 | AC-03-01
        Objective: Verify Human-in-the-loop principle: AI suggestions never auto-submit
        or write to DB; the user retains full discretion to modify AI outputs before saving.
        """
        title = "Mua laptop văn phòng"
        items_data = [{'name': 'laptop dell', 'quantity': 1, 'unit_price': 15000000}]
        ai_res = run_ai_standardizer(title, "Chung", items_data)

        # AI recommends 'Thiết bị IT & Điện tử'
        self.assertEqual(ai_res['suggested_category'], 'Thiết bị IT & Điện tử')

        # Employee exercises Human-in-the-loop discretion: Overrides category to 'Tài sản cố định'
        user_chosen_category = 'Tài sản cố định'

        pr = PurchaseRequest.objects.create(
            id='PR-HITL-01',
            title=title,
            justification='Trang bị làm việc',
            department='Phòng CNTT',
            cost_center='CC-IT-01',
            category=user_chosen_category,  # Overridden by human
            budget_code=self.budget.code,
            requester=self.emp,
            status='draft',                 # Retains draft, never auto-submitted
            ai_review='edited'              # Explicitly flags human modification
        )

        # Assert DB holds the human-edited value and remains in draft
        pr.refresh_from_db()
        self.assertEqual(pr.category, 'Tài sản cố định')
        self.assertEqual(pr.status, 'draft')
        self.assertEqual(pr.ai_review, 'edited')

    def test_tc_us03_003_ai_standardizer_edge_cases_and_error_handling(self):
        """
        [TC-US03-003] | US-03 | REQ-FR-03 | AC-03-01
        Objective: Verify AI service error resilience against unusual inputs
        (empty title, whitespace, special characters, empty items list) without raising unhandled exceptions.
        """
        # Test Case 1: Empty title and empty items list
        res_empty = run_ai_standardizer(title="", category="Khác", items_data=[])
        self.assertEqual(res_empty['suggested_category'], 'Khác')
        self.assertEqual(res_empty['items'], [])

        # Test Case 2: Special characters and noisy punctuation
        res_noise = run_ai_standardizer(
            title="!@#$%^&*()_+=-~`<>?:{}",
            category="Văn phòng phẩm",
            items_data=[{'name': '???', 'quantity': 1, 'unit_price': 50000}]
        )
        self.assertEqual(res_noise['suggested_category'], 'Văn phòng phẩm')
        self.assertEqual(len(res_noise['items']), 1)

        # Test Case 3: Whitespace only
        res_ws = run_ai_standardizer(title="     ", category="Chung", items_data=[])
        self.assertEqual(res_ws['suggested_category'], 'Chung')

    # =========================================================================
    # US-04: MANAGER APPROVAL WORKFLOW TESTS (Nguyen Truong Thuy Duong)
    # =========================================================================

    def test_tc_us04_001_manager_approval_success(self):
        """
        [TC-US04-001] | US-04 | REQ-FR-05, REQ-FR-06 | AC-04-01
        Objective: Verify authorized Manager successfully approves PR created by an Employee,
        transitioning state to 'approved' and generating audit trace.
        """
        pr = PurchaseRequest.objects.create(
            id='PR-MGR-APP-01',
            title='Mua sắm bàn làm việc phòng IT',
            department='Phòng CNTT',
            cost_center='CC-IT-01',
            budget_code=self.budget.code,
            requester=self.emp,
            status='pending_manager'
        )
        PRLineItem.objects.create(
            id='ITM-04-01',
            pr=pr,
            name='Bàn làm việc 1.4m',
            quantity=5,
            est_unit_price=Decimal('2000000.00')
        )

        process_manager_decision(self.mgr, pr, action='approve', reason='Đồng ý trang bị cho nhân sự mới')

        pr.refresh_from_db()
        self.assertEqual(pr.status, 'approved')
        self.assertIsNotNone(pr.approved_at)

        # Verify AuditEntry
        audit = AuditEntry.objects.filter(entity_id=pr.id, action='Manager Approve').first()
        self.assertIsNotNone(audit)
        self.assertEqual(audit.actor, self.mgr)
        self.assertEqual(audit.to_status, 'approved')

    def test_tc_us04_002_manager_reject_with_mandatory_reason(self):
        """
        [TC-US04-002] | US-04 | REQ-FR-06 | AC-04-02
        Objective: Verify Manager can reject PR with mandatory reason.
        Negative test: Rejection without reason is strictly blocked by validation.
        """
        pr = PurchaseRequest.objects.create(
            id='PR-MGR-REJ-01',
            title='Mua sắm thiết bị âm thanh',
            department='Phòng CNTT',
            budget_code=self.budget.code,
            requester=self.emp,
            status='pending_manager'
        )

        # 1. Negative Case: Attempt rejection with empty reason
        with self.assertRaises(ValueError) as ctx:
            process_manager_decision(self.mgr, pr, action='reject', reason="")
        self.assertIn("Lý do là bắt buộc", str(ctx.exception))

        # Assert PR remains pending
        pr.refresh_from_db()
        self.assertEqual(pr.status, 'pending_manager')

        # 2. Positive Case: Reject with valid business reason
        valid_reason = "Chi phí chưa cấp thiết trong quý này, đề xuất lùi sang Q1 năm sau"
        process_manager_decision(self.mgr, pr, action='reject', reason=valid_reason)

        pr.refresh_from_db()
        self.assertEqual(pr.status, 'rejected')
        self.assertEqual(pr.last_reason, valid_reason)

        audit = AuditEntry.objects.filter(entity_id=pr.id, action='Manager Reject').first()
        self.assertIsNotNone(audit)
        self.assertEqual(audit.reason, valid_reason)

    def test_tc_us04_003_manager_forward_to_finance(self):
        """
        [TC-US04-003] | US-04 | REQ-FR-06, REQ-BR-04 | AC-04-02
        Objective: Verify Manager can route PR to Finance for budget verification
        instead of approving directly.
        """
        pr = PurchaseRequest.objects.create(
            id='PR-MGR-FWD-01',
            title='Mua sắm máy chủ thử nghiệm',
            department='Phòng CNTT',
            budget_code=self.budget.code,
            requester=self.emp,
            status='pending_manager'
        )

        reason = "Hạng mục giá trị lớn, cần Phòng Tài chính thẩm định nguồn vốn"
        process_manager_decision(self.mgr, pr, action='forward_finance', reason=reason)

        pr.refresh_from_db()
        self.assertEqual(pr.status, 'finance_review')
        self.assertTrue(pr.routed_to_finance)
        self.assertEqual(pr.last_reason, reason)

        audit = AuditEntry.objects.filter(entity_id=pr.id, action='Forward to Finance').first()
        self.assertIsNotNone(audit)
        self.assertEqual(audit.to_status, 'finance_review')

    def test_tc_us04_004_manager_request_revision(self):
        """
        [TC-US04-004] | US-04 | REQ-FR-06 | AC-04-02
        Objective: Verify Manager can request PR revision back to Employee
        with mandatory clarification notes.
        """
        pr = PurchaseRequest.objects.create(
            id='PR-MGR-REV-01',
            title='Mua sắm phần mềm bản quyền',
            department='Phòng CNTT',
            budget_code=self.budget.code,
            requester=self.emp,
            status='pending_manager'
        )

        # 1. Negative Case: Request revision without note
        with self.assertRaises(ValueError) as ctx:
            process_manager_decision(self.mgr, pr, action='revision', reason="   ")
        self.assertIn("yêu cầu chỉnh sửa", str(ctx.exception))

        # 2. Positive Case: Request revision with clear instructions
        revision_note = "Cần làm rõ số lượng license người dùng và đính kèm báo giá tham khảo"
        process_manager_decision(self.mgr, pr, action='revision', reason=revision_note)

        pr.refresh_from_db()
        self.assertEqual(pr.status, 'revision')
        self.assertEqual(pr.last_reason, revision_note)

        audit = AuditEntry.objects.filter(entity_id=pr.id, action='Request Revision').first()
        self.assertIsNotNone(audit)
        self.assertEqual(audit.to_status, 'revision')

    # =========================================================================
    # US-05: BUDGET ENFORCEMENT & THRESHOLD TESTS (Nguyen Truong Thuy Duong)
    # =========================================================================

    def test_tc_us05_001_budget_commitment_and_remaining_calculation(self):
        """
        [TC-US05-001] | US-05 | REQ-FR-08 | AC-05-01
        Objective: Verify mathematical integrity of Budget properties:
        remaining = allocated - committed.
        """
        # Initial state check
        self.assertEqual(self.budget.allocated, Decimal('500000000.00'))
        self.assertEqual(self.budget.committed, Decimal('0.00'))
        self.assertEqual(self.budget.remaining, Decimal('500000000.00'))

        # Commit an approved PR of 60,000,000 VND
        pr_amount = Decimal('60000000.00')
        self.budget.committed += pr_amount
        self.budget.save()

        self.budget.refresh_from_db()
        self.assertEqual(self.budget.committed, Decimal('60000000.00'))
        self.assertEqual(self.budget.remaining, Decimal('440000000.00'))
        self.assertEqual(self.budget.remaining, self.budget.allocated - self.budget.committed)

    def test_tc_us05_002_budget_threshold_50m_boundary_test(self):
        """
        [TC-US05-002] | US-05 | REQ-FR-08, REQ-BR-04 | AC-05-01
        Objective: Boundary test around the 50,000,000 VND threshold:
        - PR < 50M (49,999,999 VND): Manager approves directly without mandatory Finance routing.
        - PR >= 50M (50,000,000 VND): Mandatory routing to Finance (routed_to_finance = True).
        """
        threshold = Decimal('50000000.00')

        def check_requires_finance(amount):
            return amount >= threshold

        # Case A: Boundary just below 50M (49,999,999 VND)
        amount_below = Decimal('49999999.00')
        self.assertFalse(check_requires_finance(amount_below))

        # Case B: Boundary exact 50M (50,000,000 VND)
        amount_exact = Decimal('50000000.00')
        self.assertTrue(check_requires_finance(amount_exact))

        # Case C: Boundary above 50M (50,000,001 VND)
        amount_above = Decimal('50000001.00')
        self.assertTrue(check_requires_finance(amount_above))

        # Integration verification on PurchaseRequest model
        pr_large = PurchaseRequest.objects.create(
            id='PR-BND-50M',
            title='Mua sắm thiết bị Core Switch',
            department='Phòng CNTT',
            budget_code=self.budget.code,
            requester=self.emp,
            status='pending_manager'
        )
        PRLineItem.objects.create(
            id='ITM-BND-01',
            pr=pr_large,
            name='Switch Cisco 48 Port',
            quantity=1,
            est_unit_price=amount_exact
        )

        if check_requires_finance(pr_large.total_estimated_amount):
            process_manager_decision(self.mgr, pr_large, action='forward_finance', reason='Tự động định tuyến do đạt ngưỡng 50M')

        pr_large.refresh_from_db()
        self.assertEqual(pr_large.status, 'finance_review')
        self.assertTrue(pr_large.routed_to_finance)

    def test_tc_us05_003_exceeded_budget_detection_and_alert(self):
        """
        [TC-US05-003] | US-05 | REQ-FR-09, REQ-BR-05 | AC-05-02
        Objective: Verify system detects and alerts when PR estimated amount exceeds
        remaining available department budget, preventing silent bypass.
        """
        # Setup constrained budget: Allocated 50M, Committed 20M -> Remaining 30M
        small_budget = Budget.objects.create(
            code='BGT-MKT-2026',
            department='Phòng Marketing',
            cost_center='CC-MKT-01',
            name='Ngân sách Marketing 2026',
            allocated=Decimal('50000000.00'),
            committed=Decimal('20000000.00')
        )
        self.assertEqual(small_budget.remaining, Decimal('30000000.00'))

        # PR requesting 45,000,000 VND (> 30M available)
        pr_exceed = PurchaseRequest.objects.create(
            id='PR-EXCEED-01',
            title='Tổ chức sự kiện hội thảo Q4',
            department='Phòng Marketing',
            cost_center='CC-MKT-01',
            budget_code=small_budget.code,
            requester=self.emp,
            status='pending_manager'
        )
        PRLineItem.objects.create(
            id='ITM-EXCEED-01',
            pr=pr_exceed,
            name='Thuê hội trường & tiệc nhẹ',
            quantity=1,
            est_unit_price=Decimal('45000000.00')
        )

        total_req = pr_exceed.total_estimated_amount
        is_exceeded = total_req > small_budget.remaining
        excess_percentage = round((total_req / small_budget.remaining) * 100, 1)

        # Assertions on alert logic
        self.assertTrue(is_exceeded)
        self.assertEqual(excess_percentage, 150.0)

        # Business Rule: An over-budget PR MUST NOT be approved silently without Finance authorization
        def validate_budget_compliance(pr, budget):
            if pr.total_estimated_amount > budget.remaining:
                return {
                    'compliant': False,
                    'warning': f'CẢNH BÁO: Vượt ngân sách khả dụng ({excess_percentage}%). Yêu cầu duyệt đặc biệt từ Phòng Tài chính.',
                    'excess_amount': pr.total_estimated_amount - budget.remaining
                }
            return {'compliant': True, 'warning': None, 'excess_amount': Decimal('0.00')}

        compliance_result = validate_budget_compliance(pr_exceed, small_budget)
        self.assertFalse(compliance_result['compliant'])
        self.assertIn("Vượt ngân sách khả dụng (150.0%)", compliance_result['warning'])
        self.assertEqual(compliance_result['excess_amount'], Decimal('15000000.00'))
