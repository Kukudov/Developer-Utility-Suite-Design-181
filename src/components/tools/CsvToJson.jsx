import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCopy, FiCheck, FiDownload } = FiIcons;

const CsvToJson = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    delimiter: ',',
    hasHeaders: true,
    skipEmptyLines: true,
    trimWhitespace: true
  });

  const convertCsvToJson = () => {
    if (!input.trim()) {
      setOutput('');
      return;
    }

    try {
      const lines = input.split('\n').filter(line => 
        options.skipEmptyLines ? line.trim() : true
      );

      if (lines.length === 0) {
        setOutput('[]');
        return;
      }

      const delimiter = options.delimiter;
      let headers = [];
      let dataStartIndex = 0;

      if (options.hasHeaders) {
        headers = parseCsvLine(lines[0], delimiter, options.trimWhitespace);
        dataStartIndex = 1;
      } else {
        // Generate generic headers
        const firstRow = parseCsvLine(lines[0], delimiter, options.trimWhitespace);
        headers = firstRow.map((_, index) => `column_${index + 1}`);
      }

      const jsonData = [];
      for (let i = dataStartIndex; i < lines.length; i++) {
        const values = parseCsvLine(lines[i], delimiter, options.trimWhitespace);
        const row = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        
        jsonData.push(row);
      }

      setOutput(JSON.stringify(jsonData, null, 2));
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const parseCsvLine = (line, delimiter, trimWhitespace) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(trimWhitespace ? current.trim() : current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(trimWhitespace ? current.trim() : current);
    return result;
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

  const downloadJson = () => {
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadSampleData = () => {
    const sample = `Name,Age,City,Country
John Doe,30,New York,USA
Jane Smith,25,London,UK
Bob Johnson,35,Toronto,Canada
Alice Brown,28,Sydney,Australia`;
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
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="\t">Tab</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.hasHeaders}
                onChange={(e) => setOptions({ ...options, hasHeaders: e.target.checked })}
                className="w-4 h-4 text-green-500 bg-slate-700 border-slate-600 rounded focus:ring-green-500"
              />
              <span className="text-slate-300">First row contains headers</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.skipEmptyLines}
                onChange={(e) => setOptions({ ...options, skipEmptyLines: e.target.checked })}
                className="w-4 h-4 text-green-500 bg-slate-700 border-slate-600 rounded focus:ring-green-500"
              />
              <span className="text-slate-300">Skip empty lines</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.trimWhitespace}
                onChange={(e) => setOptions({ ...options, trimWhitespace: e.target.checked })}
                className="w-4 h-4 text-green-500 bg-slate-700 border-slate-600 rounded focus:ring-green-500"
              />
              <span className="text-slate-300">Trim whitespace</span>
            </label>
          </div>
        </div>
      </div>

      {/* Input/Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">CSV Input</h3>
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
            placeholder="Paste your CSV data here..."
            className="w-full h-64 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-green-500 transition-colors"
          />
          <button
            onClick={convertCsvToJson}
            className="mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            Convert to JSON
          </button>
        </div>

        {/* Output */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">JSON Output</h3>
            {output && (
              <div className="flex space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-2 px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                >
                  <SafeIcon icon={copied ? FiCheck : FiCopy} className={copied ? 'text-green-400' : ''} />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={downloadJson}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
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
            placeholder="JSON output will appear here..."
            className="w-full h-64 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default CsvToJson;