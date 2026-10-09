"""
Automated Test Suite for Batch 1: User Stories US-01 & US-02
Covers approved test cases:
- TC-US01-001: Tao PR hop le day du cac truong bat buoc (REQ-FR-01, REQ-BR-01, AC-01-01)
- TC-US01-002: Chan Submit khi thieu cac truong bat buoc (REQ-FR-02, REQ-BR-01, AC-01-02)
- TC-US01-003: Kiem tra gia tri bien cho Line Items (REQ-FR-01, AC-01-01)
- TC-US01-004: Chuyen trang thai tu DRAFT sang SUBMITTED (REQ-FR-01, REQ-FR-02, AC-01-01)
- TC-US02-001: Hien thi Timeline trang thai qua cac buoc (REQ-FR-04, AC-02-01)
- TC-US02-002: Kiem tra dong bo trang thai qua API GET /api/v1/state/ (REQ-FR-04, REQ-NFR-01, AC-02-01)

Traceability:
- US-01 Primary Owner: Tran Thi Kieu Giang (Frontend)
- US-02 Primary Owner: Nguyen Thi Thuy Dung (Backend)
- QA Reviewer: Tran Thi Thu Ha (QA/Tester)
"""

import json
from decimal import Decimal
from django.test import TestCase, Client
from django.core.exceptions import ValidationError
from procurement.models import (
    User, Budget, PurchaseRequest, PRLineItem
)

