import type { PRStatus, PurchaseRequest, Role, User } from '../types/procurement';

export type Permission =
'pr.create' |
'pr.view' |
'approval.manager' |
'approval.finance' |
'budget.review' |
'budget.manage' |
'sourcing.manage' |
'supplier.manage' |
'supplier.view' |
'po.view' |
'po.create' |
'receiving.record' |
'reconcile' |
'pr.close' |
'admin.users' |
'audit.view' |
'category.manage';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  employee: ['pr.create', 'pr.view', 'po.view'],
  manager: ['pr.view', 'approval.manager', 'po.view'],
  finance: ['pr.view', 'approval.finance', 'budget.review', 'po.view', 'reconcile', 'pr.close'],
  procurement: ['pr.view', 'sourcing.manage', 'supplier.manage', 'supplier.view', 'po.view', 'po.create', 'receiving.record', 'pr.close'],
  admin: ['pr.create', 'pr.view', 'budget.manage', 'supplier.view', 'po.view', 'admin.users', 'audit.view', 'category.manage']
};

export const PERMISSION_LABEL: Record<Permission, string> = {
  'pr.create': 'Tạo & chỉnh sửa PR của mình',
  'pr.view': 'Xem Purchase Request (theo phạm vi)',
  'approval.manager': 'Phê duyệt cấp Manager',
  'approval.finance': 'Phê duyệt ngân sách (Finance)',
  'budget.review': 'Budget Review',
  'budget.manage': 'Quản lý Budget',
  'sourcing.manage': 'Thu thập & so sánh Quotation',
  'supplier.manage': 'Quản lý Supplier',
  'supplier.view': 'Xem Supplier',
  'po.view': 'Xem Purchase Order',
  'po.create': 'Tạo Purchase Order',
  'receiving.record': 'Ghi nhận Receiving (Thu mua)',
  reconcile: 'Đối soát PR ↔ PO ↔ Receiving',
  'pr.close': 'Close Purchase Request',
  'admin.users': 'Quản lý tài khoản & RBAC',
  'audit.view': 'Xem Audit Trail',
  'category.manage': 'Quản lý danh mục'
};

export const ALL_PERMISSIONS = Object.keys(PERMISSION_LABEL) as Permission[];

export const ROLE_LABEL: Record<Role, string> = {
  employee: 'Employee',
  manager: 'Manager',
  procurement: 'Procurement',
  finance: 'Finance',
  admin: 'Admin'
};

export const ROLE_SUMMARY: Record<Role, string> = {
  employee: 'Tạo PR, theo dõi trạng thái yêu cầu',
  manager: 'Duyệt, từ chối, yêu cầu chỉnh sửa, chuyển Finance (Chỉ duyệt, không tạo PR)',
  procurement: 'Supplier, Quotation, chọn NCC, tạo PO, ghi nhận Receiving',
  finance: 'Budget Review, đối soát và Close',
  admin: 'Tài khoản, RBAC, Budget, Audit Trail'
};


export function can(user: User | null | undefined, permission: Permission): boolean {
  if (!user) return false;
  if (permission === 'receiving.record') return user.role === 'procurement' && user.canReceive;
  return ROLE_PERMISSIONS[user.role].includes(permission);
}

const FINANCE_VISIBLE: PRStatus[] = ['finance_review', 'po_created', 'partially_received', 'received', 'closed'];
const PROCUREMENT_VISIBLE: PRStatus[] = ['approved', 'supplier_selected', 'po_created', 'partially_received', 'received', 'closed'];

export function canViewRequest(user: User, pr: PurchaseRequest): boolean {
  switch (user.role) {
    case 'employee':
      return pr.requesterId === user.id;
    case 'manager':
      return pr.requesterId === user.id || pr.department === user.department && pr.status !== 'draft';
    case 'finance':
      return pr.routedToFinance || FINANCE_VISIBLE.includes(pr.status);
    case 'procurement':
      return PROCUREMENT_VISIBLE.includes(pr.status);
    case 'admin':
      return true;
  }
}

export function canViewOrderOf(user: User, pr: PurchaseRequest | undefined): boolean {
  if (!pr) return false;
  if (user.role === 'procurement' || user.role === 'finance' || user.role === 'admin') return true;
  return canViewRequest(user, pr);
}