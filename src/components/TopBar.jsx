import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';

const { FiSettings, FiUser, FiDollarSign, FiClock, FiHelpCircle } = FiIcons;

const TopBar = ({ onSettingsClick, onSignInClick }) => {
  const { user, profile } = useAuth();
  const location = useLocation();

  const navigationItems = [
    { path: '/pricing', label: 'Pricing', icon: FiDollarSign },
    { path: '/changelog', label: 'Changelog', icon: FiClock },
    { path: '/faqs', label: 'FAQs', icon: FiHelpCircle },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 right-0 left-64 h-[76px] bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 z-30 flex items-center justify-between px-6"
    >
      {/* Left side - Navigation only */}
      <div className="flex items-center space-x-6">
        {/* Direct Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-green-500/20 text-green-400'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <SafeIcon icon={item.icon} className="text-sm" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Navigation Menu */}
        <div className="md:hidden">
          <select
            value={location.pathname}
            onChange={(e) => (window.location.hash = e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
          >
            <option value="">Navigate...</option>
            {navigationItems.map((item) => (
              <option key={item.path} value={item.path}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right side - Settings and User */}
      <div className="flex items-center space-x-4">
        {/* Settings Button */}
        <button
          onClick={onSettingsClick}
          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Settings"
        >
          <SafeIcon icon={FiSettings} className="text-lg" />
        </button>

        {/* User Info */}
        {user ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="hidden lg:block text-right">
              <p className="text-white text-sm font-medium">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-slate-400 text-xs">{profile?.role || 'Member'}</p>
            </div>
          </div>
        ) : (
          <button
            onClick={onSignInClick}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg transition-colors"
          >
            <SafeIcon icon={FiUser} className="text-sm" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default TopBar;