import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import GetStartedComponent from '../components/GetStartedComponent';
import { useAuth } from '../contexts/AuthContext';

const { FiPlay, FiStar, FiArrowRight } = FiIcons;

const GetStarted = () => {
  const { user, trackActivity } = useAuth();

  useEffect(() => {
    if (user) {
      trackActivity('getstarted_viewed');
    }
  }, [user, trackActivity]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 min-h-screen"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
          <SafeIcon icon={FiPlay} className="mr-3 text-green-400" />
          Get Started with DevBox Tools
        </h1>
        <p className="text-slate-400 text-lg">
          Complete these quick steps to unlock the full potential of your developer toolkit
        </p>
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
            <SafeIcon icon={FiIcons.FiTool} className="text-white text-xl" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">50+ Developer Tools</h3>
          <p className="text-slate-400 text-sm">
            Access a comprehensive collection of utilities for encoding, formatting, generating, and converting data.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
            <SafeIcon icon={FiStar} className="text-white text-xl" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">Save Favorites</h3>
          <p className="text-slate-400 text-sm">
            Mark your most-used tools as favorites and access them quickly from your personalized dashboard.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center mb-4">
            <SafeIcon icon={FiIcons.FiZap} className="text-white text-xl" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">AI-Powered Chat</h3>
          <p className="text-slate-400 text-sm">
            Get instant help with specialized AI agents for web scraping, research, YouTube analysis, and more.
          </p>
        </motion.div>
      </div>

      {/* GetStarted Component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-semibold text-white mb-2">Quick Setup Guide</h2>
          <p className="text-slate-400">
            Follow these interactive steps to get the most out of DevBox Tools
          </p>
        </div>
        
        <div className="p-6">
          <GetStartedComponent />
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold text-lg mb-4">Popular Tools</h3>
          <div className="space-y-3">
            {[
              { name: 'JSON Formatter', path: '/utilities' },
              { name: 'Password Generator', path: '/generators' },
              { name: 'Base64 Encoder', path: '/utilities' },
              { name: 'Color Palette Generator', path: '/generators' }
            ].map((tool, index) => (
              <div key={tool.name} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                <span className="text-slate-300">{tool.name}</span>
                <SafeIcon icon={FiArrowRight} className="text-slate-400" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
          <div className="space-y-3">
            {[
              { name: 'Explore All Tools', path: '/utilities' },
              { name: 'AI Chat Agent', path: '/ai-chat' },
              { name: 'Developer Cheat Sheets', path: '/cheatsheets' },
              { name: 'Code Snippets', path: '/snippets' }
            ].map((link, index) => (
              <div key={link.name} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                <span className="text-slate-300">{link.name}</span>
                <SafeIcon icon={FiArrowRight} className="text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GetStarted;