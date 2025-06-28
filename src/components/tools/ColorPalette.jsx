import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCopy, FiCheck, FiRefreshCw, FiDroplet } = FiIcons;

const ColorPalette = () => {
  const [palette, setPalette] = useState([]);
  const [copiedColor, setCopiedColor] = useState('');
  const [paletteType, setPaletteType] = useState('random');

  const generateRandomColor = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  };

  const hexToHsl = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };

  const hslToHex = (h, s, l) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const generatePalette = () => {
    let newPalette = [];

    switch (paletteType) {
      case 'random':
        newPalette = Array.from({ length: 5 }, () => generateRandomColor());
        break;
      
      case 'monochromatic':
        const baseColor = generateRandomColor();
        const [h, s] = hexToHsl(baseColor);
        newPalette = [20, 40, 60, 80, 100].map(l => hslToHex(h, s, l));
        break;
      
      case 'analogous':
        const baseHue = Math.floor(Math.random() * 360);
        newPalette = [-30, -15, 0, 15, 30].map(offset => 
          hslToHex((baseHue + offset + 360) % 360, 70, 60)
        );
        break;
      
      case 'complementary':
        const primaryHue = Math.floor(Math.random() * 360);
        const complementaryHue = (primaryHue + 180) % 360;
        newPalette = [
          hslToHex(primaryHue, 70, 40),
          hslToHex(primaryHue, 70, 60),
          hslToHex(primaryHue, 70, 80),
          hslToHex(complementaryHue, 70, 60),
          hslToHex(complementaryHue, 70, 80)
        ];
        break;
      
      case 'triadic':
        const triadicBase = Math.floor(Math.random() * 360);
        newPalette = [0, 120, 240].map(offset => 
          hslToHex((triadicBase + offset) % 360, 70, 60)
        );
        newPalette.push(hslToHex(triadicBase, 50, 80));
        newPalette.push(hslToHex(triadicBase, 90, 40));
        break;
    }

    setPalette(newPalette);
  };

  const copyColor = async (color) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copyPalette = async () => {
    try {
      await navigator.clipboard.writeText(palette.join(', '));
      setCopiedColor('palette');
      setTimeout(() => setCopiedColor(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const paletteTypes = [
    { value: 'random', label: 'Random' },
    { value: 'monochromatic', label: 'Monochromatic' },
    { value: 'analogous', label: 'Analogous' },
    { value: 'complementary', label: 'Complementary' },
    { value: 'triadic', label: 'Triadic' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Controls */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-white font-medium mb-2">Palette Type</label>
            <select
              value={paletteType}
              onChange={(e) => setPaletteType(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              {paletteTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={generatePalette}
            className="flex items-center space-x-2 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            <SafeIcon icon={FiRefreshCw} />
            <span>Generate</span>
          </button>
        </div>
      </div>

      {/* Palette */}
      {palette.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg flex items-center">
              <SafeIcon icon={FiDroplet} className="mr-2 text-purple-400" />
              Color Palette
            </h3>
            <button
              onClick={copyPalette}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
            >
              <SafeIcon icon={copiedColor === 'palette' ? FiCheck : FiCopy} className={copiedColor === 'palette' ? 'text-green-400' : ''} />
              <span>{copiedColor === 'palette' ? 'Copied!' : 'Copy All'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {palette.map((color, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div
                  className="w-full h-32 rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-105"
                  style={{ backgroundColor: color }}
                  onClick={() => copyColor(color)}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                    <SafeIcon 
                      icon={copiedColor === color ? FiCheck : FiCopy} 
                      className={`text-white opacity-0 group-hover:opacity-100 transition-opacity ${copiedColor === color ? 'text-green-400' : ''}`} 
                    />
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-white font-mono text-sm">{color.toUpperCase()}</p>
                  <p className="text-slate-400 text-xs mt-1">
                    HSL({hexToHsl(color).join(', ')})
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">Palette Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300 text-sm">
          <div>
            <h4 className="font-medium text-white mb-2">Monochromatic</h4>
            <p>Uses different shades and tints of a single color</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Analogous</h4>
            <p>Uses colors that are next to each other on the color wheel</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Complementary</h4>
            <p>Uses colors that are opposite each other on the color wheel</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Triadic</h4>
            <p>Uses three colors equally spaced on the color wheel</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ColorPalette;