from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from decimal import Decimal
import json

from .models import (
    User, Budget, PurchaseRequest, PRLineItem,
    Supplier, Quotation, PurchaseOrder, Receiving,
    PriceReference, AuditEntry
)
from .forms import LoginForm, UserProfileForm

# --- JSON REST API ENDPOINTS FOR FRONTEND (FE INTEGRATION) ---

def spa_index_view(request):
    """Serves the integrated React Single Page Application (SPA) index.html"""
    return render(request, 'index.html')

@csrf_exempt
def api_sync_view(request):
    """Syncs state changes from Frontend to Django SQLite database"""
    if request.method == 'POST':
        try:
            payload = json.loads(request.body.decode('utf-8'))
            
            # Extract actor information from session, header or payload
            current_actor_id = None
            if request.user.is_authenticated:
                current_actor_id = getattr(request.user, 'id', None)
            if not current_actor_id:
                current_actor_id = request.headers.get('X-Actor-Id') or request.META.get('HTTP_X_ACTOR_ID')
            if not current_actor_id and isinstance(payload, dict):
                current_actor_id = payload.get('actorId') or payload.get('actor_id') or payload.get('currentUserId')

            # 1. Sync Users
            if 'users' in payload:
                for u_data in payload['users']:
                    uid = u_data.get('id')
                    if uid:
                        u = User.objects.filter(id=uid).first()
                        if u:
                            if 'name' in u_data: u.name = u_data['name']
                            if 'username' in u_data and u_data['username']: u.username = u_data['username']
                            if 'email' in u_data: u.email = u_data['email']
                            if 'role' in u_data: u.role = u_data['role']
                            if 'department' in u_data: u.department = u_data['department']
                            if 'title' in u_data: u.title = u_data['title']
                            if 'locked' in u_data: u.locked = u_data['locked']
                            if 'canReceive' in u_data: u.can_receive = u_data['canReceive']
                            if 'password' in u_data and u_data['password'] and u_data['password'] != '123':
                                u.set_password(u_data['password'])
                            u.save()

            # 2. Sync Purchase Requests
            if 'requests' in payload:
                for req_data in payload['requests']:
                    pr_id = req_data.get('id')
                    if pr_id:
                        pr = PurchaseRequest.objects.filter(id=pr_id).first()
                        if pr:
                            new_status = req_data.get('status')
                            # Security Guard: Enforce No Self-Approval at backend API layer (BUG-0001 / BUG-SEC-01)
                            if new_status == 'approved' and pr.status != 'approved':
                                req_actor_id = req_data.get('actorId') or req_data.get('approvedBy') or current_actor_id
                                if not req_actor_id and 'audit' in payload and isinstance(payload['audit'], list):
                                    for a in reversed(payload['audit']):
                                        if a.get('entityId') == pr_id and a.get('toStatus') == 'approved':
                                            req_actor_id = a.get('actorId')
                                            break
                                requester_id = pr.requester.id if pr.requester else None
                                if req_actor_id and requester_id and str(req_actor_id) == str(requester_id):
                                    return JsonResponse({
                                        'error': 'QUY TẮC AN TOÀN (No Self-Approval): Không thể tự phê duyệt Yêu cầu do chính mình tạo ra! (BUG-SEC-01)',
                                        'code': 'SELF_APPROVAL_FORBIDDEN',
                                        'pr_id': pr_id
                                    }, status=403)
                                if not req_actor_id:
                                    return JsonResponse({
                                        'error': 'YÊU CẦU XÁC THỰC: Thao tác phê duyệt Yêu cầu mua sắm bắt buộc phải có thông tin danh tính người duyệt (Actor) hợp lệ.',
                                        'code': 'APPROVAL_ACTOR_REQUIRED',
                                        'pr_id': pr_id
                                    }, status=403)

                            if 'status' in req_data: pr.status = req_data['status']
                            if 'routedToFinance' in req_data: pr.routed_to_finance = req_data['routedToFinance']
                            if 'aiReview' in req_data: pr.ai_review = req_data['aiReview']
                            if 'lastReason' in req_data: pr.last_reason = req_data['lastReason']
                            if 'selectedQuotationId' in req_data: pr.selected_quotation_id = req_data['selectedQuotationId']
                            if 'poId' in req_data: pr.po_id = req_data['poId']
                            pr.save()

            # 3. Sync Quotations
            if 'quotations' in payload:
                for q_data in payload['quotations']:
                    qid = q_data.get('id')
                    pr_id = q_data.get('prId')
                    sup_id = q_data.get('supplierId')
                    if qid and pr_id and sup_id:
                        pr = PurchaseRequest.objects.filter(id=pr_id).first()
                        sup = Supplier.objects.filter(id=sup_id).first()
                        if pr and sup:
                            q, _ = Quotation.objects.get_or_create(id=qid, defaults={'pr': pr, 'supplier': sup})
                            q.status = q_data.get('status', q.status)
                            q.file_name = q_data.get('fileName', q.file_name)
                            q.lines = q_data.get('lines', q.lines)
                            q.tax_rate = Decimal(str(q_data.get('taxRate', q.tax_rate)))
                            q.shipping_fee = Decimal(str(q_data.get('shippingFee', q.shipping_fee)))
                            q.delivery_days = q_data.get('deliveryDays', q.delivery_days)
                            q.warranty_months = q_data.get('warrantyMonths', q.warranty_months)
                            q.save()

            # 4. Sync Orders
            if 'orders' in payload:
                for o_data in payload['orders']:
                    oid = o_data.get('id')
                    pr_id = o_data.get('prId')
                    sup_id = o_data.get('supplierId')
                    if oid and pr_id and sup_id:
                        pr = PurchaseRequest.objects.filter(id=pr_id).first()
                        sup = Supplier.objects.filter(id=sup_id).first()
                        if pr and sup:
                            o, _ = PurchaseOrder.objects.get_or_create(
                                id=oid,
                                defaults={'pr': pr, 'supplier': sup, 'quotation_id': o_data.get('quotationId', ''), 'created_by': pr.requester}
                            )
                            o.status = o_data.get('status', o.status)
                            o.reconciled = o_data.get('reconciled', o.reconciled)
                            o.reconciled_by = o_data.get('reconciledBy', o.reconciled_by)
                            o.reconcile_note = o_data.get('reconcileNote', o.reconcile_note)
                            o.save()

            # 5. Sync Receivings
            if 'receivings' in payload:
                for rc_data in payload['receivings']:
                    rc_id = rc_data.get('id')
                    po_id = rc_data.get('poId')
                    if rc_id and po_id:
                        po = PurchaseOrder.objects.filter(id=po_id).first()
                        if po:
                            user_rcv = User.objects.filter(id=rc_data.get('receivedBy')).first() or po.created_by
                            rc, _ = Receiving.objects.get_or_create(
                                id=rc_id,
                                defaults={'po': po, 'received_by': user_rcv}
                            )
                            rc.lines = rc_data.get('lines', rc.lines)
                            rc.type = rc_data.get('type', rc.type)
                            rc.note = rc_data.get('note', rc.note)
                            rc.save()

            # 6. Sync Audit Logs
            if 'audit' in payload:
                for a_data in payload['audit']:
                    aid = a_data.get('id')
                    if aid:
                        actor = User.objects.filter(id=a_data.get('actorId')).first()
                        AuditEntry.objects.get_or_create(
                            id=aid,
                            defaults={
                                'actor': actor,
                                'actor_name': a_data.get('actorName', 'Hệ thống'),
                                'role': a_data.get('role', 'employee'),
                                'action': a_data.get('action', ''),
                                'entity': a_data.get('entity', 'PR'),
                                'entity_id': a_data.get('entityId', ''),
                                'from_status': a_data.get('fromStatus', ''),
                                'to_status': a_data.get('toStatus', ''),
                                'reason': a_data.get('reason', ''),
                                'details': a_data.get('details', '')
                            }
                        )

        except Exception as e:
            print("Sync error:", e)
    return api_state_view(request)

def api_state_view(request):
    """Returns 100% complete ProcurementState JSON matching FE React state"""
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
    return JsonResponse(state)
