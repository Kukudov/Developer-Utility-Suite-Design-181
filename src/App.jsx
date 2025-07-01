import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestProvider } from '@questlabs/react-sdk';
import '@questlabs/react-sdk/dist/style.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import questConfig from './config/questConfig';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import FeedbackButton from './components/FeedbackButton';

import Dashboard from './pages/Dashboard';
import GetStarted from './pages/GetStarted';
import AiChatAgent from './pages/AiChatAgent';
import Utilities from './pages/Utilities';
import CheatSheets from './pages/CheatSheets';
import CodeSnippets from './pages/CodeSnippets';
import Generators from './pages/Generators';
import Converters from './pages/Converters';
import Pricing from './pages/Pricing';
import Changelog from './pages/Changelog';
import FAQs from './pages/FAQs';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import Activity from './pages/Activity';

// Admin components
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import RoleGuard from './components/admin/RoleGuard';
import LoginModal from './components/auth/LoginModal';
import OnboardingModal from './components/auth/OnboardingModal';
import UserSettings from './components/auth/UserSettings';
import LoadingSpinner from './components/common/LoadingSpinner';
import './App.css';

// Main App Component wrapped with Auth
function AppContent() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { user, profile, loading, getUserSettings } = useAuth();
  const [userSettings, setUserSettings] = useState(null);

  // Load user settings and apply them
  useEffect(() => {
    if (user && !loading) {
      loadUserSettings();
    }
  }, [user, loading]);

  // Check if onboarding is needed
  useEffect(() => {
    if (user && profile && !profile.onboarding_completed && !showOnboardingModal && !loading) {
      const timer = setTimeout(() => {
        setShowOnboardingModal(true);
      }, 1000); // Small delay to ensure everything is loaded
      return () => clearTimeout(timer);
    }
  }, [user, profile, showOnboardingModal, loading]);

  const loadUserSettings = async () => {
    try {
      const settings = await getUserSettings();
      if (settings) {
        setUserSettings(settings);
        applyUserSettings(settings);
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const applyUserSettings = (settings) => {
    // Apply theme
    if (settings.theme) {
      document.documentElement.setAttribute('data-theme', settings.theme);
      if (settings.theme === 'light') {
        document.body.classList.remove('dark');
        document.body.classList.add('light');
      } else {
        document.body.classList.remove('light');
        document.body.classList.add('dark');
      }
    }

    // Apply font size
    if (settings.font_size) {
      document.documentElement.style.fontSize = settings.font_size;
    }

    // Apply other preferences
    if (settings.notifications !== undefined) {
      localStorage.setItem('notifications_enabled', settings.notifications);
    }
    if (settings.auto_save !== undefined) {
      localStorage.setItem('auto_save_enabled', settings.auto_save);
    }
  };

  const handleSignInClick = () => {
    setShowLoginModal(true);
  };

  const handleSettingsClick = () => {
    setShowSettingsModal(true);
  };

  // Show loading screen only while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-blue-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading DevBox Tools..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-blue-900">
      {/* Fixed Sidebar */}
      <Sidebar onSignInClick={handleSignInClick} onSettingsClick={handleSettingsClick} />

      {/* Top Bar */}
      <TopBar onSettingsClick={handleSettingsClick} onSignInClick={handleSignInClick} />

      {/* Main Content */}
      <div className="ml-64 pt-[76px]">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/ai-chat" element={<AiChatAgent />} />
            <Route path="/utilities" element={<Utilities />} />
            <Route path="/cheatsheets" element={<CheatSheets />} />
            <Route path="/snippets" element={<CodeSnippets />} />
            <Route path="/generators" element={<Generators />} />
            <Route path="/converters" element={<Converters />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/activity" element={<Activity />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <RoleGuard allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RoleGuard allowedRoles={['admin']}>
                  <UserManagement />
                </RoleGuard>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>

      {/* Floating Feedback Button */}
      <FeedbackButton />

      {/* Auth Modals */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <OnboardingModal
        isOpen={showOnboardingModal}
        onComplete={() => setShowOnboardingModal(false)}
      />

      {/* Settings Modal - Now outside sidebar */}
      <UserSettings isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </div>
  );
}

function App() {
  return (
    <QuestProvider
      apiKey={questConfig.APIKEY}
      entityId={questConfig.ENTITYID}
      apiType="PRODUCTION"
    >
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </QuestProvider>
  );
}

export default App;