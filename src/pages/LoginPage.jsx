import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QuestLogin } from '@questlabs/react-sdk';
import { useQuestAuth } from '../contexts/QuestAuthContext';
import questConfig from '../config/questConfig';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiTool, FiCode, FiZap, FiShield } = FiIcons;

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useQuestAuth();

  const handleLogin = ({ userId, token, newUser }) => {
    login({ userId, token, newUser });
    if (newUser) {
      navigate('/onboarding');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-blue-900 flex">
      {/* Left Section - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-blue-500/10 to-cyan-500/20"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-green-500/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-xl"></div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center"
        >
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <img 
                src="/devbox-icon.png" 
                alt="DevBox" 
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <SafeIcon icon={FiTool} className="text-white text-3xl hidden" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Welcome to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">DevBox</span>
            </h1>
            <p className="text-slate-300 text-xl leading-relaxed max-w-md mx-auto">
              Your ultimate web-based utility belt for development tasks
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700"
            >
              <SafeIcon icon={FiCode} className="text-green-400 text-2xl mb-2" />
              <h3 className="text-white font-semibold text-sm">50+ Tools</h3>
              <p className="text-slate-400 text-xs">Essential utilities</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700"
            >
              <SafeIcon icon={FiZap} className="text-blue-400 text-2xl mb-2" />
              <h3 className="text-white font-semibold text-sm">Lightning Fast</h3>
              <p className="text-slate-400 text-xs">Instant results</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700"
            >
              <SafeIcon icon={FiShield} className="text-cyan-400 text-2xl mb-2" />
              <h3 className="text-white font-semibold text-sm">Secure</h3>
              <p className="text-slate-400 text-xs">Privacy focused</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700"
            >
              <SafeIcon icon={FiTool} className="text-teal-400 text-2xl mb-2" />
              <h3 className="text-white font-semibold text-sm">No Install</h3>
              <p className="text-slate-400 text-xs">Browser-based</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Right Section - Authentication */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
              <p className="text-slate-400">Access your developer toolkit</p>
            </div>

            <div style={{ width: '400px', margin: '0 auto' }}>
              <QuestLogin
                onSubmit={handleLogin}
                email={true}
                google={false}
                accent={questConfig.PRIMARY_COLOR}
              />
            </div>
          </div>

          {/* Mobile Branding */}
          <div className="lg:hidden mt-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <img 
                src="/devbox-icon.png" 
                alt="DevBox" 
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <SafeIcon icon={FiTool} className="text-white text-2xl hidden" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">DevBox Tools</h1>
            <p className="text-slate-400">Your ultimate developer utility belt</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;