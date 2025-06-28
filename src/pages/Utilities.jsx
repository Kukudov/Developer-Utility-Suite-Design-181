import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import ToolCard from '../components/ToolCard';
import JsonFormatter from '../components/tools/JsonFormatter';
import Base64Tool from '../components/tools/Base64Tool';
import UrlEncoder from '../components/tools/UrlEncoder';
import HashGenerator from '../components/tools/HashGenerator';
import QrCodeGenerator from '../components/tools/QrCodeGenerator';
import TextDiff from '../components/tools/TextDiff';
import RegexTester from '../components/tools/RegexTester';
import ImageOptimizer from '../components/tools/ImageOptimizer';
import SqlFormatter from '../components/tools/SqlFormatter';
import HtmlFormatter from '../components/tools/HtmlFormatter';

const { FiSearch, FiFilter } = FiIcons;

const Utilities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTool, setSelectedTool] = useState(null);

  const categories = [
    { id: 'all', label: 'All Tools' },
    { id: 'text', label: 'Text Processing' },
    { id: 'encoding', label: 'Encoding' },
    { id: 'hash', label: 'Hash & Crypto' },
    { id: 'json', label: 'JSON & Data' },
    { id: 'image', label: 'Image Tools' },
    { id: 'web', label: 'Web Development' },
    { id: 'database', label: 'Database' },
  ];

  const tools = [
    {
      id: 'json-formatter',
      title: 'JSON Formatter',
      description: 'Format, validate and beautify JSON data',
      category: 'json',
      icon: FiIcons.FiCode,
      color: 'from-blue-500 to-cyan-500',
      component: JsonFormatter
    },
    {
      id: 'base64-tool',
      title: 'Base64 Encoder/Decoder',
      description: 'Encode and decode Base64 strings',
      category: 'encoding',
      icon: FiIcons.FiLock,
      color: 'from-purple-500 to-pink-500',
      component: Base64Tool
    },
    {
      id: 'url-encoder',
      title: 'URL Encoder/Decoder',
      description: 'Encode and decode URL strings',
      category: 'encoding',
      icon: FiIcons.FiLink,
      color: 'from-green-500 to-emerald-500',
      component: UrlEncoder
    },
    {
      id: 'hash-generator',
      title: 'Hash Generator',
      description: 'Generate MD5, SHA1, SHA256 hashes',
      category: 'hash',
      icon: FiIcons.FiShield,
      color: 'from-orange-500 to-red-500',
      component: HashGenerator
    },
    {
      id: 'qr-code-generator',
      title: 'QR Code Generator',
      description: 'Generate QR codes for text, URLs, and data',
      category: 'web',
      icon: FiIcons.FiSquare,
      color: 'from-purple-500 to-indigo-500',
      component: QrCodeGenerator
    },
    {
      id: 'text-diff',
      title: 'Text Diff Checker',
      description: 'Compare two texts and highlight differences',
      category: 'text',
      icon: FiIcons.FiGitCommit,
      color: 'from-blue-500 to-purple-500',
      component: TextDiff
    },
    {
      id: 'regex-tester',
      title: 'Regex Tester',
      description: 'Test and validate regular expressions',
      category: 'text',
      icon: FiIcons.FiSearch,
      color: 'from-yellow-500 to-orange-500',
      component: RegexTester
    },
    {
      id: 'image-optimizer',
      title: 'Image Optimizer',
      description: 'Compress and optimize images for web',
      category: 'image',
      icon: FiIcons.FiImage,
      color: 'from-pink-500 to-rose-500',
      component: ImageOptimizer
    },
    {
      id: 'sql-formatter',
      title: 'SQL Formatter',
      description: 'Format and beautify SQL queries',
      category: 'database',
      icon: FiIcons.FiDatabase,
      color: 'from-blue-500 to-cyan-500',
      component: SqlFormatter
    },
    {
      id: 'html-formatter',
      title: 'HTML Formatter',
      description: 'Format and minify HTML code',
      category: 'web',
      icon: FiIcons.FiCode,
      color: 'from-orange-500 to-red-500',
      component: HtmlFormatter
    }
  ];

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            <span>Back to Utilities</span>
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
        <h1 className="text-4xl font-bold text-white mb-2">Developer Utilities</h1>
        <p className="text-slate-400 text-lg">Essential tools for everyday development tasks</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <div className="relative">
          <SafeIcon icon={FiFilter} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-10 pr-8 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer min-w-48"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTools.map((tool, index) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            index={index}
            onClick={() => setSelectedTool(tool)}
          />
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiIcons.FiSearch} className="text-slate-600 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">No tools found</h3>
          <p className="text-slate-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-12 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <h3 className="text-2xl font-bold text-white">{tools.length}</h3>
            <p className="text-slate-400 text-sm">Total Tools</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{categories.length - 1}</h3>
            <p className="text-slate-400 text-sm">Categories</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{filteredTools.length}</h3>
            <p className="text-slate-400 text-sm">Showing</p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">∞</h3>
            <p className="text-slate-400 text-sm">Usage Limit</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Utilities;