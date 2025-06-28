import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCopy, FiCheck, FiDownload } = FiIcons;

const JsonToCsv = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    delimiter: ',',
    includeHeaders: true,
    flattenObjects: true,
    arrayJoin: '; '
  });

  const convertJsonToCsv = () => {
    if (!input.trim()) {
      setOutput('');
      return;
    }

    try {
      const data = JSON.parse(input);
      
      if (!Array.isArray(data)) {
        setOutput('Error: JSON must be an array of objects');
        return;
      }

      if (data.length === 0) {
        setOutput('');
        return;
      }

      // Flatten objects if needed and collect all possible keys
      const processedData = data.map(item => {
        if (options.flattenObjects) {
          return flattenObject(item);
        }
        return item;
      });

      // Get all unique keys
      const allKeys = new Set();
      processedData.forEach(item => {
        Object.keys(item).forEach(key => allKeys.add(key));
      });

      const headers = Array.from(allKeys);
      const csvRows = [];

      // Add headers if needed
      if (options.includeHeaders) {
        csvRows.push(headers.map(header => escapeCsvValue(header)).join(options.delimiter));
      }

      // Add data rows
      processedData.forEach(item => {
        const row = headers.map(header => {
          let value = item[header];
          
          if (value === null || value === undefined) {
            return '';
          }
          
          if (Array.isArray(value)) {
            value = value.join(options.arrayJoin);
          } else if (typeof value === 'object') {
            value = JSON.stringify(value);
          }
          
          return escapeCsvValue(String(value));
        });
        
        csvRows.push(row.join(options.delimiter));
      });

      setOutput(csvRows.join('\n'));
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const flattenObject = (obj, prefix = '', result = {}) => {
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        flattenObject(value, newKey, result);
      } else {
        result[newKey] = value;
      }
    });
    
    return result;
  };

  const escapeCsvValue = (value) => {
    // If value contains delimiter, newline, or quote, wrap in quotes
    if (value.includes(options.delimiter) || value.includes('\n') || value.includes('"')) {
      // Escape quotes by doubling them
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
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

  const downloadCsv = () => {
    const blob = new Blob([output], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadSampleData = () => {
    const sample = `[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "country": "USA"
    },
    "skills": ["JavaScript", "React", "Node.js"]
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "age": 25,
    "address": {
      "street": "456 Oak Ave",
      "city": "London",
      "country": "UK"
    },
    "skills": ["Python", "Django", "PostgreSQL"]
  },
  {
    "id": 3,
    "name": "Bob Johnson",
    "email": "bob@example.com",
    "age": 35,
    "address": {
      "street": "789 Pine Rd",
      "city": "Toronto",
      "country": "Canada"
    },
    "skills": ["Java", "Spring", "MySQL"]
  }
]`;
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
        <h3 className="text-white font-semibold text-lg mb-4">Conversion Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white font-medium mb-2">Delimiter</label>
            <select
              value={options.delimiter}
              onChange={(e) => setOptions({ ...options, delimiter: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="\t">Tab</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>
          <div>
            <label className="block text-white font-medium mb-2">Array Join Character</label>
            <input
              type="text"
              value={options.arrayJoin}
              onChange={(e) => setOptions({ ...options, arrayJoin: e.target.value })}
              placeholder="; "
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="md:col-span-2 space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.includeHeaders}
                onChange={(e) => setOptions({ ...options, includeHeaders: e.target.checked })}
                className="w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
              />
              <span className="text-slate-300">Include column headers</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.flattenObjects}
                onChange={(e) => setOptions({ ...options, flattenObjects: e.target.checked })}
                className="w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
              />
              <span className="text-slate-300">Flatten nested objects (e.g., address.city)</span>
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
              onClick={loadSampleData}
              className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors text-sm"
            >
              Load Sample
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JSON array here..."
            className="w-full h-64 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={convertJsonToCsv}
            className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Convert to CSV
          </button>
        </div>

        {/* Output */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">CSV Output</h3>
            {output && !output.startsWith('Error:') && (
              <div className="flex space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-2 px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                >
                  <SafeIcon icon={copied ? FiCheck : FiCopy} className={copied ? 'text-green-400' : ''} />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={downloadCsv}
                  className="flex items-center space-x-2 px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiDownload} />
                  <span>Download</span>
                </button>
              </div>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="CSV output will appear here..."
            className="w-full h-64 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none"
          />
        </div>
      </div>

      {/* Information */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">CSV Conversion Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="text-blue-400 font-medium mb-2">Data Handling</h4>
            <ul className="space-y-1 text-slate-300">
              <li>• Flattens nested objects (address.city)</li>
              <li>• Joins arrays with custom separator</li>
              <li>• Handles null and undefined values</li>
              <li>• Escapes special characters properly</li>
              <li>• Supports various delimiters</li>
            </ul>
          </div>
          <div>
            <h4 className="text-blue-400 font-medium mb-2">Output Options</h4>
            <ul className="space-y-1 text-slate-300">
              <li>• Optional column headers</li>
              <li>• Custom delimiter selection</li>
              <li>• Configurable array joining</li>
              <li>• Proper CSV escaping and quoting</li>
              <li>• Download as .csv file</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default JsonToCsv;