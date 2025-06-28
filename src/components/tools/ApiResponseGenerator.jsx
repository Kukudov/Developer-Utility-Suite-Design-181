import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCopy, FiCheck, FiCode, FiRefreshCw } = FiIcons;

const ApiResponseGenerator = () => {
  const [responseType, setResponseType] = useState('success');
  const [httpStatus, setHttpStatus] = useState(200);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [dataType, setDataType] = useState('user');
  const [customMessage, setCustomMessage] = useState('');
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [copied, setCopied] = useState(false);

  const responseTypes = {
    success: { name: 'Success Response', defaultStatus: 200 },
    error: { name: 'Error Response', defaultStatus: 400 },
    created: { name: 'Created Response', defaultStatus: 201 },
    noContent: { name: 'No Content', defaultStatus: 204 },
    notFound: { name: 'Not Found', defaultStatus: 404 },
    unauthorized: { name: 'Unauthorized', defaultStatus: 401 },
    forbidden: { name: 'Forbidden', defaultStatus: 403 },
    validation: { name: 'Validation Error', defaultStatus: 422 },
    serverError: { name: 'Server Error', defaultStatus: 500 }
  };

  const dataTypes = {
    user: {
      name: 'User',
      single: {
        id: 'usr_123456789',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        avatar: 'https://i.pravatar.cc/150?img=1',
        role: 'user',
        status: 'active',
        createdAt: '2024-01-15T10:30:00Z',
        lastLoginAt: '2024-01-20T14:22:33Z'
      }
    },
    product: {
      name: 'Product',
      single: {
        id: 'prod_987654321',
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 199.99,
        currency: 'USD',
        category: 'Electronics',
        inStock: true,
        quantity: 45,
        rating: 4.5,
        images: [
          'https://picsum.photos/400/300?random=1',
          'https://picsum.photos/400/300?random=2'
        ],
        createdAt: '2024-01-10T09:15:00Z'
      }
    },
    order: {
      name: 'Order',
      single: {
        id: 'ord_555666777',
        customerId: 'usr_123456789',
        items: [
          {
            productId: 'prod_987654321',
            quantity: 2,
            price: 199.99
          }
        ],
        subtotal: 399.98,
        tax: 32.00,
        shipping: 9.99,
        total: 441.97,
        status: 'processing',
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'US'
        },
        createdAt: '2024-01-20T11:45:00Z'
      }
    },
    post: {
      name: 'Blog Post',
      single: {
        id: 'post_111222333',
        title: 'Getting Started with API Development',
        slug: 'getting-started-api-development',
        content: 'This is a comprehensive guide to API development...',
        excerpt: 'Learn the basics of building robust APIs',
        author: {
          id: 'usr_123456789',
          name: 'John Doe',
          avatar: 'https://i.pravatar.cc/150?img=1'
        },
        tags: ['api', 'development', 'tutorial'],
        status: 'published',
        publishedAt: '2024-01-18T08:00:00Z',
        views: 1247,
        likes: 89
      }
    }
  };

  const generateResponse = () => {
    const selectedDataType = dataTypes[dataType];
    let response = {};

    // Add status and message based on response type
    switch (responseType) {
      case 'success':
        response.success = true;
        response.message = customMessage || 'Request completed successfully';
        response.data = selectedDataType.single;
        break;

      case 'created':
        response.success = true;
        response.message = customMessage || `${selectedDataType.name} created successfully`;
        response.data = selectedDataType.single;
        break;

      case 'noContent':
        response.success = true;
        response.message = customMessage || 'Request completed successfully';
        // No data for 204 responses
        break;

      case 'error':
        response.success = false;
        response.error = {
          code: 'GENERAL_ERROR',
          message: customMessage || 'An error occurred while processing your request',
          details: 'Please check your request and try again'
        };
        break;

      case 'notFound':
        response.success = false;
        response.error = {
          code: 'NOT_FOUND',
          message: customMessage || `${selectedDataType.name} not found`,
          details: `The requested ${selectedDataType.name.toLowerCase()} could not be found`
        };
        break;

      case 'unauthorized':
        response.success = false;
        response.error = {
          code: 'UNAUTHORIZED',
          message: customMessage || 'Authentication required',
          details: 'Please provide a valid authentication token'
        };
        break;

      case 'forbidden':
        response.success = false;
        response.error = {
          code: 'FORBIDDEN',
          message: customMessage || 'Access denied',
          details: 'You do not have permission to access this resource'
        };
        break;

      case 'validation':
        response.success = false;
        response.error = {
          code: 'VALIDATION_ERROR',
          message: customMessage || 'Validation failed',
          details: 'One or more fields contain invalid data',
          fields: {
            email: ['Email is required', 'Email must be a valid email address'],
            password: ['Password must be at least 8 characters long']
          }
        };
        break;

      case 'serverError':
        response.success = false;
        response.error = {
          code: 'INTERNAL_SERVER_ERROR',
          message: customMessage || 'Internal server error',
          details: 'An unexpected error occurred. Please try again later',
          timestamp: new Date().toISOString(),
          requestId: 'req_' + Math.random().toString(36).substr(2, 9)
        };
        break;
    }

    // Add metadata if enabled
    if (includeMetadata && responseType !== 'noContent') {
      response.metadata = {
        timestamp: new Date().toISOString(),
        requestId: 'req_' + Math.random().toString(36).substr(2, 9),
        version: 'v1.0.0',
        processingTime: Math.floor(Math.random() * 200 + 50) + 'ms'
      };

      // Add pagination for list-like responses
      if (responseType === 'success' && Math.random() > 0.5) {
        response.pagination = {
          page: 1,
          limit: 20,
          total: 156,
          totalPages: 8,
          hasNext: true,
          hasPrev: false
        };
      }
    }

    setGeneratedResponse(JSON.stringify(response, null, 2));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const loadPreset = (type) => {
    setResponseType(type);
    setHttpStatus(responseTypes[type].defaultStatus);
    generateResponse();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Configuration */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
          <SafeIcon icon={FiCode} className="mr-2 text-purple-400" />
          API Response Generator
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-white font-medium mb-2">Response Type</label>
            <select
              value={responseType}
              onChange={(e) => {
                const newType = e.target.value;
                setResponseType(newType);
                setHttpStatus(responseTypes[newType].defaultStatus);
              }}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              {Object.entries(responseTypes).map(([key, type]) => (
                <option key={key} value={key}>{type.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-white font-medium mb-2">HTTP Status</label>
            <input
              type="number"
              value={httpStatus}
              onChange={(e) => setHttpStatus(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
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
          <div className="flex items-end">
            <button
              onClick={generateResponse}
              className="w-full flex items-center justify-center space-x-2 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            >
              <SafeIcon icon={FiRefreshCw} />
              <span>Generate</span>
            </button>
          </div>
        </div>
        
        {/* Additional Options */}
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">Custom Message (Optional)</label>
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter custom message..."
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeMetadata"
              checked={includeMetadata}
              onChange={(e) => setIncludeMetadata(e.target.checked)}
              className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="includeMetadata" className="text-slate-300">
              Include metadata (timestamp, requestId, etc.)
            </label>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h4 className="text-white font-semibold text-lg mb-4">Quick Presets</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {Object.entries(responseTypes).map(([key, type]) => (
            <button
              key={key}
              onClick={() => loadPreset(key)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                responseType === key 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {type.defaultStatus} {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Response */}
      {generatedResponse && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-lg">Generated API Response</h3>
              <p className="text-slate-400 text-sm">HTTP {httpStatus} - {responseTypes[responseType].name}</p>
            </div>
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            >
              <SafeIcon icon={copied ? FiCheck : FiCopy} className={copied ? 'text-green-400' : ''} />
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>
          </div>
          <pre className="bg-slate-900/50 rounded-lg p-4 overflow-x-auto max-h-96">
            <code className="text-green-400 font-mono text-sm">{generatedResponse}</code>
          </pre>
        </div>
      )}

      {/* HTTP Status Code Reference */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">Common HTTP Status Codes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="text-green-400 font-medium mb-2">2xx Success</h4>
            <ul className="space-y-1 text-slate-300">
              <li>• 200 OK - Request successful</li>
              <li>• 201 Created - Resource created</li>
              <li>• 204 No Content - Successful, no content</li>
            </ul>
          </div>
          <div>
            <h4 className="text-yellow-400 font-medium mb-2">4xx Client Error</h4>
            <ul className="space-y-1 text-slate-300">
              <li>• 400 Bad Request - Invalid request</li>
              <li>• 401 Unauthorized - Authentication required</li>
              <li>• 403 Forbidden - Access denied</li>
              <li>• 404 Not Found - Resource not found</li>
              <li>• 422 Unprocessable Entity - Validation error</li>
            </ul>
          </div>
          <div>
            <h4 className="text-red-400 font-medium mb-2">5xx Server Error</h4>
            <ul className="space-y-1 text-slate-300">
              <li>• 500 Internal Server Error</li>
              <li>• 502 Bad Gateway</li>
              <li>• 503 Service Unavailable</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ApiResponseGenerator;