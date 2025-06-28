import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiHash } = FiIcons;

const NumberBaseConverter = () => {
  const [values, setValues] = useState({
    binary: '',
    octal: '',
    decimal: '',
    hexadecimal: ''
  });

  const bases = {
    binary: { name: 'Binary', base: 2, prefix: '0b', color: 'text-green-400' },
    octal: { name: 'Octal', base: 8, prefix: '0o', color: 'text-blue-400' },
    decimal: { name: 'Decimal', base: 10, prefix: '', color: 'text-purple-400' },
    hexadecimal: { name: 'Hexadecimal', base: 16, prefix: '0x', color: 'text-orange-400' }
  };

  const isValidInput = (value, base) => {
    if (!value) return true;
    const validChars = '0123456789ABCDEF'.slice(0, base);
    return value.toUpperCase().split('').every(char => validChars.includes(char));
  };

  const convertFromDecimal = (decimal) => {
    if (!decimal || isNaN(decimal)) return { binary: '', octal: '', hexadecimal: '' };
    
    const num = parseInt(decimal);
    if (num < 0) return { binary: '', octal: '', hexadecimal: '' };
    
    return {
      binary: num.toString(2),
      octal: num.toString(8),
      hexadecimal: num.toString(16).toUpperCase()
    };
  };

  const handleValueChange = (inputType, value) => {
    const newValues = { ...values };
    newValues[inputType] = value;

    if (!value) {
      setValues({ binary: '', octal: '', decimal: '', hexadecimal: '' });
      return;
    }

    if (!isValidInput(value, bases[inputType].base)) return;

    try {
      const decimal = parseInt(value, bases[inputType].base);
      if (isNaN(decimal) || decimal < 0) return;

      const converted = convertFromDecimal(decimal.toString());
      newValues.decimal = decimal.toString();
      newValues.binary = inputType === 'binary' ? value : converted.binary;
      newValues.octal = inputType === 'octal' ? value : converted.octal;
      newValues.hexadecimal = inputType === 'hexadecimal' ? value.toUpperCase() : converted.hexadecimal;

      setValues(newValues);
    } catch (error) {
      console.error('Conversion error:', error);
    }
  };

  const copyToClipboard = async (value, type) => {
    try {
      const fullValue = bases[type].prefix + value;
      await navigator.clipboard.writeText(fullValue);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-6 flex items-center">
          <SafeIcon icon={FiHash} className="mr-2 text-green-400" />
          Number Base Converter
        </h3>

        <div className="space-y-6">
          {Object.entries(bases).map(([key, base]) => (
            <div key={key} className="space-y-2">
              <label className="block text-white font-medium">
                {base.name} ({base.prefix ? `${base.prefix}...` : 'Base 10'})
              </label>
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={values[key]}
                    onChange={(e) => handleValueChange(key, e.target.value)}
                    placeholder={`Enter ${base.name.toLowerCase()} number...`}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono focus:outline-none focus:border-green-500 transition-colors"
                  />
                  {values[key] && (
                    <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${base.color} text-sm`}>
                      {base.prefix}
                    </span>
                  )}
                </div>
                {values[key] && (
                  <button
                    onClick={() => copyToClipboard(values[key], key)}
                    className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiIcons.FiCopy} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">Number Base Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300 text-sm">
          <div>
            <h4 className="font-medium text-green-400 mb-2">Binary (Base 2)</h4>
            <p>Uses digits 0-1. Common in computer systems.</p>
          </div>
          <div>
            <h4 className="font-medium text-blue-400 mb-2">Octal (Base 8)</h4>
            <p>Uses digits 0-7. Often used in Unix permissions.</p>
          </div>
          <div>
            <h4 className="font-medium text-purple-400 mb-2">Decimal (Base 10)</h4>
            <p>Uses digits 0-9. Standard human counting system.</p>
          </div>
          <div>
            <h4 className="font-medium text-orange-400 mb-2">Hexadecimal (Base 16)</h4>
            <p>Uses 0-9 and A-F. Common in programming and colors.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NumberBaseConverter;