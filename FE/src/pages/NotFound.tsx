import React from 'react';
import { Link } from 'react-router-dom';
import { SearchXIcon } from 'lucide-react';
import { buttonClass } from '../components/ui/Button';

export function NotFoundPage({ message = 'Không tìm thấy trang hoặc bản ghi bạn yêu cầu.' }: {message?: string;}) {
  return (
    <div className="flex flex-col items-center px-4 py-20 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-ink-500">
        <SearchXIcon className="h-6 w-6" aria-hidden />
      </span>
      <h1 className="text-xl font-semibold text-ink-900">{message}</h1>
      <p className="mt-2 text-sm text-ink-500">Bản ghi có thể đã bị xóa hoặc đường dẫn không đúng.</p>
      <Link to="/" className={buttonClass('secondary', 'md', 'mt-6')}>
        Về trang tổng quan
      </Link>
    </div>);

}