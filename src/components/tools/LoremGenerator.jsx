import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCopy, FiCheck, FiRefreshCw, FiType } = FiIcons;

const LoremGenerator = () => {
  const [text, setText] = useState('');
  const [type, setType] = useState('paragraphs');
  const [count, setCount] = useState(3);
  const [copied, setCopied] = useState(false);

  const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
  ];

  const generateWord = () => {
    return loremWords[Math.floor(Math.random() * loremWords.length)];
  };

  const generateSentence = () => {
    const length = Math.floor(Math.random() * 10) + 5; // 5-14 words
    const words = Array.from({ length }, () => generateWord());
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return words.join(' ') + '.';
  };

  const generateParagraph = () => {
    const length = Math.floor(Math.random() * 5) + 3; // 3-7 sentences
    return Array.from({ length }, () => generateSentence()).join(' ');
  };

  const generateText = () => {
    let result = '';
    
    switch (type) {
      case 'words':
        result = Array.from({ length: count }, () => generateWord()).join(' ');
        break;
      case 'sentences':
        result = Array.from({ length: count }, () => generateSentence()).join(' ');
        break;
      case 'paragraphs':
        result = Array.from({ length: count }, () => generateParagraph()).join('\n\n');
        break;
    }
    
    setText(result);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const typeOptions = [
    { value: 'words', label: 'Words' },
    { value: 'sentences', label: 'Sentences' },
    { value: 'paragraphs', label: 'Paragraphs' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Controls */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-white font-medium mb-2">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-white font-medium mb-2">Count</label>
            <input
              type="number"
              min="1"
              max="50"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
          
          <button
            onClick={generateText}
            className="flex items-center justify-center space-x-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <SafeIcon icon={FiRefreshCw} />
            <span>Generate</span>
          </button>
        </div>
      </div>

      {/* Generated Text */}
      {text && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg flex items-center">
              <SafeIcon icon={FiType} className="mr-2 text-green-400" />
              Generated Text
            </h3>
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
            >
              <SafeIcon icon={copied ? FiCheck : FiCopy} className={copied ? 'text-green-400' : ''} />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-6 max-h-96 overflow-y-auto">
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {text}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
            <span>
              {text.split(' ').length} words, {text.length} characters
            </span>
            <span>
              {type === 'paragraphs' ? text.split('\n\n').length : 
               type === 'sentences' ? text.split('.').length - 1 :
               text.split(' ').length} {type}
            </span>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">About Lorem Ipsum</h3>
        <div className="space-y-2 text-slate-300 text-sm">
          <p>• Lorem Ipsum is dummy text used in printing and typesetting</p>
          <p>• It has been the industry standard since the 1500s</p>
          <p>• Perfect for testing layouts without meaningful content distraction</p>
          <p>• Based on sections from "de Finibus Bonorum et Malorum" by Cicero</p>
        </div>
      </div>
    </motion.div>
  );
};

export default LoremGenerator;