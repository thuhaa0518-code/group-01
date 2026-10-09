from decimal import Decimal
from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    ROLE_CHOICES = (
        ('employee', 'Employee (Nhân viên)'),
        ('manager', 'Manager (Quản lý)'),
        ('procurement', 'Procurement (Thu mua)'),
        ('finance', 'Finance (Tài chính)'),
        ('admin', 'Admin (Quản trị)'),
    )
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=150, verbose_name="Họ và tên")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee', verbose_name="Vai trò")
    department = models.CharField(max_length=100, verbose_name="Phòng ban")
    title = models.CharField(max_length=150, blank=True, verbose_name="Chức danh")
    locked = models.BooleanField(default=False, verbose_name="Bị khóa")
    can_receive = models.BooleanField(default=True, verbose_name="Có quyền nhận hàng")
    language = models.CharField(max_length=10, default='vi', verbose_name="Ngôn ngữ")

    @property
    def full_name(self):
        return self.name

    def __str__(self):
        return f"{self.name} [{self.role}] ({self.department})"

class Budget(models.Model):
    code = models.CharField(max_length=50, primary_key=True, verbose_name="Mã ngân sách")
    department = models.CharField(max_length=100, verbose_name="Phòng ban")
    cost_center = models.CharField(max_length=50, verbose_name="Trung tâm chi phí")
    name = models.CharField(max_length=255, verbose_name="Tên ngân sách")
    fiscal_year = models.IntegerField(default=2026, verbose_name="Năm tài chính")
    allocated = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Ngân sách cấp")
    committed = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Đã cam kết/chi")

    @property
    def remaining(self):
        return self.allocated - self.committed

    def __str__(self):
        return f"{self.code} - {self.name}: {self.remaining:,.0f} VNĐ còn lại"

class PurchaseRequest(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Bản nháp'),
        ('pending_manager', 'Chờ Trưởng phòng duyệt'),
        ('revision', 'Yêu cầu điều chỉnh'),
        ('finance_review', 'Chờ Finance duyệt'),
        ('rejected', 'Bị từ chối'),
        ('approved', 'Đã phê duyệt (Chờ thu mua)'),
        ('supplier_selected', 'Đã chọn Nhà cung cấp'),
        ('po_created', 'Đã tạo Đơn mua hàng (PO)'),
        ('partially_received', 'Nhận hàng một phần'),
        ('received', 'Đã nhận đủ hàng'),
        ('closed', 'Đã đóng (Closed)'),
    )
    AI_REVIEW_CHOICES = (
        ('none', 'Chưa dùng AI'),
        ('accepted', 'Đã chấp nhận gợi ý AI'),
        ('edited', 'Đã sửa lại gợi ý AI'),
        ('dismissed', 'Bỏ qua AI'),
    )
    id = models.CharField(max_length=50, primary_key=True, verbose_name="Mã PR")
    title = models.CharField(max_length=255, verbose_name="Tiêu đề yêu cầu")
    justification = models.TextField(blank=True, verbose_name="Lý do/Mục đích mua sắm")
    department = models.CharField(max_length=100, verbose_name="Phòng ban")
    cost_center = models.CharField(max_length=50, verbose_name="Trung tâm chi phí")
    category = models.CharField(max_length=100, verbose_name="Danh mục sản phẩm")
    budget_code = models.CharField(max_length=50, verbose_name="Mã ngân sách")
    required_by = models.DateField(null=True, blank=True, verbose_name="Ngày cần hàng")
    delivery_location = models.CharField(max_length=255, blank=True, verbose_name="Địa điểm giao hàng")
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requests', verbose_name="Người yêu cầu")
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft', verbose_name="Trạng thái")
    routed_to_finance = models.BooleanField(default=False, verbose_name="Chuyển Finance duyệt")
    ai_review = models.CharField(max_length=20, choices=AI_REVIEW_CHOICES, default='none', verbose_name="Trạng thái AI Review")
    last_reason = models.TextField(blank=True, null=True, verbose_name="Lý do gần nhất")
    approved_at = models.DateTimeField(null=True, blank=True, verbose_name="Thời gian duyệt")
    selected_quotation_id = models.CharField(max_length=50, blank=True, null=True, verbose_name="ID Báo giá được chọn")
    selection_note = models.TextField(blank=True, null=True, verbose_name="Ghi chú chọn Supplier")
    po_id = models.CharField(max_length=50, blank=True, null=True, verbose_name="ID PO liên kết")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Thời gian tạo")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Thời gian cập nhật")

    @property
    def total_estimated_amount(self):
        return sum(item.quantity * item.est_unit_price for item in self.items.all())

    def __str__(self):
        return f"{self.id} - {self.title} ({self.get_status_display()})"

