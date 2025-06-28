import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCopy, FiCheck } = FiIcons;

const JsonToYaml = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    indent: 2,
    quotedKeys: false,
    quotedValues: 'auto' // 'auto', 'always', 'never'
  });

  const convertJsonToYaml = () => {
    if (!input.trim()) {
      setOutput('');
      return;
    }

    try {
      const data = JSON.parse(input);
      const yaml = convertToYaml(data, 0);
      setOutput(yaml.trim());
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const convertToYaml = (obj, depth = 0) => {
    const indent = ' '.repeat(depth * options.indent);
    
    if (obj === null) {
      return 'null';
    }
    
    if (typeof obj === 'undefined') {
      return 'null';
    }
    
    if (typeof obj === 'boolean') {
      return obj.toString();
    }
    
    if (typeof obj === 'number') {
      return obj.toString();
    }
    
    if (typeof obj === 'string') {
      return formatYamlString(obj);
    }
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        return '[]';
      }
      
      return obj.map(item => {
        const yamlItem = convertToYaml(item, depth + 1);
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          return `${indent}- ${yamlItem.substring(indent.length + options.indent)}`;
        } else {
          return `${indent}- ${yamlItem}`;
        }
      }).join('\n');
    }
    
    if (typeof obj === 'object') {
      if (Object.keys(obj).length === 0) {
        return '{}';
      }
      
      return Object.entries(obj).map(([key, value]) => {
        const yamlKey = options.quotedKeys ? `"${key}"` : formatYamlKey(key);
        const yamlValue = convertToYaml(value, depth + 1);
        
        if (typeof value === 'object' && value !== null) {
          if (Array.isArray(value) && value.length > 0) {
            return `${indent}${yamlKey}:\n${yamlValue}`;
          } else if (!Array.isArray(value) && Object.keys(value).length > 0) {
            return `${indent}${yamlKey}:\n${yamlValue}`;
          } else {
            return `${indent}${yamlKey}: ${yamlValue}`;
          }
        } else {
          return `${indent}${yamlKey}: ${yamlValue}`;
        }
      }).join('\n');
    }
    
    return String(obj);
  };

  const formatYamlKey = (key) => {
    // Check if key needs quoting
    if (key.match(/^[a-zA-Z_][a-zA-Z0-9_-]*$/) && !isYamlKeyword(key)) {
      return key;
    }
    return `"${key}"`;
  };

  const formatYamlString = (str) => {
    // Handle special cases
    if (str === '') {
      return '""';
    }
    
    // Check if string looks like a number or boolean
    if (str.match(/^(true|false|null|~)$/i) || str.match(/^-?\d+(\.\d+)?$/)) {
      return `"${str}"`;
    }
    
    // Check if string needs quoting based on options
    if (options.quotedValues === 'always') {
      return `"${escapeYamlString(str)}"`;
    }
    
    if (options.quotedValues === 'never') {
      return str;
    }
    
    // Auto mode - quote if necessary
    if (needsQuoting(str)) {
      return `"${escapeYamlString(str)}"`;
    }
    
    return str;
  };

  const needsQuoting = (str) => {
    // Contains special YAML characters
    if (str.match(/[:\[\]{}|>!@#%^&*()+=`~]/)) {
      return true;
    }
    
    // Starts with special characters
    if (str.match(/^[-?:,\[\]{}#&*!|>'"%@`]/)) {
      return true;
    }
    
    // Contains line breaks
    if (str.includes('\n') || str.includes('\r')) {
      return true;
    }
    
    // Leading or trailing whitespace
    if (str !== str.trim()) {
      return true;
    }
    
    return false;
  };

  const escapeYamlString = (str) => {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  };

  const isYamlKeyword = (key) => {
    const keywords = ['true', 'false', 'null', 'yes', 'no', 'on', 'off'];
    return keywords.includes(key.toLowerCase());
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

  const loadSampleJson = () => {
    const sample = `{
  "name": "DevBox Tools",
  "version": "1.0.0",
  "description": "A collection of developer utilities",
  "author": {
    "name": "Developer",
    "email": "dev@example.com"
  },
  "scripts": {
    "start": "npm run dev",
    "build": "npm run build-prod",
    "test": "jest"
  },
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "vite": "^4.0.0",
    "eslint": "^8.0.0"
  },
  "keywords": ["tools", "utilities", "developer"],
  "repository": {
    "type": "git",
    "url": "https://github.com/example/devbox-tools"
  },
  "license": "MIT",
  "private": false,
  "engines": {
    "node": ">=16.0.0"
  }
}`;
    setInput(sample);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Options */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">YAML Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-white font-medium mb-2">Indentation</label>
            <select
              value={options.indent}
              onChange={(e) => setOptions({ ...options, indent: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-yellow-500 transition-colors"
            >
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="8">8 spaces</option>
            </select>
          </div>
          <div>
            <label className="block text-white font-medium mb-2">Quote Values</label>
            <select
              value={options.quotedValues}
              onChange={(e) => setOptions({ ...options, quotedValues: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-yellow-500 transition-colors"
            >
              <option value="auto">Auto (when needed)</option>
              <option value="always">Always quote strings</option>
              <option value="never">Never quote strings</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.quotedKeys}
                onChange={(e) => setOptions({ ...options, quotedKeys: e.target.checked })}
                className="w-4 h-4 text-yellow-500 bg-slate-700 border-slate-600 rounded focus:ring-yellow-500"
              />
              <span className="text-slate-300">Quote all keys</span>
            </label>
          </div>
        </div>
      </div>

      {/* Input/Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">JSON Input</h3>
            <button
              onClick={loadSampleJson}
              className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors text-sm"
            >
              Load Sample
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JSON here..."
            className="w-full h-64 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-yellow-500 transition-colors"
          />
          <button
            onClick={convertJsonToYaml}
            className="mt-4 px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
          >
            Convert to YAML
          </button>
        </div>

        {/* Output */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">YAML Output</h3>
            {output && !output.startsWith('Error:') && (
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
            placeholder="YAML output will appear here..."
            className="w-full h-64 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none"
          />
        </div>
      </div>

      {/* YAML Guide */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">YAML Conversion Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="text-yellow-400 font-medium mb-2">Data Types</h4>
            <ul className="space-y-1 text-slate-300">
              <li>• Strings (auto-quoted when needed)</li>
              <li>• Numbers (integers and floats)</li>
              <li>• Booleans (true/false)</li>
              <li>• Arrays (lists with dashes)</li>
              <li>• Objects (key-value pairs)</li>
              <li>• Null values</li>
            </ul>
          </div>
          <div>
            <h4 className="text-yellow-400 font-medium mb-2">Formatting Options</h4>
            <ul className="space-y-1 text-slate-300">
              <li>• Configurable indentation (2, 4, 8 spaces)</li>
              <li>• Smart string quoting</li>
              <li>• Optional key quoting</li>
              <li>• Proper escaping of special characters</li>
              <li>• Clean, readable output</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default JsonToYaml;