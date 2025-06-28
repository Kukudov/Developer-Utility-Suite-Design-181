import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCopy, FiCheck } = FiIcons;

const HamlToHtml = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    format: true,
    selfClosing: 'xhtml' // 'xhtml', 'html5', 'html4'
  });

  const convertHamlToHtml = () => {
    if (!input.trim()) {
      setOutput('');
      return;
    }

    try {
      const lines = input.split('\n');
      const result = parseHamlLines(lines);
      setOutput(options.format ? formatHtml(result) : result);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const parseHamlLines = (lines) => {
    const stack = [];
    const result = [];
    let currentIndent = 0;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('/')) return; // Skip empty lines and comments

      const indent = line.length - line.trimStart().length;
      
      // Close tags if indentation decreased
      while (stack.length > 0 && indent <= stack[stack.length - 1].indent) {
        const tag = stack.pop();
        if (!tag.selfClosing) {
          result.push(`${'  '.repeat(tag.indent)}</${tag.name}>`);
        }
      }

      const parsed = parseHamlLine(trimmed, indent);
      if (parsed) {
        result.push(`${'  '.repeat(indent)}${parsed.html}`);
        
        if (!parsed.selfClosing && !parsed.hasContent) {
          stack.push({
            name: parsed.name,
            indent: indent,
            selfClosing: false
          });
        }
      }
    });

    // Close remaining tags
    while (stack.length > 0) {
      const tag = stack.pop();
      if (!tag.selfClosing) {
        result.push(`${'  '.repeat(tag.indent)}</${tag.name}>`);
      }
    }

    return result.join('\n');
  };

  const parseHamlLine = (line, indent) => {
    // Handle plain text
    if (!line.startsWith('%') && !line.startsWith('#') && !line.startsWith('.')) {
      return { html: line, hasContent: true };
    }

    let tagName = 'div';
    let classes = [];
    let id = '';
    let attributes = {};
    let content = '';
    let selfClosing = false;

    // Parse tag name
    if (line.startsWith('%')) {
      const match = line.match(/^%([a-zA-Z0-9-]+)/);
      if (match) {
        tagName = match[1];
        line = line.substring(match[0].length);
      }
    }

    // Parse ID
    const idMatch = line.match(/#([a-zA-Z0-9-_]+)/);
    if (idMatch) {
      id = idMatch[1];
      line = line.replace(idMatch[0], '');
    }

    // Parse classes
    const classMatches = line.match(/\.([a-zA-Z0-9-_]+)/g);
    if (classMatches) {
      classes = classMatches.map(cls => cls.substring(1));
      classMatches.forEach(cls => {
        line = line.replace(cls, '');
      });
    }

    // Parse attributes
    const attrMatch = line.match(/\{([^}]+)\}/);
    if (attrMatch) {
      const attrString = attrMatch[1];
      const attrPairs = attrString.match(/[^,\s]+:\s*[^,]+/g);
      if (attrPairs) {
        attrPairs.forEach(pair => {
          const [key, value] = pair.split(':').map(s => s.trim());
          attributes[key] = value.replace(/['"]/g, '');
        });
      }
      line = line.replace(attrMatch[0], '');
    }

    // Parse content
    content = line.trim();
    if (content.startsWith('=')) {
      content = content.substring(1).trim();
    }

    // Check if self-closing tag
    const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
    selfClosing = selfClosingTags.includes(tagName.toLowerCase());

    // Build HTML
    let html = `<${tagName}`;

    if (id) {
      html += ` id="${id}"`;
    }

    if (classes.length > 0) {
      html += ` class="${classes.join(' ')}"`;
    }

    Object.entries(attributes).forEach(([key, value]) => {
      html += ` ${key}="${value}"`;
    });

    if (selfClosing) {
      html += getSelfClosingEnd();
    } else {
      html += '>';
      if (content) {
        html += content + `</${tagName}>`;
        return { html, name: tagName, selfClosing: false, hasContent: true };
      }
    }

    return { html, name: tagName, selfClosing, hasContent: !!content };
  };

  const getSelfClosingEnd = () => {
    switch (options.selfClosing) {
      case 'xhtml':
        return ' />';
      case 'html5':
      case 'html4':
      default:
        return '>';
    }
  };

  const formatHtml = (html) => {
    // Simple HTML formatting
    let formatted = html;
    let indentLevel = 0;
    const lines = formatted.split('\n');
    const formattedLines = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Decrease indent for closing tags
      if (trimmed.startsWith('</')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      formattedLines.push('  '.repeat(indentLevel) + trimmed);

      // Increase indent for opening tags (except self-closing)
      if (trimmed.startsWith('<') && !trimmed.startsWith('</') && 
          !trimmed.includes('/>') && !trimmed.includes('</')) {
        indentLevel++;
      }
    });

    return formattedLines.join('\n');
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

  const loadSampleHaml = () => {
    const sample = `!!!
%html
  %head
    %meta{charset: "utf-8"}
    %title Sample HAML Document
    %link{rel: "stylesheet", href: "styles.css"}
  %body
    %header#main-header
      %nav.navigation
        %ul.nav-list
          %li.nav-item
            %a{href: "/"} Home
          %li.nav-item
            %a{href: "/about"} About
          %li.nav-item
            %a{href: "/contact"} Contact
    %main.container
      %section#hero.hero-section
        %h1.hero-title Welcome to Our Website
        %p.hero-description This is a sample HAML document demonstrating various features.
      %section.features
        %h2 Features
        %ul.feature-list
          %li Clean and readable syntax
          %li Indentation-based structure
          %li CSS-like selectors for classes and IDs
          %li Attribute support with hash syntax
    %footer.site-footer
      %p © 2024 Sample Website. All rights reserved.`;
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
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.format}
              onChange={(e) => setOptions({ ...options, format: e.target.checked })}
              className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
            />
            <span className="text-slate-300">Format output HTML</span>
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-slate-300">Self-closing tags:</span>
            <select
              value={options.selfClosing}
              onChange={(e) => setOptions({ ...options, selfClosing: e.target.value })}
              className="px-3 py-1 bg-slate-700/50 border border-slate-600 rounded text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="xhtml">XHTML (/&gt;)</option>
              <option value="html5">HTML5 (&gt;)</option>
              <option value="html4">HTML4 (&gt;)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Input/Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">HAML Input</h3>
            <button
              onClick={loadSampleHaml}
              className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors text-sm"
            >
              Load Sample
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your HAML code here..."
            className="w-full h-64 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button
            onClick={convertHamlToHtml}
            className="mt-4 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            Convert to HTML
          </button>
        </div>

        {/* Output */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">HTML Output</h3>
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
            placeholder="HTML output will appear here..."
            className="w-full h-64 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none"
          />
        </div>
      </div>

      {/* HAML Syntax Guide */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">HAML Syntax Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="text-purple-400 font-medium mb-2">Basic Elements</h4>
            <div className="space-y-1 text-slate-300 font-mono">
              <div><span className="text-purple-400">%div</span> → &lt;div&gt;&lt;/div&gt;</div>
              <div><span className="text-purple-400">%h1</span> Hello → &lt;h1&gt;Hello&lt;/h1&gt;</div>
              <div><span className="text-purple-400">%p</span> Text → &lt;p&gt;Text&lt;/p&gt;</div>
              <div><span className="text-purple-400">%br</span> → &lt;br&gt;</div>
            </div>
          </div>
          <div>
            <h4 className="text-purple-400 font-medium mb-2">Classes & IDs</h4>
            <div className="space-y-1 text-slate-300 font-mono">
              <div><span className="text-purple-400">.class</span> → &lt;div class="class"&gt;</div>
              <div><span className="text-purple-400">#id</span> → &lt;div id="id"&gt;</div>
              <div><span className="text-purple-400">%div.class</span> → &lt;div class="class"&gt;</div>
              <div><span className="text-purple-400">%div#id.class</span> → &lt;div id="id" class="class"&gt;</div>
            </div>
          </div>
          <div>
            <h4 className="text-purple-400 font-medium mb-2">Attributes</h4>
            <div className="space-y-1 text-slate-300 font-mono text-xs">
              <div><span className="text-purple-400">%a{`{href: "url"}`}</span> → &lt;a href="url"&gt;</div>
              <div><span className="text-purple-400">%img{`{src: "pic.jpg", alt: "Alt"}`}</span></div>
              <div><span className="text-purple-400">%input{`{type: "text", name: "field"}`}</span></div>
            </div>
          </div>
          <div>
            <h4 className="text-purple-400 font-medium mb-2">Special Characters</h4>
            <div className="space-y-1 text-slate-300 font-mono">
              <div><span className="text-purple-400">/</span> Comment (ignored)</div>
              <div><span className="text-purple-400">=</span> Dynamic content</div>
              <div><span className="text-purple-400">!!!</span> DOCTYPE declaration</div>
              <div>Indentation defines nesting</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HamlToHtml;