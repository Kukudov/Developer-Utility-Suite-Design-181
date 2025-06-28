import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useAuth } from '../../contexts/AuthContext';

const { FiArrowRight, FiArrowLeft, FiCheck, FiUser, FiCode, FiSettings, FiX } = FiIcons;

const OnboardingModal = ({ isOpen, onComplete }) => {
  const { completeOnboarding, updateUserSettings } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [onboardingData, setOnboardingData] = useState({
    fullName: '',
    role: 'developer', // Default to valid role
    experience: 'beginner', // Default to valid experience
    interests: [],
    preferences: {
      theme: 'dark',
      notifications: true,
      autoSave: true
    }
  });

  const steps = [
    { id: 'personal', title: 'Tell us about yourself', icon: FiUser, component: PersonalInfoStep },
    { id: 'role', title: 'What describes you best?', icon: FiCode, component: RoleStep },
    { id: 'preferences', title: 'Set your preferences', icon: FiSettings, component: PreferencesStep }
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Personal Info Step
        return onboardingData.fullName.trim().length > 0 && onboardingData.experience.length > 0;
      case 1: // Role Step
        return onboardingData.role.length > 0;
      case 2: // Preferences Step
        return true; // Always can complete preferences
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    console.log('Complete Setup clicked', { canProceed: canProceed(), loading });
    if (!canProceed() || loading) {
      console.log('Cannot proceed or already loading');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Starting onboarding completion with data:', onboardingData);
      
      // Complete onboarding with profile data
      await completeOnboarding(onboardingData);
      console.log('Onboarding completed successfully');

      // Save user settings/preferences
      const settingsData = {
        theme: onboardingData.preferences.theme,
        notifications: onboardingData.preferences.notifications,
        auto_save: onboardingData.preferences.autoSave,
        sidebar_open: false, // Default sidebar state
        font_size: '16px' // Default font size
      };

      console.log('Saving user settings:', settingsData);
      try {
        await updateUserSettings(settingsData);
        console.log('User settings saved successfully');
      } catch (settingsError) {
        console.warn('Settings save failed, but continuing:', settingsError);
        // Don't fail the entire onboarding for settings issues
      }

      // Apply settings immediately
      applySettings(onboardingData.preferences);
      console.log('Settings applied');

      // Complete the onboarding process
      onComplete();
      console.log('Onboarding process completed');

    } catch (error) {
      console.error('Error completing onboarding:', error);
      let errorMessage = 'Failed to complete setup. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.code === 'PGRST204') {
        errorMessage = 'Database configuration issue. Please contact support.';
      } else if (error.hint) {
        errorMessage = error.hint;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const applySettings = (preferences) => {
    try {
      // Apply theme
      document.documentElement.setAttribute('data-theme', preferences.theme);
      if (preferences.theme === 'light') {
        document.body.classList.remove('dark');
        document.body.classList.add('light');
      } else {
        document.body.classList.remove('light');
        document.body.classList.add('dark');
      }

      // Store preferences in localStorage
      localStorage.setItem('notifications_enabled', preferences.notifications);
      localStorage.setItem('auto_save_enabled', preferences.autoSave);
      console.log('Settings applied successfully');
    } catch (error) {
      console.error('Error applying settings:', error);
    }
  };

  const updateOnboardingData = (updates) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  };

  const handleSkipOnboarding = async () => {
    console.log('Skipping onboarding');
    setLoading(true);
    setError('');

    try {
      // Set minimal defaults and complete
      const defaultData = {
        fullName: 'User',
        role: 'developer',
        experience: 'intermediate',
        interests: [],
        preferences: {
          theme: 'dark',
          notifications: true,
          autoSave: true
        }
      };

      console.log('Completing with default data:', defaultData);
      await completeOnboarding(defaultData);

      // Apply default settings
      applySettings(defaultData.preferences);

      // Complete the onboarding process
      onComplete();
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      setError('Failed to skip setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-800 rounded-xl p-8 w-full max-w-2xl border border-slate-700 relative"
        >
          {/* Close Button */}
          <button
            onClick={handleSkipOnboarding}
            disabled={loading}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700 disabled:opacity-50"
            title="Skip onboarding"
          >
            <SafeIcon icon={FiX} className="text-xl" />
          </button>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index <= currentStep
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-600 text-slate-400'
                  }`}>
                    {index < currentStep ? (
                      <SafeIcon icon={FiCheck} />
                    ) : (
                      <SafeIcon icon={step.icon} />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 ${
                      index < currentStep ? 'bg-purple-500' : 'bg-slate-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <h2 className="text-2xl font-bold text-white">{steps[currentStep].title}</h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Step Content */}
          <div className="mb-8">
            <CurrentStepComponent
              data={onboardingData}
              updateData={updateOnboardingData}
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0 || loading}
              className="flex items-center space-x-2 px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SafeIcon icon={FiArrowLeft} />
              <span>Back</span>
            </button>

            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? 'bg-purple-500' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>

            {currentStep === steps.length - 1 ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSkipOnboarding}
                  disabled={loading}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  Skip
                </button>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Setting up...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Setup</span>
                      <SafeIcon icon={FiCheck} />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed() || loading}
                className="flex items-center space-x-2 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <SafeIcon icon={FiArrowRight} />
              </button>
            )}
          </div>

          {/* Skip Option at bottom */}
          {currentStep < steps.length - 1 && (
            <div className="mt-4 text-center">
              <button
                onClick={handleSkipOnboarding}
                disabled={loading}
                className="text-slate-400 hover:text-white text-sm transition-colors disabled:opacity-50"
              >
                Skip onboarding and use defaults
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Step Components remain the same...
const PersonalInfoStep = ({ data, updateData }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-white font-medium mb-2">
          Full Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={data.fullName}
          onChange={(e) => updateData({ fullName: e.target.value })}
          placeholder="Enter your full name"
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
        />
        {data.fullName.trim().length === 0 && (
          <p className="text-red-400 text-sm mt-1">Please enter your full name</p>
        )}
      </div>

      <div>
        <label className="block text-white font-medium mb-2">
          Experience Level <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {['beginner', 'intermediate', 'advanced'].map((level) => (
            <button
              key={level}
              onClick={() => updateData({ experience: level })}
              className={`p-4 rounded-lg border transition-colors ${
                data.experience === level
                  ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                  : 'border-slate-600 text-slate-400 hover:border-slate-500'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
        {data.experience.length === 0 && (
          <p className="text-red-400 text-sm mt-2">Please select your experience level</p>
        )}
      </div>

      {/* Progress indicator */}
      <div className="mt-6">
        <div className="text-slate-400 text-sm mb-2">
          Step 1 of 3 - {data.fullName.trim().length > 0 && data.experience.length > 0 ? 'Ready to continue!' : 'Please fill in the required fields'}
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((data.fullName.trim().length > 0 ? 1 : 0) + (data.experience.length > 0 ? 1 : 0)) * 50}%`
            }}
          />
        </div>
      </div>
    </div>
  );
};

const RoleStep = ({ data, updateData }) => {
  const roles = [
    { id: 'developer', label: 'Developer', icon: FiIcons.FiCode, desc: 'Frontend, Backend, or Fullstack' },
    { id: 'designer', label: 'Designer', icon: FiIcons.FiPenTool, desc: 'UI/UX, Graphic, or Web Design' },
    { id: 'manager', label: 'Project Manager', icon: FiIcons.FiUsers, desc: 'Team Lead or Product Manager' },
    { id: 'student', label: 'Student', icon: FiIcons.FiBookOpen, desc: 'Learning development or design' },
    { id: 'freelancer', label: 'Freelancer', icon: FiIcons.FiBriefcase, desc: 'Independent contractor' },
    { id: 'other', label: 'Other', icon: FiIcons.FiUser, desc: 'Something else entirely' }
  ];

  const interests = [
    'Web Development', 'Mobile Development', 'Data Science', 'DevOps',
    'UI/UX Design', 'Machine Learning', 'Cybersecurity', 'Blockchain',
    'Game Development', 'Cloud Computing'
  ];

  const toggleInterest = (interest) => {
    const newInterests = data.interests.includes(interest)
      ? data.interests.filter(i => i !== interest)
      : [...data.interests, interest];
    updateData({ interests: newInterests });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-white font-medium mb-4">
          Primary Role <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => updateData({ role: role.id })}
              className={`p-4 rounded-lg border text-left transition-colors ${
                data.role === role.id
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <SafeIcon icon={role.icon} className="text-purple-400" />
                <span className="text-white font-medium">{role.label}</span>
              </div>
              <p className="text-slate-400 text-sm">{role.desc}</p>
            </button>
          ))}
        </div>
        {data.role.length === 0 && (
          <p className="text-red-400 text-sm mt-2">Please select your primary role</p>
        )}
      </div>

      <div>
        <label className="block text-white font-medium mb-4">Interests (Optional)</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {interests.map((interest) => (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`p-2 rounded-lg border text-sm transition-colors ${
                data.interests.includes(interest)
                  ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                  : 'border-slate-600 text-slate-400 hover:border-slate-500'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
        <p className="text-slate-400 text-xs mt-2">
          Selected: {data.interests.length} interests
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mt-6">
        <div className="text-slate-400 text-sm mb-2">
          Step 2 of 3 - {data.role.length > 0 ? 'Ready to continue!' : 'Please select your role'}
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: data.role.length > 0 ? '100%' : '0%' }}
          />
        </div>
      </div>
    </div>
  );
};

const PreferencesStep = ({ data, updateData }) => {
  const updatePreference = (key, value) => {
    updateData({
      preferences: {
        ...data.preferences,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-white font-medium mb-4">Theme Preference</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'dark', label: 'Dark', icon: FiIcons.FiMoon },
            { value: 'light', label: 'Light', icon: FiIcons.FiSun },
            { value: 'auto', label: 'Auto', icon: FiIcons.FiMonitor }
          ].map((theme) => (
            <button
              key={theme.value}
              onClick={() => updatePreference('theme', theme.value)}
              className={`p-4 rounded-lg border transition-colors ${
                data.preferences.theme === theme.value
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <SafeIcon icon={theme.icon} className="text-purple-400 mx-auto mb-2" />
              <span className="text-white text-sm">{theme.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">Enable Notifications</h4>
            <p className="text-slate-400 text-sm">Get updates about new features and tips</p>
          </div>
          <button
            onClick={() => updatePreference('notifications', !data.preferences.notifications)}
            className={`w-12 h-6 rounded-full transition-colors ${
              data.preferences.notifications ? 'bg-purple-500' : 'bg-slate-600'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
              data.preferences.notifications ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">Auto-save Settings</h4>
            <p className="text-slate-400 text-sm">Automatically save your work and preferences</p>
          </div>
          <button
            onClick={() => updatePreference('autoSave', !data.preferences.autoSave)}
            className={`w-12 h-6 rounded-full transition-colors ${
              data.preferences.autoSave ? 'bg-purple-500' : 'bg-slate-600'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
              data.preferences.autoSave ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-6">
        <div className="text-slate-400 text-sm mb-2">
          Step 3 of 3 - Almost done! Review your preferences and complete setup.
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div className="bg-purple-500 h-2 rounded-full w-full" />
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
        <h4 className="text-white font-medium mb-2">Setup Summary</h4>
        <div className="text-sm text-slate-400 space-y-1">
          <p>Name: <span className="text-white">{data.fullName || 'Not set'}</span></p>
          <p>Role: <span className="text-white">{data.role || 'Not set'}</span></p>
          <p>Experience: <span className="text-white">{data.experience || 'Not set'}</span></p>
          <p>Theme: <span className="text-white">{data.preferences.theme}</span></p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;