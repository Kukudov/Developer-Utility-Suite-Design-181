import React from 'react';
import { Navigate } from 'react-router-dom';
import { useQuestAuth } from '../contexts/QuestAuthContext';
import LoadingSpinner from './common/LoadingSpinner';

const ProtectedRoute = ({ children, requireOnboarding = false }) => {
  const { isAuthenticated, isOnboarded, loading } = useQuestAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireOnboarding && !isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default ProtectedRoute;