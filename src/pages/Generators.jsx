import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import ToolCard from '../components/ToolCard';

import UuidGenerator from '../components/tools/UuidGenerator';
import PasswordGenerator from '../components/tools/PasswordGenerator';
import ColorPalette from '../components/tools/ColorPalette';
import LoremGenerator from '../components/tools/LoremGenerator';
import QrCodeGenerator from '../components/tools/QrCodeGenerator';
import CssClassGenerator from '../components/tools/CssClassGenerator';
import HtmlSchemaGenerator from '../components/tools/HtmlSchemaGenerator';
import MockDataGenerator from '../components/tools/MockDataGenerator';
import ApiResponseGenerator from '../components/tools/ApiResponseGenerator';

const { FiCpu } = FiIcons;

const Generators = () => {
  const [selectedTool, setSelectedTool] = useState(null);

  const tools = [
    {
      id: 'uuid-generator',
      title: 'UUID Generator',
      description: 'Generate unique identifiers (UUID v4)',
      icon: FiIcons.FiHash,
      color: 'from-blue-500 to-cyan-500',
      component: UuidGenerator
    },
    {
      id: 'password-generator',
      title: 'Password Generator',
      description: 'Generate secure passwords with custom options',
      icon: FiIcons.FiLock,
      color: 'from-red-500 to-pink-500',
      component: PasswordGenerator
    },
    {
      id: 'color-palette',
      title: 'Color Palette Generator',
      description: 'Generate beautiful color palettes',
      icon: FiIcons.FiDroplet,
      color: 'from-purple-500 to-indigo-500',
      component: ColorPalette
    },
    {
      id: 'lorem-generator',
      title: 'Lorem Ipsum Generator',
      description: 'Generate placeholder text for designs',
      icon: FiIcons.FiType,
      color: 'from-green-500 to-emerald-500',
      component: LoremGenerator
    },
    {
      id: 'qr-code-generator',
      title: 'QR Code Generator',
      description: 'Generate QR codes for text, URLs, and data',
      icon: FiIcons.FiSquare,
      color: 'from-orange-500 to-red-500',
      component: QrCodeGenerator
    },
    {
      id: 'css-class-generator',
      title: 'CSS Class Generator',
      description: 'Generate CSS classes with visual builder',
      icon: FiIcons.FiCode,
      color: 'from-cyan-500 to-blue-500',
      component: CssClassGenerator
    },
    {
      id: 'html-schema-generator',
      title: 'HTML Schema Generator',
      description: 'Generate structured data markup for SEO',
      icon: FiIcons.FiGlobe,
      color: 'from-yellow-500 to-orange-500',
      component: HtmlSchemaGenerator
    },
    {
      id: 'mock-data-generator',
      title: 'Mock Data Generator',
      description: 'Generate realistic mock data for testing',
      icon: FiIcons.FiDatabase,
      color: 'from-pink-500 to-rose-500',
      component: MockDataGenerator
    },
    {
      id: 'api-response-generator',
      title: 'API Response Generator',
      description: 'Generate realistic API responses for development',
      icon: FiIcons.FiServer,
      color: 'from-indigo-500 to-purple-500',
      component: ApiResponseGenerator
    }
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
            <span>Back to Generators</span>
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
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
          <SafeIcon icon={FiCpu} className="mr-3 text-purple-400" />
          Code Generators
        </h1>
        <p className="text-slate-400 text-lg">Generate boilerplate code, mock data, and development assets</p>
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

      {/* Stats */}
      <div className="mt-12 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <h3 className="text-2xl font-bold text-white">{tools.length}</h3>
            <p className="text-slate-400 text-sm">Generator Tools</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">∞</h3>
            <p className="text-slate-400 text-sm">Combinations</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">5+</h3>
            <p className="text-slate-400 text-sm">Output Formats</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">100%</h3>
            <p className="text-slate-400 text-sm">Free to Use</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Generators;