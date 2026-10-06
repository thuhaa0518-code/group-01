export type Role = 'employee' | 'manager' | 'procurement' | 'finance' | 'admin';

export interface User {
  id: string;
  username?: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  department: string;
  title: string;
  locked: boolean;
  canReceive: boolean;
}

export type PRStatus =
'draft' |
'pending_manager' |
'revision' |
'finance_review' |
'rejected' |
'approved' |
'supplier_selected' |
'po_created' |
'partially_received' |
'received' |
'closed';

export type AIReviewResult = 'none' | 'accepted' | 'edited' | 'dismissed';

export interface LineItem {
  id: string;
  name: string;
  specs: string;
  quantity: number;
  unit: string;
  estUnitPrice: number;
}

export interface PurchaseRequest {
  id: string;
  title: string;
  justification: string;
  department: string;
  costCenter: string;
  category: string;
  budgetCode: string;
  requiredBy: string;
  deliveryLocation: string;
  items: LineItem[];
  requesterId: string;
  createdAt: string;
  updatedAt: string;
  status: PRStatus;
  routedToFinance: boolean;
  aiReview: AIReviewResult;
  lastReason?: string;
  approvedAt?: string;
  selectedQuotationId?: string;
  selectionNote?: string;
  poId?: string;
}

export type PRInput = Pick<
  PurchaseRequest,
  'title' |
  'justification' |
  'department' |
  'costCenter' |
  'category' |
  'budgetCode' |
  'requiredBy' |
  'deliveryLocation' |
  'items' |
  'aiReview'>;


export interface QuotationLine {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export type QuotationField = 'unitPrice' | 'taxRate' | 'shippingFee' | 'deliveryDays' | 'warrantyMonths';

export interface QuotationSnapshot {
  lines: QuotationLine[];
  taxRate: number;
  shippingFee: number;
  deliveryDays: number;
  warrantyMonths: number;
}

export interface Quotation extends QuotationSnapshot {
  id: string;
  prId: string;
  supplierId: string;
  fileName: string;
  fileType: 'pdf' | 'excel';
  status: 'extracted' | 'confirmed';
  aiConfidence: number;
  lowConfidence: QuotationField[];
  editedFields: QuotationField[];
  original: QuotationSnapshot;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  taxCode: string;
  contactName: string;
  email: string;
  phone: string;
  categories: string[];
  status: 'active' | 'inactive';
}

export type POStatus = 'issued' | 'partially_received' | 'received' | 'closed';

export interface PurchaseOrder {
  id: string;
  prId: string;
  quotationId: string;
  supplierId: string;
  createdAt: string;
  createdBy: string;
  lines: QuotationLine[];
  taxRate: number;
  shippingFee: number;
  total: number;
  expectedDelivery: string;
  status: POStatus;
  reconciled: boolean;
  reconciledBy?: string;
  reconcileNote?: string;
}

export interface ReceivingLine {
  itemId: string;
  quantity: number;
}

export interface Receiving {
  id: string;
  poId: string;
  receivedBy: string;
  receivedAt: string;
  lines: ReceivingLine[];
  type: 'full' | 'partial' | 'discrepancy';
  note: string;
}

export interface Budget {
  code: string;
  department: string;
  costCenter: string;
  name: string;
  fiscalYear: number;
  allocated: number;
  committed: number;
}

export interface PriceReference {
  key: string;
  label: string;
  keywords: string[];
  avgUnitPrice: number;
  samples: number;
  period: string;
}

export type AuditEntity = 'PR' | 'Quotation' | 'PO' | 'Receiving' | 'Supplier' | 'User' | 'Budget' | 'Category' | 'Auth';

export interface AuditEntry {
  id: string;
  at: string;
  actorId: string;
  actorName: string;
  role: Role;
  action: string;
  entity: AuditEntity;
  entityId: string;
  fromStatus?: string;
  toStatus?: string;
  reason?: string;
  details?: string;
}

export interface ProcurementState {
  users: User[];
  requests: PurchaseRequest[];
  quotations: Quotation[];
  suppliers: Supplier[];
  orders: PurchaseOrder[];
  receivings: Receiving[];
  budgets: Budget[];
  categories: string[];
  audit: AuditEntry[];
}