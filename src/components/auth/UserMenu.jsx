import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useAuth } from '../../contexts/AuthContext';

const { FiUser, FiSettings, FiHeart, FiActivity, FiLogOut, FiChevronDown } = FiIcons;

const UserMenu = ({ onSettingsClick }) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSettingsClick = () => {
    onSettingsClick();
    setIsOpen(false);
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const menuItems = [
    { icon: FiUser, label: 'Profile', action: () => handleMenuItemClick('/profile') },
    { icon: FiHeart, label: 'Favorites', action: () => handleMenuItemClick('/favorites') },
    { icon: FiActivity, label: 'Activity', action: () => handleMenuItemClick('/activity') },
    { icon: FiSettings, label: 'Settings', action: handleSettingsClick },
    { icon: FiLogOut, label: 'Sign Out', action: handleSignOut, danger: true }
  ];

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors w-full"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-semibold">
            {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
          </span>
        </div>
        <div className="text-left flex-1">
          <p className="text-white text-sm font-medium">
            {profile?.full_name || 'User'}
          </p>
          <p className="text-slate-400 text-xs">{profile?.role || 'Member'}</p>
        </div>
        <SafeIcon icon={FiChevronDown} className="text-slate-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 bottom-full mb-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50"
          >
            <div className="p-4 border-b border-slate-700">
              <p className="text-white font-medium">{profile?.full_name || 'User'}</p>
              <p className="text-slate-400 text-sm">{user.email}</p>
              {profile?.subscription_tier && (
                <span className="inline-block mt-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                  {profile.subscription_tier}
                </span>
              )}
            </div>
            <div className="p-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.action();
                    if (!item.danger && item.label !== 'Settings') setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    item.danger
                      ? 'text-red-400 hover:bg-red-500/20'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <SafeIcon icon={item.icon} className="text-sm" />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;