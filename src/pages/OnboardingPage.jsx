import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { OnBoarding } from '@questlabs/react-sdk';
import { useQuestAuth } from '../contexts/QuestAuthContext';
import questConfig from '../config/questConfig';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiTool, FiStar, FiUsers, FiTrendingUp } = FiIcons;

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user, completeOnboarding } = useQuestAuth();
  const [answers, setAnswers] = useState({});

  const getAnswers = () => {
    completeOnboarding();
    navigate('/');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-blue-900 flex">
      {/* Left Section - Visual/Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-blue-500/10 to-cyan-500/20"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>

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
              Let's Get{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">Started!</span>
            </h1>
            <p className="text-slate-300 text-xl leading-relaxed max-w-md mx-auto">
              We're setting up your personalized developer experience
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4 max-w-sm mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex items-center space-x-3 bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50"
            >
              <SafeIcon icon={FiStar} className="text-yellow-400 text-xl" />
              <div className="text-left">
                <h3 className="text-white font-semibold text-sm">Personalized Tools</h3>
                <p className="text-slate-400 text-xs">Customized for your workflow</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex items-center space-x-3 bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50"
            >
              <SafeIcon icon={FiUsers} className="text-blue-400 text-xl" />
              <div className="text-left">
                <h3 className="text-white font-semibold text-sm">Team Collaboration</h3>
                <p className="text-slate-400 text-xs">Share and sync with your team</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-center space-x-3 bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50"
            >
              <SafeIcon icon={FiTrendingUp} className="text-green-400 text-xl" />
              <div className="text-left">
                <h3 className="text-white font-semibold text-sm">Productivity Boost</h3>
                <p className="text-slate-400 text-xs">Streamline your development</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Right Section - Onboarding Component */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 shadow-2xl">
            <div style={{ width: '400px', margin: '0 auto' }}>
              <OnBoarding
                userId={user.userId}
                token={user.token}
                questId={questConfig.QUEST_ONBOARDING_QUESTID}
                answer={answers}
                setAnswer={setAnswers}
                getAnswers={getAnswers}
                accent={questConfig.PRIMARY_COLOR}
                singleChoose="modal1"
                multiChoice="modal2"
              >
                <OnBoarding.Header />
                <OnBoarding.Content />
                <OnBoarding.Footer />
              </OnBoarding>
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
            <h1 className="text-2xl font-bold text-white mb-2">Almost Ready!</h1>
            <p className="text-slate-400">Complete setup to access all features</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingPage;