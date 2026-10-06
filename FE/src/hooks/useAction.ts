import { useCallback } from 'react';
import { toast } from 'sonner';
import { useProcurement } from '../contexts/ProcurementContext';
import { useAuth } from '../contexts/AuthContext';
import type { ActionFn, ActionResult } from '../utils/procurementActions';

/** Chạy một action nghiệp vụ dưới danh nghĩa người dùng hiện tại; lỗi quy tắc được hiển thị bằng toast. */
export function useAction() {
  const { dispatch } = useProcurement();
  const { user } = useAuth();

  return useCallback(
    <A extends unknown[],>(fn: ActionFn<A>, ...args: A): ActionResult => {
      if (!user) {
        const res: ActionResult = { ok: false, error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
        toast.error(res.error);
        return res;
      }
      const res = dispatch(fn, user, ...args);
      if (!res.ok) toast.error(res.error);
      return res;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, dispatch]
  );
}