import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import React, { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/i18n'; // Initialize i18n
import '@/index.css'
import { Root } from '@/components/Root';
import { LoginPage } from '@/pages/LoginPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppShell } from '@/components/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { SchedulePage } from '@/pages/SchedulePage';
import { PublicBookingPage } from '@/pages/PublicBookingPage';
import { AppointmentsPage } from '@/pages/AppointmentsPage';
import { RewardsPage } from '@/pages/RewardsPage';
import { ClientsPage } from '@/pages/ClientsPage';
import { AdminShell } from '@/components/AdminShell';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminManicuristsPage } from '@/pages/admin/AdminManicuristsPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';
import { AdminSubscriptionsPage } from '@/pages/admin/AdminSubscriptionsPage';
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/book/:manicuristId",
    element: <PublicBookingPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "/",
        element: <AppShell />,
        children: [
          { path: "dashboard", element: <DashboardPage /> },
          { path: "services", element: <ServicesPage /> },
          { path: "schedule", element: <SchedulePage /> },
          { path: "appointments", element: <AppointmentsPage /> },
          { path: "rewards", element: <RewardsPage /> },
          { path: "clients", element: <ClientsPage /> },
        ]
      },
      {
        path: "/admin",
        element: <AdminShell />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: "dashboard", element: <AdminDashboardPage /> },
          { path: "manicurists", element: <AdminManicuristsPage /> },
          { path: "subscriptions", element: <AdminSubscriptionsPage /> },
          { path: "settings", element: <AdminSettingsPage /> },
        ]
      },
    ]
  },
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ErrorBoundary>
    </Suspense>
  </StrictMode>,
)