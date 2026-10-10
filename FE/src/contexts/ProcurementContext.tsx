import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { ProcurementState, User } from '../types/procurement';
import type { ActionFn, ActionResult } from '../utils/procurementActions';
import { users } from '../data/users';
import { requests } from '../data/requests';
import { quotations } from '../data/quotations';
import { suppliers } from '../data/suppliers';
import { orders, receivings } from '../data/orders';
import { budgets, categories } from '../data/budgets';
import { auditSeed } from '../data/auditSeed';

const STORAGE_KEY = 'procureai-state-v1';

interface ProcurementContextValue {
  state: ProcurementState;
  dispatch: <A extends unknown[]>(fn: ActionFn<A>, actor: User, ...args: A) => ActionResult;
  reset: () => void;
}

const ProcurementContext = createContext<ProcurementContextValue | null>(null);

function seedState(): ProcurementState {
  return { users, requests, quotations, suppliers, orders, receivings, budgets, categories, audit: auditSeed };
}

function loadState(): ProcurementState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ProcurementState;
  } catch {
    /* ignore corrupted storage */
  }
  return seedState();
}

export function ProcurementProvider({ children }: {children: ReactNode;}) {
  const [state, setState] = useState<ProcurementState>(loadState);
  const ref = useRef(state);
  ref.current = state;

  const fetchState = () => {
    fetch('/api/v1/state/')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ProcurementState | null) => {
        if (data && data.users && data.users.length > 0) {
          setState((prev) => {
            const serverRequests = data.requests || [];
            const localOnlyRequests = prev.requests.filter(
              (pr) => !serverRequests.some((s) => s.id === pr.id)
            );
            const serverQuotations = data.quotations || [];
            const localOnlyQuotations = prev.quotations.filter(
              (q) => !serverQuotations.some((s) => s.id === q.id)
            );
            const serverOrders = data.orders || [];
            const localOnlyOrders = prev.orders.filter(
              (o) => !serverOrders.some((s) => s.id === o.id)
            );
            const serverReceivings = data.receivings || [];
            const localOnlyReceivings = prev.receivings.filter(
              (r) => !serverReceivings.some((s) => s.id === r.id)
            );
            const mergedState: ProcurementState = {
              ...data,
              requests: [...serverRequests, ...localOnlyRequests],
              quotations: [...serverQuotations, ...localOnlyQuotations],
              orders: [...serverOrders, ...localOnlyOrders],
              receivings: [...serverReceivings, ...localOnlyReceivings],
            };
            ref.current = mergedState;
            return mergedState;
          });
        }
      })
      .catch(() => {
        /* fallback to local state if offline */
      });
  };

  useEffect(() => {
    // Initial fetch
    fetchState();

    // Poll every 5s for multi-user real-time sync across devices/browsers
    const interval = setInterval(fetchState, 5000);
    const onFocus = () => fetchState();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);


  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state]);

  /**
   * [US-03 Global Dispatcher & Synchronization]
   * Thực thi các hành động tạo/sửa PR (như Submit PR sau khi áp dụng gợi ý AI),
   * cập nhật React State nội bộ, lưu LocalStorage và đẩy HTTP POST `/api/v1/sync/`
   * sang Backend để lưu đồng bộ vào MongoDB Atlas Cloud Database.
   */
  function dispatch<A extends unknown[]>(fn: ActionFn<A>, actor: User, ...args: A): ActionResult {
    const res = fn(ref.current, actor, ...args);
    if (res.ok) {
      ref.current = res.state;
      setState(res.state);

      // Đồng bộ cây dữ liệu mới sang Django Backend API & MongoDB Atlas Cloud DB
      fetch('/api/v1/sync/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(res.state),
      }).catch(() => {});
    }
    return res;
  }


  function reset() {
    const fresh = seedState();
    ref.current = fresh;
    setState(fresh);
  }

  return <ProcurementContext.Provider value={{ state, dispatch, reset }}>{children}</ProcurementContext.Provider>;
}

export function useProcurement(): ProcurementContextValue {
  const ctx = useContext(ProcurementContext);
  if (!ctx) throw new Error('useProcurement must be used within ProcurementProvider');
  return ctx;
}