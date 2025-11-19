import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
export const Root = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const userRole = useAuthStore(state => state.userRole);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  switch (userRole) {
    case 'manicurist':
      return <Navigate to="/dashboard" replace />;
    case 'client':
      return <Navigate to="/client-dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    default:
      // Fallback if role is somehow null while authenticated
      return <Navigate to="/login" replace />;
  }
};