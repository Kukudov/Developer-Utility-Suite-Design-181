import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCopy, FiCheck, FiCode } = FiIcons;

const HtmlSchemaGenerator = () => {
  const [schemaType, setSchemaType] = useState('organization');
  const [formData, setFormData] = useState({});
  const [copied, setCopied] = useState(false);

  const schemas = {
    organization: {
      name: 'Organization',
      fields: [
        { key: 'name', label: 'Organization Name', type: 'text', required: true },
        { key: 'url', label: 'Website URL', type: 'url', required: true },
        { key: 'logo', label: 'Logo URL', type: 'url' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'telephone', label: 'Phone Number', type: 'tel' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'address', label: 'Street Address', type: 'text' },
        { key: 'city', label: 'City', type: 'text' },
        { key: 'state', label: 'State/Region', type: 'text' },
        { key: 'postalCode', label: 'Postal Code', type: 'text' },
        { key: 'country', label: 'Country', type: 'text' }
      ]
    },
    person: {
      name: 'Person',
      fields: [
        { key: 'name', label: 'Full Name', type: 'text', required: true },
        { key: 'jobTitle', label: 'Job Title', type: 'text' },
        { key: 'description', label: 'Bio/Description', type: 'textarea' },
        { key: 'image', label: 'Photo URL', type: 'url' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'telephone', label: 'Phone Number', type: 'tel' },
        { key: 'url', label: 'Website/Profile URL', type: 'url' },
        { key: 'sameAs', label: 'Social Media URLs (comma separated)', type: 'textarea' },
        { key: 'worksFor', label: 'Organization Name', type: 'text' },
        { key: 'address', label: 'Address', type: 'text' }
      ]
    },
    article: {
      name: 'Article',
      fields: [
        { key: 'headline', label: 'Article Title', type: 'text', required: true },
        { key: 'description', label: 'Article Description', type: 'textarea' },
        { key: 'image', label: 'Featured Image URL', type: 'url' },
        { key: 'author', label: 'Author Name', type: 'text', required: true },
        { key: 'datePublished', label: 'Publication Date', type: 'date', required: true },
        { key: 'dateModified', label: 'Last Modified Date', type: 'date' },
        { key: 'publisher', label: 'Publisher Name', type: 'text' },
        { key: 'url', label: 'Article URL', type: 'url' },
        { key: 'wordCount', label: 'Word Count', type: 'number' },
        { key: 'keywords', label: 'Keywords (comma separated)', type: 'textarea' }
      ]
    },
    product: {
      name: 'Product',
      fields: [
        { key: 'name', label: 'Product Name', type: 'text', required: true },
        { key: 'description', label: 'Product Description', type: 'textarea' },
        { key: 'image', label: 'Product Image URL', type: 'url' },
        { key: 'brand', label: 'Brand Name', type: 'text' },
        { key: 'sku', label: 'SKU', type: 'text' },
        { key: 'price', label: 'Price', type: 'number', required: true },
        { key: 'currency', label: 'Currency', type: 'text', placeholder: 'USD' },
        { key: 'availability', label: 'Availability', type: 'select', options: ['InStock', 'OutOfStock', 'PreOrder'] },
        { key: 'condition', label: 'Condition', type: 'select', options: ['NewCondition', 'UsedCondition', 'RefurbishedCondition'] },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'ratingValue', label: 'Rating (1-5)', type: 'number', min: 1, max: 5 },
        { key: 'reviewCount', label: 'Review Count', type: 'number' }
      ]
    },
    breadcrumb: {
      name: 'Breadcrumb',
      fields: [
        { key: 'items', label: 'Breadcrumb Items (JSON format)', type: 'textarea', required: true, placeholder: '[{"name": "Home", "url": "/"}, {"name": "Category", "url": "/category"}]' }
      ]
    },
    faq: {
      name: 'FAQ',
      fields: [
        { key: 'questions', label: 'FAQ Items (JSON format)', type: 'textarea', required: true, placeholder: '[{"question": "What is...?", "answer": "This is..."}]' }
      ]
    }
  };

  const generateSchema = () => {
    const schema = schemas[schemaType];
    if (!schema) return '';

    let schemaData = {
      "@context": "https://schema.org",
      "@type": schema.name
    };

    // Handle special cases
    if (schemaType === 'breadcrumb') {
      try {
        const items = JSON.parse(formData.items || '[]');
        schemaData = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
          }))
        };
      } catch (e) {
        return '// Invalid JSON format for breadcrumb items';
      }
    } else if (schemaType === 'faq') {
      try {
        const questions = JSON.parse(formData.questions || '[]');
        schemaData = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": questions.map(q => ({
            "@type": "Question",
            "name": q.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": q.answer
            }
          }))
        };
      } catch (e) {
        return '// Invalid JSON format for FAQ items';
      }
    } else {
      // Standard schema generation
      schema.fields.forEach(field => {
        if (formData[field.key] && formData[field.key].trim()) {
          let value = formData[field.key].trim();
          
          if (field.type === 'number') {
            value = parseFloat(value);
          } else if (field.key === 'sameAs') {
            value = value.split(',').map(url => url.trim()).filter(url => url);
          } else if (field.key === 'keywords') {
            value = value.split(',').map(keyword => keyword.trim()).filter(keyword => keyword);
          }
          
          schemaData[field.key] = value;
        }
      });

      // Add nested objects for specific schemas
      if (schemaType === 'organization' && (formData.address || formData.city || formData.state || formData.postalCode || formData.country)) {
        schemaData.address = {
          "@type": "PostalAddress",
          "streetAddress": formData.address,
          "addressLocality": formData.city,
          "addressRegion": formData.state,
          "postalCode": formData.postalCode,
          "addressCountry": formData.country
        };
        // Remove individual address fields
        ['address', 'city', 'state', 'postalCode', 'country'].forEach(key => delete schemaData[key]);
      }

      if (schemaType === 'product' && (formData.price || formData.currency || formData.availability)) {
        schemaData.offers = {
          "@type": "Offer",
          "price": formData.price,
          "priceCurrency": formData.currency || "USD",
          "availability": `https://schema.org/${formData.availability || 'InStock'}`
        };
        // Remove individual offer fields
        ['price', 'currency', 'availability'].forEach(key => delete schemaData[key]);
      }

      if (schemaType === 'product' && (formData.ratingValue || formData.reviewCount)) {
        schemaData.aggregateRating = {
          "@type": "AggregateRating",
          "ratingValue": formData.ratingValue,
          "reviewCount": formData.reviewCount
        };
        // Remove individual rating fields
        ['ratingValue', 'reviewCount'].forEach(key => delete schemaData[key]);
      }

      if (schemaType === 'article' && formData.author) {
        schemaData.author = {
          "@type": "Person",
          "name": formData.author
        };
      }

      if (schemaType === 'article' && formData.publisher) {
        schemaData.publisher = {
          "@type": "Organization",
          "name": formData.publisher
        };
      }
    }

    return `<script type="application/ld+json">
${JSON.stringify(schemaData, null, 2)}
</script>`;
  };

  const copyToClipboard = async () => {
    const schema = generateSchema();
    if (!schema) return;

    try {
      await navigator.clipboard.writeText(schema);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const resetForm = () => {
    setFormData({});
  };

  const currentSchema = schemas[schemaType];
  const generatedSchema = generateSchema();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Schema Type Selection */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
          <SafeIcon icon={FiCode} className="mr-2 text-purple-400" />
          HTML Schema Generator
        </h3>
        <div>
          <label className="block text-white font-medium mb-2">Schema Type</label>
          <select
            value={schemaType}
            onChange={(e) => {
              setSchemaType(e.target.value);
              setFormData({});
            }}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
          >
            {Object.entries(schemas).map(([key, schema]) => (
              <option key={key} value={key}>{schema.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Form Fields */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg">{currentSchema.name} Information</h3>
          <button
            onClick={resetForm}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors text-sm"
          >
            Reset Form
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentSchema.fields.map((field) => (
            <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
              <label className="block text-white font-medium mb-2">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={formData[field.key] || ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  placeholder={field.placeholder || ''}
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
              ) : field.type === 'select' ? (
                <select
                  value={formData[field.key] || ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="">Select...</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  placeholder={field.placeholder || ''}
                  min={field.min}
                  max={field.max}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Generated Schema */}
      {generatedSchema && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">Generated Schema</h3>
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            >
              <SafeIcon icon={copied ? FiCheck : FiCopy} className={copied ? 'text-green-400' : ''} />
              <span>{copied ? 'Copied!' : 'Copy Schema'}</span>
            </button>
          </div>
          <pre className="bg-slate-900/50 rounded-lg p-4 overflow-x-auto">
            <code className="text-green-400 font-mono text-sm">{generatedSchema}</code>
          </pre>
        </div>
      )}

      {/* Schema Types Info */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-white font-semibold text-lg mb-4">Schema Types Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-slate-300">
          <div>
            <h4 className="text-white font-medium mb-2">Organization</h4>
            <p>For businesses, companies, and organizations. Helps with local SEO and brand recognition.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Person</h4>
            <p>For individual profiles, authors, and personal brands. Great for personal websites and bios.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Article</h4>
            <p>For blog posts, news articles, and written content. Improves content visibility in search.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Product</h4>
            <p>For e-commerce items and products. Shows rich snippets with pricing and ratings in search.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Breadcrumb</h4>
            <p>For navigation breadcrumbs. Helps search engines understand site structure.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">FAQ</h4>
            <p>For frequently asked questions. Can appear as rich snippets in search results.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HtmlSchemaGenerator;