import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlus, FiTool, FiBug, FiZap, FiShield, FiStar, FiArrowUp } = FiIcons;

const Changelog = () => {
  const [selectedVersion, setSelectedVersion] = useState(null);

  const changelogEntries = [
    {
      version: '2.1.0',
      date: '2024-01-15',
      type: 'major',
      title: 'Major UI Overhaul & New Tools',
      description: 'Complete redesign of the interface with improved user experience and 5 new developer tools.',
      changes: [
        { type: 'feature', text: 'Added Image Optimizer tool with advanced compression algorithms' },
        { type: 'feature', text: 'New SQL Formatter with syntax highlighting' },
        { type: 'feature', text: 'HTML Formatter and minifier' },
        { type: 'feature', text: 'Enhanced Color Palette Generator with advanced color theory' },
        { type: 'feature', text: 'Added dark/light theme toggle with system preference detection' },
        { type: 'improvement', text: 'Completely redesigned sidebar navigation' },
        { type: 'improvement', text: 'Improved mobile responsiveness across all tools' },
        { type: 'improvement', text: 'Enhanced copy-to-clipboard functionality' },
        { type: 'fix', text: 'Fixed JSON formatter validation issues' },
        { type: 'fix', text: 'Resolved Base64 encoding edge cases' }
      ]
    },
    {
      version: '2.0.5',
      date: '2024-01-08',
      type: 'patch',
      title: 'Security Updates & Bug Fixes',
      description: 'Important security patches and various bug fixes to improve stability.',
      changes: [
        { type: 'security', text: 'Updated all dependencies to latest secure versions' },
        { type: 'security', text: 'Enhanced input sanitization across all tools' },
        { type: 'fix', text: 'Fixed memory leak in Regex Tester' },
        { type: 'fix', text: 'Resolved clipboard permissions on Safari' },
        { type: 'improvement', text: 'Improved error handling for large file uploads' }
      ]
    },
    {
      version: '2.0.0',
      date: '2024-01-01',
      type: 'major',
      title: 'DevBox 2.0 - Complete Rewrite',
      description: 'Major version release with complete codebase rewrite, user accounts, and premium features.',
      changes: [
        { type: 'feature', text: 'User authentication and account management' },
        { type: 'feature', text: 'Favorites system to save frequently used tools' },
        { type: 'feature', text: 'Usage analytics and dashboard' },
        { type: 'feature', text: 'Premium subscription tiers' },
        { type: 'feature', text: 'API access for Pro users' },
        { type: 'feature', text: 'Team collaboration features' },
        { type: 'improvement', text: 'Complete UI/UX redesign with modern design system' },
        { type: 'improvement', text: 'Significantly improved performance' },
        { type: 'improvement', text: 'Better accessibility support' }
      ]
    },
    {
      version: '1.8.2',
      date: '2023-12-15',
      type: 'patch',
      title: 'Performance Improvements',
      description: 'Various performance optimizations and minor feature additions.',
      changes: [
        { type: 'improvement', text: 'Optimized bundle size by 30%' },
        { type: 'improvement', text: 'Faster tool loading times' },
        { type: 'feature', text: 'Added keyboard shortcuts for common actions' },
        { type: 'fix', text: 'Fixed URL encoding special characters' },
        { type: 'fix', text: 'Resolved QR code generation for large text' }
      ]
    },
    {
      version: '1.8.0',
      date: '2023-12-01',
      type: 'minor',
      title: 'New Converter Tools',
      description: 'Added new data conversion tools and improved existing ones.',
      changes: [
        { type: 'feature', text: 'CSS Unit Converter for responsive design' },
        { type: 'feature', text: 'Timestamp Converter with multiple formats' },
        { type: 'feature', text: 'Number Base Converter (binary, hex, octal)' },
        { type: 'improvement', text: 'Enhanced Unit Converter with more units' },
        { type: 'improvement', text: 'Better validation for all converters' }
      ]
    },
    {
      version: '1.7.5',
      date: '2023-11-20',
      type: 'patch',
      title: 'Bug Fixes & Stability',
      description: 'Fixed several reported bugs and improved overall stability.',
      changes: [
        { type: 'fix', text: 'Fixed password generator character exclusions' },
        { type: 'fix', text: 'Resolved UUID generation uniqueness issue' },
        { type: 'fix', text: 'Fixed text diff highlighting edge cases' },
        { type: 'improvement', text: 'Improved error messages across all tools' }
      ]
    }
  ];

  const getTypeInfo = (type) => {
    const types = {
      feature: { icon: FiPlus, color: 'text-green-400', bg: 'bg-green-500/20', label: 'New' },
      improvement: { icon: FiZap, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Improved' },
      fix: { icon: FiBug, color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'Fixed' },
      security: { icon: FiShield, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Security' }
    };
    return types[type] || types.improvement;
  };

  const getVersionTypeInfo = (type) => {
    const types = {
      major: { color: 'from-purple-500 to-pink-500', label: 'Major Release' },
      minor: { color: 'from-blue-500 to-cyan-500', label: 'Minor Release' },
      patch: { color: 'from-green-500 to-emerald-500', label: 'Patch Release' }
    };
    return types[type] || types.patch;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 min-h-screen"
    >
      {/* Header */}
      <div className="text-center mb-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold text-white mb-4"
        >
          Changelog
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-lg max-w-2xl mx-auto"
        >
          Stay up to date with new features, improvements, and fixes in DevBox Tools
        </motion.p>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiStar} className="text-white text-xl" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{changelogEntries.length}</h3>
          <p className="text-slate-400 text-sm">Total Releases</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiPlus} className="text-white text-xl" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">25+</h3>
          <p className="text-slate-400 text-sm">New Features</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiArrowUp} className="text-white text-xl" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">50+</h3>
          <p className="text-slate-400 text-sm">Improvements</p>
        </div>
      </motion.div>

      {/* Changelog Entries */}
      <div className="max-w-4xl mx-auto space-y-8">
        {changelogEntries.map((entry, index) => {
          const versionInfo = getVersionTypeInfo(entry.type);
          const isExpanded = selectedVersion === entry.version;
          
          return (
            <motion.div
              key={entry.version}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden"
            >
              <div
                className="p-6 cursor-pointer hover:bg-slate-700/20 transition-colors"
                onClick={() => setSelectedVersion(isExpanded ? null : entry.version)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`px-3 py-1 bg-gradient-to-r ${versionInfo.color} rounded-full`}>
                        <span className="text-white text-sm font-semibold">v{entry.version}</span>
                      </div>
                      <span className="text-slate-400 text-sm">{entry.date}</span>
                      <span className="text-slate-500 text-xs px-2 py-1 bg-slate-700 rounded">
                        {versionInfo.label}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{entry.title}</h3>
                    <p className="text-slate-400">{entry.description}</p>
                  </div>
                  <div className="ml-4">
                    <SafeIcon 
                      icon={isExpanded ? FiIcons.FiChevronUp : FiIcons.FiChevronDown} 
                      className="text-slate-400" 
                    />
                  </div>
                </div>
              </div>

              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-slate-700 p-6"
                >
                  <h4 className="text-white font-semibold mb-4">What's Changed</h4>
                  <div className="space-y-3">
                    {entry.changes.map((change, changeIndex) => {
                      const typeInfo = getTypeInfo(change.type);
                      return (
                        <motion.div
                          key={changeIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: changeIndex * 0.05 }}
                          className="flex items-start space-x-3"
                        >
                          <div className={`p-1 rounded ${typeInfo.bg} mt-0.5`}>
                            <SafeIcon icon={typeInfo.icon} className={`text-xs ${typeInfo.color}`} />
                          </div>
                          <div className="flex-1">
                            <span className="text-slate-300">{change.text}</span>
                            <span className={`ml-2 text-xs ${typeInfo.color} font-medium`}>
                              {typeInfo.label}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center mt-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-8 border border-purple-500/30"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Stay Updated</h2>
        <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
          Want to be notified when we release new features? Sign up for our newsletter or follow us on social media.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors">
            Subscribe to Updates
          </button>
          <button className="px-6 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors">
            Follow on Twitter
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Changelog;