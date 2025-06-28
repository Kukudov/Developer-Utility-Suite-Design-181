import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiCheck, FiStar, FiZap, FiShield, FiUsers, FiTool, FiCpu, FiDatabase } = FiIcons;

const Pricing = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started with essential developer tools',
      features: [
        'Access to 25+ basic tools',
        'Standard processing speed',
        'Community support',
        'Basic usage analytics',
        'Export results',
      ],
      limitations: [
        'Limited to 100 operations per day',
        'No advanced features',
        'No priority support',
      ],
      color: 'from-slate-500 to-slate-600',
      popular: false,
      ctaText: 'Get Started',
      ctaAction: 'signup'
    },
    {
      name: 'Pro',
      price: '$9',
      period: 'per month',
      description: 'Ideal for professional developers and small teams',
      features: [
        'Access to all 50+ tools',
        'Advanced features unlocked',
        'Priority processing speed',
        'Email support',
        'Advanced analytics',
        'Bulk operations',
        'Custom themes',
        'API access (1000 calls/month)',
      ],
      limitations: [],
      color: 'from-green-500 to-blue-500',
      popular: true,
      ctaText: 'Start Free Trial',
      ctaAction: 'trial'
    },
    {
      name: 'Team',
      price: '$29',
      period: 'per month',
      description: 'Built for teams that need collaboration and advanced features',
      features: [
        'Everything in Pro',
        'Team collaboration tools',
        'Shared workspaces',
        'Advanced API access (10k calls/month)',
        'Priority support',
        'Custom integrations',
        'Advanced security features',
        'Team analytics dashboard',
        'White-label options',
      ],
      limitations: [],
      color: 'from-blue-500 to-cyan-500',
      popular: false,
      ctaText: 'Contact Sales',
      ctaAction: 'contact'
    }
  ];

  const features = [
    {
      category: 'Core Tools',
      icon: FiTool,
      items: ['Text processing tools', 'Encoding/decoding utilities', 'Hash generators', 'JSON/XML formatters']
    },
    {
      category: 'Advanced Features',
      icon: FiZap,
      items: ['Bulk operations', 'Custom scripts', 'Advanced algorithms', 'Real-time collaboration']
    },
    {
      category: 'Security & Privacy',
      icon: FiShield,
      items: ['End-to-end encryption', 'GDPR compliance', 'Secure data processing', 'No data retention']
    },
    {
      category: 'Team Features',
      icon: FiUsers,
      items: ['Shared workspaces', 'Team analytics', 'Role management', 'Audit logs']
    }
  ];

  const faqs = [
    {
      question: 'Can I upgrade or downgrade my plan anytime?',
      answer: 'Yes, you can change your plan at any time. Changes take effect immediately, and billing is prorated.'
    },
    {
      question: 'Is there a free trial for paid plans?',
      answer: 'Yes, we offer a 14-day free trial for the Pro plan. No credit card required to start.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for annual plans.'
    },
    {
      question: 'Do you offer discounts for students or non-profits?',
      answer: 'Yes, we offer 50% discounts for students and qualifying non-profit organizations.'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 min-h-screen"
    >
      {/* Header */}
      <div className="text-center mb-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl font-bold text-white mb-4"
        >
          Simple, Transparent{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
            Pricing
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-xl max-w-2xl mx-auto"
        >
          Choose the perfect plan for your development workflow. Start free and upgrade as you grow.
        </motion.p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className={`relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border transition-all duration-300 hover:scale-105 ${
              plan.popular
                ? 'border-green-500 shadow-lg shadow-green-500/20'
                : 'border-slate-700 hover:border-slate-600'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                  <SafeIcon icon={FiStar} className="mr-1" />
                  Most Popular
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-slate-400 ml-2">/{plan.period}</span>
              </div>
              <p className="text-slate-400 text-sm">{plan.description}</p>
            </div>

            <div className="space-y-4 mb-8">
              {plan.features.map((feature, featureIndex) => (
                <div key={featureIndex} className="flex items-start space-x-3">
                  <SafeIcon icon={FiCheck} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{feature}</span>
                </div>
              ))}
              {plan.limitations.length > 0 && (
                <div className="pt-4 border-t border-slate-700">
                  <p className="text-slate-500 text-xs mb-2">Limitations:</p>
                  {plan.limitations.map((limitation, limitIndex) => (
                    <div key={limitIndex} className="flex items-start space-x-3">
                      <div className="w-1 h-1 bg-slate-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-slate-500 text-xs">{limitation}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                plan.popular
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
              {plan.ctaText}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Features Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-20"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Everything You Need</h2>
          <p className="text-slate-400 text-lg">Comprehensive tools for modern development workflows</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <SafeIcon icon={feature.icon} className="text-white text-xl" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-3">{feature.category}</h3>
              <ul className="space-y-2">
                {feature.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-slate-400 text-sm flex items-start">
                    <div className="w-1 h-1 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-20"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-lg">Get answers to common questions about our pricing</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
            >
              <h3 className="text-white font-semibold text-lg mb-3">{faq.question}</h3>
              <p className="text-slate-400">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="text-center bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl p-12 border border-green-500/30"
      >
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
        <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of developers who rely on DevBox Tools for their daily workflow
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 transition-colors">
            Start Free Trial
          </button>
          <button className="px-8 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors">
            Contact Sales
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Pricing;