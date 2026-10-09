from django.core.management.base import BaseCommand
from procurement.models import (
    User, Budget, PurchaseRequest, PRLineItem,
    Supplier, Quotation, PurchaseOrder, Receiving,
    PriceReference, AuditEntry
)
from procurement.mongodb import get_mongo_db, save_state_to_mongo
from procurement.views import api_state_view
from django.test import RequestFactory

class Command(BaseCommand):
    help = 'Export all current SQLite data to MongoDB'

    def handle(self, *args, **options):
        self.stdout.write("Checking MongoDB connection...")
        db = get_mongo_db()
        if db is None:
            self.stderr.write(self.style.ERROR("MongoDB connection is not configured or failed to connect. Please set MONGODB_URI environment variable."))
            return

        self.stdout.write("Exporting SQLite state to MongoDB...")
        rf = RequestFactory()
        req = rf.get('/api/v1/state/')
        
        # Build state dict directly
        users_qs = User.objects.all()
        requests_qs = PurchaseRequest.objects.all().prefetch_related('items')
        quotations_qs = Quotation.objects.all()
        suppliers_qs = Supplier.objects.all()
        orders_qs = PurchaseOrder.objects.all()
        receivings_qs = Receiving.objects.all()
        budgets_qs = Budget.objects.all()
        audit_qs = AuditEntry.objects.all().order_by('-at')

        state = {
            'users': [
                {
                    'id': u.id, 'username': u.username, 'name': u.name, 'email': u.email, 'password': '123',
                    'role': u.role, 'department': u.department, 'title': u.title,
                    'locked': u.locked, 'canReceive': u.can_receive
                } for u in users_qs
            ],
            'requests': [
                {
                    'id': r.id, 'title': r.title, 'justification': r.justification,
                    'department': r.department, 'costCenter': r.cost_center, 'category': r.category,
                    'budgetCode': r.budget_code, 'requiredBy': r.required_by.strftime('%Y-%m-%d') if r.required_by else '',
                    'deliveryLocation': r.delivery_location,
                    'items': [
                        {
                            'id': it.id, 'name': it.name, 'specs': it.specs,
                            'quantity': it.quantity, 'unit': it.unit, 'estUnitPrice': float(it.est_unit_price)
                        } for it in r.items.all()
                    ],
                    'requesterId': r.requester.id if r.requester else '',
                    'createdAt': r.created_at.isoformat(), 'updatedAt': r.updated_at.isoformat(),
                    'status': r.status, 'routedToFinance': r.routed_to_finance, 'aiReview': r.ai_review,
                    'lastReason': r.last_reason or '', 'approvedAt': r.approved_at.isoformat() if r.approved_at else None,
                    'selectedQuotationId': r.selected_quotation_id or '', 'selectionNote': r.selection_note or '',
                    'poId': r.po_id or ''
                } for r in requests_qs
            ],
            'quotations': [
                {
                    'id': q.id, 'prId': q.pr.id, 'supplierId': q.supplier.id, 'fileName': q.file_name,
                    'fileType': q.file_type, 'status': q.status, 'aiConfidence': float(q.ai_confidence),
                    'lowConfidence': q.low_confidence, 'editedFields': q.edited_fields,
                    'original': q.original, 'lines': q.lines, 'taxRate': float(q.tax_rate),
                    'shippingFee': float(q.shipping_fee), 'deliveryDays': q.delivery_days,
                    'warrantyMonths': q.warranty_months, 'createdAt': q.created_at.isoformat()
                } for q in quotations_qs
            ],
            'suppliers': [
                {
                    'id': s.id, 'name': s.name, 'taxCode': s.tax_code, 'contactName': s.contact_name,
                    'email': s.email, 'phone': s.phone, 'categories': s.categories, 'status': s.status
                } for s in suppliers_qs
            ],
            'orders': [
                {
                    'id': o.id, 'prId': o.pr.id, 'quotationId': o.quotation_id, 'supplierId': o.supplier.id,
                    'createdAt': o.created_at.isoformat(), 'createdBy': o.created_by.id if o.created_by else '',
                    'lines': o.lines, 'taxRate': float(o.tax_rate), 'shippingFee': float(o.shipping_fee),
                    'total': float(o.total), 'expectedDelivery': o.expected_delivery.strftime('%Y-%m-%d') if o.expected_delivery else '',
                    'status': o.status, 'reconciled': o.reconciled, 'reconciledBy': o.reconciled_by or '',
                    'reconcileNote': o.reconcile_note or ''
                } for o in orders_qs
            ],
            'receivings': [
                {
                    'id': rc.id, 'poId': rc.po.id, 'receivedBy': rc.received_by.id if rc.received_by else '',
                    'receivedAt': rc.received_at.isoformat(), 'lines': rc.lines, 'type': rc.type,
                    'note': rc.note
                } for rc in receivings_qs
            ],
            'budgets': [
                {
                    'code': b.code, 'department': b.department, 'costCenter': b.cost_center,
                    'name': b.name, 'fiscalYear': b.fiscal_year, 'allocated': float(b.allocated),
                    'committed': float(b.committed)
                } for b in budgets_qs
            ],
            'categories': ['Thiết bị CNTT', 'In ấn & Marketing', 'Phần mềm & Dịch vụ', 'Nội thất văn phòng', 'Văn phòng phẩm', 'Thiết bị phòng họp'],
            'audit': [
                {
                    'id': a.id, 'at': a.at.isoformat(), 'actorId': a.actor.id if a.actor else '',
                    'actorName': a.actor_name, 'role': a.role, 'action': a.action,
                    'entity': a.entity, 'entityId': a.entity_id, 'fromStatus': a.from_status or '',
                    'toStatus': a.to_status or '', 'reason': a.reason or '', 'details': a.details or ''
                } for a in audit_qs
            ]
        }

        success = save_state_to_mongo(state)
        if success:
            self.stdout.write(self.style.SUCCESS("Successfully seeded MongoDB database!"))
        else:
            self.stderr.write(self.style.ERROR("Failed to seed MongoDB database."))
