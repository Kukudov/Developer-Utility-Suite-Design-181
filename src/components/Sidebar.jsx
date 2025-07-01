import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import UserMenu from './auth/UserMenu';
import { useAuth } from '../contexts/AuthContext';

const { FiHome, FiTool, FiBookOpen, FiCode, FiCpu, FiRefreshCw, FiUser, FiMessageSquare, FiShield, FiUsers, FiPlay } = FiIcons;

const Sidebar = ({ onSignInClick, onSettingsClick }) => {
  const location = useLocation();
  const { user, profile } = useAuth();

  const menuItems = [
    { path: '/', icon: FiHome, label: 'Dashboard' },
    { path: '/get-started', icon: FiPlay, label: 'Get Started' },
    { path: '/ai-chat', icon: FiMessageSquare, label: 'AI Chat Agent' },
    { path: '/utilities', icon: FiTool, label: 'Utilities' },
    { path: '/cheatsheets', icon: FiBookOpen, label: 'Cheat Sheets' },
    { path: '/snippets', icon: FiCode, label: 'Code Snippets' },
    { path: '/generators', icon: FiCpu, label: 'Generators' },
    { path: '/converters', icon: FiRefreshCw, label: 'Converters' },
  ];

  // Admin menu items (only shown to admins)
  const adminMenuItems = [
    { path: '/admin', icon: FiShield, label: 'Admin Dashboard' },
    { path: '/admin/users', icon: FiUsers, label: 'User Management' },
  ];

  return (
    <motion.div className="fixed left-0 top-0 h-full w-64 bg-slate-800/95 backdrop-blur-sm border-r border-slate-700 z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
            <img
              src="/devbox-icon.png"
              alt="DevBox"
              className="w-6 h-6 object-contain"
              onError={(e) => {
                // Fallback to icon if image fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <SafeIcon icon={FiTool} className="text-white text-sm hidden" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">DevBox</h1>
            <p className="text-slate-400 text-xs">Ultimate Tools</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-8 px-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <SafeIcon
                  icon={item.icon}
                  className={`text-lg ${
                    isActive ? 'text-white' : 'group-hover:text-white'
                  }`}
                />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          {/* Admin Section */}
          {user && profile?.role === 'admin' && (
            <>
              <div className="pt-6 pb-2">
                <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3">
                  Administration
                </h3>
              </div>
              {adminMenuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <SafeIcon
                      icon={item.icon}
                      className={`text-lg ${
                        isActive ? 'text-white' : 'group-hover:text-white'
                      }`}
                    />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </div>
      </nav>

      {/* User Menu */}
      <div className="p-4 border-t border-slate-700">
        {user ? (
          <UserMenu onSettingsClick={onSettingsClick} />
        ) : (
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-3">Sign in to save your work</p>
            <button
              onClick={onSignInClick}
              className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg transition-colors text-sm"
            >
              Sign In
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4">
        <div className="bg-slate-700/50 rounded-lg p-4 text-center">
          <p className="text-slate-400 text-sm">Made with ❤️ for developers</p>
          <p className="text-slate-500 text-xs mt-1">v1.0.0</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;