import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCopy, FiCheck } = FiIcons;

const HtmlToMarkdown = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const convertHtmlToMarkdown = () => {
    if (!input.trim()) {
      setOutput('');
      return;
    }

    try {
      let markdown = input;

      // Headers
      markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
      markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
      markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
      markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
      markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
      markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');

      // Bold and Italic
      markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
      markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
      markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
      markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

      // Code
      markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
      markdown = markdown.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '\n```\n$1\n```\n');
      markdown = markdown.replace(/<pre[^>]*>(.*?)<\/pre>/gis, '\n```\n$1\n```\n');

      // Links
      markdown = markdown.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');

      // Images
      markdown = markdown.replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, '![$2]($1)');
      markdown = markdown.replace(/<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*\/?>/gi, '![$1]($2)');
      markdown = markdown.replace(/<img[^>]*src=["']([^"']*)["'][^>]*\/?>/gi, '![]($1)');

      // Lists
      markdown = markdown.replace(/<ul[^>]*>/gi, '\n');
      markdown = markdown.replace(/<\/ul>/gi, '\n');
      markdown = markdown.replace(/<ol[^>]*>/gi, '\n');
      markdown = markdown.replace(/<\/ol>/gi, '\n');
      markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');

      // Paragraphs
      markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');

      // Line breaks
      markdown = markdown.replace(/<br\s*\/?>/gi, '\n');
      markdown = markdown.replace(/<hr\s*\/?>/gi, '\n---\n');

      // Blockquotes
      markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (match, content) => {
        return content.split('\n').map(line => `> ${line.trim()}`).join('\n') + '\n\n';
      });

      // Tables
      markdown = markdown.replace(/<table[^>]*>(.*?)<\/table>/gis, (match, content) => {
        let tableMarkdown = '\n';
        const rows = content.match(/<tr[^>]*>(.*?)<\/tr>/gis);
        if (rows) {
          rows.forEach((row, index) => {
            const cells = row.match(/<t[hd][^>]*>(.*?)<\/t[hd]>/gis);
            if (cells) {
              const cellContents = cells.map(cell => 
                cell.replace(/<t[hd][^>]*>(.*?)<\/t[hd]>/gi, '$1').trim()
              );
              tableMarkdown += '| ' + cellContents.join(' | ') + ' |\n';
              
              // Add separator after header row
              if (index === 0) {
                tableMarkdown += '|' + cellContents.map(() => ' --- ').join('|') + '|\n';
              }
            }
          });
        }
        return tableMarkdown + '\n';
      });

      // Remove remaining HTML tags
      markdown = markdown.replace(/<[^>]*>/g, '');

      // Clean up extra whitespace
      markdown = markdown.replace(/\n{3,}/g, '\n\n');
      markdown = markdown.replace(/^\s+|\s+$/g, '');

      // Decode HTML entities
      markdown = markdown.replace(/&lt;/g, '<');
      markdown = markdown.replace(/&gt;/g, '>');
      markdown = markdown.replace(/&amp;/g, '&');
      markdown = markdown.replace(/&quot;/g, '"');
      markdown = markdown.replace(/&#39;/g, "'");

      setOutput(markdown);
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
    const sample = `<h1>Welcome to My Blog</h1>
<p>This is a <strong>sample HTML</strong> document that demonstrates various elements.</p>

<h2>Features</h2>
<ul>
  <li><em>Italic text</em> support</li>
  <li><strong>Bold text</strong> formatting</li>
  <li><code>Inline code</code> blocks</li>
  <li><a href="https://example.com">External links</a></li>
</ul>

<h3>Code Example</h3>
<pre><code>function hello() {
  console.log("Hello, World!");
}</code></pre>

<blockquote>
  <p>This is a blockquote with <strong>formatted text</strong>.</p>
</blockquote>

<p>Check out this <a href="https://example.com">link</a> and this image:</p>
<img src="image.jpg" alt="Sample Image" />`;
    setInput(sample);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
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
            className="w-full h-64 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={convertHtmlToMarkdown}
            className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Convert to Markdown
          </button>
        </div>

        {/* Output */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">Markdown Output</h3>
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
            placeholder="Markdown output will appear here..."
            className="w-full h-64 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none"
          />
        </div>
      </div>

      {/* Supported Elements */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">Supported HTML Elements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="text-blue-400 font-medium mb-2">Text Formatting</h4>
            <ul className="space-y-1 text-slate-300">
              <li>• Headers (h1-h6)</li>
              <li>• Bold (strong, b)</li>
              <li>• Italic (em, i)</li>
              <li>• Paragraphs (p)</li>
              <li>• Line breaks (br)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-blue-400 font-medium mb-2">Links & Media</h4>
            <ul className="space-y-1 text-slate-300">
              <li>• Links (a)</li>
              <li>• Images (img)</li>
              <li>• Code (code, pre)</li>
              <li>• Blockquotes</li>
              <li>• Horizontal rules (hr)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-blue-400 font-medium mb-2">Structure</h4>
            <ul className="space-y-1 text-slate-300">
              <li>• Unordered lists (ul, li)</li>
              <li>• Ordered lists (ol, li)</li>
              <li>• Tables (table, tr, td, th)</li>
              <li>• HTML entity decoding</li>
              <li>• Tag removal</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HtmlToMarkdown;