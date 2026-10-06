import React from "react";
import { CircleCheckIcon, CircleXIcon, ClockIcon, LockIcon, PackageCheckIcon, PackageIcon, RotateCcwIcon, ScaleIcon, SquarePenIcon, TruckIcon, WalletIcon, BoxIcon } from "lucide-react";
import { POStatus, PRStatus } from "../../types/procurement";
import { PO_STATUS_META, STATUS_META } from "../../utils/workflow";
import { Tag } from "./Tag";
const PR_ICONS: Record<PRStatus, BoxIcon> = {
  draft: SquarePenIcon,
  pending_manager: ClockIcon,
  revision: RotateCcwIcon,
  finance_review: WalletIcon,
  rejected: CircleXIcon,
  approved: CircleCheckIcon,
  supplier_selected: ScaleIcon,
  po_created: PackageIcon,
  partially_received: TruckIcon,
  received: PackageCheckIcon,
  closed: LockIcon
};
const PO_ICONS: Record<POStatus, BoxIcon> = {
  issued: TruckIcon,
  partially_received: TruckIcon,
  received: PackageCheckIcon,
  closed: LockIcon
};
interface BadgeProps {
  size?: 'sm' | 'md';
}
export function StatusBadge({
  status,
  size = 'md'


}: BadgeProps & {status: PRStatus;}) {
  const meta = STATUS_META[status];
  const Icon = PR_ICONS[status];
  return <Tag tone={meta.tone} size={size} icon={<Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden />}>
      {meta.label}
    </Tag>;
}
export function POStatusBadge({
  status,
  size = 'md'


}: BadgeProps & {status: POStatus;}) {
  const meta = PO_STATUS_META[status];
  const Icon = PO_ICONS[status];
  return <Tag tone={meta.tone} size={size} icon={<Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden />}>
      {meta.label}
    </Tag>;
}