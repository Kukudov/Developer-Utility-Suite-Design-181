import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiDownload, FiEye, FiSettings } = FiIcons;

const HtmlToPdf = () => {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState({
    pageSize: 'A4',
    orientation: 'portrait',
    margins: 'normal',
    includeCSS: true,
    pageNumbers: false
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = async () => {
    if (!input.trim()) return;

    setIsGenerating(true);
    
    try {
      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank');
      
      // Prepare HTML content with styles
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Generated PDF</title>
    <style>
        @page {
            size: ${options.pageSize} ${options.orientation};
            margin: ${getMarginValue(options.margins)};
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: none;
        }
        
        ${options.includeCSS ? `
        h1, h2, h3, h4, h5, h6 {
            color: #2c3e50;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
        }
        
        h1 { font-size: 2.5em; border-bottom: 2px solid #3498db; padding-bottom: 0.3em; }
        h2 { font-size: 2em; }
        h3 { font-size: 1.5em; }
        
        p { margin-bottom: 1em; }
        
        a {
            color: #3498db;
            text-decoration: none;
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        blockquote {
            border-left: 4px solid #3498db;
            padding-left: 1em;
            margin: 1em 0;
            font-style: italic;
            color: #666;
        }
        
        code {
            background-color: #f8f9fa;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }
        
        pre {
            background-color: #f8f9fa;
            padding: 1em;
            border-radius: 5px;
            overflow-x: auto;
            border: 1px solid #e9ecef;
        }
        
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 0.75em;
            text-align: left;
        }
        
        th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        
        ul, ol {
            padding-left: 2em;
            margin: 1em 0;
        }
        
        li {
            margin-bottom: 0.5em;
        }
        
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 1em auto;
        }
        ` : ''}
        
        ${options.pageNumbers ? `
        @page {
            @bottom-right {
                content: counter(page);
                font-size: 12px;
            }
        }
        ` : ''}
        
        @media print {
            body {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
        }
    </style>
</head>
<body>
    ${input}
</body>
</html>`;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setIsGenerating(false);
      }, 1000);

    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsGenerating(false);
    }
  };

  const previewHtml = () => {
    const previewWindow = window.open('', '_blank');
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>HTML Preview</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            color: #333;
        }
    </style>
</head>
<body>
    ${input}
</body>
</html>`;
    
    previewWindow.document.write(htmlContent);
    previewWindow.document.close();
  };

  const getMarginValue = (margins) => {
    switch (margins) {
      case 'none': return '0';
      case 'small': return '0.5in';
      case 'normal': return '1in';
      case 'large': return '1.5in';
      default: return '1in';
    }
  };

  const loadSampleHtml = () => {
    const sample = `<h1>Sample Document</h1>
<p>This is a sample HTML document that will be converted to PDF.</p>

<h2>Features</h2>
<ul>
    <li><strong>Professional formatting</strong> with clean typography</li>
    <li><em>Responsive layouts</em> that work well in print</li>
    <li>Support for <code>inline code</code> and code blocks</li>
    <li>Images and tables are properly handled</li>
</ul>

<h3>Code Example</h3>
<pre><code>function generatePdf() {
    console.log("Converting HTML to PDF...");
    return "Success!";
}</code></pre>

<h3>Table Example</h3>
<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Experience</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>John Doe</td>
            <td>Developer</td>
            <td>5 years</td>
        </tr>
        <tr>
            <td>Jane Smith</td>
            <td>Designer</td>
            <td>3 years</td>
        </tr>
    </tbody>
</table>

<blockquote>
    <p>"The best way to predict the future is to create it." - Peter Drucker</p>
</blockquote>

<p>This document demonstrates various HTML elements that will be properly formatted in the PDF output.</p>`;
    setInput(sample);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Settings */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
          <SafeIcon icon={FiSettings} className="mr-2 text-red-400" />
          PDF Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-white font-medium mb-2">Page Size</label>
            <select
              value={options.pageSize}
              onChange={(e) => setOptions({ ...options, pageSize: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
            >
              <option value="A4">A4</option>
              <option value="A3">A3</option>
              <option value="A5">A5</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
            </select>
          </div>
          <div>
            <label className="block text-white font-medium mb-2">Orientation</label>
            <select
              value={options.orientation}
              onChange={(e) => setOptions({ ...options, orientation: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
          <div>
            <label className="block text-white font-medium mb-2">Margins</label>
            <select
              value={options.margins}
              onChange={(e) => setOptions({ ...options, margins: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
            >
              <option value="none">None</option>
              <option value="small">Small (0.5in)</option>
              <option value="normal">Normal (1in)</option>
              <option value="large">Large (1.5in)</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.includeCSS}
              onChange={(e) => setOptions({ ...options, includeCSS: e.target.checked })}
              className="w-4 h-4 text-red-500 bg-slate-700 border-slate-600 rounded focus:ring-red-500"
            />
            <span className="text-slate-300">Include styling</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.pageNumbers}
              onChange={(e) => setOptions({ ...options, pageNumbers: e.target.checked })}
              className="w-4 h-4 text-red-500 bg-slate-700 border-slate-600 rounded focus:ring-red-500"
            />
            <span className="text-slate-300">Page numbers</span>
          </label>
        </div>
      </div>

      {/* Input */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg">HTML Input</h3>
          <div className="flex space-x-2">
            <button
              onClick={loadSampleHtml}
              className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors text-sm"
            >
              Load Sample
            </button>
            <button
              onClick={previewHtml}
              disabled={!input.trim()}
              className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
            >
              <SafeIcon icon={FiEye} className="text-xs" />
              <span>Preview</span>
            </button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your HTML code here..."
          className="w-full h-64 bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:border-red-500 transition-colors"
        />
        <div className="mt-4 flex space-x-4">
          <button
            onClick={generatePdf}
            disabled={!input.trim() || isGenerating}
            className="flex items-center space-x-2 px-6 py-2 bg-red-500 hover:bg-red-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <SafeIcon icon={FiDownload} />
                <span>Generate PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Information */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">PDF Generation Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="text-red-400 font-medium mb-2">Supported Elements</h4>
            <ul className="space-y-1 text-slate-300">
              <li>• Headers and paragraphs</li>
              <li>• Lists and tables</li>
              <li>• Links and images</li>
              <li>• Code blocks and inline code</li>
              <li>• Blockquotes and formatting</li>
            </ul>
          </div>
          <div>
            <h4 className="text-red-400 font-medium mb-2">PDF Options</h4>
            <ul className="space-y-1 text-slate-300">
              <li>• Multiple page sizes (A4, Letter, etc.)</li>
              <li>• Portrait and landscape orientation</li>
              <li>• Customizable margins</li>
              <li>• Optional styling and page numbers</li>
              <li>• Print-optimized formatting</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-sm">
            <strong>Note:</strong> This tool uses your browser's print functionality to generate PDFs. 
            Make sure to select "Save as PDF" in the print dialog that opens.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default HtmlToPdf;