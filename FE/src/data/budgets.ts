import type { Budget } from '../types/procurement';

export const budgets: Budget[] = [
{ code: 'BGT-IT-2026', department: 'Công nghệ thông tin', costCenter: 'CC-IT-01', name: 'Thiết bị & phần mềm CNTT 2026', fiscalYear: 2026, allocated: 600_000_000, committed: 412_000_000 },
{ code: 'BGT-MKT-2026', department: 'Marketing', costCenter: 'CC-MKT-01', name: 'Hoạt động Marketing 2026', fiscalYear: 2026, allocated: 300_000_000, committed: 284_500_000 },
{ code: 'BGT-OPS-2026', department: 'Vận hành', costCenter: 'CC-OPS-01', name: 'Vận hành văn phòng 2026', fiscalYear: 2026, allocated: 250_000_000, committed: 96_000_000 }];


export const categories: string[] = [
'Thiết bị CNTT',
'Nội thất văn phòng',
'Thiết bị phòng họp',
'In ấn & Marketing',
'Phần mềm & Dịch vụ',
'Văn phòng phẩm'];