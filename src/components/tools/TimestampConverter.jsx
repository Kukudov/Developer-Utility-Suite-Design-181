import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, fromUnixTime, getUnixTime, parseISO } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiClock, FiCopy, FiCheck } = FiIcons;

const TimestampConverter = () => {
  const [timestamp, setTimestamp] = useState('');
  const [humanDate, setHumanDate] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [copiedField, setCopiedField] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const convertTimestampToHuman = (ts) => {
    try {
      const num = parseInt(ts);
      if (isNaN(num)) return '';
      
      // Handle both seconds and milliseconds
      const date = num > 1e10 ? new Date(num) : fromUnixTime(num);
      return format(date, 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      return '';
    }
  };

  const convertHumanToTimestamp = (dateStr) => {
    try {
      const date = parseISO(dateStr.replace(' ', 'T'));
      return getUnixTime(date).toString();
    } catch (error) {
      return '';
    }
  };

  const handleTimestampChange = (value) => {
    setTimestamp(value);
    setHumanDate(convertTimestampToHuman(value));
  };

  const handleHumanDateChange = (value) => {
    setHumanDate(value);
    setTimestamp(convertHumanToTimestamp(value));
  };

  const copyToClipboard = async (value, field) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const useCurrentTime = () => {
    const now = new Date();
    setTimestamp(getUnixTime(now).toString());
    setHumanDate(format(now, 'yyyy-MM-dd HH:mm:ss'));
  };

  const commonTimestamps = [
    { label: 'Unix Epoch', timestamp: '0', date: '1970-01-01 00:00:00' },
    { label: 'Y2K', timestamp: '946684800', date: '2000-01-01 00:00:00' },
    { label: 'Current Time', timestamp: getUnixTime(currentTime).toString(), date: format(currentTime, 'yyyy-MM-dd HH:mm:ss') },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Current Time Display */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
          <SafeIcon icon={FiClock} className="mr-2 text-purple-400" />
          Current Time
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-700/30 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Unix Timestamp</p>
            <p className="text-purple-400 font-mono text-lg">{getUnixTime(currentTime)}</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-1">Human Readable</p>
            <p className="text-purple-400 font-mono text-lg">{format(currentTime, 'yyyy-MM-dd HH:mm:ss')}</p>
          </div>
        </div>
        <button
          onClick={useCurrentTime}
          className="mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
        >
          Use Current Time
        </button>
      </div>

      {/* Converter */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-6">Timestamp Converter</h3>
        
        <div className="space-y-6">
          {/* Timestamp Input */}
          <div>
            <label className="block text-white font-medium mb-2">Unix Timestamp</label>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={timestamp}
                onChange={(e) => handleTimestampChange(e.target.value)}
                placeholder="Enter Unix timestamp..."
                className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono focus:outline-none focus:border-purple-500 transition-colors"
              />
              {timestamp && (
                <button
                  onClick={() => copyToClipboard(timestamp, 'timestamp')}
                  className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                >
                  <SafeIcon icon={copiedField === 'timestamp' ? FiCheck : FiCopy} className={copiedField === 'timestamp' ? 'text-green-400' : ''} />
                </button>
              )}
            </div>
          </div>

          {/* Human Date Input */}
          <div>
            <label className="block text-white font-medium mb-2">Human Readable Date</label>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={humanDate}
                onChange={(e) => handleHumanDateChange(e.target.value)}
                placeholder="YYYY-MM-DD HH:mm:ss"
                className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white font-mono focus:outline-none focus:border-purple-500 transition-colors"
              />
              {humanDate && (
                <button
                  onClick={() => copyToClipboard(humanDate, 'human')}
                  className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                >
                  <SafeIcon icon={copiedField === 'human' ? FiCheck : FiCopy} className={copiedField === 'human' ? 'text-green-400' : ''} />
                </button>
              )}
            </div>
            <p className="text-slate-400 text-sm mt-1">Format: YYYY-MM-DD HH:mm:ss</p>
          </div>
        </div>
      </div>

      {/* Common Timestamps */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">Common Timestamps</h3>
        <div className="space-y-3">
          {commonTimestamps.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div>
                <p className="text-white font-medium">{item.label}</p>
                <p className="text-slate-400 text-sm">{item.date}</p>
              </div>
              <div className="flex items-center space-x-3">
                <code className="text-purple-400 font-mono">{item.timestamp}</code>
                <button
                  onClick={() => {
                    setTimestamp(item.timestamp);
                    setHumanDate(item.date);
                  }}
                  className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-md hover:bg-purple-500/30 transition-colors text-sm"
                >
                  Use
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">About Unix Timestamps</h3>
        <div className="space-y-2 text-slate-300 text-sm">
          <p>• Unix timestamp represents seconds since January 1, 1970 (Unix Epoch)</p>
          <p>• Commonly used in programming and databases</p>
          <p>• JavaScript uses milliseconds, so multiply by 1000 for JS timestamps</p>
          <p>• Maximum value for 32-bit signed integer: 2147483647 (January 19, 2038)</p>
        </div>
      </div>
    </motion.div>
  );
};

export default TimestampConverter;