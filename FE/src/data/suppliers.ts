import type { Supplier } from '../types/procurement';

export const suppliers: Supplier[] = [
{ id: 'sup-hoaphat', name: 'Nội thất Hòa Phát Pro', taxCode: '0101234567', contactName: 'Nguyễn Văn Hùng', email: 'sales@hoaphatpro.vn', phone: '024 3771 2233', categories: ['Nội thất văn phòng'], status: 'active' },
{ id: 'sup-ergo', name: 'Ergonomic Việt', taxCode: '0312345678', contactName: 'Trần Thu Hằng', email: 'quote@ergoviet.vn', phone: '028 3822 4455', categories: ['Nội thất văn phòng'], status: 'active' },
{ id: 'sup-office', name: 'Office Plus Furniture', taxCode: '0108889990', contactName: 'Lý Thanh Tùng', email: 'b2b@officeplus.vn', phone: '024 3633 8899', categories: ['Nội thất văn phòng'], status: 'active' },
{ id: 'sup-saomai', name: 'Tin học Sao Mai', taxCode: '0105556677', contactName: 'Lê Quang Minh', email: 'b2b@saomai.com.vn', phone: '024 3556 7788', categories: ['Thiết bị CNTT', 'Thiết bị phòng họp'], status: 'active' },
{ id: 'sup-anphat', name: 'An Phát Computer', taxCode: '0102223344', contactName: 'Phạm Đức Anh', email: 'doanhnghiep@anphat.vn', phone: '024 3668 9900', categories: ['Thiết bị CNTT', 'Thiết bị phòng họp'], status: 'active' },
{ id: 'sup-digiworld', name: 'DigiWorld Distribution', taxCode: '0301112233', contactName: 'Võ Thị Mai', email: 'corp@digiworld.vn', phone: '028 3910 1122', categories: ['Thiết bị CNTT'], status: 'active' },
{ id: 'sup-vietien', name: 'In ấn Việt Tiến', taxCode: '0109998877', contactName: 'Đặng Văn Tiến', email: 'baogia@invt.vn', phone: '024 3999 1234', categories: ['In ấn & Marketing'], status: 'inactive' }];