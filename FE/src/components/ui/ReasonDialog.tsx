import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { TriangleAlertIcon } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import type { ButtonVariant } from './Button';
import { textareaClass } from '../../utils/styles';

export interface ConfirmDetail {
  label: string;
  value: string;
}

interface ReasonDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel: string;
  confirmVariant?: ButtonVariant;
  reasonLabel?: string;
  reasonRequired?: boolean;
  /** Hide the note field entirely (pure confirmation). */
  hideReason?: boolean;
  placeholder?: string;
  details?: ConfirmDetail[];
  irreversibleNote?: string;
  children?: ReactNode;
  onConfirm: (reason: string) => boolean;
}

export function ReasonDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel,
  confirmVariant = 'primary',
  reasonLabel = 'Lý do',
  reasonRequired = true,
  hideReason = false,
  placeholder,
  details,
  irreversibleNote,
  children,
  onConfirm
}: ReasonDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setReason('');
      setError('');
      setLoading(false);
    }
  }, [open]);

  const submit = () => {
    if (!hideReason && reasonRequired && reason.trim().length < 5) {
      setError('Vui lòng nhập lý do (tối thiểu 5 ký tự).');
      return;
    }
    setError('');
    setLoading(true);
    window.setTimeout(() => {
      const ok = onConfirm(reason);
      setLoading(false);
      if (ok) onClose();
    }, 300);
  };

  return (
    <Modal
      open={open}
      onClose={loading ? () => undefined : onClose}
      title={title}
      description={description}
      footer={
      <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant={confirmVariant === 'danger' ? 'primary' : confirmVariant} className={confirmVariant === 'danger' ? 'bg-danger-600 hover:bg-danger-700' : undefined} onClick={submit} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }>
      
      {details && details.length > 0 &&
      <dl className="mb-4 divide-y divide-line/70 rounded-md border border-line bg-raised">
          {details.map((d) =>
        <div key={d.label} className="flex gap-4 px-3 py-2 text-sm">
              <dt className="w-28 flex-none text-xs text-ink-500">{d.label}</dt>
              <dd className="min-w-0 flex-1 text-ink-900">{d.value}</dd>
            </div>
        )}
        </dl>
      }
      {children && <div className="mb-4">{children}</div>}
      {!hideReason &&
      <>
          <label htmlFor="reason-input" className="mb-1 block text-xs font-semibold text-ink-900">
            {reasonLabel}
            {reasonRequired ? <span className="font-normal text-ink-500"> (bắt buộc)</span> : <span className="font-normal text-ink-500"> (không bắt buộc)</span>}
          </label>
          <textarea
          id="reason-input"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'reason-error' : undefined}
          className={textareaClass(Boolean(error))} />
        
          {error &&
        <p id="reason-error" className="mt-1.5 text-xs text-danger-600">
              {error}
            </p>
        }
        </>
      }
      {irreversibleNote &&
      <p className="mt-4 flex items-start gap-1.5 rounded-md border border-warning-200 bg-warning-50 px-3 py-2 text-xs leading-relaxed text-warning-700">
          <TriangleAlertIcon className="mt-0.5 h-3.5 w-3.5 flex-none" aria-hidden />
          {irreversibleNote}
        </p>
      }
      <p className="mt-3 text-xs text-ink-500">Thao tác được ghi vào Audit Trail cùng người thực hiện và thời điểm.</p>
    </Modal>);

}