import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCopy, FiCheck, FiRefreshCw } = FiIcons;

const UuidGenerator = () => {
  const [uuids, setUuids] = useState([]);
  const [count, setCount] = useState(1);
  const [copiedIndex, setCopiedIndex] = useState(-1);

  const generateUuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const generateUuids = () => {
    const newUuids = [];
    for (let i = 0; i < count; i++) {
      newUuids.push(generateUuid());
    }
    setUuids(newUuids);
  };

  const copyToClipboard = async (uuid, index) => {
    try {
      await navigator.clipboard.writeText(uuid);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(-1), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copyAllUuids = async () => {
    try {
      await navigator.clipboard.writeText(uuids.join('\n'));
      setCopiedIndex(-2);
      setTimeout(() => setCopiedIndex(-1), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Controls */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-white font-medium mb-2">Number of UUIDs</label>
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            onClick={generateUuids}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <SafeIcon icon={FiRefreshCw} />
            <span>Generate</span>
          </button>
        </div>
      </div>

      {/* Results */}
      {uuids.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg">Generated UUIDs</h3>
            {uuids.length > 1 && (
              <button
                onClick={copyAllUuids}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
              >
                <SafeIcon icon={copiedIndex === -2 ? FiCheck : FiCopy} className={copiedIndex === -2 ? 'text-green-400' : ''} />
                <span>{copiedIndex === -2 ? 'Copied All!' : 'Copy All'}</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {uuids.map((uuid, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <code className="text-blue-400 font-mono text-sm md:text-base flex-1 mr-4 break-all">
                  {uuid}
                </code>
                <button
                  onClick={() => copyToClipboard(uuid, index)}
                  className="flex items-center space-x-2 px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors flex-shrink-0"
                >
                  <SafeIcon 
                    icon={copiedIndex === index ? FiCheck : FiCopy} 
                    className={copiedIndex === index ? 'text-green-400' : ''} 
                  />
                  <span className="hidden sm:inline">{copiedIndex === index ? 'Copied!' : 'Copy'}</span>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">About UUIDs</h3>
        <div className="space-y-2 text-slate-300 text-sm">
          <p>• UUID v4 uses random or pseudo-random numbers</p>
          <p>• 122 bits of entropy ensure uniqueness</p>
          <p>• Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx</p>
          <p>• Collision probability is extremely low</p>
        </div>
      </div>
    </motion.div>
  );
};

export default UuidGenerator;