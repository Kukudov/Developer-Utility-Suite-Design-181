import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useAuth } from '../../contexts/AuthContext';

const { FiX, FiSend, FiMessageCircle, FiTool, FiBug, FiStar, FiCheck } = FiIcons;

const FeedbackModal = ({ isOpen, onClose }) => {
  const { user, profile, trackActivity } = useAuth();
  const [feedbackType, setFeedbackType] = useState('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const feedbackTypes = [
    { id: 'general', label: 'General Feedback', icon: FiMessageCircle, color: 'text-blue-400' },
    { id: 'tool-request', label: 'New Tool Request', icon: FiTool, color: 'text-purple-400' },
    { id: 'bug-report', label: 'Bug Report', icon: FiBug, color: 'text-red-400' },
    { id: 'feature-request', label: 'Feature Request', icon: FiStar, color: 'text-yellow-400' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call - replace with actual feedback submission
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Track the feedback submission
      if (user) {
        await trackActivity('feedback_submitted', null, {
          type: feedbackType,
          subject: subject,
          hasMessage: message.length > 0
        });
      }

      setSubmitted(true);
      
      // Auto close after showing success
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);

    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFeedbackType('general');
    setSubject('');
    setMessage('');
    setEmail(user?.email || '');
    setSubmitted(false);
  };

  const handleClose = () => {
    onClose();
    if (!submitted) {
      setTimeout(resetForm, 300); // Reset after modal closes
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-800 rounded-xl w-full max-w-lg border border-slate-700 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <SafeIcon icon={FiMessageCircle} className="mr-3 text-purple-400" />
              Send Feedback
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700"
            >
              <SafeIcon icon={FiX} className="text-xl" />
            </button>
          </div>

          {submitted ? (
            // Success State
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 text-center"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiCheck} className="text-green-400 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Thank You!</h3>
              <p className="text-slate-400">
                Your feedback has been submitted successfully. We'll review it and get back to you if needed.
              </p>
            </motion.div>
          ) : (
            // Feedback Form
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Feedback Type */}
              <div>
                <label className="block text-white font-medium mb-3">What type of feedback is this?</label>
                <div className="grid grid-cols-2 gap-3">
                  {feedbackTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFeedbackType(type.id)}
                      className={`p-3 rounded-lg border transition-colors text-left ${
                        feedbackType === type.id
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <SafeIcon icon={type.icon} className={`${type.color} text-sm`} />
                        <span className="text-white text-sm font-medium">{type.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Subject <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={
                    feedbackType === 'tool-request' 
                      ? 'e.g., Password Strength Checker'
                      : feedbackType === 'bug-report'
                      ? 'e.g., JSON formatter not working with large files'
                      : 'Brief description of your feedback'
                  }
                  required
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Details <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    feedbackType === 'tool-request'
                      ? 'Describe the tool you\'d like us to build. What would it do? How would it help your workflow?'
                      : feedbackType === 'bug-report'
                      ? 'Please describe the bug, steps to reproduce it, and what you expected to happen.'
                      : 'Share your thoughts, suggestions, or any details about your feedback.'
                  }
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>

              {/* Email (for non-logged in users) */}
              {!user && (
                <div>
                  <label className="block text-white font-medium mb-2">
                    Email <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <p className="text-slate-400 text-xs mt-1">
                    Leave your email if you'd like us to follow up with you.
                  </p>
                </div>
              )}

              {/* User Info Display (for logged in users) */}
              {user && (
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-slate-400 text-xs">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !subject.trim() || !message.trim()}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <SafeIcon icon={FiSend} />
                    <span>Send Feedback</span>
                  </>
                )}
              </button>

              <p className="text-slate-400 text-xs text-center">
                Your feedback helps us improve DevBox Tools for everyone. Thank you for taking the time to share your thoughts!
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FeedbackModal;