import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlertIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABEL } from '../utils/permissions';
import { buttonClass } from '../components/ui/Button';

export function UnauthorizedPage() {
  const { user } = useAuth();
  return (
    <div className="flex flex-col items-center px-4 py-20 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-50 text-danger-600">
        <ShieldAlertIcon className="h-6 w-6" aria-hidden />
      </span>
      <h1 className="text-xl font-semibold text-ink-900">Bạn không có quyền truy cập màn hình này.</h1>
      <p className="mt-2 max-w-md text-sm text-ink-500">
        {user ? `Vai trò ${ROLE_LABEL[user.role]} không được phân quyền cho chức năng này. ` : ''}Nếu bạn cần quyền truy cập, vui lòng liên hệ Admin.
      </p>
      <Link to="/" className={buttonClass('secondary', 'md', 'mt-6')}>
        Về trang tổng quan
      </Link>
    </div>);

}