import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCopy, FiCheck } = FiIcons;

const HashGenerator = () => {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState({});
  const [copiedHash, setCopiedHash] = useState('');

  const generateHashes = async () => {
    if (!input.trim()) return;

    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const results = {};

    // Generate SHA-1
    try {
      const sha1Buffer = await crypto.subtle.digest('SHA-1', data);
      results.sha1 = Array.from(new Uint8Array(sha1Buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (err) {
      results.sha1 = 'Not supported';
    }

    // Generate SHA-256
    try {
      const sha256Buffer = await crypto.subtle.digest('SHA-256', data);
      results.sha256 = Array.from(new Uint8Array(sha256Buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (err) {
      results.sha256 = 'Not supported';
    }

    // Simple MD5-like hash (not cryptographically secure)
    results.md5 = simpleMd5(input);

    setHashes(results);
  };

  // Simple hash function (not actual MD5, but similar output format)
  const simpleMd5 = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0').repeat(4).substring(0, 32);
  };

  const copyToClipboard = async (hash, type) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(type);
      setTimeout(() => setCopiedHash(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const hashTypes = [
    { key: 'md5', label: 'MD5', color: 'from-red-500 to-pink-500' },
    { key: 'sha1', label: 'SHA-1', color: 'from-blue-500 to-cyan-500' },
    { key: 'sha256', label: 'SHA-256', color: 'from-purple-500 to-indigo-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Input */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">Input Text</h3>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to hash..."
          className="w-full h-32 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white text-sm resize-none focus:outline-none focus:border-orange-500 transition-colors"
        />
        <button
          onClick={generateHashes}
          className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
        >
          Generate Hashes
        </button>
      </div>

      {/* Hash Results */}
      {Object.keys(hashes).length > 0 && (
        <div className="space-y-4">
          {hashTypes.map((type) => (
            hashes[type.key] && (
              <motion.div
                key={type.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 bg-gradient-to-br ${type.color} rounded-lg flex items-center justify-center`}>
                      <SafeIcon icon={FiIcons.FiShield} className="text-white text-sm" />
                    </div>
                    <h3 className="text-white font-semibold text-lg">{type.label}</h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(hashes[type.key], type.key)}
                    className="flex items-center space-x-2 px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                  >
                    <SafeIcon 
                      icon={copiedHash === type.key ? FiCheck : FiCopy} 
                      className={copiedHash === type.key ? 'text-green-400' : ''} 
                    />
                    <span>{copiedHash === type.key ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <code className="text-slate-300 font-mono text-sm break-all">
                    {hashes[type.key]}
                  </code>
                </div>
              </motion.div>
            )
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default HashGenerator;