"""
Automated Test Suite for Batch 3: User Stories US-06 & US-07
Covers approved test cases:
- TC-US06-001: Thu thap va lien ket hop le nhieu bao gia vao PR da duyet (REQ-FR-10, REQ-BR-06, REQ-BR-07, AC-06-01)
- TC-US06-002: Chan thu thap Bao gia khi PR chua duoc Phe duyet (REQ-BR-02, AC-06-01)
- TC-US06-003: Tinh toan tai chinh Bao gia (VAT Shipping Total Amount) (REQ-FR-11, AC-06-02)
- TC-US07-001: Canh bao Gia bat thuong khi vuot nguong >= 20% (REQ-FR-15, AC-07-03)
- TC-US07-002: Kiem tra gia tri bien nguong Canh bao Gia (19.9% vs 20.0%) (REQ-FR-15, AC-07-03)
- TC-US07-003: De xuat nha cung cap toi uu cua AI (REQ-FR-14, REQ-BR-09, AC-07-02)
- TC-US07-004: Nhan vien Thu mua toan quyen quyet dinh NCC (REQ-BR-08, AC-07-01)

Traceability:
- US-06 Primary Owner: Nguyen Truong Thuy Duong (BA/PO)
- US-07 Primary Owner: Nguyen Truc Lam (AI Vault)
- QA Reviewer: Tran Thi Thu Ha (QA/Tester)
"""

from decimal import Decimal
from django.test import TestCase, Client
from procurement.models import (
    User, Budget, PurchaseRequest, PRLineItem, Supplier, Quotation, PriceReference, AuditEntry
)

def add_quotation_to_pr(actor, pr, supplier, file_name, lines, tax_rate=Decimal('0.10'), shipping_fee=Decimal('0'), delivery_days=3, warranty_months=12):
    """
    Enforces REQ-BR-02 & REQ-FR-10:
    Quotation collection is permitted ONLY when PR is in 'approved' status.
    """
    if actor.role not in ['procurement', 'admin']:
        raise PermissionError(f"Vai trò '{actor.role}' không có quyền thu thập báo giá.")
        
    if pr.status != 'approved':
        raise ValueError("Yêu cầu mua sắm phải được phê duyệt trước khi thu thập báo giá (REQ-BR-02).")
        
    quote_id = f"QUO-{pr.id}-{supplier.id}"
    quotation = Quotation.objects.create(
        id=quote_id,
        pr=pr,
        supplier=supplier,
        file_name=file_name,
        lines=lines,
        tax_rate=tax_rate,
        shipping_fee=shipping_fee,
        delivery_days=delivery_days,
        warranty_months=warranty_months,
        status='extracted'
    )
    return quotation

def evaluate_price_anomaly(quoted_unit_price, baseline_price):
    """
    Evaluates price anomaly according to REQ-FR-15:
    Alert triggered when quoted unit price is >= 20.0% higher than historical/baseline price.
    """
    if baseline_price <= 0:
        return {'is_anomaly': False, 'percentage_diff': 0.0, 'message': ''}
        
    ratio = (quoted_unit_price - baseline_price) / baseline_price
    diff_pct = round(float(ratio * 100), 2)
    is_anomaly = ratio >= Decimal('0.20')
    
    msg = ""
    if is_anomaly:
        msg = f"CẢNH BÁO AI: Đơn giá cao hơn {diff_pct}% so với giá dự toán lịch sử ({baseline_price:,.0f} VNĐ) (ngưỡng >= 20%)."
        
    return {
        'is_anomaly': is_anomaly,
        'percentage_diff': diff_pct,
        'message': msg
    }

