import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiHelpCircle, FiChevronDown, FiChevronUp, FiSearch, FiMail, FiMessageCircle, FiBook } = FiIcons;

const FAQs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFAQ, setOpenFAQ] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Questions', count: 20 },
    { id: 'general', label: 'General', count: 6 },
    { id: 'account', label: 'Account & Billing', count: 5 },
    { id: 'tools', label: 'Tools & Features', count: 6 },
    { id: 'technical', label: 'Technical', count: 3 },
  ];

  const faqs = [
    {
      id: 1,
      category: 'general',
      question: 'What is DevBox Tools?',
      answer: 'DevBox Tools is a comprehensive collection of web-based developer utilities designed to streamline your development workflow. It includes text processors, encoders, formatters, generators, and converters - all accessible directly from your browser without any installation required.'
    },
    {
      id: 2,
      category: 'general',
      question: 'Do I need to install anything to use DevBox Tools?',
      answer: 'No installation is required! DevBox Tools runs entirely in your web browser. Simply visit our website and start using any of our 50+ tools immediately. All processing happens locally in your browser for maximum privacy and speed.'
    },
    {
      id: 3,
      category: 'general',
      question: 'Is DevBox Tools free to use?',
      answer: 'Yes! We offer a generous free tier that includes access to 25+ essential tools with up to 100 operations per day. For power users and teams, we offer Pro and Team plans with additional features, unlimited usage, and priority support.'
    },
    {
      id: 4,
      category: 'general',
      question: 'What browsers are supported?',
      answer: 'DevBox Tools works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version of your browser for the best experience and access to all features.'
    },
    {
      id: 5,
      category: 'general',
      question: 'Can I use DevBox Tools offline?',
      answer: 'Most tools work offline once the page is loaded, as processing happens in your browser. However, some features like account sync, favorites, and cloud storage require an internet connection.'
    },
    {
      id: 6,
      category: 'general',
      question: 'How do I report bugs or request features?',
      answer: 'We welcome feedback! You can report bugs or request features through our support email, GitHub repository, or the feedback form in your account dashboard. We actively review all suggestions and prioritize based on user demand.'
    },
    {
      id: 7,
      category: 'account',
      question: 'Do I need an account to use the tools?',
      answer: 'No, you can use most tools without an account. However, creating a free account allows you to save favorites, track usage, sync settings across devices, and access additional features.'
    },
    {
      id: 8,
      category: 'account',
      question: 'How do I upgrade to a paid plan?',
      answer: 'You can upgrade anytime from your account dashboard. Click on "Upgrade Plan" and choose between Pro or Team plans. We offer a 14-day free trial for the Pro plan, and you can cancel or change plans anytime.'
    },
    {
      id: 9,
      category: 'account',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual plans. All payments are processed securely through Stripe.'
    },
    {
      id: 10,
      category: 'account',
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time from your account settings. Your access to premium features will continue until the end of your billing period, and you can always reactivate later.'
    },
    {
      id: 11,
      category: 'account',
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied within the first 30 days, contact our support team for a full refund.'
    },
    {
      id: 12,
      category: 'tools',
      question: 'How accurate are the conversion tools?',
      answer: 'Our conversion tools use industry-standard algorithms and formulas to ensure maximum accuracy. For critical applications, we recommend verifying results, especially for complex calculations or edge cases.'
    },
    {
      id: 13,
      category: 'tools',
      question: 'What file formats are supported for uploads?',
      answer: 'Supported formats vary by tool. Generally, we support common text formats (TXT, JSON, XML, CSV), images (PNG, JPG, GIF, WebP), and code files (JS, HTML, CSS, SQL). File size limits apply based on your plan.'
    },
    {
      id: 14,
      category: 'tools',
      question: 'Can I process multiple files at once?',
      answer: 'Bulk processing is available for Pro and Team plan users. Free users can process one file at a time. The batch processing feature supports up to 100 files simultaneously, depending on the tool.'
    },
    {
      id: 15,
      category: 'tools',
      question: 'How do I save my work?',
      answer: 'Most tools offer export/download options for your processed data. Pro users also get cloud storage to save and sync their work across devices. Use the "Save" or "Export" buttons available in each tool.'
    },
    {
      id: 16,
      category: 'tools',
      question: 'Are there keyboard shortcuts available?',
      answer: 'Yes! Common shortcuts include Ctrl+C (copy result), Ctrl+V (paste input), Ctrl+Z (undo), and Ctrl+Enter (process/convert). Each tool may have specific shortcuts listed in the help section.'
    },
    {
      id: 17,
      category: 'tools',
      question: 'Can I customize tool settings?',
      answer: 'Yes, most tools offer customizable settings like output format, precision levels, character sets, and processing options. Your preferences are saved to your account and synced across devices.'
    },
    {
      id: 18,
      category: 'technical',
      question: 'Is my data secure and private?',
      answer: 'Absolutely! Most processing happens locally in your browser, so your data never leaves your device. For tools that require server processing, we use encrypted connections and don\'t store your data. We\'re GDPR compliant and take privacy seriously.'
    },
    {
      id: 19,
      category: 'technical',
      question: 'What are the API rate limits?',
      answer: 'API access is available for Pro and Team plans. Pro users get 1,000 API calls per month, while Team users get 10,000 calls per month. Rate limits are 100 requests per minute for Pro and 500 for Team plans.'
    },
    {
      id: 20,
      category: 'technical',
      question: 'Can I integrate DevBox Tools into my application?',
      answer: 'Yes! We offer a REST API for Pro and Team users, along with JavaScript SDKs and webhooks. Check our API documentation for integration guides, code examples, and best practices.'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 min-h-screen"
    >
      {/* Header */}
      <div className="text-center mb-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold text-white mb-4"
        >
          Frequently Asked Questions
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-lg max-w-2xl mx-auto"
        >
          Find answers to common questions about DevBox Tools. Can't find what you're looking for? Contact our support team.
        </motion.p>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-2xl mx-auto mb-8"
      >
        <div className="relative">
          <SafeIcon icon={FiSearch} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap justify-center gap-3 mb-12"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === category.id
                ? 'bg-purple-500 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {category.label} ({category.count})
          </button>
        ))}
      </motion.div>

      {/* FAQ List */}
      <div className="max-w-4xl mx-auto space-y-4 mb-16">
        {filteredFAQs.map((faq, index) => (
          <motion.div
            key={faq.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.05 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden"
          >
            <button
              onClick={() => toggleFAQ(faq.id)}
              className="w-full p-6 text-left hover:bg-slate-700/20 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white pr-4">{faq.question}</h3>
                <SafeIcon 
                  icon={openFAQ === faq.id ? FiChevronUp : FiChevronDown} 
                  className="text-slate-400 flex-shrink-0" 
                />
              </div>
            </button>
            
            <AnimatePresence>
              {openFAQ === faq.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-slate-700"
                >
                  <div className="p-6">
                    <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* No Results */}
      {filteredFAQs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <SafeIcon icon={FiSearch} className="text-slate-600 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">No FAQs found</h3>
          <p className="text-slate-500">Try adjusting your search or browse different categories</p>
        </motion.div>
      )}

      {/* Contact Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-8 border border-purple-500/30"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Still need help?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Can't find the answer you're looking for? Our support team is here to help you get the most out of DevBox Tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiMail} className="text-white text-xl" />
            </div>
            <h3 className="text-white font-semibold mb-2">Email Support</h3>
            <p className="text-slate-400 text-sm mb-4">Get help via email with detailed responses</p>
            <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
              Contact Support
            </button>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiMessageCircle} className="text-white text-xl" />
            </div>
            <h3 className="text-white font-semibold mb-2">Live Chat</h3>
            <p className="text-slate-400 text-sm mb-4">Chat with us in real-time for quick help</p>
            <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
              Start Chat
            </button>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiBook} className="text-white text-xl" />
            </div>
            <h3 className="text-white font-semibold mb-2">Documentation</h3>
            <p className="text-slate-400 text-sm mb-4">Browse our comprehensive guides and tutorials</p>
            <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
              View Docs
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FAQs;