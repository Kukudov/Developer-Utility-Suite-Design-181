import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiDatabase, FiCopy, FiCheck } = FiIcons;

const SqlFormatter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const formatSql = () => {
    if (!input.trim()) return;

    // Basic SQL formatting - in a real app, you'd use a proper SQL parser
    let formatted = input
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/,/g, ',\n    ') // Add new line after commas
      .replace(/\b(SELECT|FROM|WHERE|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|GROUP BY|ORDER BY|HAVING|UNION|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/gi, '\n$1')
      .replace(/\b(AND|OR)\b/gi, '\n  $1')
      .replace(/\(/g, '(\n    ')
      .replace(/\)/g, '\n)')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');

    // Add proper indentation
    const lines = formatted.split('\n');
    let indentLevel = 0;
    const indentedLines = lines.map(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.includes(')')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      const indentedLine = '  '.repeat(indentLevel) + trimmedLine;
      
      if (trimmedLine.includes('(')) {
        indentLevel++;
      }
      
      return indentedLine;
    });

    setOutput(indentedLines.join('\n'));
  };

  const minifySql = () => {
    if (!input.trim()) return;

    const minified = input
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ',')
      .replace(/\s*\(\s*/g, '(')
      .replace(/\s*\)\s*/g, ')')
      .replace(/\s*=\s*/g, '=')
      .replace(/\s*<\s*/g, '<')
      .replace(/\s*>\s*/g, '>')
      .trim();

    setOutput(minified);
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

  const sampleQueries = [
    {
      name: 'Basic SELECT',
      query: 'SELECT users.name, users.email, orders.total FROM users JOIN orders ON users.id = orders.user_id WHERE orders.status = "completed" ORDER BY orders.created_at DESC;'
    },
    {
      name: 'Complex JOIN',
      query: 'SELECT p.name, c.name AS category, AVG(r.rating) AS avg_rating FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN reviews r ON p.id = r.product_id WHERE p.active = 1 GROUP BY p.id HAVING avg_rating > 4.0 ORDER BY avg_rating DESC;'
    },
    {
      name: 'Subquery',
      query: 'SELECT * FROM users WHERE id IN (SELECT user_id FROM orders WHERE total > (SELECT AVG(total) FROM orders WHERE created_at > "2023-01-01"));'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Controls */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
          <SafeIcon icon={FiDatabase} className="mr-2 text-blue-400" />
          SQL Formatter
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">Sample Queries</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {sampleQueries.map((sample) => (
                <button
                  key={sample.name}
                  onClick={() => setInput(sample.query)}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors text-sm text-left"
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={formatSql}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Format SQL
            </button>
            <button
              onClick={minifySql}
              className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
            >
              Minify SQL
            </button>
          </div>
        </div>
      </div>

      {/* Input/Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold text-lg mb-4">SQL Input</h3>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your SQL query here..."
            className="w-full h-64 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Output */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">Formatted SQL</h3>
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
            placeholder="Formatted SQL will appear here..."
            className="w-full h-64 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none"
          />
        </div>
      </div>

      {/* SQL Keywords Reference */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">Common SQL Keywords</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
          {[
            'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN',
            'INNER JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 'UNION', 'INSERT',
            'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'INDEX', 'TABLE', 'DATABASE'
          ].map((keyword) => (
            <div key={keyword} className="bg-slate-700/30 rounded px-2 py-1 text-blue-400 font-mono text-center">
              {keyword}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SqlFormatter;