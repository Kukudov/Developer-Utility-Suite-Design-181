import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useQuestAuth } from '../contexts/QuestAuthContext';

const { FiUser, FiSettings, FiHeart, FiActivity, FiLogOut, FiChevronDown } = FiIcons;

const QuestUserMenu = () => {
  const { user, logout } = useQuestAuth();
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
      logout();
      setIsOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    { icon: FiUser, label: 'Profile', action: () => console.log('Profile') },
    { icon: FiHeart, label: 'Favorites', action: () => console.log('Favorites') },
    { icon: FiActivity, label: 'Activity', action: () => console.log('Activity') },
    { icon: FiSettings, label: 'Settings', action: () => console.log('Settings') },
    { icon: FiLogOut, label: 'Sign Out', action: handleSignOut, danger: true }
  ];

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-semibold">
            {user.userId?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-white text-sm font-medium">User</p>
          <p className="text-slate-400 text-xs">Member</p>
        </div>
        <SafeIcon icon={FiChevronDown} className="text-slate-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50"
          >
            <div className="p-4 border-b border-slate-700">
              <p className="text-white font-medium">Quest User</p>
              <p className="text-slate-400 text-sm">{user.userId}</p>
              <span className="inline-block mt-1 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                Member
              </span>
            </div>
            <div className="p-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.action();
                    if (!item.danger) setIsOpen(false);
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

export default QuestUserMenu;