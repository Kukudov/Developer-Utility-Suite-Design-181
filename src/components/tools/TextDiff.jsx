import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiGitCommit } = FiIcons;

const TextDiff = () => {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diffResult, setDiffResult] = useState([]);

  const calculateDiff = () => {
    if (!text1 && !text2) return;

    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const maxLines = Math.max(lines1.length, lines2.length);
    const diff = [];

    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';

      if (line1 === line2) {
        diff.push({ type: 'equal', line1, line2, lineNum: i + 1 });
      } else if (!line1) {
        diff.push({ type: 'added', line1: '', line2, lineNum: i + 1 });
      } else if (!line2) {
        diff.push({ type: 'removed', line1, line2: '', lineNum: i + 1 });
      } else {
        diff.push({ type: 'modified', line1, line2, lineNum: i + 1 });
      }
    }

    setDiffResult(diff);
  };

  const getLineClass = (type) => {
    switch (type) {
      case 'added':
        return 'bg-green-500/20 border-l-4 border-green-500';
      case 'removed':
        return 'bg-red-500/20 border-l-4 border-red-500';
      case 'modified':
        return 'bg-yellow-500/20 border-l-4 border-yellow-500';
      default:
        return 'bg-slate-700/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold text-lg mb-4">Original Text</h3>
          <textarea
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            placeholder="Enter original text..."
            className="w-full h-64 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold text-lg mb-4">Modified Text</h3>
          <textarea
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            placeholder="Enter modified text..."
            className="w-full h-64 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={calculateDiff}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <SafeIcon icon={FiGitCommit} className="inline mr-2" />
          Compare Text
        </button>
      </div>

      {/* Diff Result */}
      {diffResult.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold text-lg mb-4">Comparison Result</h3>
          
          <div className="mb-4 flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-green-400">Added</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-red-400">Removed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-yellow-400">Modified</span>
            </div>
          </div>

          <div className="space-y-1 max-h-96 overflow-y-auto">
            {diffResult.map((diff, index) => (
              <div key={index} className={`p-3 rounded-lg ${getLineClass(diff.type)}`}>
                <div className="flex text-sm">
                  <span className="text-slate-400 w-10 flex-shrink-0">{diff.lineNum}</span>
                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="font-mono text-slate-300">
                      {diff.type === 'added' ? (
                        <span className="text-slate-500">-</span>
                      ) : (
                        <span className={diff.type === 'removed' ? 'text-red-400' : ''}>
                          {diff.line1}
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-slate-300">
                      {diff.type === 'removed' ? (
                        <span className="text-slate-500">-</span>
                      ) : (
                        <span className={diff.type === 'added' ? 'text-green-400' : ''}>
                          {diff.line2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TextDiff;