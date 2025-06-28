import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, requireOnboarding = false }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-slate-400 mb-6">Please sign in to access this feature.</p>
        </div>
      </div>
    );
  }

  if (requireOnboarding && (!profile || !profile.onboarding_completed)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Complete Your Setup</h2>
          <p className="text-slate-400 mb-6">Please complete the onboarding process to continue.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;