import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCopy, FiCheck } = FiIcons;

const HtmlToText = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    preserveLineBreaks: true,
    preserveSpacing: false,
    includeLinks: true,
    includeImageAlt: true
  });

  const convertHtmlToText = () => {
    if (!input.trim()) {
      setOutput('');
      return;
    }

    try {
      let text = input;

      // Handle links
      if (options.includeLinks) {
        text = text.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '$2 ($1)');
      } else {
        text = text.replace(/<a[^>]*>(.*?)<\/a>/gi, '$1');
      }

      // Handle images
      if (options.includeImageAlt) {
        text = text.replace(/<img[^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, '[Image: $1]');
        text = text.replace(/<img[^>]*src=["']([^"']*)["'][^>]*\/?>/gi, '[Image]');
      } else {
        text = text.replace(/<img[^>]*\/?>/gi, '');
      }

      // Convert line breaks and paragraphs
      if (options.preserveLineBreaks) {
        text = text.replace(/<br\s*\/?>/gi, '\n');
        text = text.replace(/<\/p>/gi, '\n\n');
        text = text.replace(/<p[^>]*>/gi, '');
        text = text.replace(/<\/div>/gi, '\n');
        text = text.replace(/<div[^>]*>/gi, '');
        text = text.replace(/<\/h[1-6]>/gi, '\n\n');
        text = text.replace(/<h[1-6][^>]*>/gi, '');
      } else {
        text = text.replace(/<br\s*\/?>/gi, ' ');
        text = text.replace(/<\/p>/gi, ' ');
        text = text.replace(/<p[^>]*>/gi, '');
        text = text.replace(/<\/div>/gi, ' ');
        text = text.replace(/<div[^>]*>/gi, '');
        text = text.replace(/<\/h[1-6]>/gi, ' ');
        text = text.replace(/<h[1-6][^>]*>/gi, '');
      }

      // Handle lists
      text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, options.preserveLineBreaks ? '• $1\n' : '• $1 ');
      text = text.replace(/<\/[uo]l>/gi, options.preserveLineBreaks ? '\n' : ' ');
      text = text.replace(/<[uo]l[^>]*>/gi, '');

      // Handle tables
      text = text.replace(/<\/tr>/gi, options.preserveLineBreaks ? '\n' : ' | ');
      text = text.replace(/<\/td>/gi, ' | ');
      text = text.replace(/<\/th>/gi, ' | ');
      text = text.replace(/<t[rdh][^>]*>/gi, '');
      text = text.replace(/<\/?table[^>]*>/gi, options.preserveLineBreaks ? '\n' : ' ');

      // Handle blockquotes
      text = text.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, 
        options.preserveLineBreaks ? '"$1"\n' : '"$1" ');

      // Remove all remaining HTML tags
      text = text.replace(/<[^>]*>/g, '');

      // Decode HTML entities
      text = text.replace(/&lt;/g, '<');
      text = text.replace(/&gt;/g, '>');
      text = text.replace(/&amp;/g, '&');
      text = text.replace(/&quot;/g, '"');
      text = text.replace(/&#39;/g, "'");
      text = text.replace(/&nbsp;/g, ' ');

      // Clean up spacing
      if (!options.preserveSpacing) {
        text = text.replace(/[ \t]+/g, ' '); // Multiple spaces/tabs to single space
      }

      if (options.preserveLineBreaks) {
        text = text.replace(/\n{3,}/g, '\n\n'); // Multiple newlines to double newlines
      } else {
        text = text.replace(/\s+/g, ' '); // All whitespace to single spaces
      }

      text = text.trim();

      setOutput(text);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
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

  const loadSampleHtml = () => {
    const sample = `<!DOCTYPE html>
<html>
<head>
    <title>Sample Document</title>
</head>
<body>
    <h1>Welcome to Our Website</h1>
    <p>This is a <strong>sample HTML document</strong> with various elements.</p>
    
    <h2>Features</h2>
    <ul>
        <li>Easy to use interface</li>
        <li>Fast processing</li>
        <li>Reliable results</li>
    </ul>
    
    <p>Visit our <a href="https://example.com">homepage</a> for more information.</p>
    
    <div>
        <img src="logo.png" alt="Company Logo" />
        <p>Contact us at: <a href="mailto:info@example.com">info@example.com</a></p>
    </div>
    
    <blockquote>
        "Innovation distinguishes between a leader and a follower." - Steve Jobs
    </blockquote>
    
    <table>
        <tr>
            <th>Name</th>
            <th>Role</th>
        </tr>
        <tr>
            <td>John Doe</td>
            <td>Developer</td>
        </tr>
    </table>
</body>
</html>`;
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
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.preserveLineBreaks}
                onChange={(e) => setOptions({ ...options, preserveLineBreaks: e.target.checked })}
                className="w-4 h-4 text-orange-500 bg-slate-700 border-slate-600 rounded focus:ring-orange-500"
              />
              <span className="text-slate-300">Preserve line breaks</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.preserveSpacing}
                onChange={(e) => setOptions({ ...options, preserveSpacing: e.target.checked })}
                className="w-4 h-4 text-orange-500 bg-slate-700 border-slate-600 rounded focus:ring-orange-500"
              />
              <span className="text-slate-300">Preserve original spacing</span>
            </label>
          </div>
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.includeLinks}
                onChange={(e) => setOptions({ ...options, includeLinks: e.target.checked })}
                className="w-4 h-4 text-orange-500 bg-slate-700 border-slate-600 rounded focus:ring-orange-500"
              />
              <span className="text-slate-300">Include link URLs</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.includeImageAlt}
                onChange={(e) => setOptions({ ...options, includeImageAlt: e.target.checked })}
                className="w-4 h-4 text-orange-500 bg-slate-700 border-slate-600 rounded focus:ring-orange-500"
              />
              <span className="text-slate-300">Include image alt text</span>
            </label>
          </div>
        </div>
      </div>

      {/* Input/Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">HTML Input</h3>
            <button
              onClick={loadSampleHtml}
              className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors text-sm"
            >
              Load Sample
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your HTML code here..."
            className="w-full h-64 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-orange-500 transition-colors"
          />
          <button
            onClick={convertHtmlToText}
            className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            Convert to Text
          </button>
        </div>

        {/* Output */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">Plain Text Output</h3>
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
            placeholder="Plain text output will appear here..."
            className="w-full h-64 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white text-sm resize-none focus:outline-none whitespace-pre-wrap"
          />
        </div>
      </div>

      {/* Information */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">Conversion Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="text-orange-400 font-medium mb-2">Text Extraction</h4>
            <ul className="space-y-1 text-slate-300">
              <li>• Removes all HTML tags</li>
              <li>• Preserves text content</li>
              <li>• Handles nested elements</li>
              <li>• Decodes HTML entities</li>
            </ul>
          </div>
          <div>
            <h4 className="text-orange-400 font-medium mb-2">Special Handling</h4>
            <ul className="space-y-1 text-slate-300">
              <li>• Links: Text + URL in parentheses</li>
              <li>• Images: Alt text or [Image] placeholder</li>
              <li>• Lists: Bullet points preserved</li>
              <li>• Tables: Pipe-separated values</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HtmlToText;