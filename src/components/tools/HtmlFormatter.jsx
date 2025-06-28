import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCode, FiCopy, FiCheck } = FiIcons;

const HtmlFormatter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const formatHtml = () => {
    if (!input.trim()) return;

    try {
      let formatted = input;
      let indentLevel = 0;
      const indentSize = 2;

      // Remove extra whitespace
      formatted = formatted.replace(/>\s*</g, '><');
      
      // Add line breaks before opening tags
      formatted = formatted.replace(/</g, '\n<');
      
      // Split into lines and process each
      const lines = formatted.split('\n').filter(line => line.trim());
      const formattedLines = [];

      lines.forEach(line => {
        const trimmedLine = line.trim();
        
        // Decrease indent for closing tags
        if (trimmedLine.startsWith('</') && !trimmedLine.match(/<\/\w+>.*<\w+/)) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
        
        // Self-closing tags or inline elements
        const isSelfClosing = trimmedLine.includes('/>') || 
                             trimmedLine.match(/<(br|hr|img|input|meta|link|area|base|col|embed|source|track|wbr)[^>]*>/i);
        const isInline = trimmedLine.match(/<(span|a|strong|em|b|i|small|sub|sup|code|kbd|var|samp)[^>]*>.*<\/\1>/i);
        
        // Add indentation
        const indentedLine = ' '.repeat(indentLevel * indentSize) + trimmedLine;
        formattedLines.push(indentedLine);
        
        // Increase indent for opening tags (except self-closing and inline)
        if (trimmedLine.startsWith('<') && 
            !trimmedLine.startsWith('</') && 
            !isSelfClosing && 
            !isInline &&
            !trimmedLine.includes('</')){
          indentLevel++;
        }
      });

      setOutput(formattedLines.join('\n'));
    } catch (error) {
      setOutput('Error formatting HTML: ' + error.message);
    }
  };

  const minifyHtml = () => {
    if (!input.trim()) return;

    const minified = input
      .replace(/>\s+</g, '><') // Remove whitespace between tags
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/<!--.*?-->/g, '') // Remove comments
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

  const sampleHtml = `<div class="container"><header><h1>Welcome to My Website</h1><nav><ul><li><a href="#home">Home</a></li><li><a href="#about">About</a></li><li><a href="#contact">Contact</a></li></ul></nav></header><main><section id="hero"><h2>Hero Section</h2><p>This is a sample paragraph with some <strong>bold text</strong> and <em>italic text</em>.</p><button type="button" class="btn btn-primary">Click Me</button></section></main><footer><p>&copy; 2024 My Website. All rights reserved.</p></footer></div>`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Controls */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
          <SafeIcon icon={FiCode} className="mr-2 text-orange-400" />
          HTML Formatter & Minifier
        </h3>

        <div className="space-y-4">
          <div>
            <button
              onClick={() => setInput(sampleHtml)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors text-sm"
            >
              Load Sample HTML
            </button>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={formatHtml}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              Format HTML
            </button>
            <button
              onClick={minifyHtml}
              className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
            >
              Minify HTML
            </button>
          </div>
        </div>
      </div>

      {/* Input/Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold text-lg mb-4">HTML Input</h3>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your HTML code here..."
            className="w-full h-64 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Output */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">Formatted HTML</h3>
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
            placeholder="Formatted HTML will appear here..."
            className="w-full h-64 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none"
          />
        </div>
      </div>

      {/* HTML Reference */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">HTML Elements Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="text-orange-400 font-medium mb-2">Structure</h4>
            <div className="space-y-1 text-slate-300">
              <div><code className="text-orange-400">html</code> - Document root</div>
              <div><code className="text-orange-400">head</code> - Document metadata</div>
              <div><code className="text-orange-400">body</code> - Document content</div>
              <div><code className="text-orange-400">header</code> - Page header</div>
              <div><code className="text-orange-400">nav</code> - Navigation</div>
              <div><code className="text-orange-400">main</code> - Main content</div>
              <div><code className="text-orange-400">footer</code> - Page footer</div>
            </div>
          </div>
          
          <div>
            <h4 className="text-orange-400 font-medium mb-2">Content</h4>
            <div className="space-y-1 text-slate-300">
              <div><code className="text-orange-400">h1-h6</code> - Headings</div>
              <div><code className="text-orange-400">p</code> - Paragraph</div>
              <div><code className="text-orange-400">div</code> - Generic container</div>
              <div><code className="text-orange-400">span</code> - Inline container</div>
              <div><code className="text-orange-400">ul, ol, li</code> - Lists</div>
              <div><code className="text-orange-400">a</code> - Links</div>
              <div><code className="text-orange-400">img</code> - Images</div>
            </div>
          </div>
          
          <div>
            <h4 className="text-orange-400 font-medium mb-2">Forms</h4>
            <div className="space-y-1 text-slate-300">
              <div><code className="text-orange-400">form</code> - Form container</div>
              <div><code className="text-orange-400">input</code> - Input field</div>
              <div><code className="text-orange-400">textarea</code> - Text area</div>
              <div><code className="text-orange-400">select</code> - Dropdown</div>
              <div><code className="text-orange-400">button</code> - Button</div>
              <div><code className="text-orange-400">label</code> - Input label</div>
              <div><code className="text-orange-400">fieldset</code> - Field grouping</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HtmlFormatter;