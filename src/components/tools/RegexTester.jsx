import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiSearch, FiCheckCircle, FiXCircle, FiInfo } = FiIcons;

const RegexTester = () => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testText, setTestText] = useState('');
  const [matches, setMatches] = useState([]);
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState('');

  const commonPatterns = [
    { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
    { name: 'URL', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)' },
    { name: 'Phone (US)', pattern: '\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})' },
    { name: 'IP Address', pattern: '\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b' },
    { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}' },
    { name: 'Hex Color', pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})' }
  ];

  useEffect(() => {
    testRegex();
  }, [pattern, flags, testText]);

  const testRegex = () => {
    if (!pattern) {
      setMatches([]);
      setIsValid(true);
      setError('');
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      setIsValid(true);
      setError('');

      if (!testText) {
        setMatches([]);
        return;
      }

      const foundMatches = [];
      let match;

      if (flags.includes('g')) {
        while ((match = regex.exec(testText)) !== null) {
          foundMatches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });
          
          if (match.index === regex.lastIndex) {
            break;
          }
        }
      } else {
        match = regex.exec(testText);
        if (match) {
          foundMatches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      }

      setMatches(foundMatches);
    } catch (err) {
      setIsValid(false);
      setError(err.message);
      setMatches([]);
    }
  };

  const highlightMatches = (text) => {
    if (!pattern || !isValid || matches.length === 0) {
      return text;
    }

    let highlightedText = text;
    let offset = 0;

    matches.forEach((match) => {
      const start = match.index + offset;
      const end = start + match.match.length;
      const highlighted = `<mark class="bg-yellow-400 text-black">${match.match}</mark>`;
      
      highlightedText = 
        highlightedText.slice(0, start) + 
        highlighted + 
        highlightedText.slice(end);
      
      offset += highlighted.length - match.match.length;
    });

    return highlightedText;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Pattern Input */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
          <SafeIcon icon={FiSearch} className="mr-2 text-blue-400" />
          Regular Expression Tester
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">Regular Expression Pattern</label>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern..."
                className={`flex-1 px-4 py-3 bg-slate-700/50 border rounded-lg text-white font-mono focus:outline-none transition-colors ${
                  isValid ? 'border-slate-600 focus:border-blue-500' : 'border-red-500'
                }`}
              />
              <span className="text-slate-400">/</span>
              <input
                type="text"
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                placeholder="flags"
                className="w-20 px-2 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500 transition-colors"
              />
              <div className="flex items-center">
                {isValid ? (
                  <SafeIcon icon={FiCheckCircle} className="text-green-400" />
                ) : (
                  <SafeIcon icon={FiXCircle} className="text-red-400" />
                )}
              </div>
            </div>
            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Common Patterns</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {commonPatterns.map((common) => (
                <button
                  key={common.name}
                  onClick={() => setPattern(common.pattern)}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors text-sm text-left"
                >
                  {common.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Test Text */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">Test Text</h3>
        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          placeholder="Enter text to test against the regex pattern..."
          className="w-full h-32 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Highlighted Text */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold text-lg mb-4">Highlighted Matches</h3>
          <div className="bg-slate-900/50 rounded-lg p-4 min-h-32 max-h-64 overflow-y-auto">
            <pre className="text-slate-300 font-mono text-sm whitespace-pre-wrap">
              <span dangerouslySetInnerHTML={{ __html: highlightMatches(testText) }} />
            </pre>
          </div>
        </div>

        {/* Match Details */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold text-lg mb-4">
            Match Details ({matches.length} matches)
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {matches.length > 0 ? (
              matches.map((match, index) => (
                <div key={index} className="bg-slate-700/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-400 font-mono text-sm">Match #{index + 1}</span>
                    <span className="text-slate-400 text-xs">Index: {match.index}</span>
                  </div>
                  <div className="text-white font-mono text-sm bg-slate-900/50 rounded p-2">
                    "{match.match}"
                  </div>
                  {match.groups.length > 0 && (
                    <div className="mt-2">
                      <span className="text-slate-400 text-xs">Capture Groups:</span>
                      <div className="mt-1 space-y-1">
                        {match.groups.map((group, groupIndex) => (
                          group && (
                            <div key={groupIndex} className="text-green-400 font-mono text-xs">
                              ${groupIndex + 1}: "{group}"
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <SafeIcon icon={FiInfo} className="text-slate-600 text-4xl mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No matches found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Flags Reference */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">Regex Flags Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <code className="text-blue-400">g</code>
            <span className="text-slate-300 ml-2">Global - find all matches</span>
          </div>
          <div>
            <code className="text-blue-400">i</code>
            <span className="text-slate-300 ml-2">Ignore case</span>
          </div>
          <div>
            <code className="text-blue-400">m</code>
            <span className="text-slate-300 ml-2">Multiline</span>
          </div>
          <div>
            <code className="text-blue-400">s</code>
            <span className="text-slate-300 ml-2">Dot matches newline</span>
          </div>
          <div>
            <code className="text-blue-400">u</code>
            <span className="text-slate-300 ml-2">Unicode</span>
          </div>
          <div>
            <code className="text-blue-400">y</code>
            <span className="text-slate-300 ml-2">Sticky</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RegexTester;