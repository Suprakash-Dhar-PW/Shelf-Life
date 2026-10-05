import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // If we don't have token in context, but it's in localStorage, 
  // the context might be hydrating. Wait, we initialized state synchronously?
  // Our context uses useState which is initialized to null, but we have useEffect for storage.
  // Actually, we should initialize state directly from localStorage to prevent flash of login.
  
  // Checking local storage directly here as a fallback, 
  // or better: let context be the source of truth.
  const isAuth = isAuthenticated || !!localStorage.getItem('token');

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
