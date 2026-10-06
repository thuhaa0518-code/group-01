import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon, LockIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProcurement } from '../contexts/ProcurementContext';
import { Logo } from '../components/layout/Logo';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { FormField } from '../components/ui/FormField';
import { inputClass } from '../utils/styles';
import { ROLE_LABEL, ROLE_SUMMARY } from '../utils/permissions';
import { DEMO_PASSWORD } from '../data/users';

interface LocationState {
  from?: string;
  reason?: 'manual' | 'expired' | 'locked';
}

export function LoginPage() {
  const { user, login } = useAuth();
  const { state, reset } = useProcurement();
  const navigate = useNavigate();
  const location = useLocation();
  const locState = (location.state ?? {}) as LocationState;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<'invalid' | 'locked' | 'empty' | null>(null);

  if (user) return <Navigate to={locState.from ?? '/'} replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('empty');
      return;
    }
    setError(null);
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    navigate(locState.from ?? '/', { replace: true });
  };

  const fill = (addr: string) => {
    setEmail(addr);
    setPassword(DEMO_PASSWORD);
    setError(null);
  };

  const demoUsers = state.users;

  return (
    <div className="min-h-screen w-full bg-canvas">
      <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col justify-center px-4 py-12">
        <div className="rounded-lg border border-line bg-surface p-6 shadow-card sm:p-8">
        <Logo size="lg" />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink-900">Đăng nhập</h1>
        <p className="mt-1 text-sm text-ink-700">Nền tảng mua sắm & phê duyệt nội bộ.</p>

        <div className="mt-6 space-y-3" aria-live="polite">
          {locState.reason === 'expired' && <Alert tone="info" title="Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." />}
          {locState.reason === 'locked' && <Alert tone="blocked" title="Tài khoản đang bị khóa. Vui lòng liên hệ Admin." />}
          {locState.reason === 'manual' && <Alert tone="success" title="Bạn đã đăng xuất an toàn." />}
          {error === 'invalid' && <Alert tone="error" title="Tên đăng nhập hoặc mật khẩu không đúng." />}
          {error === 'locked' && <Alert tone="blocked" title="Tài khoản đang bị khóa. Vui lòng liên hệ Admin." />}
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <FormField label="Tên đăng nhập" htmlFor="username" error={error === 'empty' && !email.trim() ? 'Vui lòng nhập tên đăng nhập.' : undefined}>
            <input
                id="username"
                type="text"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ví dụ: employee1, manager1, admin1..."
                className={inputClass(error === 'invalid' || error === 'empty' && !email.trim())}
                disabled={loading} />
              
          </FormField>
          <FormField label="Mật khẩu" htmlFor="password" error={error === 'empty' && !password ? 'Nhập mật khẩu.' : undefined}>
            <div className="relative">
              <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass(error === 'invalid' || error === 'empty' && !password)} pr-10`}
                  disabled={loading} />
                
              <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-ink-500 hover:text-ink-900"
                  aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
                  
                {showPw ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </FormField>
          <Button type="submit" className="w-full" loading={loading}>
            {loading ? 'Đang kiểm tra thông tin đăng nhập...' : 'Login'}
          </Button>
        </form>
        </div>
      </div>
    </div>);
}