import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCopy, FiCheck } = FiIcons;

const UrlEncoder = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');
  const [copied, setCopied] = useState(false);

  const processUrl = () => {
    try {
      if (mode === 'encode') {
        setOutput(encodeURIComponent(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
    } catch (err) {
      setOutput('Error: Invalid input for decoding');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setMode('encode')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              mode === 'encode' 
                ? 'bg-green-500 text-white' 
                : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              mode === 'decode' 
                ? 'bg-green-500 text-white' 
                : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
            }`}
          >
            Decode
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              {mode === 'encode' ? 'Plain URL' : 'URL Encoded'}
            </h3>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encode' ? 'Enter URL to encode...' : 'Enter encoded URL to decode...'}
              className="w-full h-32 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white text-sm resize-none focus:outline-none focus:border-green-500 transition-colors"
            />
            <button
              onClick={processUrl}
              className="mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              {mode === 'encode' ? 'Encode' : 'Decode'}
            </button>
          </div>

          {/* Output */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">
                {mode === 'encode' ? 'URL Encoded' : 'Plain URL'}
              </h3>
              {output && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-2 px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                >
                  <SafeIcon icon={copied ? FiCheck : FiCopy} className={copied ? 'text-green-400' : ''} />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              )}
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Result will appear here..."
              className="w-full h-32 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white text-sm resize-none focus:outline-none"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UrlEncoder;