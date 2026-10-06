import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types/procurement';
import { useProcurement } from './ProcurementContext';
import { logAuth } from '../utils/procurementActions';

const SESSION_KEY = 'procureai-session';
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

type LoginError = 'invalid' | 'locked';
export type LogoutReason = 'manual' | 'expired' | 'locked';

interface Session {
  userId: string;
  lastActive: number;
}

interface AuthContextValue {
  user: User | null;
  expiredOnLoad: boolean;
  login: (email: string, password: string) => Promise<{ok: true;} | {ok: false;error: LoginError;}>;
  logout: (reason?: LogoutReason) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readSession(): {session: Session | null;expired: boolean;} {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return { session: null, expired: false };
    const s = JSON.parse(raw) as Session;
    if (Date.now() - s.lastActive > SESSION_TIMEOUT_MS) {
      window.localStorage.removeItem(SESSION_KEY);
      return { session: null, expired: true };
    }
    return { session: s, expired: false };
  } catch {
    return { session: null, expired: false };
  }
}

export function AuthProvider({ children }: {children: ReactNode;}) {
  const { state, dispatch } = useProcurement();
  const navigate = useNavigate();
  const [initial] = useState(readSession);
  const [session, setSession] = useState<Session | null>(initial.session);
  const [expiredOnLoad, setExpiredOnLoad] = useState(initial.expired);
  const lastActiveRef = useRef(Date.now());

  const user = session ? state.users.find((u) => u.id === session.userId) ?? null : null;

  const logout = useCallback(
    (reason: LogoutReason = 'manual') => {
      if (user) {
        const action = reason === 'manual' ? 'Đăng xuất' : reason === 'expired' ? 'Phiên đăng nhập hết hạn' : 'Buộc đăng xuất (tài khoản bị khóa)';
        dispatch(logAuth, user, action);
      }
      window.localStorage.removeItem(SESSION_KEY);
      setSession(null);
      navigate('/login', { replace: true, state: { reason } });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, navigate]
  );

  const logoutRef = useRef(logout);
  logoutRef.current = logout;

  const login = useCallback<AuthContextValue['login']>(
    async (email, password) => {
      const target = email.trim().toLowerCase();
      const found = state.users.find(
        (u) =>
          u.email.toLowerCase() === target ||
          (u.username && u.username.toLowerCase() === target) ||
          u.id.toLowerCase() === target
      );
      if (!found || found.password !== password) return { ok: false, error: 'invalid' };
      if (found.locked) return { ok: false, error: 'locked' };
      const s: Session = { userId: found.id, lastActive: Date.now() };
      lastActiveRef.current = s.lastActive;
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      setExpiredOnLoad(false);
      setSession(s);
      dispatch(logAuth, found, 'Đăng nhập');
      return { ok: true };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.users]
  );

  useEffect(() => {
    if (!session) return;
    const markActive = () => {
      lastActiveRef.current = Date.now();
    };
    const events: (keyof WindowEventMap)[] = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, markActive, { passive: true }));
    const timer = window.setInterval(() => {
      if (Date.now() - lastActiveRef.current > SESSION_TIMEOUT_MS) {
        logoutRef.current('expired');
      } else {
        window.localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: session.userId, lastActive: lastActiveRef.current }));
      }
    }, 15_000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, markActive));
      window.clearInterval(timer);
    };
  }, [session]);

  useEffect(() => {
    if (user?.locked) logoutRef.current('locked');
  }, [user?.locked]);

  return <AuthContext.Provider value={{ user, expiredOnLoad, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useCurrentUser(): User {
  const { user } = useAuth();
  if (!user) throw new Error('No authenticated user');
  return user;
}