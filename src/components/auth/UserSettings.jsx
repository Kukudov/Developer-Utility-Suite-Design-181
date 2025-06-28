import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useAuth } from '../../contexts/AuthContext';

const { FiX, FiSave, FiSettings, FiMoon, FiSun, FiMonitor, FiKey, FiEye, FiEyeOff } = FiIcons;

const UserSettings = ({ isOpen, onClose }) => {
  const { user, updateUserSettings, getUserSettings } = useAuth();
  const [settings, setSettings] = useState({
    theme: 'dark',
    openrouter_api_key: ''
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadSettings();
    }
  }, [isOpen, user]);

  const loadSettings = async () => {
    try {
      const userSettings = await getUserSettings();
      if (userSettings) {
        setSettings({
          theme: userSettings.theme || 'dark',
          openrouter_api_key: userSettings.openrouter_api_key || ''
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setError('No user logged in');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Saving settings:', settings);
      const settingsToSave = {
        theme: settings.theme,
        openrouter_api_key: settings.openrouter_api_key.trim()
      };

      console.log('Settings to save:', settingsToSave);
      const result = await updateUserSettings(settingsToSave);
      console.log('Save result:', result);

      setSaved(true);
      setError('');
      setTimeout(() => setSaved(false), 2000);

      // Apply theme settings immediately
      applySettings(settings);

      // Close modal after a brief delay
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError(error.message || 'Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applySettings = (newSettings) => {
    // Apply theme
    document.documentElement.setAttribute('data-theme', newSettings.theme);
    if (newSettings.theme === 'light') {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
      document.body.classList.add('dark');
    }
  };

  const updateSetting = (key, value) => {
    console.log('Updating setting:', key, value);
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleApiKeyVisibility = () => {
    setShowApiKey(prev => !prev);
  };

  const maskApiKey = (apiKey) => {
    if (!apiKey) return '';
    if (apiKey.length <= 8) return '*'.repeat(apiKey.length);
    return apiKey.substring(0, 4) + '*'.repeat(apiKey.length - 8) + apiKey.substring(apiKey.length - 4);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl border border-slate-700 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <SafeIcon icon={FiSettings} className="mr-2 text-green-400" />
              Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <SafeIcon icon={FiX} className="text-xl" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Settings Form */}
          <div className="space-y-8">
            {/* Theme Setting */}
            <div>
              <label className="block text-white font-medium mb-3">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'dark', label: 'Dark', icon: FiMoon },
                  { value: 'light', label: 'Light', icon: FiSun },
                  { value: 'auto', label: 'Auto', icon: FiMonitor }
                ].map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => updateSetting('theme', theme.value)}
                    className={`p-3 rounded-lg border transition-colors ${
                      settings.theme === theme.value
                        ? 'border-green-500 bg-green-500/20 text-green-400'
                        : 'border-slate-600 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <SafeIcon icon={theme.icon} className="mx-auto mb-1" />
                    <span className="text-sm">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* OpenRouter API Key Section */}
            <div>
              <div className="flex items-center mb-4">
                <SafeIcon icon={FiKey} className="text-blue-400 mr-2" />
                <h3 className="text-white font-semibold text-lg">OpenRouter API Configuration</h3>
              </div>
              <p className="text-slate-400 text-sm mb-6">
                Configure your OpenRouter API key to enable AI-powered features across DevBox Tools
              </p>

              <div className="space-y-3">
                <label className="block text-white font-medium">
                  OpenRouter API Key
                </label>
                <p className="text-slate-400 text-sm">
                  Access 400+ AI models through OpenRouter - GPT-4, Claude, Gemini, Llama and more
                </p>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={settings.openrouter_api_key || ''}
                    onChange={(e) => updateSetting('openrouter_api_key', e.target.value)}
                    placeholder="sk-or-..."
                    className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={toggleApiKeyVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    <SafeIcon icon={showApiKey ? FiEyeOff : FiEye} className="text-sm" />
                  </button>
                </div>
                {settings.openrouter_api_key && !showApiKey && (
                  <p className="text-green-400 text-xs">
                    ✓ API key configured: {maskApiKey(settings.openrouter_api_key)}
                  </p>
                )}
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs transition-colors inline-flex items-center"
                >
                  Get API Key →
                </a>
              </div>

              {/* OpenRouter Info */}
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="text-blue-400 font-medium mb-2">Why OpenRouter?</h4>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>• Access 400+ AI models with a single API key</li>
                  <li>• Includes GPT-4, Claude, Gemini, Llama, and many free models</li>
                  <li>• API keys are encrypted and stored securely</li>
                  <li>• Keys are only used for your requests and never shared</li>
                  <li>• You can update or remove your key at any time</li>
                  <li>• Cost-effective with competitive pricing and free models</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8">
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <SafeIcon icon={saved ? FiIcons.FiCheck : FiSave} className={saved ? 'text-green-300' : ''} />
              <span>
                {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
              </span>
            </button>
          </div>

          {/* Success Message */}
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg"
            >
              <p className="text-green-400 text-sm text-center">
                Settings saved successfully! Your OpenRouter API key is ready for use.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UserSettings;