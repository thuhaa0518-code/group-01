import type { User } from '../types/procurement';

export const DEMO_PASSWORD = '123';

export const users: User[] = [
  { id: 'u-nam', username: 'employee1', name: 'Lê Hoàng Nam', email: 'nam.le@procure.vn', password: DEMO_PASSWORD, role: 'employee', department: 'Công nghệ thông tin', title: 'Kỹ sư phần mềm', locked: false, canReceive: false },
  { id: 'u-vietanh', username: 'manager1', name: 'Trần Việt Anh', email: 'vietanh.tran@procure.vn', password: DEMO_PASSWORD, role: 'manager', department: 'Công nghệ thông tin', title: 'Trưởng phòng CNTT', locked: false, canReceive: false },
  { id: 'u-phuong', username: 'procurement1', name: 'Nguyễn Mai Phương', email: 'phuong.nguyen@procure.vn', password: DEMO_PASSWORD, role: 'procurement', department: 'Thu mua', title: 'Chuyên viên thu mua', locked: false, canReceive: true },
  { id: 'u-ha', username: 'finance1', name: 'Phạm Thanh Hà', email: 'ha.pham@procure.vn', password: DEMO_PASSWORD, role: 'finance', department: 'Tài chính', title: 'Kiểm soát ngân sách', locked: false, canReceive: false },
  { id: 'u-thang', username: 'admin1', name: 'Vũ Đức Thắng', email: 'thang.vu@procure.vn', password: DEMO_PASSWORD, role: 'admin', department: 'Quản trị hệ thống', title: 'Quản trị hệ thống', locked: false, canReceive: false },
];