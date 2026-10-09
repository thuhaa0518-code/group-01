import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Toaster } from 'sonner';
import { ProcurementProvider } from './contexts/ProcurementContext';
import { AuthProvider } from './contexts/AuthContext';
import { RequireAuth } from './components/layout/RequireAuth';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { RequestsPage } from './pages/Requests';
import { RequestFormPage } from './pages/RequestForm';
import { RequestDetailPage } from './pages/RequestDetail';
import { ApprovalsPage } from './pages/Approvals';
import { BudgetReviewPage } from './pages/BudgetReview';
import { SourcingPage } from './pages/Sourcing';
import { SourcingDetailPage } from './pages/SourcingDetail';
import { SuppliersPage } from './pages/Suppliers';
import { OrdersPage } from './pages/Orders';
import { OrderDetailPage } from './pages/OrderDetail';
import { AdminUsersPage } from './pages/admin/Users';
import { AdminCatalogPage } from './pages/admin/Catalog';
import { AuditTrailPage } from './pages/AuditTrail';
import { NotFoundPage } from './pages/NotFound';
import { AssumptionsPage } from './pages/Assumptions';

import { ErrorBoundary } from './components/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <MotionConfig reducedMotion="user">
          <ProcurementProvider>
            <AuthProvider>
              <Toaster position="top-right" richColors closeButton />
              <Routes>
                <Route path="/login" element={<LoginPage />} />
              <Route
                element={
                <RequireAuth>
                    <AppShell />
                  </RequireAuth>
                }>
                
                <Route index element={<DashboardPage />} />
                <Route path="requests" element={<RequireAuth permission="pr.view"><RequestsPage /></RequireAuth>} />
                <Route path="requests/new" element={<RequireAuth permission="pr.create"><RequestFormPage /></RequireAuth>} />
                <Route path="requests/:id" element={<RequireAuth permission="pr.view"><RequestDetailPage /></RequireAuth>} />
                <Route path="requests/:id/edit" element={<RequireAuth permission="pr.create"><RequestFormPage /></RequireAuth>} />
                <Route path="approvals" element={<RequireAuth permission="approval.manager"><ApprovalsPage /></RequireAuth>} />
                <Route path="budget" element={<RequireAuth permission="budget.review"><BudgetReviewPage /></RequireAuth>} />
                <Route path="sourcing" element={<RequireAuth permission="sourcing.manage"><SourcingPage /></RequireAuth>} />
                <Route path="sourcing/:id" element={<RequireAuth permission="sourcing.manage"><SourcingDetailPage /></RequireAuth>} />
                <Route path="suppliers" element={<RequireAuth permission="supplier.view"><SuppliersPage /></RequireAuth>} />
                <Route path="orders" element={<RequireAuth permission="po.view"><OrdersPage /></RequireAuth>} />
                <Route path="orders/:id" element={<RequireAuth permission="po.view"><OrderDetailPage /></RequireAuth>} />
                <Route path="admin/users" element={<RequireAuth permission="admin.users"><AdminUsersPage /></RequireAuth>} />
                <Route path="audit" element={<RequireAuth permission="audit.view"><AuditTrailPage /></RequireAuth>} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </AuthProvider>
        </ProcurementProvider>
      </MotionConfig>
    </BrowserRouter>
  </ErrorBoundary>);
}