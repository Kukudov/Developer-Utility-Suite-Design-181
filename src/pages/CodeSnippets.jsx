import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiSearch, FiFilter, FiCopy, FiCheck } = FiIcons;

const CodeSnippets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  const languages = [
    { id: 'all', label: 'All Languages' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'python', label: 'Python' },
    { id: 'react', label: 'React' },
    { id: 'css', label: 'CSS' },
    { id: 'bash', label: 'Bash' },
  ];

  const snippets = [
    {
      id: 1,
      title: 'Debounce Function',
      language: 'javascript',
      description: 'Debounce function to limit function calls',
      code: `function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Usage
const debouncedSearch = debounce((query) => {
  console.log('Searching for:', query);
}, 300);`
    },
    {
      id: 2,
      title: 'React Custom Hook - useLocalStorage',
      language: 'react',
      description: 'Custom hook for localStorage management',
      code: `import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// Usage
const [name, setName] = useLocalStorage('name', 'John');`
    },
    {
      id: 3,
      title: 'Python List Comprehension Examples',
      language: 'python',
      description: 'Common list comprehension patterns',
      code: `# Basic list comprehension
squares = [x**2 for x in range(10)]

# With condition
even_squares = [x**2 for x in range(10) if x % 2 == 0]

# Nested loops
matrix = [[i+j for j in range(3)] for i in range(3)]

# Dictionary comprehension
word_lengths = {word: len(word) for word in ['hello', 'world', 'python']}

# Set comprehension
unique_chars = {char.lower() for word in ['Hello', 'World'] for char in word}`
    },
    {
      id: 4,
      title: 'CSS Flexbox Center',
      language: 'css',
      description: 'Perfect centering with flexbox',
      code: `.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

/* Alternative with margin auto */
.centered-item {
  margin: auto;
}

/* Grid alternative */
.grid-container {
  display: grid;
  place-items: center;
  min-height: 100vh;
}`
    },
    {
      id: 5,
      title: 'Bash Script Template',
      language: 'bash',
      description: 'Basic bash script structure with error handling',
      code: `#!/bin/bash

# Script configuration
set -e  # Exit on error
set -u  # Exit on undefined variable

# Variables
SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/tmp/script.log"

# Functions
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

error_exit() {
    log "ERROR: $1"
    exit 1
}

# Main script
main() {
    log "Script started"
    
    # Your code here
    
    log "Script completed successfully"
}

# Run main function
main "$@"`
    },
    {
      id: 6,
      title: 'JavaScript Array Methods Chain',
      language: 'javascript',
      description: 'Common array method chaining patterns',
      code: `const users = [
  { name: 'John', age: 25, active: true },
  { name: 'Jane', age: 30, active: false },
  { name: 'Bob', age: 35, active: true }
];

// Filter, map, and reduce chain
const result = users
  .filter(user => user.active)
  .map(user => ({ ...user, ageGroup: user.age > 30 ? 'senior' : 'junior' }))
  .reduce((acc, user) => {
    acc[user.ageGroup] = (acc[user.ageGroup] || 0) + 1;
    return acc;
  }, {});

// Find and some/every
const activeUser = users.find(user => user.active);
const allActive = users.every(user => user.active);
const hasActive = users.some(user => user.active);`
    }
  ];

  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         snippet.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = selectedLanguage === 'all' || snippet.language === selectedLanguage;
    return matchesSearch && matchesLanguage;
  });

  const copyToClipboard = async (code, id) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 min-h-screen"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Code Snippets</h1>
        <p className="text-slate-400 text-lg">Ready-to-use code templates and examples</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search snippets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        
        <div className="relative">
          <SafeIcon icon={FiFilter} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="pl-10 pr-8 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer"
          >
            {languages.map(language => (
              <option key={language.id} value={language.id}>{language.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Snippets */}
      <div className="space-y-6">
        {filteredSnippets.map((snippet, index) => (
          <motion.div
            key={snippet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{snippet.title}</h3>
                  <p className="text-slate-400 mb-3">{snippet.description}</p>
                  <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                    {snippet.language}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(snippet.code, snippet.id)}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  <SafeIcon 
                    icon={copiedId === snippet.id ? FiCheck : FiCopy} 
                    className={copiedId === snippet.id ? 'text-green-400' : 'text-slate-400'} 
                  />
                  <span>{copiedId === snippet.id ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
            
            <div className="relative">
              <pre className="p-6 overflow-x-auto text-sm">
                <code className="text-slate-300 font-mono">{snippet.code}</code>
              </pre>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredSnippets.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiSearch} className="text-slate-600 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-400 mb-2">No snippets found</h3>
          <p className="text-slate-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </motion.div>
  );
};

export default CodeSnippets;