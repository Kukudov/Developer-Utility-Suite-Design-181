import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCopy, FiCheck, FiRefreshCw, FiDownload } = FiIcons;

const MockDataGenerator = () => {
  const [dataType, setDataType] = useState('users');
  const [count, setCount] = useState(10);
  const [format, setFormat] = useState('json');
  const [generatedData, setGeneratedData] = useState('');
  const [copied, setCopied] = useState(false);

  const dataTypes = {
    users: {
      name: 'Users',
      fields: ['id', 'firstName', 'lastName', 'email', 'phone', 'avatar', 'createdAt']
    },
    products: {
      name: 'Products',
      fields: ['id', 'name', 'description', 'price', 'category', 'inStock', 'rating', 'image']
    },
    companies: {
      name: 'Companies',
      fields: ['id', 'name', 'industry', 'website', 'employees', 'founded', 'revenue', 'location']
    },
    posts: {
      name: 'Blog Posts',
      fields: ['id', 'title', 'content', 'author', 'tags', 'publishedAt', 'views', 'likes']
    },
    orders: {
      name: 'Orders',
      fields: ['id', 'customerId', 'items', 'total', 'status', 'orderDate', 'shippingAddress']
    },
    events: {
      name: 'Events',
      fields: ['id', 'title', 'description', 'startDate', 'endDate', 'location', 'attendees', 'type']
    }
  };

  // Mock data generators
  const generators = {
    id: () => Math.random().toString(36).substr(2, 9),
    firstName: () => {
      const names = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Chris', 'Emma', 'Alex', 'Maria'];
      return names[Math.floor(Math.random() * names.length)];
    },
    lastName: () => {
      const names = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson'];
      return names[Math.floor(Math.random() * names.length)];
    },
    email: () => {
      const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
      const name = generators.firstName().toLowerCase() + generators.lastName().toLowerCase();
      return `${name}@${domains[Math.floor(Math.random() * domains.length)]}`;
    },
    phone: () => `+1-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
    avatar: () => `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70 + 1)}`,
    createdAt: () => new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    name: () => {
      const adjectives = ['Amazing', 'Super', 'Ultra', 'Premium', 'Smart', 'Pro', 'Elite', 'Advanced'];
      const nouns = ['Widget', 'Tool', 'Device', 'Solution', 'System', 'Platform', 'Service'];
      return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
    },
    description: () => {
      const descriptions = [
        'High-quality product with excellent features',
        'Innovative solution for modern needs',
        'Professional grade tool for experts',
        'User-friendly interface with powerful capabilities',
        'Cutting-edge technology for optimal performance'
      ];
      return descriptions[Math.floor(Math.random() * descriptions.length)];
    },
    price: () => +(Math.random() * 1000 + 10).toFixed(2),
    category: () => {
      const categories = ['Electronics', 'Clothing', 'Home', 'Sports', 'Books', 'Beauty', 'Automotive'];
      return categories[Math.floor(Math.random() * categories.length)];
    },
    inStock: () => Math.random() > 0.2,
    rating: () => +(Math.random() * 2 + 3).toFixed(1),
    image: () => `https://picsum.photos/300/200?random=${Math.floor(Math.random() * 1000)}`,
    industry: () => {
      const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing'];
      return industries[Math.floor(Math.random() * industries.length)];
    },
    website: () => `https://www.${generators.lastName().toLowerCase()}.com`,
    employees: () => Math.floor(Math.random() * 10000 + 10),
    founded: () => Math.floor(Math.random() * 50 + 1970),
    revenue: () => `$${(Math.random() * 100 + 1).toFixed(1)}M`,
    location: () => {
      const cities = ['New York', 'San Francisco', 'London', 'Tokyo', 'Berlin', 'Sydney', 'Toronto'];
      return cities[Math.floor(Math.random() * cities.length)];
    },
    title: () => {
      const titles = [
        'Getting Started with Modern Development',
        'Best Practices for Web Applications',
        'Understanding User Experience Design',
        'The Future of Technology',
        'Building Scalable Systems'
      ];
      return titles[Math.floor(Math.random() * titles.length)];
    },
    content: () => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    author: () => `${generators.firstName()} ${generators.lastName()}`,
    tags: () => {
      const allTags = ['javascript', 'react', 'nodejs', 'python', 'design', 'ux', 'ai', 'ml', 'web', 'mobile'];
      const numTags = Math.floor(Math.random() * 3 + 1);
      return Array.from({ length: numTags }, () => allTags[Math.floor(Math.random() * allTags.length)]);
    },
    publishedAt: () => new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    views: () => Math.floor(Math.random() * 10000),
    likes: () => Math.floor(Math.random() * 1000),
    customerId: () => generators.id(),
    items: () => Math.floor(Math.random() * 5 + 1),
    total: () => +(Math.random() * 500 + 20).toFixed(2),
    status: () => {
      const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      return statuses[Math.floor(Math.random() * statuses.length)];
    },
    orderDate: () => new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    shippingAddress: () => `${Math.floor(Math.random() * 9999 + 1)} Main St, ${generators.location()}`,
    startDate: () => new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: () => new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
    attendees: () => Math.floor(Math.random() * 500 + 10),
    type: () => {
      const types = ['conference', 'workshop', 'meetup', 'webinar', 'seminar'];
      return types[Math.floor(Math.random() * types.length)];
    }
  };

  const generateData = () => {
    const selectedType = dataTypes[dataType];
    const data = Array.from({ length: count }, () => {
      const item = {};
      selectedType.fields.forEach(field => {
        item[field] = generators[field] ? generators[field]() : `sample_${field}`;
      });
      return item;
    });

    let output;
    switch (format) {
      case 'json':
        output = JSON.stringify(data, null, 2);
        break;
      case 'csv':
        output = generateCSV(data);
        break;
      case 'sql':
        output = generateSQL(data, dataType);
        break;
      case 'xml':
        output = generateXML(data, dataType);
        break;
      default:
        output = JSON.stringify(data, null, 2);
    }

    setGeneratedData(output);
  };

  const generateCSV = (data) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (Array.isArray(value)) return `"${value.join(';')}"`;
        if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
        return value;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  const generateSQL = (data, tableName) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const createTable = `CREATE TABLE ${tableName} (\n${headers.map(header => `  ${header} VARCHAR(255)`).join(',\n')}\n);\n\n`;
    
    const insertStatements = data.map(row => {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return 'NULL';
        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
        if (Array.isArray(value)) return `'${value.join(';')}'`;
        return value;
      }).join(', ');
      return `INSERT INTO ${tableName} (${headers.join(', ')}) VALUES (${values});`;
    }).join('\n');
    
    return createTable + insertStatements;
  };

  const generateXML = (data, rootName) => {
    const xmlItems = data.map(item => {
      const xmlFields = Object.entries(item).map(([key, value]) => {
        if (Array.isArray(value)) {
          return `    <${key}>${value.join(';')}</${key}>`;
        }
        return `    <${key}>${value}</${key}>`;
      }).join('\n');
      return `  <${rootName.slice(0, -1)}>\n${xmlFields}\n  </${rootName.slice(0, -1)}>`;
    }).join('\n');
    
    return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n${xmlItems}\n</${rootName}>`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadData = () => {
    if (!generatedData) return;

    const fileExtensions = { json: 'json', csv: 'csv', sql: 'sql', xml: 'xml' };
    const mimeTypes = {
      json: 'application/json',
      csv: 'text/csv',
      sql: 'text/sql',
      xml: 'application/xml'
    };

    const blob = new Blob([generatedData], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mock_${dataType}.${fileExtensions[format]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Configuration */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">Mock Data Generator</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-white font-medium mb-2">Data Type</label>
            <select
              value={dataType}
              onChange={(e) => setDataType(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              {Object.entries(dataTypes).map(([key, type]) => (
                <option key={key} value={key}>{type.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-white font-medium mb-2">Count</label>
            <input
              type="number"
              min="1"
              max="1000"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-white font-medium mb-2">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="sql">SQL</option>
              <option value="xml">XML</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={generateData}
              className="w-full flex items-center justify-center space-x-2 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            >
              <SafeIcon icon={FiRefreshCw} />
              <span>Generate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Preview */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h4 className="text-white font-semibold text-lg mb-4">
          {dataTypes[dataType].name} Fields
        </h4>
        <div className="flex flex-wrap gap-2">
          {dataTypes[dataType].fields.map((field) => (
            <span
              key={field}
              className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm"
            >
              {field}
            </span>
          ))}
        </div>
      </div>

      {/* Generated Data */}
      {generatedData && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">
              Generated Data ({count} {dataTypes[dataType].name.toLowerCase()})
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={downloadData}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <SafeIcon icon={FiDownload} />
                <span>Download</span>
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                <SafeIcon icon={copied ? FiCheck : FiCopy} className={copied ? 'text-green-400' : ''} />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
          <pre className="bg-slate-900/50 rounded-lg p-4 overflow-x-auto max-h-96">
            <code className="text-green-400 font-mono text-sm">{generatedData}</code>
          </pre>
        </div>
      )}

      {/* Usage Examples */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">Use Cases</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
          <div>
            <h4 className="text-white font-medium mb-2">Development & Testing</h4>
            <ul className="space-y-1">
              <li>• API testing and mocking</li>
              <li>• Database seeding</li>
              <li>• Frontend prototyping</li>
              <li>• Load testing scenarios</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Design & Demo</h4>
            <ul className="space-y-1">
              <li>• UI/UX mockups</li>
              <li>• Client presentations</li>
              <li>• Documentation examples</li>
              <li>• Training datasets</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MockDataGenerator;