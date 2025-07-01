import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiShield } = FiIcons;

const RoleGuard = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true,
  fallback = null 
}) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Check authentication requirement
  if (requireAuth && !user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <SafeIcon icon={FiShield} className="text-slate-600 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-slate-400 mb-6">Please sign in to access this feature.</p>
        </div>
      </div>
    );
  }

  // Check role permissions
  if (allowedRoles.length > 0 && user) {
    const userRole = profile?.role || 'user';
    
    if (!allowedRoles.includes(userRole)) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="text-center">
            <SafeIcon icon={FiShield} className="text-slate-600 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
            <p className="text-slate-400 mb-6">
              You don't have permission to access this feature.
            </p>
            <div className="bg-slate-800/50 rounded-lg p-4 inline-block">
              <p className="text-slate-300 text-sm">
                Your role: <span className="text-blue-400 font-medium">{userRole}</span>
              </p>
              <p className="text-slate-300 text-sm">
                Required: <span className="text-green-400 font-medium">{allowedRoles.join(', ')}</span>
              </p>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default RoleGuard;