import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

os.makedirs('sample_quotations', exist_ok=True)

def generate_pdf(filename, title, supplier_name, items, subtotal, tax, shipping, total, notes):
    doc = SimpleDocTemplate(filename, pagesize=letter)
    styles = getSampleStyleSheet()
    
    story = []
    
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=14,
        textColor=colors.HexColor('#1E40AF'),
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'SubTitleStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#475569'),
        spaceAfter=15
    )

    h2_style = ParagraphStyle(
        'H2Style',
        parent=styles['Heading2'],
        fontSize=13,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=10
    )
    
    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#334155'),
        spaceAfter=6
    )

    story.append(Paragraph(supplier_name, title_style))
    story.append(Paragraph("Hotline: 024-3852-1122 | Email: sales@supplier.vn", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph(title, h2_style))
    story.append(Spacer(1, 10))
    
    table_data = [["STT", "Ten mat hang", "DVT", "So luong", "Don gia (VND)", "Thanh tien (VND)"]]
    for item in items:
        table_data.append([str(item[0]), item[1], item[2], str(item[3]), f"{item[4]:,}", f"{item[3]*item[4]:,}"])
    
    table_data.append(["", "Cong tien hang:", "", "", "", f"{subtotal:,}"])
    table_data.append(["", "Thue VAT (10%):", "", "", "", f"{tax:,}"])
    table_data.append(["", "Phi van chuyen:", "", "", "", f"{shipping:,}"])
    table_data.append(["", "TONG CONG THANH TOAN:", "", "", "", f"{total:,}"])
    
    t = Table(table_data, colWidths=[30, 200, 40, 50, 90, 100])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#0F172A')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('GRID', (0,0), (-1,-5), 0.5, colors.HexColor('#CBD5E1')),
        ('FONTNAME', (0,-4), (-1,-1), 'Helvetica-Bold'),
    ]))
    story.append(t)
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("DIEU KIEN THUONG MAI:", ParagraphStyle('HeaderBold', parent=body_style, fontName='Helvetica-Bold')))
    for note in notes:
        story.append(Paragraph(f"- {note}", body_style))
        
    doc.build(story)

# 1. PDF 1: HaNoiTech
generate_pdf(
    'sample_quotations/BaoGia_Laptop_HaNoiTech.pdf',
    'BANG BAO GIA THIET BI CONG NGHE THONG TIN',
    'CONG TY TNHH THIET BI CONG NGHE HA NOI',
    [
        (1, 'Laptop van phong 14 inch i7-1355U/32GB/1TB', 'Chiec', 5, 23500000),
        (2, 'Man hinh 27 inch 2K IPS 75Hz (HDMI/USB-C)', 'Chiec', 4, 6200000),
        (3, 'Bo ban phim + chuot khong day Bluetooth', 'Bo', 3, 1150000),
    ],
    145750000, 14575000, 300000, 160625000,
    ['Thoi gian giao hang: Trong vong 3 ngay lam viec', 'Thoi gian bao hanh: 24 thang cho Laptop/Man hinh', 'Hieu luc bao gia: 30 ngay']
)

# 2. PDF 2: TanPhat Furniture
generate_pdf(
    'sample_quotations/BaoGia_GheCongThaiHoc_TanPhat.pdf',
    'BAO GIA THIET BI NOI THAT CONG THAI HOC',
    'CONG TY CO PHAN NOI THAT VAN PHONG TAN PHAT',
    [
        (1, 'Ghe cong thai hoc lung luoi TP-E08', 'Chiec', 10, 4800000),
        (2, 'Ban nang ha chieu cao dien tu 140x70cm', 'Bo', 2, 7500000),
    ],
    63000000, 6300000, 500000, 69800000,
    ['Thoi gian giao hang: 3-5 ngay', 'Thoi gian bao hanh: 24 thang tai nha', 'Mien phi lap dat tai Ha Noi']
)

# 3. PDF 3: VietQuocTe
generate_pdf(
    'sample_quotations/BaoGia_ThietBiPhongHop_VietQuocTe.pdf',
    'BAO GIA THIET BI TRUYEN THONG PHONG HOP',
    'CONG TY CP DAU TU & THUONG MAI VIET QUOC TE',
    [
        (1, 'May chieu Laser 4K Panasonic 5000 Lumens', 'Bo', 1, 35000000),
        (2, 'Loa hoi nghe Bluetooth Jabra Speak 710', 'Chiec', 2, 6800000),
    ],
    48600000, 4860000, 0, 53460000,
    ['Thoi gian giao hang: 24h', 'Bao hanh 36 thang', 'Ho tro demo ky thuat mien phi']
)

print("Created 3 PDF sample quotation files in sample_quotations/")