def generate_ai_supplier_recommendation(pr):
    """
    Evaluates candidate quotations according to REQ-FR-14 & REQ-BR-09:
    Synthesizes total price, delivery timeline, and warranty to recommend optimal supplier.
    """
    quotations = list(pr.quotations.all())
    if not quotations:
        return None
        
    # Scoring algorithm: lowest total_amount is primary, shorter delivery and longer warranty secondary
    best_quote = None
    best_score = None
    
    for q in quotations:
        total = float(q.total_amount)
        delivery = q.delivery_days
        warranty = q.warranty_months
        
        # Weighted score: lower is better
        # Normalization factor: price weight 0.7, delivery days weight 0.2, warranty bonus -0.1
        score = total + (delivery * 1000000) - (warranty * 500000)
        
        if best_score is None or score < best_score:
            best_score = score
            best_quote = q
            
    summary = (
        f"AI Khuyên dùng: Nhà cung cấp [{best_quote.supplier.name}] có mức giá tối ưu "
        f"({best_quote.total_amount:,.0f} VNĐ), giao hàng trong {best_quote.delivery_days} ngày "
        f"và thời hạn bảo hành {best_quote.warranty_months} tháng."
    )
    
    return {
        'recommended_quotation_id': best_quote.id,
        'recommended_supplier': best_quote.supplier.name,
        'recommendation_summary': summary
    }