class PRLineItem(models.Model):
    id = models.CharField(max_length=50, primary_key=True, verbose_name="ID Mặt hàng")
    pr = models.ForeignKey(PurchaseRequest, on_delete=models.CASCADE, related_name='items', verbose_name="Purchase Request")
    name = models.CharField(max_length=255, verbose_name="Tên mặt hàng/dịch vụ")
    specs = models.TextField(blank=True, verbose_name="Thông số kỹ thuật")
    quantity = models.IntegerField(default=1, verbose_name="Số lượng")
    unit = models.CharField(max_length=50, default='cái', verbose_name="Đơn tính")
    est_unit_price = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Đơn giá dự kiến")

    @property
    def total_price(self):
        return self.quantity * self.est_unit_price

    def __str__(self):
        return f"{self.name} x {self.quantity} {self.unit}"

# Alias for backwards compatibility
PRItem = PRLineItem

class Supplier(models.Model):
    id = models.CharField(max_length=50, primary_key=True, verbose_name="Mã Nhà cung cấp")
    name = models.CharField(max_length=255, verbose_name="Tên Nhà cung cấp")
    tax_code = models.CharField(max_length=50, blank=True, verbose_name="Mã số thuế")
    contact_name = models.CharField(max_length=150, blank=True, verbose_name="Người liên hệ")
    email = models.EmailField(blank=True, verbose_name="Email")
    phone = models.CharField(max_length=50, blank=True, verbose_name="Số điện thoại")
    categories = models.JSONField(default=list, verbose_name="Danh mục cung cấp")
    status = models.CharField(max_length=20, default='active', verbose_name="Trạng thái")

    def __str__(self):
        return f"{self.name} ({self.id})"

class Quotation(models.Model):
    id = models.CharField(max_length=50, primary_key=True, verbose_name="Mã Quotation")
    pr = models.ForeignKey(PurchaseRequest, on_delete=models.CASCADE, related_name='quotations', verbose_name="Purchase Request")
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='quotations', verbose_name="Nhà cung cấp")
    file_name = models.CharField(max_length=255, blank=True, verbose_name="Tên tệp báo giá")
    file_type = models.CharField(max_length=20, default='pdf', verbose_name="Loại tệp")
    status = models.CharField(max_length=20, default='extracted', verbose_name="Trạng thái") # 'extracted', 'confirmed'
    ai_confidence = models.DecimalField(max_digits=5, decimal_places=2, default=0.95, verbose_name="Độ tin cậy AI")
    low_confidence = models.JSONField(default=list, verbose_name="Trường độ tin cậy thấp")
    edited_fields = models.JSONField(default=list, verbose_name="Trường đã chỉnh sửa")
    original = models.JSONField(default=dict, verbose_name="Snapshot dữ liệu gốc")
    lines = models.JSONField(default=list, verbose_name="Chi tiết mặt hàng")
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.10, verbose_name="Thuế VAT")
    shipping_fee = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Phí vận chuyển")
    delivery_days = models.IntegerField(default=3, verbose_name="Số ngày giao hàng")
    warranty_months = models.IntegerField(default=12, verbose_name="Số tháng bảo hành")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Thời gian tạo")

    @property
    def subtotal(self):
        return sum(item.get('quantity', 1) * item.get('unitPrice', 0) for item in self.lines)

    @property
    def total_amount(self):
        sub = float(self.subtotal)
        tax = sub * float(self.tax_rate)
        shipping = float(self.shipping_fee)
        return Decimal(str(sub + tax + shipping))

    def __str__(self):
        return f"Quotation {self.id} for PR {self.pr.id} ({self.supplier.name})"

