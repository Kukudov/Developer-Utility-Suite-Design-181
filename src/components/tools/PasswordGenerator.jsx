import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCopy, FiCheck, FiRefreshCw, FiShield } = FiIcons;

const PasswordGenerator = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
  });
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    let charset = '';
    
    if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (options.numbers) charset += '0123456789';
    if (options.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (options.excludeSimilar) {
      charset = charset.replace(/[il1Lo0O]/g, '');
    }
    
    if (!charset) return;
    
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    setPassword(result);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getStrengthInfo = () => {
    if (!password) return { strength: 0, label: 'No password', color: 'bg-gray-500' };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    if (score <= 2) return { strength: score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { strength: score, label: 'Medium', color: 'bg-yellow-500' };
    return { strength: score, label: 'Strong', color: 'bg-green-500' };
  };

  const strengthInfo = getStrengthInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Controls */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-6">Password Options</h3>
        
        {/* Length */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-2">
            Password Length: {length}
          </label>
          <input
            type="range"
            min="4"
            max="64"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-slate-400 text-sm mt-1">
            <span>4</span>
            <span>64</span>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[
            { key: 'uppercase', label: 'Uppercase (A-Z)' },
            { key: 'lowercase', label: 'Lowercase (a-z)' },
            { key: 'numbers', label: 'Numbers (0-9)' },
            { key: 'symbols', label: 'Symbols (!@#$...)' },
            { key: 'excludeSimilar', label: 'Exclude Similar (il1Lo0O)' },
          ].map((option) => (
            <label key={option.key} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options[option.key]}
                onChange={(e) => setOptions({ ...options, [option.key]: e.target.checked })}
                className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
              />
              <span className="text-slate-300">{option.label}</span>
            </label>
          ))}
        </div>

        <button
          onClick={generatePassword}
          className="flex items-center space-x-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
        >
          <SafeIcon icon={FiRefreshCw} />
          <span>Generate Password</span>  
        </button>
      </div>

      {/* Generated Password */}
      {password && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">Generated Password</h3>
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
            >
              <SafeIcon icon={copied ? FiCheck : FiCopy} className={copied ? 'text-green-400' : ''} />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
            <code className="text-green-400 font-mono text-lg break-all">
              {password}
            </code>
          </div>

          {/* Strength Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Password Strength</span>
              <span className={`text-sm font-medium ${
                strengthInfo.label === 'Strong' ? 'text-green-400' :
                strengthInfo.label === 'Medium' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {strengthInfo.label}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${strengthInfo.color}`}
                style={{ width: `${(strengthInfo.strength / 6) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tips */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
          <SafeIcon icon={FiShield} className="mr-2 text-blue-400" />
          Security Tips
        </h3>
        <ul className="space-y-2 text-slate-300 text-sm">
          <li>• Use at least 12 characters for better security</li>
          <li>• Include a mix of uppercase, lowercase, numbers, and symbols</li>
          <li>• Don't reuse passwords across multiple accounts</li>
          <li>• Consider using a password manager</li>
          <li>• Enable two-factor authentication when possible</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default PasswordGenerator;