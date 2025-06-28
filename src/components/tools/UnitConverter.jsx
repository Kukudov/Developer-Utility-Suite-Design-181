import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiRefreshCw } = FiIcons;

const UnitConverter = () => {
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');

  const conversions = {
    length: {
      name: 'Length',
      units: {
        mm: { name: 'Millimeters', factor: 0.001 },
        cm: { name: 'Centimeters', factor: 0.01 },
        m: { name: 'Meters', factor: 1 },
        km: { name: 'Kilometers', factor: 1000 },
        in: { name: 'Inches', factor: 0.0254 },
        ft: { name: 'Feet', factor: 0.3048 },
        yd: { name: 'Yards', factor: 0.9144 },
        mi: { name: 'Miles', factor: 1609.344 }
      }
    },
    weight: {
      name: 'Weight',
      units: {
        mg: { name: 'Milligrams', factor: 0.000001 },
        g: { name: 'Grams', factor: 0.001 },
        kg: { name: 'Kilograms', factor: 1 },
        oz: { name: 'Ounces', factor: 0.0283495 },
        lb: { name: 'Pounds', factor: 0.453592 },
        ton: { name: 'Tons', factor: 1000 }
      }
    },
    temperature: {
      name: 'Temperature',
      units: {
        c: { name: 'Celsius' },
        f: { name: 'Fahrenheit' },
        k: { name: 'Kelvin' }
      }
    },
    volume: {
      name: 'Volume',
      units: {
        ml: { name: 'Milliliters', factor: 0.001 },
        l: { name: 'Liters', factor: 1 },
        cup: { name: 'Cups', factor: 0.236588 },
        pt: { name: 'Pints', factor: 0.473176 },
        qt: { name: 'Quarts', factor: 0.946353 },
        gal: { name: 'Gallons', factor: 3.78541 }
      }
    }
  };

  useEffect(() => {
    const units = Object.keys(conversions[category].units);
    setFromUnit(units[0]);
    setToUnit(units[1]);
    setFromValue('');
    setToValue('');
  }, [category]);

  const convertValue = (value, from, to, cat) => {
    if (!value || isNaN(value)) return '';
    
    const num = parseFloat(value);
    
    if (cat === 'temperature') {
      return convertTemperature(num, from, to);
    }
    
    const fromFactor = conversions[cat].units[from].factor;
    const toFactor = conversions[cat].units[to].factor;
    
    return (num * fromFactor / toFactor).toFixed(8).replace(/\.?0+$/, '');
  };

  const convertTemperature = (value, from, to) => {
    let celsius;
    
    // Convert to Celsius first
    switch (from) {
      case 'c': celsius = value; break;
      case 'f': celsius = (value - 32) * 5/9; break;
      case 'k': celsius = value - 273.15; break;
    }
    
    // Convert from Celsius to target
    switch (to) {
      case 'c': return celsius.toFixed(2);
      case 'f': return (celsius * 9/5 + 32).toFixed(2);
      case 'k': return (celsius + 273.15).toFixed(2);
    }
  };

  const handleFromValueChange = (value) => {
    setFromValue(value);
    setToValue(convertValue(value, fromUnit, toUnit, category));
  };

  const handleToValueChange = (value) => {
    setToValue(value);
    setFromValue(convertValue(value, toUnit, fromUnit, category));
  };

  const swapUnits = () => {
    const tempUnit = fromUnit;
    const tempValue = fromValue;
    
    setFromUnit(toUnit);
    setToUnit(tempUnit);
    setFromValue(toValue);
    setToValue(tempValue);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Category Selection */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">Conversion Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(conversions).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                category === key 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Converter */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* From */}
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">From</label>
              <select
                value={fromUnit}
                onChange={(e) => {
                  setFromUnit(e.target.value);
                  setToValue(convertValue(fromValue, e.target.value, toUnit, category));
                }}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                {Object.entries(conversions[category].units).map(([key, unit]) => (
                  <option key={key} value={key}>{unit.name}</option>
                ))}
              </select>
            </div>
            <input
              type="number"
              value={fromValue}
              onChange={(e) => handleFromValueChange(e.target.value)}
              placeholder="Enter value..."
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={swapUnits}
              className="p-3 bg-slate-600 hover:bg-slate-500 text-white rounded-full transition-colors"
            >
              <SafeIcon icon={FiRefreshCw} className="text-xl" />
            </button>
          </div>

          {/* To */}
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">To</label>
              <select
                value={toUnit}
                onChange={(e) => {
                  setToUnit(e.target.value);
                  setToValue(convertValue(fromValue, fromUnit, e.target.value, category));
                }}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                {Object.entries(conversions[category].units).map(([key, unit]) => (
                  <option key={key} value={key}>{unit.name}</option>
                ))}
              </select>
            </div>
            <input
              type="number"
              value={toValue}
              onChange={(e) => handleToValueChange(e.target.value)}
              placeholder="Result..."
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Quick Conversions */}
      {fromValue && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold text-lg mb-4">Quick Conversions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(conversions[category].units)
              .filter(([key]) => key !== fromUnit)
              .map(([key, unit]) => (
                <div key={key} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-300">{unit.name}</span>
                  <span className="text-blue-400 font-mono">
                    {convertValue(fromValue, fromUnit, key, category)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UnitConverter;