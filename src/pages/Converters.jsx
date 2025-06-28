import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import ToolCard from '../components/ToolCard';
import UnitConverter from '../components/tools/UnitConverter';
import NumberBaseConverter from '../components/tools/NumberBaseConverter';
import TimestampConverter from '../components/tools/TimestampConverter';
import CssUnitConverter from '../components/tools/CssUnitConverter';

const Converters = () => {
  const [selectedTool, setSelectedTool] = useState(null);

  const tools = [
    {
      id: 'unit-converter',
      title: 'Unit Converter',
      description: 'Convert between different units of measurement',
      icon: FiIcons.FiRefreshCw,
      color: 'from-blue-500 to-cyan-500',
      component: UnitConverter
    },
    {
      id: 'number-base',
      title: 'Number Base Converter',
      description: 'Convert between binary, decimal, hex, and octal',
      icon: FiIcons.FiHash,
      color: 'from-green-500 to-emerald-500',
      component: NumberBaseConverter
    },
    {
      id: 'timestamp-converter',
      title: 'Timestamp Converter',
      description: 'Convert between timestamps and human dates',
      icon: FiIcons.FiClock,
      color: 'from-purple-500 to-pink-500',
      component: TimestampConverter
    },
    {
      id: 'css-unit-converter',
      title: 'CSS Unit Converter',
      description: 'Convert between px, rem, em, and other CSS units',
      icon: FiIcons.FiMonitor,
      color: 'from-orange-500 to-red-500',
      component: CssUnitConverter
    },
  ];

  if (selectedTool) {
    const ToolComponent = selectedTool.component;
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 min-h-screen"
      >
        <div className="mb-6">
          <button
            onClick={() => setSelectedTool(null)}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <SafeIcon icon={FiIcons.FiArrowLeft} />
            <span>Back to Converters</span>
          </button>
          <h1 className="text-3xl font-bold text-white">{selectedTool.title}</h1>
          <p className="text-slate-400 mt-2">{selectedTool.description}</p>
        </div>
        <ToolComponent />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 min-h-screen"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Data Converters</h1>
        <p className="text-slate-400 text-lg">Convert between different data formats and units</p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            index={index}
            onClick={() => setSelectedTool(tool)}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default Converters;