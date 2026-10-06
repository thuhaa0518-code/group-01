import type { LucideIcon } from 'lucide-react';
import {
  ClipboardListIcon,
  FileTextIcon,
  GavelIcon,
  HistoryIcon,
  PackageIcon,
  PlusIcon,
  ScaleIcon,
  SlidersHorizontalIcon,
  TruckIcon,
  UsersIcon,
  WalletIcon } from
'lucide-react';
import type { Permission } from '../utils/permissions';
import type { WorkArea } from '../hooks/useWorkQueue';

export interface NavItem {
  to: string;
  label: string;
  /** Role that owns this queue — shown as a small label, as in the reference workspace. */
  owner: string;
  icon: LucideIcon;
  permission?: Permission;
  badgeArea?: WorkArea;
}

export const navItems: NavItem[] = [
{ to: '/requests', label: 'Purchase requests', owner: 'Employee', icon: ClipboardListIcon, permission: 'pr.view', badgeArea: 'requests' },
{ to: '/requests/new', label: 'New request', owner: 'Employee', icon: PlusIcon, permission: 'pr.create' },
{ to: '/approvals', label: 'Approvals', owner: 'Manager', icon: GavelIcon, permission: 'approval.manager', badgeArea: 'approvals' },
{ to: '/budget', label: 'Budget review', owner: 'Finance', icon: WalletIcon, permission: 'budget.review', badgeArea: 'budget' },
{ to: '/sourcing', label: 'Sourcing', owner: 'Procurement', icon: ScaleIcon, permission: 'sourcing.manage', badgeArea: 'sourcing' },
{ to: '/suppliers', label: 'Suppliers', owner: 'Procurement', icon: TruckIcon, permission: 'supplier.view' },
{ to: '/orders', label: 'Purchase orders', owner: 'PO', icon: PackageIcon, permission: 'po.view', badgeArea: 'orders' },
{ to: '/admin/users', label: 'Users & RBAC', owner: 'Admin', icon: UsersIcon, permission: 'admin.users' },
{ to: '/admin/catalog', label: 'Budget & danh mục', owner: 'Admin', icon: SlidersHorizontalIcon, permission: 'budget.manage' },
{ to: '/audit', label: 'Audit trail', owner: 'Admin', icon: HistoryIcon, permission: 'audit.view' }
];