import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import FeedbackModal from './auth/FeedbackModal';

const { FiMessageCircle, FiX } = FiIcons;

const FeedbackButton = () => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Floating Feedback Button - Moved down 100px from previous position */}
      <motion.div
        className="fixed bottom-32 right-6 z-50"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 1 }}
      >
        <motion.button
          onClick={() => setShowFeedbackModal(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group relative bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <SafeIcon icon={FiMessageCircle} className="text-xl" />

          {/* Tooltip */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: 10, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.9 }}
                className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-slate-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg border border-slate-700 whitespace-nowrap"
              >
                Send Feedback
                {/* Arrow */}
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-slate-800 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse Animation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-blue-500 opacity-30 animate-ping"></div>
        </motion.button>
      </motion.div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </>
  );
};

export default FeedbackButton;