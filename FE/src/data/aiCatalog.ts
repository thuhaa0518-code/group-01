export interface AICatalogEntry {
  keywords: string[];
  shortName: string;
  category: string;
  itemName: string;
  unit: string;
  specs: string;
  missing: string[];
}

export const aiCatalog: AICatalogEntry[] = [
{
  keywords: ['laptop', 'máy tính xách tay'], shortName: 'laptop', category: 'Thiết bị CNTT', itemName: 'Laptop văn phòng 14" hiệu năng cao', unit: 'chiếc',
  specs: 'CPU Intel Core i7 hoặc tương đương, RAM 16–32GB, SSD ≥ 512GB, màn hình 14" ≥ FHD, bảo hành ≥ 24 tháng',
  missing: ['Mức RAM/CPU cụ thể theo nhu cầu công việc', 'Hệ điều hành và phần mềm cần cài sẵn']
},
{
  keywords: ['màn hình', 'monitor'], shortName: 'màn hình', category: 'Thiết bị CNTT', itemName: 'Màn hình 27 inch 2K', unit: 'chiếc',
  specs: 'Tấm nền IPS, độ phân giải 2560×1440, cổng HDMI + USB-C, chân điều chỉnh độ cao',
  missing: ['Kích thước và độ phân giải mong muốn', 'Cổng kết nối tương thích với máy hiện có']
},
{
  keywords: ['bàn ghế', 'bàn gỗ', 'bàn làm việc'], shortName: 'bàn ghế văn phòng', category: 'Nội thất văn phòng', itemName: 'Bộ bàn ghế gỗ cao cấp', unit: 'bộ',
  specs: 'Gỗ tự nhiên/công nghiệp cao cấp, bao gồm bàn làm việc và ghế đồng bộ, thiết kế hiện đại',
  missing: ['Kích thước mặt bàn', 'Màu sắc / loại chất liệu gỗ']
},
{
  keywords: ['ghế công thái học', 'ghế xoay', 'ghế lưới', 'ghế làm việc', 'ghế cá nhân'], shortName: 'ghế công thái học', category: 'Nội thất văn phòng', itemName: 'Ghế công thái học lưng lưới', unit: 'chiếc',
  specs: 'Tựa đầu, tay 4D, đệm ngồi trượt, chịu tải ≥ 120kg, bảo hành ≥ 36 tháng',
  missing: ['Màu sắc / chất liệu theo nhận diện văn phòng']
},
{
  keywords: ['máy chiếu', 'projector'], shortName: 'máy chiếu', category: 'Thiết bị phòng họp', itemName: 'Máy chiếu Full HD', unit: 'chiếc',
  specs: 'Độ phân giải 1920×1080, ≥ 3500 ANSI lumens, HDMI ×2, kèm giá treo',
  missing: ['Diện tích phòng họp / khoảng cách chiếu']
},
{
  keywords: ['tai nghe', 'headset'], shortName: 'tai nghe', category: 'Thiết bị CNTT', itemName: 'Tai nghe chống ồn không dây', unit: 'chiếc',
  specs: 'ANC, Bluetooth 5.x, pin ≥ 30 giờ, micro đàm thoại',
  missing: ['Nhu cầu dùng cho họp trực tuyến hay dựng âm thanh']
},
{
  keywords: ['bàn phím', 'chuột', 'keyboard', 'mouse'], shortName: 'bàn phím, chuột', category: 'Thiết bị CNTT', itemName: 'Bộ bàn phím và chuột không dây', unit: 'bộ',
  specs: 'Kết nối Bluetooth + USB receiver, layout US, pin sạc',
  missing: ['Layout bàn phím (US / có phím số)']
},
{
  keywords: ['máy in'], shortName: 'máy in', category: 'Thiết bị CNTT', itemName: 'Máy in laser đa năng A4', unit: 'chiếc',
  specs: 'In laser đen trắng, in 2 mặt tự động, scan/copy, kết nối LAN + Wi-Fi, ≥ 30 trang/phút',
  missing: ['Nhu cầu in màu hay đen trắng', 'Sản lượng in ước tính mỗi tháng']
},
{
  keywords: ['ssd', 'ổ cứng'], shortName: 'ổ cứng SSD', category: 'Thiết bị CNTT', itemName: 'Ổ cứng SSD NVMe 1TB', unit: 'chiếc',
  specs: 'PCIe Gen4, đọc ≥ 7000MB/s, bảo hành 5 năm',
  missing: ['Dung lượng và chuẩn kết nối của máy hiện có']
},
{
  keywords: ['brochure', 'tờ rơi', 'in ấn', 'standee'], shortName: 'ấn phẩm in', category: 'In ấn & Marketing', itemName: 'Brochure A4 gấp 3', unit: 'tờ',
  specs: 'Giấy C150, in 4 màu 2 mặt, cán mờ',
  missing: ['File thiết kế đã duyệt', 'Số lượng theo từng loại ấn phẩm']
}];