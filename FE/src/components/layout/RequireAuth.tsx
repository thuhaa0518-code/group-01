import React from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { can } from '../../utils/permissions';
import type { Permission } from '../../utils/permissions';
import { UnauthorizedPage } from '../../pages/Unauthorized';

interface RequireAuthProps {
  permission?: Permission;
  children: ReactNode;
}

export function RequireAuth({ permission, children }: RequireAuthProps) {
  const { user, expiredOnLoad } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname, reason: expiredOnLoad ? 'expired' : undefined }} />;
  }
  if (permission && !can(user, permission)) return <UnauthorizedPage />;
  return <>{children}</>;
}