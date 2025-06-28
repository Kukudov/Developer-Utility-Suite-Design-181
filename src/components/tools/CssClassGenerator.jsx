import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCopy, FiCheck, FiRefreshCw } = FiIcons;

const CssClassGenerator = () => {
  const [className, setClassName] = useState('');
  const [properties, setProperties] = useState({
    display: '',
    flexDirection: '',
    justifyContent: '',
    alignItems: '',
    gap: '',
    padding: '',
    margin: '',
    backgroundColor: '',
    color: '',
    fontSize: '',
    fontWeight: '',
    borderRadius: '',
    border: '',
    boxShadow: '',
    width: '',
    height: '',
    position: '',
    top: '',
    left: '',
    zIndex: ''
  });
  const [copied, setCopied] = useState(false);

  const generateCSS = () => {
    const css = [];
    const validProperties = Object.entries(properties).filter(([_, value]) => value.trim() !== '');
    
    if (validProperties.length === 0 || !className.trim()) return '';

    css.push(`.${className.trim()} {`);
    
    validProperties.forEach(([property, value]) => {
      const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
      css.push(`  ${cssProperty}: ${value.trim()};`);
    });
    
    css.push('}');
    
    return css.join('\n');
  };

  const copyToClipboard = async () => {
    const css = generateCSS();
    if (!css) return;

    try {
      await navigator.clipboard.writeText(css);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const clearAll = () => {
    setClassName('');
    setProperties({
      display: '',
      flexDirection: '',
      justifyContent: '',
      alignItems: '',
      gap: '',
      padding: '',
      margin: '',
      backgroundColor: '',
      color: '',
      fontSize: '',
      fontWeight: '',
      borderRadius: '',
      border: '',
      boxShadow: '',
      width: '',
      height: '',
      position: '',
      top: '',
      left: '',
      zIndex: ''
    });
  };

  const presets = [
    {
      name: 'Flexbox Center',
      className: 'flex-center',
      properties: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }
    },
    {
      name: 'Card Component',
      className: 'card',
      properties: {
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }
    },
    {
      name: 'Button Primary',
      className: 'btn-primary',
      properties: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        borderRadius: '0.375rem',
        fontWeight: '500',
        border: 'none'
      }
    },
    {
      name: 'Grid Container',
      className: 'grid-container',
      properties: {
        display: 'grid',
        gap: '1rem',
        padding: '1rem'
      }
    }
  ];

  const loadPreset = (preset) => {
    setClassName(preset.className);
    setProperties({ ...properties, ...preset.properties });
  };

  const css = generateCSS();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Class Name */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">CSS Class Generator</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">Class Name</label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="my-awesome-class"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          
          {/* Presets */}
          <div>
            <label className="block text-white font-medium mb-2">Quick Presets</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => loadPreset(preset)}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors text-sm"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Properties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Layout Properties */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h4 className="text-white font-semibold text-lg mb-4">Layout & Positioning</h4>
          <div className="space-y-3">
            {[
              { key: 'display', label: 'Display', placeholder: 'flex, grid, block, inline...' },
              { key: 'position', label: 'Position', placeholder: 'relative, absolute, fixed...' },
              { key: 'flexDirection', label: 'Flex Direction', placeholder: 'row, column...' },
              { key: 'justifyContent', label: 'Justify Content', placeholder: 'center, space-between...' },
              { key: 'alignItems', label: 'Align Items', placeholder: 'center, flex-start...' },
              { key: 'gap', label: 'Gap', placeholder: '1rem, 16px...' },
              { key: 'width', label: 'Width', placeholder: '100%, 300px...' },
              { key: 'height', label: 'Height', placeholder: 'auto, 200px...' },
              { key: 'top', label: 'Top', placeholder: '0, 10px...' },
              { key: 'left', label: 'Left', placeholder: '0, 10px...' },
              { key: 'zIndex', label: 'Z-Index', placeholder: '10, 999...' }
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-slate-300 text-sm mb-1">{label}</label>
                <input
                  type="text"
                  value={properties[key]}
                  onChange={(e) => setProperties({ ...properties, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Styling Properties */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h4 className="text-white font-semibold text-lg mb-4">Styling & Appearance</h4>
          <div className="space-y-3">
            {[
              { key: 'padding', label: 'Padding', placeholder: '1rem, 16px 24px...' },
              { key: 'margin', label: 'Margin', placeholder: '1rem, 0 auto...' },
              { key: 'backgroundColor', label: 'Background Color', placeholder: '#ffffff, red, rgba(...)' },
              { key: 'color', label: 'Text Color', placeholder: '#000000, blue...' },
              { key: 'fontSize', label: 'Font Size', placeholder: '16px, 1rem...' },
              { key: 'fontWeight', label: 'Font Weight', placeholder: 'bold, 500...' },
              { key: 'borderRadius', label: 'Border Radius', placeholder: '4px, 0.5rem...' },
              { key: 'border', label: 'Border', placeholder: '1px solid #ccc...' },
              { key: 'boxShadow', label: 'Box Shadow', placeholder: '0 2px 4px rgba(0,0,0,0.1)...' }
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-slate-300 text-sm mb-1">{label}</label>
                <input
                  type="text"
                  value={properties[key]}
                  onChange={(e) => setProperties({ ...properties, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Generated CSS */}
      {css && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">Generated CSS</h3>
            <div className="flex space-x-2">
              <button
                onClick={clearAll}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
              >
                <SafeIcon icon={FiRefreshCw} />
                <span>Clear All</span>
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                <SafeIcon icon={copied ? FiCheck : FiCopy} className={copied ? 'text-green-400' : ''} />
                <span>{copied ? 'Copied!' : 'Copy CSS'}</span>
              </button>
            </div>
          </div>
          <pre className="bg-slate-900/50 rounded-lg p-4 overflow-x-auto">
            <code className="text-green-400 font-mono text-sm whitespace-pre">{css}</code>
          </pre>
        </div>
      )}

      {/* Tips */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">CSS Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
          <div>
            <h4 className="text-white font-medium mb-2">Modern CSS Units</h4>
            <ul className="space-y-1">
              <li>• rem: Relative to root font size</li>
              <li>• em: Relative to parent font size</li>
              <li>• vw/vh: Viewport width/height</li>
              <li>• ch: Character width</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Flexbox Quick Reference</h4>
            <ul className="space-y-1">
              <li>• justify-content: main axis alignment</li>
              <li>• align-items: cross axis alignment</li>
              <li>• flex-direction: row or column</li>
              <li>• gap: spacing between items</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CssClassGenerator;