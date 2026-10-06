import React from 'react';
import type { PurchaseRequest, Quotation, Supplier } from '../../types/procurement';
import { quotationTotal, linesSubtotal } from '../../utils/rules';
import { formatDate, formatVND } from '../../utils/format';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface SourceFileDialogProps {
  quotation: Quotation | null;
  supplier?: Supplier;
  pr: PurchaseRequest;
  onClose: () => void;
}

/** Bản xem file gốc — hiển thị giá trị nguyên bản trước khi AI trích xuất / người dùng chỉnh sửa. */
export function SourceFileDialog({ quotation, supplier, pr, onClose }: SourceFileDialogProps) {
  const o = quotation?.original;
  return (
    <Modal
      open={Boolean(quotation)}
      onClose={onClose}
      size="lg"
      title="File Quotation gốc"
      description={quotation ? `${quotation.fileName} · đối chiếu với dữ liệu AI trích xuất` : undefined}
      footer={<Button variant="secondary" onClick={onClose}>Đóng</Button>}>
      
      {quotation && o &&
      <div className="rounded-md border border-line bg-white p-6 font-serif text-ink-900">
          <div className="flex flex-wrap justify-between gap-4 border-b border-ink-900 pb-4">
            <div>
              <p className="text-lg font-bold uppercase">{supplier?.name}</p>
              <p className="text-xs">MST: {supplier?.taxCode}</p>
              <p className="text-xs">
                {supplier?.email} · {supplier?.phone}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">BÁO GIÁ</p>
              <p className="text-xs">Ngày: {formatDate(quotation.createdAt)}</p>
              <p className="text-xs">Tham chiếu: {pr.id}</p>
            </div>
          </div>
          <table className="mt-4 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-900">
                <th className="py-1.5 pr-2">Hàng hóa</th>
                <th className="px-2 py-1.5 text-right">SL</th>
                <th className="px-2 py-1.5 text-right">Đơn giá</th>
                <th className="py-1.5 pl-2 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {o.lines.map((l) =>
            <tr key={l.itemId} className="border-b border-line">
                  <td className="py-1.5 pr-2">{l.name}</td>
                  <td className="px-2 py-1.5 text-right">{l.quantity}</td>
                  <td className="px-2 py-1.5 text-right">{formatVND(l.unitPrice)}</td>
                  <td className="py-1.5 pl-2 text-right">{formatVND(l.unitPrice * l.quantity)}</td>
                </tr>
            )}
            </tbody>
          </table>
          <div className="ml-auto mt-3 w-full max-w-xs space-y-1 text-sm">
            <p className="flex justify-between">
              <span>Cộng</span>
              <span>{formatVND(linesSubtotal(o.lines))}</span>
            </p>
            <p className="flex justify-between">
              <span>VAT {Math.round(o.taxRate * 100)}%</span>
              <span>{formatVND(linesSubtotal(o.lines) * o.taxRate)}</span>
            </p>
            <p className="flex justify-between">
              <span>Vận chuyển</span>
              <span>{formatVND(o.shippingFee)}</span>
            </p>
            <p className="flex justify-between border-t border-ink-900 pt-1 font-bold">
              <span>Tổng cộng</span>
              <span>{formatVND(quotationTotal(o))}</span>
            </p>
          </div>
          <p className="mt-4 text-xs">
            Thời gian giao hàng: {o.deliveryDays} ngày kể từ PO. Bảo hành: {o.warrantyMonths} tháng. Báo giá có hiệu lực 30 ngày.
          </p>
        </div>
      }
    </Modal>);

}