import React, { useState } from 'react';
import { BanIcon, CheckIcon, RotateCcwIcon, SendIcon, SparklesIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Budget, PurchaseRequest } from '../../types/procurement';
import { useCurrentUser } from '../../contexts/AuthContext';
import { useAction } from '../../hooks/useAction';
import { can } from '../../utils/permissions';
import { financeGuard, managerGuard } from '../../utils/rules';
import { financeDecide, managerDecide } from '../../utils/procurementActions';
import type { FinanceDecision, ManagerDecision } from '../../utils/procurementActions';
import { formatVND } from '../../utils/format';
import { Button } from '../ui/Button';
import type { ButtonVariant } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { ReasonDialog } from '../ui/ReasonDialog';

type Decision = ManagerDecision | FinanceDecision;

interface DialogConfig {
  decision: Decision;
  title: string;
  confirmLabel: string;
  variant: ButtonVariant;
  required: boolean;
  reasonLabel: string;
  placeholder: string;
}

export function DecisionPanel({ pr, budget }: {pr: PurchaseRequest;budget?: Budget;}) {
  const user = useCurrentUser();
  const act = useAction();
  const [dialog, setDialog] = useState<DialogConfig | null>(null);

  const isManager = user.role === 'manager' && can(user, 'approval.manager') && pr.status === 'pending_manager';
  const isFinance = user.role === 'finance' && can(user, 'approval.finance') && pr.status === 'finance_review';
  if (!isManager && !isFinance) return null;

  const g = isManager ? managerGuard(user, pr, budget) : financeGuard(user, pr, budget);

  const DIALOGS: Record<Decision, DialogConfig> = {
    approve: {
      decision: 'approve',
      title: isManager
        ? (g.overThreshold ? 'Manager Approve & Chuyển Finance' : 'Approve Purchase Request')
        : 'Phê duyệt ngân sách',
      confirmLabel: isManager && g.overThreshold ? 'Approve & Send to Finance' : 'Approve',
      variant: 'success',
      required: isFinance && g.overBudget,
      reasonLabel: isFinance && g.overBudget ? 'Ghi chú phê duyệt vượt Budget' : 'Ghi chú',
      placeholder: isFinance && g.overBudget ? 'VD: Điều chuyển 25 tr từ ngân sách dự phòng Q4 theo quyết định…' : 'Ghi chú thêm cho người tạo (không bắt buộc)'
    },
    reject: { decision: 'reject', title: 'Reject Purchase Request', confirmLabel: 'Reject', variant: 'danger', required: true, reasonLabel: 'Lý do Reject', placeholder: 'Nêu rõ lý do để người tạo hiểu quyết định' },
    revision: { decision: 'revision', title: 'Yêu cầu chỉnh sửa', confirmLabel: 'Request revision', variant: 'primary', required: true, reasonLabel: 'Nội dung cần chỉnh sửa', placeholder: 'VD: Bổ sung cấu hình RAM, xác nhận số lượng…' },
    finance: { decision: 'finance', title: 'Chuyển Finance kiểm tra Budget', confirmLabel: 'Send to Finance', variant: 'warning', required: true, reasonLabel: 'Lý do chuyển Finance', placeholder: 'VD: PR trên ngưỡng 50 tr / vượt Budget phòng…' }
  };

  const confirm = (reason: string): boolean => {
    if (!dialog) return false;
    const res = isManager ? act(managerDecide, pr.id, dialog.decision as ManagerDecision, reason) : act(financeDecide, pr.id, dialog.decision as FinanceDecision, reason);
    if (res.ok) toast.success(`${dialog.confirmLabel}: ${pr.id} đã được cập nhật.`);
    return res.ok;
  };

  return (
    <section className="rounded-lg border border-primary-200 bg-white p-5" aria-labelledby="decision-title">
      <h2 id="decision-title" className="text-base font-semibold text-ink-900">
        {isManager ? 'Quyết định của Manager' : 'Finance Budget Review'}
      </h2>
      <p className="mt-0.5 text-xs text-ink-500">
        Giá trị PR {formatVND(g.check.requested)} · Budget khả dụng {formatVND(g.check.available)}
      </p>

      {g.blockReason ?
      <Alert tone="blocked" title="Không thể xử lý phê duyệt" className="mt-4">
          {g.blockReason}
        </Alert> :

      <>
          {g.approveBlock &&
        <Alert tone="warning" title="Approve không khả dụng" className="mt-4">
              {g.approveBlock}
            </Alert>
        }
          {isManager && g.overThreshold && !g.approveBlock &&
        <Alert tone="info" title="PR trên 50 triệu" className="mt-4">
              Nhấn Approve sẽ phê duyệt cấp Manager và chuyển PR sang Finance phê duyệt ngân sách tiếp theo.
            </Alert>
        }
          {isFinance && g.overBudget &&
        <Alert tone="warning" title="PR vượt Budget khả dụng" className="mt-4">
              Nếu phê duyệt, bạn cần ghi chú căn cứ điều chỉnh ngân sách theo policy.
            </Alert>
        }
          <div className="mt-4 grid gap-2">
            <Button variant="success" icon={<CheckIcon className="h-4 w-4" aria-hidden />} disabled={Boolean(g.approveBlock)} onClick={() => setDialog(DIALOGS.approve)}>
              {isManager && g.overThreshold ? 'Approve & Chuyển Finance' : 'Approve'}
            </Button>
            {isManager &&
          <Button variant="warning" icon={<SendIcon className="h-4 w-4" aria-hidden />} onClick={() => setDialog(DIALOGS.finance)}>
                Send to Finance
              </Button>
          }
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" icon={<RotateCcwIcon className="h-4 w-4" aria-hidden />} onClick={() => setDialog(DIALOGS.revision)}>
                Revision
              </Button>
              <Button variant="danger" icon={<XIcon className="h-4 w-4" aria-hidden />} onClick={() => setDialog(DIALOGS.reject)}>
                Reject
              </Button>
            </div>
          </div>
        </>
      }

      <p className="mt-4 flex gap-2 text-xs text-ink-500">
        {g.blockReason ? <BanIcon className="h-4 w-4 flex-none" aria-hidden /> : <SparklesIcon className="h-4 w-4 flex-none text-info-600" aria-hidden />}
        AI chỉ cảnh báo và hỗ trợ phân tích. Quyết định phê duyệt thuộc về bạn và được ghi vào Audit Trail.
      </p>

      <ReasonDialog
        open={Boolean(dialog)}
        onClose={() => setDialog(null)}
        title={dialog?.title ?? ''}
        description={`${pr.id} · ${pr.title}`}
        confirmLabel={dialog?.confirmLabel ?? ''}
        confirmVariant={dialog?.variant}
        reasonRequired={dialog?.required}
        reasonLabel={dialog?.reasonLabel}
        placeholder={dialog?.placeholder}
        onConfirm={confirm} />
      
    </section>);

}