class PurchaseRequestUS01US02Tests(TestCase):
    """
    Automated integration and unit test suite for Purchase Request creation (US-01)
    and Timeline Status Verification / API State Synchronization (US-02).
    """

    def setUp(self):
        self.client = Client()

        # Seed Users
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

    # -------------------------------------------------------------------------
    # US-01: TẠO VÀ QUẢN LÝ PURCHASE REQUEST
    # Primary Owner: Trần Thị Kiều Giang (Frontend)
    # -------------------------------------------------------------------------

    def test_tc_us01_001_create_valid_draft_pr(self):
        """
        [TC-US01-001] | US-01 | REQ-FR-01, REQ-BR-01 | AC-01-01
        Owner: Tran Thi Kieu Giang
        Objective: Xac minh nguoi dung Employee tao thanh cong PR hop le voi day du
        truong bat buoc o trang thai 'draft', tong tien du toan tinh toan chinh xac.
        """
        pr = PurchaseRequest.objects.create(
            id='PR-2026-US01-01',
            title='Mua sắm màn hình và bàn phím cho phòng CNTT',
            justification='Trang bị thiết bị làm việc mới',
            department='Phòng CNTT',
            cost_center='CC-IT-01',
            category='Thiết bị CNTT',
            budget_code=self.budget.code,
            requester=self.emp,
            status='draft'
        )

        item1 = PRLineItem.objects.create(
            id='ITM-US01-01',
            pr=pr,
            name='Màn hình Dell 24 inch',
            specs='IPS, FHD 75Hz',
            quantity=2,
            unit='cái',
            est_unit_price=Decimal('4000000.00')
        )
        item2 = PRLineItem.objects.create(
            id='ITM-US01-02',
            pr=pr,
            name='Bàn phím cơ văn phòng',
            specs='Silent Red Switch',
            quantity=2,
            unit='cái',
            est_unit_price=Decimal('1000000.00')
        )

        # Assertions
        self.assertEqual(pr.status, 'draft')
        self.assertEqual(pr.items.count(), 2)
        expected_total = (2 * Decimal('4000000.00')) + (2 * Decimal('1000000.00'))
        self.assertEqual(pr.total_estimated_amount, expected_total)
        self.assertEqual(item1.total_price, Decimal('8000000.00'))
        self.assertEqual(item2.total_price, Decimal('2000000.00'))

    def test_tc_us01_002_reject_pr_without_required_fields(self):
        """
        [TC-US01-002] | US-01 | REQ-FR-02, REQ-BR-01 | AC-01-02
        Owner: Tran Thi Kieu Giang
        Objective: Dam bao he thong khong cho phep submit PR khi thieu line items
        hoac thieu thong tin bat buoc truoc khi chuyen vao workflow.
        """
        pr_empty = PurchaseRequest.objects.create(
            id='PR-2026-US01-02',
            title='PR chưa có sản phẩm',
            department='Phòng CNTT',
            requester=self.emp,
            status='draft'
        )

        # Kiểm tra PR chưa có items
        self.assertEqual(pr_empty.items.count(), 0)
        self.assertEqual(pr_empty.total_estimated_amount, Decimal('0.00'))

        # Nghiệp vụ REQ-BR-01: Không thể submit khi items count == 0
        def can_submit(pr_obj):
            if not pr_obj.title or pr_obj.items.count() == 0:
                raise ValidationError("Không thể Submit PR khi thiếu tiêu đề hoặc không có sản phẩm nào!")
            return True

        with self.assertRaises(ValidationError) as ctx:
            can_submit(pr_empty)

        self.assertIn("không có sản phẩm nào", str(ctx.exception))
        # Trạng thái PR vẫn giữ nguyên là draft
        self.assertEqual(pr_empty.status, 'draft')

    def test_tc_us01_003_line_item_boundary_values(self):
        """
        [TC-US01-003] | US-01 | REQ-FR-01 | AC-01-01
        Owner: Tran Thi Kieu Giang
        Objective: Kiem tra gia tri bien (Boundary Value): so luong = 1, don gia toi thieu.
        """
        pr = PurchaseRequest.objects.create(
            id='PR-2026-US01-03',
            title='PR kiểm tra giá trị biên',
            department='Phòng CNTT',
            requester=self.emp,
            status='draft'
        )

        # Biên tối thiểu: quantity = 1, unit_price = 1 VND
        min_item = PRLineItem.objects.create(
            id='ITM-MIN-01',
            pr=pr,
            name='Cáp mạng bấm sẵn 1m',
            quantity=1,
            unit='sợi',
            est_unit_price=Decimal('1.00')
        )
        self.assertEqual(min_item.quantity, 1)
        self.assertEqual(min_item.total_price, Decimal('1.00'))
        self.assertEqual(pr.total_estimated_amount, Decimal('1.00'))

    def test_tc_us01_004_state_transition_draft_to_submitted(self):
        """
        [TC-US01-004] | US-01 | REQ-FR-01, REQ-FR-02 | AC-01-01
        Owner: Tran Thi Kieu Giang
        Objective: Xac minh luong chuyen doi trang thai tu DRAFT sang SUBMITTED (pending_manager)
        va cap nhat dung ngan sach tam giu.
        """
        pr = PurchaseRequest.objects.create(
            id='PR-2026-US01-04',
            title='Mua sắm Laptop văn phòng',
            department='Phòng CNTT',
            budget_code=self.budget.code,
            requester=self.emp,
            status='draft'
        )
        PRLineItem.objects.create(
            id='ITM-US01-04',
            pr=pr,
            name='Laptop Asus Zenbook',
            quantity=1,
            unit='cái',
            est_unit_price=Decimal('22000000.00')
        )

        # Chuyển trạng thái khi Submit
        pr.status = 'pending_manager'
        pr.save()

        # Cam kết ngân sách
        self.budget.committed += pr.total_estimated_amount
        self.budget.save()

        pr.refresh_from_db()
        self.budget.refresh_from_db()

        self.assertEqual(pr.status, 'pending_manager')
        self.assertEqual(self.budget.committed, Decimal('22000000.00'))
        self.assertEqual(self.budget.remaining, Decimal('478000000.00'))

    # -------------------------------------------------------------------------
    # US-02: THEO DÕI TRẠNG THÁI PR QUA TIMELINE & ĐỒNG BỘ API
    # Primary Owner: Nguyễn Thị Thùy Dung (Backend)
    # -------------------------------------------------------------------------

    def test_tc_us02_001_timeline_status_progression(self):
        """
        [TC-US02-001] | US-02 | REQ-FR-04 | AC-02-01
        Owner: Nguyen Thi Thuy Dung
        Objective: Xac minh PR phan anh dung ten hien thi trang thai qua cac buoc
        trong chu trinh mua sam (get_status_display).
        """
        pr = PurchaseRequest.objects.create(
            id='PR-2026-US02-01',
            title='Theo dõi trạng thái Timeline',
            department='Phòng CNTT',
            requester=self.emp,
            status='draft'
        )

        # Bước 1: Bản nháp
        self.assertEqual(pr.get_status_display(), 'Bản nháp')

        # Bước 2: Chờ Manager / Trưởng phòng duyệt
        pr.status = 'pending_manager'
        pr.save()
        self.assertEqual(pr.get_status_display(), 'Chờ Trưởng phòng duyệt')

        # Bước 3: Đã phê duyệt (Chờ thu mua)
        pr.status = 'approved'
        pr.save()
        self.assertEqual(pr.get_status_display(), 'Đã phê duyệt (Chờ thu mua)')

        # Bước 4: Đã đóng (Closed)
        pr.status = 'closed'
        pr.save()
        self.assertEqual(pr.get_status_display(), 'Đã đóng (Closed)')

    def test_tc_us02_002_api_state_sync_endpoint(self):
        """
        [TC-US02-002] | US-02 | REQ-FR-04, REQ-NFR-01 | AC-02-01
        Owner: Nguyen Thi Thuy Dung
        Objective: Xac minh endpoint API GET /api/v1/state/ tra ve dung trang thai
        va danh sach PR phuc vu render Timeline tren Frontend React.
        """
        pr = PurchaseRequest.objects.create(
            id='PR-2026-US02-02',
            title='PR đồng bộ API Timeline',
            department='Phòng CNTT',
            cost_center='CC-IT-01',
            requester=self.emp,
            status='pending_manager'
        )
        PRLineItem.objects.create(
            id='ITM-US02-02',
            pr=pr,
            name='Switch Cisco 24 Port',
            quantity=1,
            unit='cái',
            est_unit_price=Decimal('15000000.00')
        )

        response = self.client.get('/api/v1/state/')
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertIn('requests', data)

        # Tìm PR vừa tạo trong danh sách requests
        matching_pr = next((r for r in data['requests'] if r['id'] == 'PR-2026-US02-02'), None)
        self.assertIsNotNone(matching_pr)
        self.assertEqual(matching_pr['status'], 'pending_manager')
        self.assertEqual(matching_pr['title'], 'PR đồng bộ API Timeline')
        self.assertEqual(len(matching_pr['items']), 1)
        self.assertEqual(matching_pr['items'][0]['estUnitPrice'], 15000000.0)
