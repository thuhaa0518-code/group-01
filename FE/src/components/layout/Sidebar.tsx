import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboardIcon, LogOutIcon } from 'lucide-react';
import { navItems } from '../../data/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkQueue } from '../../hooks/useWorkQueue';
import { can, ROLE_LABEL } from '../../utils/permissions';
import { initials } from '../../utils/format';
import { Logo } from './Logo';

export function Sidebar({ onNavigate }: {onNavigate?: () => void;}) {
  const { user, logout } = useAuth();
  const queue = useWorkQueue(user);
  const { pathname } = useLocation();
  if (!user) return null;
  const items = navItems.filter((i) => !i.permission || can(user, i.permission));

  const isActive = (to: string) => {
    if (to === '/requests') return pathname.startsWith('/requests') && pathname !== '/requests/new';
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  const linkClass = (active: boolean) =>
  `group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors duration-150 ease-exp ${
  active ? 'bg-primary-50 text-primary-700' : 'text-ink-700 hover:bg-canvas hover:text-ink-900'}`;


  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 flex-none items-center border-b border-line px-4">
        <Logo />
      </div>

      <nav aria-label="Điều hướng chính" className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-0.5">
          <li>
            <NavLink to="/" onClick={onNavigate} aria-current={pathname === '/' ? 'page' : undefined} className={linkClass(pathname === '/')}>
              <LayoutDashboardIcon className="h-4 w-4 flex-none" aria-hidden />
              <span className="flex-1 truncate font-medium">Việc của tôi</span>
              {queue.filter((q) => !q.blocked).length > 0 &&
              <span className="tabular rounded bg-primary-600 px-1.5 text-2xs font-semibold leading-5 text-white">{queue.filter((q) => !q.blocked).length}</span>
              }
            </NavLink>
          </li>
          {items.map((item) => {
            const active = isActive(item.to);
            const count = item.badgeArea ? queue.filter((q) => q.area === item.badgeArea && !q.blocked).length : 0;
            return (
              <li key={item.to}>
                <NavLink to={item.to} onClick={onNavigate} aria-current={active ? 'page' : undefined} className={linkClass(active)}>
                  <item.icon className="h-4 w-4 flex-none" aria-hidden />
                  <span className="flex-1 truncate font-medium">{item.label}</span>
                  {item.owner && <span className="text-2xs uppercase tracking-wide text-ink-500">{item.owner}</span>}
                  {count > 0 && <span className="tabular rounded bg-canvas px-1.5 text-2xs font-semibold text-ink-700">{count}</span>}
                </NavLink>
              </li>);

          })}
        </ul>
      </nav>

      <div className="flex-none border-t border-line p-2">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
          <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-primary-50 text-2xs font-semibold text-primary-700" aria-hidden>
            {initials(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink-900">{user.name}</p>
            <p className="truncate text-2xs uppercase tracking-wide text-ink-500">
              {ROLE_LABEL[user.role]} · {user.department}
            </p>
          </div>
          <button
            type="button"
            onClick={() => logout('manual')}
            className="rounded-md p-1.5 text-ink-500 transition-colors duration-150 ease-exp hover:bg-danger-50 hover:text-danger-600"
            aria-label="Đăng xuất"
            title="Đăng xuất">
            
            <LogOutIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>);

}