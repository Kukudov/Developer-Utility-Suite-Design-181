import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiMonitor } = FiIcons;

const CssUnitConverter = () => {
  const [baseFontSize, setBaseFontSize] = useState(16);
  const [parentFontSize, setParentFontSize] = useState(16);
  const [inputValue, setInputValue] = useState('');
  const [inputUnit, setInputUnit] = useState('px');
  const [results, setResults] = useState({});

  const units = {
    px: { name: 'Pixels', type: 'absolute' },
    rem: { name: 'Root EM', type: 'relative' },
    em: { name: 'EM', type: 'relative' },
    '%': { name: 'Percentage', type: 'relative' },
    vw: { name: 'Viewport Width', type: 'viewport' },
    vh: { name: 'Viewport Height', type: 'viewport' },
    vmin: { name: 'Viewport Min', type: 'viewport' },
    vmax: { name: 'Viewport Max', type: 'viewport' },
    pt: { name: 'Points', type: 'absolute' },
    pc: { name: 'Picas', type: 'absolute' },
    in: { name: 'Inches', type: 'absolute' },
    cm: { name: 'Centimeters', type: 'absolute' },
    mm: { name: 'Millimeters', type: 'absolute' }
  };

  const convertUnits = () => {
    if (!inputValue || isNaN(inputValue)) {
      setResults({});
      return;
    }

    const value = parseFloat(inputValue);
    const newResults = {};

    // Convert input to pixels first
    let pixelValue;
    switch (inputUnit) {
      case 'px':
        pixelValue = value;
        break;
      case 'rem':
        pixelValue = value * baseFontSize;
        break;
      case 'em':
        pixelValue = value * parentFontSize;
        break;
      case '%':
        pixelValue = (value / 100) * parentFontSize;
        break;
      case 'pt':
        pixelValue = value * (96 / 72); // 1pt = 1/72 inch, 96px = 1 inch
        break;
      case 'pc':
        pixelValue = value * 16; // 1pc = 12pt = 16px
        break;
      case 'in':
        pixelValue = value * 96;
        break;
      case 'cm':
        pixelValue = value * (96 / 2.54);
        break;
      case 'mm':
        pixelValue = value * (96 / 25.4);
        break;
      case 'vw':
        pixelValue = value * (window.innerWidth / 100);
        break;
      case 'vh':
        pixelValue = value * (window.innerHeight / 100);
        break;
      case 'vmin':
        pixelValue = value * (Math.min(window.innerWidth, window.innerHeight) / 100);
        break;
      case 'vmax':
        pixelValue = value * (Math.max(window.innerWidth, window.innerHeight) / 100);
        break;
      default:
        pixelValue = value;
    }

    // Convert pixels to all other units
    Object.keys(units).forEach(unit => {
      if (unit === inputUnit) {
        newResults[unit] = value;
        return;
      }

      switch (unit) {
        case 'px':
          newResults[unit] = pixelValue;
          break;
        case 'rem':
          newResults[unit] = pixelValue / baseFontSize;
          break;
        case 'em':
          newResults[unit] = pixelValue / parentFontSize;
          break;
        case '%':
          newResults[unit] = (pixelValue / parentFontSize) * 100;
          break;
        case 'pt':
          newResults[unit] = pixelValue * (72 / 96);
          break;
        case 'pc':
          newResults[unit] = pixelValue / 16;
          break;
        case 'in':
          newResults[unit] = pixelValue / 96;
          break;
        case 'cm':
          newResults[unit] = pixelValue / (96 / 2.54);
          break;
        case 'mm':
          newResults[unit] = pixelValue / (96 / 25.4);
          break;
        case 'vw':
          newResults[unit] = pixelValue / (window.innerWidth / 100);
          break;
        case 'vh':
          newResults[unit] = pixelValue / (window.innerHeight / 100);
          break;
        case 'vmin':
          newResults[unit] = pixelValue / (Math.min(window.innerWidth, window.innerHeight) / 100);
          break;
        case 'vmax':
          newResults[unit] = pixelValue / (Math.max(window.innerWidth, window.innerHeight) / 100);
          break;
      }
    });

    setResults(newResults);
  };

  const handleInputChange = (value) => {
    setInputValue(value);
    if (value) {
      convertUnits();
    } else {
      setResults({});
    }
  };

  const copyToClipboard = async (value, unit) => {
    try {
      await navigator.clipboard.writeText(`${value}${unit}`);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatValue = (value) => {
    if (typeof value !== 'number') return value;
    return Math.round(value * 1000) / 1000;
  };

  const getUnitsByType = (type) => {
    return Object.entries(units).filter(([, unit]) => unit.type === type);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Settings */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white font-medium mb-2">Root Font Size (px)</label>
            <input
              type="number"
              value={baseFontSize}
              onChange={(e) => {
                setBaseFontSize(parseFloat(e.target.value) || 16);
                if (inputValue) convertUnits();
              }}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-white font-medium mb-2">Parent Font Size (px)</label>
            <input
              type="number"
              value={parentFontSize}
              onChange={(e) => {
                setParentFontSize(parseFloat(e.target.value) || 16);
                if (inputValue) convertUnits();
              }}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
          <SafeIcon icon={FiMonitor} className="mr-2 text-orange-400" />
          CSS Unit Converter
        </h3>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Enter value..."
            className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
          />
          <select
            value={inputUnit}
            onChange={(e) => {
              setInputUnit(e.target.value);
              if (inputValue) convertUnits();
            }}
            className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
          >
            {Object.entries(units).map(([unit, info]) => (
              <option key={unit} value={unit}>{unit} - {info.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {Object.keys(results).length > 0 && (
        <div className="space-y-6">
          {/* Absolute Units */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-white font-semibold text-lg mb-4">Absolute Units</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getUnitsByType('absolute').map(([unit, info]) => (
                <div key={unit} className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm">{info.name}</span>
                    <button
                      onClick={() => copyToClipboard(formatValue(results[unit]), unit)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <SafeIcon icon={FiIcons.FiCopy} className="text-xs" />
                    </button>
                  </div>
                  <p className="text-orange-400 font-mono text-lg">
                    {formatValue(results[unit])}{unit}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Relative Units */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-white font-semibold text-lg mb-4">Relative Units</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getUnitsByType('relative').map(([unit, info]) => (
                <div key={unit} className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm">{info.name}</span>
                    <button
                      onClick={() => copyToClipboard(formatValue(results[unit]), unit)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <SafeIcon icon={FiIcons.FiCopy} className="text-xs" />
                    </button>
                  </div>
                  <p className="text-blue-400 font-mono text-lg">
                    {formatValue(results[unit])}{unit}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Viewport Units */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-white font-semibold text-lg mb-4">Viewport Units</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {getUnitsByType('viewport').map(([unit, info]) => (
                <div key={unit} className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm">{info.name}</span>
                    <button
                      onClick={() => copyToClipboard(formatValue(results[unit]), unit)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <SafeIcon icon={FiIcons.FiCopy} className="text-xs" />
                    </button>
                  </div>
                  <p className="text-purple-400 font-mono text-lg">
                    {formatValue(results[unit])}{unit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">CSS Unit Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-orange-400 mb-2">Absolute Units</h4>
            <ul className="space-y-1 text-slate-300">
              <li>• px: Pixels (most common)</li>
              <li>• pt: Points (typography)</li>
              <li>• in: Inches (print)</li>
              <li>• cm/mm: Centimeters/Millimeters</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-400 mb-2">Relative Units</h4>
            <ul className="space-y-1 text-slate-300">
              <li>• rem: Relative to root font size</li>
              <li>• em: Relative to parent font size</li>
              <li>• %: Percentage of parent</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-purple-400 mb-2">Viewport Units</h4>
            <ul className="space-y-1 text-slate-300">
              <li>• vw: Viewport width</li>
              <li>• vh: Viewport height</li>
              <li>• vmin/vmax: Min/max viewport</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CssUnitConverter;