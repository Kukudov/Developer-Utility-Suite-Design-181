import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCopy, FiCheck, FiEye } = FiIcons;

const MarkdownToHtml = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    includeCSS: true,
    sanitize: true,
    breaks: true,
    linkify: true
  });

  const convertMarkdownToHtml = () => {
    if (!input.trim()) {
      setOutput('');
      return;
    }

    try {
      let html = input;

      // Headers
      html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
      html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
      html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

      // Bold
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

      // Italic
      html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
      html = html.replace(/_(.*?)_/g, '<em>$1</em>');

      // Code blocks
      html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

      // Inline code
      html = html.replace(/`(.*?)`/g, '<code>$1</code>');

      // Links
      html = html.replace(/\[([^\]]*)\]\(([^)]*)\)/g, '<a href="$2">$1</a>');

      // Images
      html = html.replace(/!\[([^\]]*)\]\(([^)]*)\)/g, '<img alt="$1" src="$2" />');

      // Horizontal rules
      html = html.replace(/^---$/gm, '<hr>');
      html = html.replace(/^\*\*\*$/gm, '<hr>');

      // Blockquotes
      html = html.replace(/^> (.*)$/gm, '<blockquote><p>$1</p></blockquote>');
      
      // Clean up multiple blockquotes
      html = html.replace(/<\/blockquote>\s*<blockquote>/g, '');

      // Unordered lists
      html = html.replace(/^\* (.*)$/gm, '<li>$1</li>');
      html = html.replace(/^- (.*)$/gm, '<li>$1</li>');
      html = html.replace(/^\+ (.*)$/gm, '<li>$1</li>');

      // Ordered lists
      html = html.replace(/^\d+\. (.*)$/gm, '<li>$1</li>');

      // Wrap consecutive list items in ul/ol tags
      html = html.replace(/(<li>.*<\/li>)/s, (match) => {
        // Check if this looks like an ordered list (starts with number)
        const isOrdered = input.match(/^\d+\./m);
        const tag = isOrdered ? 'ol' : 'ul';
        return `<${tag}>${match}</${tag}>`;
      });

      // Tables
      html = convertTables(html);

      // Strikethrough
      html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

      // Line breaks
      if (options.breaks) {
        html = html.replace(/\n\n/g, '</p><p>');
        html = html.replace(/\n/g, '<br>');
      }

      // Wrap in paragraphs
      html = html.replace(/^(?!<[huo]|<blockquote|<pre|<hr|<table)(.+)$/gm, '<p>$1</p>');

      // Clean up empty paragraphs and fix formatting
      html = html.replace(/<p><\/p>/g, '');
      html = html.replace(/<p>(<h[1-6]>.*<\/h[1-6]>)<\/p>/g, '$1');
      html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
      html = html.replace(/<p>(<blockquote>.*<\/blockquote>)<\/p>/g, '$1');
      html = html.replace(/<p>(<[uo]l>.*<\/[uo]l>)<\/p>/g, '$1');

      // Auto-link URLs if enabled
      if (options.linkify) {
        html = html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>');
      }

      // Sanitize if enabled
      if (options.sanitize) {
        html = sanitizeHtml(html);
      }

      // Add CSS if enabled
      if (options.includeCSS) {
        html = addCSS(html);
      }

      setOutput(html);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const convertTables = (html) => {
    const lines = html.split('\n');
    const result = [];
    let inTable = false;
    let tableRows = [];

    lines.forEach((line, index) => {
      if (line.includes('|')) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        tableRows.push(line);
      } else {
        if (inTable) {
          // Process the table
          result.push(processTable(tableRows));
          inTable = false;
          tableRows = [];
        }
        result.push(line);
      }
    });

    if (inTable) {
      result.push(processTable(tableRows));
    }

    return result.join('\n');
  };

  const processTable = (rows) => {
    if (rows.length < 2) return rows.join('\n');

    let html = '<table>\n';
    
    // Header row
    const headerCells = rows[0].split('|').map(cell => cell.trim()).filter(cell => cell);
    html += '  <thead>\n    <tr>\n';
    headerCells.forEach(cell => {
      html += `      <th>${cell}</th>\n`;
    });
    html += '    </tr>\n  </thead>\n';

    // Skip separator row (index 1) and process data rows
    if (rows.length > 2) {
      html += '  <tbody>\n';
      for (let i = 2; i < rows.length; i++) {
        const cells = rows[i].split('|').map(cell => cell.trim()).filter(cell => cell);
        html += '    <tr>\n';
        cells.forEach(cell => {
          html += `      <td>${cell}</td>\n`;
        });
        html += '    </tr>\n';
      }
      html += '  </tbody>\n';
    }

    html += '</table>';
    return html;
  };

  const sanitizeHtml = (html) => {
    // Basic HTML sanitization - remove potentially dangerous tags and attributes
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'];
    let sanitized = html;
    
    dangerousTags.forEach(tag => {
      const regex = new RegExp(`<${tag}[^>]*>.*?<\/${tag}>`, 'gi');
      sanitized = sanitized.replace(regex, '');
      sanitized = sanitized.replace(new RegExp(`<${tag}[^>]*>`, 'gi'), '');
    });

    // Remove dangerous attributes
    sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');

    return sanitized;
  };

  const addCSS = (html) => {
    const css = `<style>
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1, h2, h3, h4, h5, h6 {
  color: #2c3e50;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

h1 { font-size: 2.5rem; border-bottom: 2px solid #3498db; padding-bottom: 0.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.5rem; }

p { margin-bottom: 1rem; }

a {
  color: #3498db;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

code {
  background-color: #f8f9fa;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

pre {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 5px;
  overflow-x: auto;
  border: 1px solid #e9ecef;
}

pre code {
  background: none;
  padding: 0;
}

blockquote {
  border-left: 4px solid #3498db;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
  color: #666;
}

table {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}

th, td {
  border: 1px solid #ddd;
  padding: 0.75rem;
  text-align: left;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
}

ul, ol {
  padding-left: 2rem;
}

li {
  margin-bottom: 0.5rem;
}

hr {
  border: none;
  height: 2px;
  background-color: #eee;
  margin: 2rem 0;
}

img {
  max-width: 100%;
  height: auto;
}

del {
  text-decoration: line-through;
  color: #999;
}
</style>

`;

    return css + html;
  };

  const previewHtml = () => {
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(output);
    previewWindow.document.close();
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

  const loadSampleMarkdown = () => {
    const sample = `# Welcome to Markdown

This is a **sample markdown document** that demonstrates various *formatting* features.

## Features

### Text Formatting
- **Bold text** using double asterisks
- *Italic text* using single asterisks
- \`Inline code\` using backticks
- ~~Strikethrough~~ using double tildes

### Links and Images
Check out [this link](https://example.com) for more information.

![Sample Image](https://via.placeholder.com/300x200?text=Sample+Image)

### Code Blocks
\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\`

### Lists

#### Unordered List
- First item
- Second item
  - Nested item
  - Another nested item
- Third item

#### Ordered List
1. First step
2. Second step
3. Third step

### Tables

| Name | Role | Experience |
|------|------|------------|
| John Doe | Developer | 5 years |
| Jane Smith | Designer | 3 years |
| Bob Johnson | Manager | 10 years |

### Blockquotes

> "The best way to predict the future is to create it." - Peter Drucker

### Horizontal Rule

---

That's a quick overview of Markdown formatting!`;
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
        <h3 className="text-white font-semibold text-lg mb-4">HTML Options</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.includeCSS}
              onChange={(e) => setOptions({ ...options, includeCSS: e.target.checked })}
              className="w-4 h-4 text-green-500 bg-slate-700 border-slate-600 rounded focus:ring-green-500"
            />
            <span className="text-slate-300">Include CSS</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.sanitize}
              onChange={(e) => setOptions({ ...options, sanitize: e.target.checked })}
              className="w-4 h-4 text-green-500 bg-slate-700 border-slate-600 rounded focus:ring-green-500"
            />
            <span className="text-slate-300">Sanitize HTML</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.breaks}
              onChange={(e) => setOptions({ ...options, breaks: e.target.checked })}
              className="w-4 h-4 text-green-500 bg-slate-700 border-slate-600 rounded focus:ring-green-500"
            />
            <span className="text-slate-300">Line breaks</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.linkify}
              onChange={(e) => setOptions({ ...options, linkify: e.target.checked })}
              className="w-4 h-4 text-green-500 bg-slate-700 border-slate-600 rounded focus:ring-green-500"
            />
            <span className="text-slate-300">Auto-link URLs</span>
          </label>
        </div>
      </div>

      {/* Input/Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">Markdown Input</h3>
            <button
              onClick={loadSampleMarkdown}
              className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors text-sm"
            >
              Load Sample
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your Markdown here..."
            className="w-full h-64 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-green-500 transition-colors"
          />
          <button
            onClick={convertMarkdownToHtml}
            className="mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            Convert to HTML
          </button>
        </div>

        {/* Output */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">HTML Output</h3>
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
                  onClick={previewHtml}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiEye} />
                  <span>Preview</span>
                </button>
              </div>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="HTML output will appear here..."
            className="w-full h-64 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none"
          />
        </div>
      </div>

      {/* Markdown Guide */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">Supported Markdown Syntax</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="text-green-400 font-medium mb-2">Text Formatting</h4>
            <div className="space-y-1 text-slate-300 font-mono">
              <div><span className="text-green-400">**bold**</span> → <strong>bold</strong></div>
              <div><span className="text-green-400">*italic*</span> → <em>italic</em></div>
              <div><span className="text-green-400">`code`</span> → <code>code</code></div>
              <div><span className="text-green-400">~~strike~~</span> → <del>strike</del></div>
            </div>
          </div>
          <div>
            <h4 className="text-green-400 font-medium mb-2">Structure</h4>
            <div className="space-y-1 text-slate-300 font-mono">
              <div><span className="text-green-400"># H1</span> → Header 1</div>
              <div><span className="text-green-400">## H2</span> → Header 2</div>
              <div><span className="text-green-400">- item</span> → List item</div>
              <div><span className="text-green-400">1. item</span> → Numbered item</div>
            </div>
          </div>
          <div>
            <h4 className="text-green-400 font-medium mb-2">Links & Media</h4>
            <div className="space-y-1 text-slate-300 font-mono">
              <div><span className="text-green-400">[text](url)</span> → Link</div>
              <div><span className="text-green-400">![alt](url)</span> → Image</div>
              <div><span className="text-green-400">> quote</span> → Blockquote</div>
              <div><span className="text-green-400">---</span> → Horizontal rule</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MarkdownToHtml;