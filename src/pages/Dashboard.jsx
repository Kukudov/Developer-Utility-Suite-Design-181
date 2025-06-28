import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';

const { FiTool, FiBookOpen, FiCode, FiCpu, FiRefreshCw, FiTrendingUp, FiUsers, FiStar, FiHeart, FiExternalLink } = FiIcons;

const Dashboard = () => {
  const { user, profile, favorites, trackActivity } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      trackActivity('dashboard_visit');
    }
  }, [user]);

  const stats = [
    { label: 'Total Tools', value: '50+', icon: FiTool, color: 'from-green-500 to-blue-500' },
    { label: 'Code Snippets', value: '200+', icon: FiCode, color: 'from-blue-500 to-cyan-500' },
    { label: 'Cheat Sheets', value: '30+', icon: FiBookOpen, color: 'from-cyan-500 to-teal-500' },
    { label: 'Daily Users', value: '1.2K+', icon: FiUsers, color: 'from-teal-500 to-green-500' },
  ];

  const quickAccess = [
    {
      title: 'Text Utilities',
      description: 'Format, encode, decode text',
      icon: FiTool,
      path: '/utilities',
      color: 'from-green-500 to-blue-500'
    },
    {
      title: 'Code Generators',
      description: 'Generate boilerplate code',
      icon: FiCpu,
      path: '/generators',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Data Converters',
      description: 'Convert between formats',
      icon: FiRefreshCw,
      path: '/converters',
      color: 'from-cyan-500 to-teal-500'
    },
    {
      title: 'Quick Reference',
      description: 'Handy cheat sheets',
      icon: FiBookOpen,
      path: '/cheatsheets',
      color: 'from-teal-500 to-green-500'
    },
  ];

  const recentTools = [
    'JSON Formatter',
    'Base64 Encoder',
    'Color Picker',
    'UUID Generator',
    'Hash Generator'
  ];

  // Tool mapping for navigation
  const toolRoutes = {
    'JSON Formatter': '/utilities',
    'Base64 Encoder': '/utilities',
    'Color Picker': '/generators',
    'UUID Generator': '/generators',
    'Hash Generator': '/utilities',
    'Password Generator': '/generators',
    'QR Code Generator': '/utilities',
    'Regex Tester': '/utilities',
    'Text Diff Checker': '/utilities',
    'SQL Formatter': '/utilities',
    'HTML Formatter': '/utilities',
    'Image Optimizer': '/utilities',
    'Unit Converter': '/converters',
    'Timestamp Converter': '/converters',
    'Number Base Converter': '/converters',
    'CSS Unit Converter': '/converters',
    'Color Palette Generator': '/generators',
    'Lorem Ipsum Generator': '/generators'
  };

  const handleFavoriteClick = (toolName) => {
    const route = toolRoutes[toolName] || '/utilities';
    if (user) {
      trackActivity('favorite_tool_clicked', toolName);
    }
    navigate(route);
  };

  const greeting = profile?.full_name
    ? `Welcome back, ${profile.full_name.split(' ')[0]}!`
    : user
    ? 'Welcome back!'
    : 'Welcome to DevBox Tools';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 min-h-screen"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          {greeting}
        </h1>
        <p className="text-slate-400 text-lg">
          {user
            ? 'Your ultimate web-based utility belt for development tasks'
            : 'Your ultimate web-based utility belt for development tasks. Sign in to save favorites and track your usage.'
          }
        </p>
        {profile?.subscription_tier && (
          <div className="mt-2">
            <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
              {profile.subscription_tier} Plan
            </span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                <SafeIcon icon={stat.icon} className="text-white text-xl" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Access */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickAccess.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            >
              <Link
                to={item.path}
                className="block bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300 group hover:scale-105"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <SafeIcon icon={item.icon} className="text-white text-xl" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dynamic Content based on user status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Favorites or Recent Tools */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center">
              <SafeIcon icon={user ? FiHeart : FiTrendingUp} className={`mr-2 ${user ? 'text-red-400' : 'text-green-400'}`} />
              {user ? 'Your Favorites' : 'Popular Tools'}
            </h3>
            {user && favorites.length > 0 && (
              <span className="text-slate-400 text-sm">
                {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {user && favorites.length > 0 ? (
            <div className="space-y-3">
              {favorites.slice(0, 5).map((favorite, index) => (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleFavoriteClick(favorite.tool_name)}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiHeart} className="text-red-400" />
                    <span className="text-slate-300 group-hover:text-white transition-colors">
                      {favorite.tool_name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500 text-xs">
                      {new Date(favorite.created_at).toLocaleDateString()}
                    </span>
                    <SafeIcon icon={FiExternalLink} className="text-slate-500 group-hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                </motion.div>
              ))}
              {favorites.length > 5 && (
                <div className="text-center pt-2">
                  <span className="text-slate-400 text-sm">
                    +{favorites.length - 5} more favorites
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {user && favorites.length === 0 ? (
                <div className="text-center py-8">
                  <SafeIcon icon={FiHeart} className="text-slate-600 text-4xl mx-auto mb-4" />
                  <p className="text-slate-400 text-sm mb-2">No favorites yet</p>
                  <p className="text-slate-500 text-xs">
                    Start exploring tools and click the ❤️ to add your favorites!
                  </p>
                  <Link
                    to="/utilities"
                    className="inline-block mt-4 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                  >
                    Explore Tools
                  </Link>
                </div>
              ) : (
                recentTools.map((tool, index) => (
                  <div
                    key={tool}
                    onClick={() => handleFavoriteClick(tool)}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiStar} className="text-yellow-400" />
                      <span className="text-slate-300 group-hover:text-white transition-colors">{tool}</span>
                    </div>
                    <SafeIcon icon={FiExternalLink} className="text-slate-500 group-hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                ))
              )}
            </div>
          )}
        </motion.div>

        {/* Features or User Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
        >
          <h3 className="text-xl font-bold text-white mb-4">
            {user ? 'Your Account' : 'Key Features'}
          </h3>

          {user && profile ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {profile.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <h4 className="text-white font-medium">{profile.full_name || 'User'}</h4>
                  <p className="text-slate-400 text-sm">{user.email}</p>
                  <p className="text-slate-400 text-sm capitalize">{profile.role || 'Member'}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Member since</span>
                  <span className="text-white">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-slate-400">Subscription</span>
                  <span className="text-green-400 capitalize">
                    {profile.subscription_tier || 'Free'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-slate-400">Favorites</span>
                  <span className="text-red-400">
                    {favorites.length} tool{favorites.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="text-white font-medium">50+ Developer Tools</h4>
                  <p className="text-slate-400 text-sm">Comprehensive collection of utilities</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="text-white font-medium">Save Favorites & History</h4>
                  <p className="text-slate-400 text-sm">Track your most-used tools (requires sign in)</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="text-white font-medium">Interactive Cheat Sheets</h4>
                  <p className="text-slate-400 text-sm">Quick reference guides</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="text-white font-medium">No Installation Required</h4>
                  <p className="text-slate-400 text-sm">Works directly in your browser</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;