class PurchaseOrder(models.Model):
    STATUS_CHOICES = (
        ('issued', 'Đã phát hành'),
        ('partially_received', 'Nhận hàng một phần'),
        ('received', 'Đã nhận đủ hàng'),
        ('closed', 'Đã đóng (Closed)'),
    )
    id = models.CharField(max_length=50, primary_key=True, verbose_name="Mã PO")
    pr = models.ForeignKey(PurchaseRequest, on_delete=models.CASCADE, related_name='orders', verbose_name="Purchase Request")
    quotation_id = models.CharField(max_length=50, verbose_name="ID Báo giá")
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='orders', verbose_name="Nhà cung cấp")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_orders', verbose_name="Người tạo PO")
    lines = models.JSONField(default=list, verbose_name="Danh sách mặt hàng")
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.10, verbose_name="Thuế VAT")
    shipping_fee = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Phí giao hàng")
    total = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Tổng giá trị PO")
    expected_delivery = models.DateField(null=True, blank=True, verbose_name="Ngày giao hàng dự kiến")
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='issued', verbose_name="Trạng thái PO")
    reconciled = models.BooleanField(default=False, verbose_name="Đã đối soát 3 bên")
    reconciled_by = models.CharField(max_length=150, blank=True, null=True, verbose_name="Người đối soát")
    reconcile_note = models.TextField(blank=True, null=True, verbose_name="Ghi chú đối soát")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Thời gian tạo")

    def __str__(self):
        return f"{self.id} for {self.pr.id} ({self.supplier.name})"

class Receiving(models.Model):
    TYPE_CHOICES = (
        ('full', 'Nhận đủ 100%'),
        ('partial', 'Nhận một phần'),
        ('discrepancy', 'Có sai lệch'),
    )
    id = models.CharField(max_length=50, primary_key=True, verbose_name="Mã Receiving Note")
    po = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='receivings', verbose_name="Purchase Order")
    received_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='receivings', verbose_name="Người nhận hàng")
    lines = models.JSONField(default=list, verbose_name="Danh sách mặt hàng thực nhận")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='full', verbose_name="Loại nhận hàng")
    note = models.TextField(blank=True, verbose_name="Ghi chú tình trạng")
    received_at = models.DateTimeField(auto_now_add=True, verbose_name="Thời gian nhận hàng")

    def __str__(self):
        return f"Receiving {self.id} for PO {self.po.id}"

class PriceReference(models.Model):
    key = models.CharField(max_length=50, primary_key=True, verbose_name="Mã tra cứu")
    label = models.CharField(max_length=255, verbose_name="Tên sản phẩm tham chiếu")
    keywords = models.JSONField(default=list, verbose_name="Từ khóa tra cứu")
    avg_unit_price = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Giá trung bình lịch sử")
    samples = models.IntegerField(default=10, verbose_name="Số lượng mẫu")
    period = models.CharField(max_length=50, default='6 tháng', verbose_name="Kỳ tham chiếu")

    def __str__(self):
        return f"{self.label}: {self.avg_unit_price:,.0f} VNĐ"

class AuditEntry(models.Model):
    id = models.CharField(max_length=50, primary_key=True, verbose_name="Mã Audit Log")
    at = models.DateTimeField(auto_now_add=True, verbose_name="Thời gian")
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Người thực hiện")
    actor_name = models.CharField(max_length=150, verbose_name="Tên người thực hiện")
    role = models.CharField(max_length=20, verbose_name="Vai trò")
    action = models.CharField(max_length=100, verbose_name="Hành động")
    entity = models.CharField(max_length=50, verbose_name="Thực thể")
    entity_id = models.CharField(max_length=50, verbose_name="ID thực thể")
    from_status = models.CharField(max_length=50, blank=True, null=True, verbose_name="Trạng thái cũ")
    to_status = models.CharField(max_length=50, blank=True, null=True, verbose_name="Trạng thái mới")
    reason = models.TextField(blank=True, null=True, verbose_name="Lý do")
    details = models.TextField(blank=True, null=True, verbose_name="Chi tiết")

    def __str__(self):
        return f"[{self.at.strftime('%Y-%m-%d %H:%M')}] {self.actor_name} ({self.role}) - {self.action} on {self.entity} {self.entity_id}"

# Alias for backwards compatibility
AuditLog = AuditEntry