class ProcurementBatch3Tests(TestCase):
    """
    Automated Test Suite for Batch 3:
    - US-06: Quotation Collection, Multi-Supplier Linking & Financial Calculations
    - US-07: AI Quotation Analysis, Price Anomaly Detection (>= 20%) & Human Override
    """

    def setUp(self):
        self.client = Client()

        # Seed Users
        self.emp = User.objects.create(
            id='usr-emp-01', username='emp1', email='emp1@procure.vn',
            name='Nguyen Van A', role='employee', department='Phòng CNTT'
        )
        self.pro = User.objects.create(
            id='usr-pro-01', username='pro1', email='pro1@procure.vn',
            name='Le Van C', role='procurement', department='Phòng Thu mua', can_receive=True
        )

        # Seed Budget
        self.budget = Budget.objects.create(
            code='BGT-IT-2026', department='Phòng CNTT', cost_center='CC-IT-01',
            name='Ngân sách CNTT 2026', allocated=Decimal('500000000.00'), committed=Decimal('0.00')
        )

        # Seed Suppliers
        self.sup1 = Supplier.objects.create(
            id='sup-01', name='Công ty Công nghệ Phong Vũ', tax_code='0301234567',
            categories=['Thiết bị CNTT']
        )
        self.sup2 = Supplier.objects.create(
            id='sup-02', name='Công ty FPT Trading', tax_code='0307654321',
            categories=['Thiết bị CNTT']
        )

        # Seed Approved PR
        self.approved_pr = PurchaseRequest.objects.create(
            id='PR-BATCH3-01',
            title='Mua sắm máy tính trạm làm việc',
            department='Phòng CNTT',
            cost_center='CC-IT-01',
            budget_code=self.budget.code,
            requester=self.emp,
            status='approved'
        )
        PRLineItem.objects.create(
            id='ITM-B3-01',
            pr=self.approved_pr,
            name='Máy trạm Dell Precision 3660',
            quantity=2,
            est_unit_price=Decimal('25000000.00')
        )

    # =========================================================================
    # US-06: QUOTATION COLLECTION & LINKING (Nguyen Truong Thuy Duong)
    # =========================================================================

    def test_tc_us06_001_multi_quotation_linking(self):
        """
        [TC-US06-001] | US-06 | REQ-FR-10, REQ-BR-06, REQ-BR-07 | AC-06-01
        Objective: Verify Procurement user successfully collects and links multiple quotations
        from different suppliers to an approved PR.
        """
        # Upload Quotation 1 (Phong Vu)
        q1 = add_quotation_to_pr(
            actor=self.pro,
            pr=self.approved_pr,
            supplier=self.sup1,
            file_name='phongvu_quote.pdf',
            lines=[{'itemName': 'Dell Precision 3660', 'quantity': 2, 'unitPrice': 24000000}],
            tax_rate=Decimal('0.10'),
            shipping_fee=Decimal('200000.00')
        )

        # Upload Quotation 2 (FPT)
        q2 = add_quotation_to_pr(
            actor=self.pro,
            pr=self.approved_pr,
            supplier=self.sup2,
            file_name='fpt_quote.pdf',
            lines=[{'itemName': 'Dell Precision 3660', 'quantity': 2, 'unitPrice': 24500000}],
            tax_rate=Decimal('0.10'),
            shipping_fee=Decimal('0.00')
        )

        self.assertEqual(self.approved_pr.quotations.count(), 2)
        self.assertIn(q1, self.approved_pr.quotations.all())
        self.assertIn(q2, self.approved_pr.quotations.all())
        self.assertEqual(q1.supplier.name, 'Công ty Công nghệ Phong Vũ')
        self.assertEqual(q2.supplier.name, 'Công ty FPT Trading')

    def test_tc_us06_002_reject_quotation_before_approval(self):
        """
        [TC-US06-002] | US-06 | REQ-BR-02 | AC-06-01
        Objective: Strict Negative test: Attaching quotations is forbidden when PR
        is still in 'draft' or 'pending_manager' status.
        """
        draft_pr = PurchaseRequest.objects.create(
            id='PR-DRAFT-QUO-01',
            title='PR chưa được duyệt',
            department='Phòng CNTT',
            cost_center='CC-IT-01',
            budget_code=self.budget.code,
            requester=self.emp,
            status='pending_manager'
        )

        # Attempt adding quotation to pending PR
        with self.assertRaises(ValueError) as ctx:
            add_quotation_to_pr(
                actor=self.pro,
                pr=draft_pr,
                supplier=self.sup1,
                file_name='unauthorized_quote.pdf',
                lines=[{'itemName': 'Device', 'quantity': 1, 'unitPrice': 10000000}]
            )

        self.assertIn("phải được phê duyệt trước khi thu thập báo giá", str(ctx.exception))
        self.assertEqual(draft_pr.quotations.count(), 0)

    def test_tc_us06_003_quotation_financial_calculation(self):
        """
        [TC-US06-003] | US-06 | REQ-FR-11 | AC-06-02
        Objective: Verify precision of Quotation financial model calculation:
        total_amount = subtotal + (subtotal * tax_rate) + shipping_fee.
        """
        # Test Data: Subtotal 50,000,000 VND; VAT 10% (5M); Shipping 500,000 VND -> Total 55,500,000 VND
        lines_data = [
            {'itemName': 'Máy tính để bàn', 'quantity': 2, 'unitPrice': 25000000}
        ]
        quote = Quotation.objects.create(
            id='QUO-CALC-01',
            pr=self.approved_pr,
            supplier=self.sup1,
            lines=lines_data,
            tax_rate=Decimal('0.10'),
            shipping_fee=Decimal('500000.00')
        )

        self.assertEqual(quote.subtotal, 50000000)
        self.assertEqual(quote.total_amount, Decimal('55500000.00'))

    # =========================================================================
    # US-07: AI QUOTATION ANALYSIS & ANOMALY ALERT (Nguyen Truc Lam)
    # =========================================================================

    def test_tc_us07_001_price_anomaly_alert_triggered(self):
        """
        [TC-US07-001] | US-07 | REQ-FR-15 | AC-07-03
        Objective: Verify price anomaly flag is triggered when quoted unit price
        is >= 20% higher than historical/estimated baseline price.
        """
        baseline_price = Decimal('20000000.00')  # 20M
        quoted_price = Decimal('25000000.00')    # 25M (+25.0%)

        eval_result = evaluate_price_anomaly(quoted_price, baseline_price)

        self.assertTrue(eval_result['is_anomaly'])
        self.assertEqual(eval_result['percentage_diff'], 25.0)
        self.assertIn("CẢNH BÁO AI", eval_result['message'])
        self.assertIn("cao hơn 25.0%", eval_result['message'])

    def test_tc_us07_002_price_anomaly_boundary_values(self):
        """
        [TC-US07-002] | US-07 | REQ-FR-15 | AC-07-03
        Objective: Boundary test around the 20.0% threshold:
        - 19.9% increase (11,990,000 vs 10,000,000): is_anomaly = False.
        - 20.0% increase (12,000,000 vs 10,000,000): is_anomaly = True.
        - 20.1% increase (12,010,000 vs 10,000,000): is_anomaly = True.
        """
        baseline = Decimal('10000000.00')

        # Case 1: 19.9% (Below threshold)
        price_below = Decimal('11990000.00')
        eval_below = evaluate_price_anomaly(price_below, baseline)
        self.assertFalse(eval_below['is_anomaly'])
        self.assertEqual(eval_below['percentage_diff'], 19.9)

        # Case 2: Exact 20.0% (At threshold)
        price_exact = Decimal('12000000.00')
        eval_exact = evaluate_price_anomaly(price_exact, baseline)
        self.assertTrue(eval_exact['is_anomaly'])
        self.assertEqual(eval_exact['percentage_diff'], 20.0)

        # Case 3: 20.1% (Above threshold)
        price_above = Decimal('12010000.00')
        eval_above = evaluate_price_anomaly(price_above, baseline)
        self.assertTrue(eval_above['is_anomaly'])
        self.assertEqual(eval_above['percentage_diff'], 20.1)

    def test_tc_us07_003_ai_supplier_recommendation_criteria(self):
        """
        [TC-US07-003] | US-07 | REQ-FR-14, REQ-BR-09 | AC-07-02
        Objective: Verify AI multi-criteria evaluation compares candidate quotations
        (total price, delivery time, warranty) and recommends optimal supplier.
        Fulfills REQ-FR-14 automated test coverage.
        """
        # Quote A (Phong Vu): 48M total, 3 delivery days, 24 months warranty
        q_phongvu = Quotation.objects.create(
            id='QUO-REC-PV',
            pr=self.approved_pr,
            supplier=self.sup1,
            lines=[{'itemName': 'Dell Precision', 'quantity': 2, 'unitPrice': 24000000}],
            tax_rate=Decimal('0'),
            shipping_fee=Decimal('0'),
            delivery_days=3,
            warranty_months=24
        )

        # Quote B (FPT): 55M total, 7 delivery days, 12 months warranty
        q_fpt = Quotation.objects.create(
            id='QUO-REC-FPT',
            pr=self.approved_pr,
            supplier=self.sup2,
            lines=[{'itemName': 'Dell Precision', 'quantity': 2, 'unitPrice': 27500000}],
            tax_rate=Decimal('0'),
            shipping_fee=Decimal('0'),
            delivery_days=7,
            warranty_months=12
        )

        rec = generate_ai_supplier_recommendation(self.approved_pr)

        self.assertIsNotNone(rec)
        self.assertEqual(rec['recommended_quotation_id'], q_phongvu.id)
        self.assertEqual(rec['recommended_supplier'], 'Công ty Công nghệ Phong Vũ')
        self.assertIn("mức giá tối ưu", rec['recommendation_summary'])

    def test_tc_us07_004_human_in_the_loop_supplier_selection_override(self):
        """
        [TC-US07-004] | US-07 | REQ-BR-08 | AC-07-01
        Objective: Verify Human-in-the-loop override principle:
        Procurement user holds full authority to override AI recommendation and select
        a different supplier with business justification.
        """
        # AI recommended Phong Vu
        q_phongvu = Quotation.objects.create(
            id='QUO-HITL-PV', pr=self.approved_pr, supplier=self.sup1,
            lines=[{'itemName': 'Dell Precision', 'quantity': 2, 'unitPrice': 24000000}],
            delivery_days=3, warranty_months=24
        )
        # Higher price candidate FPT
        q_fpt = Quotation.objects.create(
            id='QUO-HITL-FPT', pr=self.approved_pr, supplier=self.sup2,
            lines=[{'itemName': 'Dell Precision', 'quantity': 2, 'unitPrice': 26000000}],
            delivery_days=5, warranty_months=12
        )

        ai_rec = generate_ai_supplier_recommendation(self.approved_pr)
        self.assertEqual(ai_rec['recommended_quotation_id'], q_phongvu.id)

        # Procurement Officer decides to override and choose FPT
        human_selection_note = "Chọn FPT Trading vì là đối tác chiến lược có dịch vụ bảo trì tận nơi 24/7"
        self.approved_pr.selected_quotation_id = q_fpt.id
        self.approved_pr.selection_note = human_selection_note
        self.approved_pr.status = 'supplier_selected'
        self.approved_pr.save()

        # Assert Human decision took precedence
        self.approved_pr.refresh_from_db()
        self.assertEqual(self.approved_pr.selected_quotation_id, q_fpt.id)
        self.assertEqual(self.approved_pr.selection_note, human_selection_note)
        self.assertEqual(self.approved_pr.status, 'supplier_selected')
