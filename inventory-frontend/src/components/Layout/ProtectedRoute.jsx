import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; 
import LoadingSpinner from '../Common/LoadingSpinner';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles.length > 0 && !hasRole(roles)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;