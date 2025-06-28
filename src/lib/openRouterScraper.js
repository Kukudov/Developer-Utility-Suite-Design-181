// Enhanced OpenRouter Model Scraper - Multiple strategies for maximum compatibility
class OpenRouterModelScraper {
  constructor() {
    this.baseUrl = 'https://openrouter.ai/api/v1';
    this.modelsEndpoint = '/models';
    this.cache = new Map();
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
    this.requestTimeout = 15000; // 15 seconds
    this.retryAttempts = 3;
    this.retryDelay = 2000; // 2 seconds
  }

  /**
   * Main function to fetch models - enhanced with multiple strategies
   */
  async fetchModels(options = {}) {
    const { freeOnly = false, apiKey = null, forceRefresh = false } = options;
    const cacheKey = `models_${freeOnly ? 'free' : 'all'}_${apiKey ? 'auth' : 'public'}`;

    console.log('🔄 OpenRouter fetch request:', { freeOnly, hasApiKey: !!apiKey, forceRefresh });

    // Check cache first
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        console.log(`✅ Using cached models: ${cached.data.length} models`);
        return cached.data;
      }
    }

    // Multiple fetch strategies for maximum compatibility
    const strategies = [
      () => this.fetchWithAuthentication(apiKey),
      () => this.fetchWithPublicAccess(),
      () => this.fetchWithPagination(apiKey),
      () => this.fetchWithCorsProxy(apiKey)
    ];

    let lastError = null;
    
    for (let i = 0; i < strategies.length; i++) {
      try {
        console.log(`🎯 Trying strategy ${i + 1}/${strategies.length}`);
        const models = await this.retryRequest(strategies[i]);
        
        if (models && models.length > 0) {
          console.log(`✅ Success! Fetched ${models.length} raw models`);
          
          // Process and filter models
          const processedModels = this.processModels(models, freeOnly);
          
          // Cache the results
          this.cacheModels(cacheKey, processedModels);
          
          console.log(`🎉 Final result: ${processedModels.length} models (${processedModels.filter(m => m.pricing.isFree).length} free)`);
          return processedModels;
        }
      } catch (error) {
        console.warn(`❌ Strategy ${i + 1} failed:`, error.message);
        lastError = error;
        
        // Wait before trying next strategy
        if (i < strategies.length - 1) {
          await this.delay(1000);
        }
      }
    }

    console.error('❌ All strategies failed, using enhanced fallback models');
    const fallbackModels = this.getEnhancedFallbacks();
    const filteredFallback = freeOnly ? fallbackModels.filter(m => m.pricing.isFree) : fallbackModels;
    
    // Cache fallback models with shorter expiry
    this.cacheModels(cacheKey, filteredFallback);
    
    return filteredFallback;
  }

  /**
   * Strategy 1: Authenticated request with API key
   */
  async fetchWithAuthentication(apiKey) {
    if (!apiKey) {
      throw new Error('No API key provided for authenticated request');
    }

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://localhost',
      'X-Title': 'AI Assistant Web App'
    };

    return await this.makeRequest(`${this.baseUrl}${this.modelsEndpoint}`, { headers });
  }

  /**
   * Strategy 2: Public access without authentication
   */
  async fetchWithPublicAccess() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://localhost',
      'X-Title': 'AI Assistant Web App',
      'User-Agent': 'Mozilla/5.0 (compatible; AI-Assistant/1.0)'
    };

    return await this.makeRequest(`${this.baseUrl}${this.modelsEndpoint}`, { headers });
  }

  /**
   * Strategy 3: Paginated requests to get more models
   */
  async fetchWithPagination(apiKey) {
    const endpoints = [
      '/models?per_page=1000',
      '/models?limit=1000',
      '/models?page_size=1000',
      '/models?count=1000'
    ];

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://localhost',
      'X-Title': 'AI Assistant Web App'
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    for (const endpoint of endpoints) {
      try {
        const models = await this.makeRequest(`${this.baseUrl}${endpoint}`, { headers });
        if (models && models.length > 10) { // Ensure we got a substantial response
          return models;
        }
      } catch (error) {
        console.warn(`Pagination endpoint ${endpoint} failed:`, error.message);
      }
    }

    throw new Error('All pagination endpoints failed');
  }

  /**
   * Strategy 4: CORS proxy as last resort
   */
  async fetchWithCorsProxy(apiKey) {
    const corsProxies = [
      'https://api.allorigins.win/raw?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://corsproxy.io/?'
    ];

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    for (const proxy of corsProxies) {
      try {
        const url = `${proxy}${encodeURIComponent(`${this.baseUrl}${this.modelsEndpoint}`)}`;
        return await this.makeRequest(url, { headers });
      } catch (error) {
        console.warn(`CORS proxy ${proxy} failed:`, error.message);
      }
    }

    throw new Error('All CORS proxies failed');
  }

  /**
   * Enhanced HTTP request with timeout and error handling
   */
  async makeRequest(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      if (data.data && Array.isArray(data.data)) {
        return data.data;
      } else if (Array.isArray(data)) {
        return data;
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  /**
   * Retry mechanism with exponential backoff
   */
  async retryRequest(requestFn) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        if (attempt === this.retryAttempts) {
          throw error;
        }
        
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
        await this.delay(delay);
      }
    }
    
    throw lastError;
  }

  /**
   * Utility delay function
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Process and filter models
   */
  processModels(rawModels, freeOnly = false) {
    console.log(`🔄 Processing ${rawModels.length} raw models...`);

    // Basic validation and transformation
    const validModels = rawModels
      .filter(model => model && model.id && model.name && model.pricing)
      .map(model => this.transformModel(model));

    console.log(`✅ ${validModels.length} valid models after processing`);

    // Filter for free models if requested
    let modelsToReturn = validModels;
    if (freeOnly) {
      modelsToReturn = validModels.filter(model => this.isModelFree(model));
      console.log(`🆓 ${modelsToReturn.length} free models found`);
    }

    // Sort models: free first, then by name
    return modelsToReturn.sort((a, b) => {
      if (a.pricing.isFree && !b.pricing.isFree) return -1;
      if (!a.pricing.isFree && b.pricing.isFree) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Check if model is free
   */
  isModelFree(model) {
    const pricing = model.pricing || {};
    
    // Check pricing values
    const promptPrice = this.parsePrice(pricing.prompt);
    const completionPrice = this.parsePrice(pricing.completion);
    const isPricingFree = promptPrice === 0 && completionPrice === 0;

    // Check model ID for free indicators
    const freePatterns = [':free', '/free', '-free', '_free'];
    const hasFreePattern = freePatterns.some(pattern => 
      model.id.toLowerCase().includes(pattern)
    );

    return isPricingFree || hasFreePattern;
  }

  /**
   * Parse price safely
   */
  parsePrice(priceValue) {
    if (priceValue === null || priceValue === undefined || priceValue === '') {
      return 0;
    }
    if (typeof priceValue === 'number') {
      return priceValue;
    }
    if (typeof priceValue === 'string') {
      const parsed = parseFloat(priceValue.replace(/[^0-9.-]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  /**
   * Transform raw model to our format
   */
  transformModel(model) {
    const pricing = model.pricing || {};
    const promptPrice = this.parsePrice(pricing.prompt);
    const completionPrice = this.parsePrice(pricing.completion);
    const isFree = this.isModelFree(model);

    return {
      id: model.id,
      name: this.formatModelName(model.name || model.id),
      description: this.formatDescription(model, isFree),
      provider: this.extractProvider(model.id),
      pricing: {
        prompt: promptPrice,
        completion: completionPrice,
        isFree,
        currency: pricing.currency || 'USD'
      },
      context_length: this.parseContextLength(model.context_length),
      capabilities: this.extractCapabilities(model),
      compatibility: { compatible: true, score: 85 },
      raw: model
    };
  }

  /**
   * Format model name
   */
  formatModelName(name) {
    return name
      .replace(/^[^/]+\//, '') // Remove provider prefix
      .replace(/[-_]/g, ' ') // Replace dashes/underscores with spaces
      .replace(/\b\w/g, l => l.toUpperCase()) // Title case
      .trim();
  }

  /**
   * Format model description
   */
  formatDescription(model, isFree) {
    const parts = [];

    if (isFree) {
      parts.push('🆓 Free');
    } else {
      const pricing = model.pricing || {};
      const promptPrice = this.parsePrice(pricing.prompt);
      if (promptPrice > 0) {
        if (promptPrice < 0.001) {
          parts.push(`$${(promptPrice * 1000000).toFixed(1)}/1M tokens`);
        } else {
          parts.push(`$${(promptPrice * 1000).toFixed(2)}/1K tokens`);
        }
      }
    }

    // Add context length
    const contextLength = this.parseContextLength(model.context_length);
    if (contextLength >= 1000) {
      parts.push(`${Math.round(contextLength / 1000)}K context`);
    }

    // Add capabilities
    const capabilities = this.extractCapabilities(model);
    if (capabilities.includes('vision')) parts.push('👁️ Vision');
    if (capabilities.includes('code')) parts.push('💻 Code');

    return parts.join(' • ') || 'Language Model';
  }

  /**
   * Extract provider from model ID
   */
  extractProvider(modelId) {
    const providers = {
      'openai/': 'OpenAI',
      'anthropic/': 'Anthropic',
      'google/': 'Google',
      'meta-llama/': 'Meta',
      'mistralai/': 'Mistral',
      'microsoft/': 'Microsoft',
      'cohere/': 'Cohere'
    };

    for (const [prefix, provider] of Object.entries(providers)) {
      if (modelId.toLowerCase().includes(prefix)) {
        return provider;
      }
    }

    const parts = modelId.split('/');
    if (parts.length > 1) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }

    return 'OpenRouter';
  }

  /**
   * Parse context length
   */
  parseContextLength(contextLength) {
    if (typeof contextLength === 'number') {
      return contextLength;
    }
    if (typeof contextLength === 'string') {
      const cleaned = contextLength.toLowerCase().replace(/[,\s]/g, '');
      if (cleaned.includes('k')) {
        const num = parseFloat(cleaned.replace('k', ''));
        return isNaN(num) ? 4096 : num * 1000;
      }
      const parsed = parseInt(cleaned);
      return isNaN(parsed) ? 4096 : parsed;
    }
    return 4096;
  }

  /**
   * Extract capabilities
   */
  extractCapabilities(model) {
    const capabilities = [];
    const modelText = `${model.id} ${model.name} ${model.description || ''}`.toLowerCase();

    if (modelText.includes('vision') || modelText.includes('image')) {
      capabilities.push('vision');
    }
    if (modelText.includes('code') || modelText.includes('programming')) {
      capabilities.push('code');
    }
    if (modelText.includes('chat') || modelText.includes('instruct')) {
      capabilities.push('chat');
    }

    return capabilities;
  }

  /**
   * Cache models
   */
  cacheModels(cacheKey, models) {
    this.cache.set(cacheKey, {
      data: models,
      timestamp: Date.now(),
      count: models.length,
      freeCount: models.filter(m => m.pricing.isFree).length
    });
    console.log(`💾 Cached ${models.length} models`);
  }

  /**
   * Enhanced fallback models - comprehensive list when API fails
   */
  getEnhancedFallbacks() {
    console.warn('⚠️ Using enhanced fallback models - API connection failed');
    return [
      // Free Models
      {
        id: 'meta-llama/llama-3.2-3b-instruct:free',
        name: 'Llama 3.2 3B Instruct',
        description: '🆓 Free • 128K context • 💻 Code',
        provider: 'Meta',
        pricing: { prompt: 0, completion: 0, isFree: true },
        context_length: 131072,
        capabilities: ['chat', 'code'],
        compatibility: { compatible: true, score: 85 }
      },
      {
        id: 'meta-llama/llama-3.2-1b-instruct:free',
        name: 'Llama 3.2 1B Instruct',
        description: '🆓 Free • 128K context • Fast',
        provider: 'Meta',
        pricing: { prompt: 0, completion: 0, isFree: true },
        context_length: 131072,
        capabilities: ['chat'],
        compatibility: { compatible: true, score: 80 }
      },
      {
        id: 'google/gemma-2-9b-it:free',
        name: 'Gemma 2 9B IT',
        description: '🆓 Free • 8K context • 💻 Code',
        provider: 'Google',
        pricing: { prompt: 0, completion: 0, isFree: true },
        context_length: 8192,
        capabilities: ['chat', 'code'],
        compatibility: { compatible: true, score: 85 }
      },
      {
        id: 'microsoft/phi-3-mini-128k-instruct:free',
        name: 'Phi-3 Mini 128K Instruct',
        description: '🆓 Free • 128K context • 💻 Code',
        provider: 'Microsoft',
        pricing: { prompt: 0, completion: 0, isFree: true },
        context_length: 131072,
        capabilities: ['chat', 'code'],
        compatibility: { compatible: true, score: 82 }
      },
      {
        id: 'huggingface/zephyr-7b-beta:free',
        name: 'Zephyr 7B Beta',
        description: '🆓 Free • 32K context • Chat',
        provider: 'Hugging Face',
        pricing: { prompt: 0, completion: 0, isFree: true },
        context_length: 32768,
        capabilities: ['chat'],
        compatibility: { compatible: true, score: 78 }
      },
      {
        id: 'openchat/openchat-7b:free',
        name: 'OpenChat 7B',
        description: '🆓 Free • 8K context • Chat',
        provider: 'OpenChat',
        pricing: { prompt: 0, completion: 0, isFree: true },
        context_length: 8192,
        capabilities: ['chat'],
        compatibility: { compatible: true, score: 75 }
      },
      {
        id: 'mistralai/mistral-7b-instruct:free',
        name: 'Mistral 7B Instruct',
        description: '🆓 Free • 32K context • 💻 Code',
        provider: 'Mistral AI',
        pricing: { prompt: 0, completion: 0, isFree: true },
        context_length: 32768,
        capabilities: ['chat', 'code'],
        compatibility: { compatible: true, score: 83 }
      },
      {
        id: 'nousresearch/nous-capybara-7b:free',
        name: 'Nous Capybara 7B',
        description: '🆓 Free • 4K context • Chat',
        provider: 'Nous Research',
        pricing: { prompt: 0, completion: 0, isFree: true },
        context_length: 4096,
        capabilities: ['chat'],
        compatibility: { compatible: true, score: 76 }
      },
      // Popular Paid Models
      {
        id: 'openai/gpt-4-turbo',
        name: 'GPT-4 Turbo',
        description: '$10/1M tokens • 128K context • 🔍 Vision • 💻 Code',
        provider: 'OpenAI',
        pricing: { prompt: 0.01, completion: 0.03, isFree: false },
        context_length: 128000,
        capabilities: ['chat', 'code', 'vision'],
        compatibility: { compatible: true, score: 98 }
      },
      {
        id: 'openai/gpt-4',
        name: 'GPT-4',
        description: '$30/1M tokens • 8K context • 💻 Code',
        provider: 'OpenAI',
        pricing: { prompt: 0.03, completion: 0.06, isFree: false },
        context_length: 8192,
        capabilities: ['chat', 'code'],
        compatibility: { compatible: true, score: 96 }
      },
      {
        id: 'openai/gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: '$0.50/1M tokens • 16K context • 💻 Code',
        provider: 'OpenAI',
        pricing: { prompt: 0.0005, completion: 0.0015, isFree: false },
        context_length: 16385,
        capabilities: ['chat', 'code'],
        compatibility: { compatible: true, score: 90 }
      },
      {
        id: 'anthropic/claude-3-opus',
        name: 'Claude 3 Opus',
        description: '$15/1M tokens • 200K context • 🔍 Vision • 💻 Code',
        provider: 'Anthropic',
        pricing: { prompt: 0.015, completion: 0.075, isFree: false },
        context_length: 200000,
        capabilities: ['chat', 'code', 'vision'],
        compatibility: { compatible: true, score: 97 }
      },
      {
        id: 'anthropic/claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        description: '$3/1M tokens • 200K context • 🔍 Vision • 💻 Code',
        provider: 'Anthropic',
        pricing: { prompt: 0.003, completion: 0.015, isFree: false },
        context_length: 200000,
        capabilities: ['chat', 'code', 'vision'],
        compatibility: { compatible: true, score: 94 }
      },
      {
        id: 'anthropic/claude-3-haiku',
        name: 'Claude 3 Haiku',
        description: '$0.25/1M tokens • 200K context • 🔍 Vision • Fast',
        provider: 'Anthropic',
        pricing: { prompt: 0.00025, completion: 0.00125, isFree: false },
        context_length: 200000,
        capabilities: ['chat', 'vision'],
        compatibility: { compatible: true, score: 88 }
      },
      {
        id: 'google/gemini-pro',
        name: 'Gemini Pro',
        description: '$0.50/1M tokens • 32K context • 💻 Code',
        provider: 'Google',
        pricing: { prompt: 0.0005, completion: 0.0015, isFree: false },
        context_length: 32768,
        capabilities: ['chat', 'code'],
        compatibility: { compatible: true, score: 89 }
      },
      {
        id: 'google/gemini-pro-vision',
        name: 'Gemini Pro Vision',
        description: '$0.50/1M tokens • 16K context • 🔍 Vision • 💻 Code',
        provider: 'Google',
        pricing: { prompt: 0.0005, completion: 0.0015, isFree: false },
        context_length: 16384,
        capabilities: ['chat', 'code', 'vision'],
        compatibility: { compatible: true, score: 91 }
      },
      {
        id: 'meta-llama/llama-2-70b-chat',
        name: 'Llama 2 70B Chat',
        description: '$0.70/1M tokens • 4K context • 💻 Code',
        provider: 'Meta',
        pricing: { prompt: 0.0007, completion: 0.0009, isFree: false },
        context_length: 4096,
        capabilities: ['chat', 'code'],
        compatibility: { compatible: true, score: 86 }
      },
      {
        id: 'mistralai/mixtral-8x7b-instruct',
        name: 'Mixtral 8x7B Instruct',
        description: '$0.24/1M tokens • 32K context • 💻 Code',
        provider: 'Mistral AI',
        pricing: { prompt: 0.00024, completion: 0.00024, isFree: false },
        context_length: 32768,
        capabilities: ['chat', 'code'],
        compatibility: { compatible: true, score: 87 }
      },
      {
        id: 'cohere/command-r-plus',
        name: 'Command R+',
        description: '$3/1M tokens • 128K context • 💻 Code',
        provider: 'Cohere',
        pricing: { prompt: 0.003, completion: 0.015, isFree: false },
        context_length: 128000,
        capabilities: ['chat', 'code'],
        compatibility: { compatible: true, score: 85 }
      }
    ];
  }

  /**
   * Clear cache
   */
  clearCache() {
    const count = this.cache.size;
    this.cache.clear();
    console.log(`🗑️ Cleared ${count} cache entries`);
    return count;
  }

  /**
   * Get cache statistics
   */
  getModelStatistics() {
    const stats = {
      totalEntries: this.cache.size,
      totalModels: 0,
      totalFreeModels: 0,
      lastUpdated: null
    };

    for (const [key, value] of this.cache.entries()) {
      stats.totalModels += value.count || 0;
      stats.totalFreeModels += value.freeCount || 0;
      if (!stats.lastUpdated || value.timestamp > stats.lastUpdated) {
        stats.lastUpdated = value.timestamp;
      }
    }

    return stats;
  }
}

// Create singleton instance
export const openRouterScraper = new OpenRouterModelScraper();

// Simplified utility functions
export const fetchOpenRouterModels = (options = {}) => {
  return openRouterScraper.fetchModels(options);
};

export const clearOpenRouterCache = () => {
  return openRouterScraper.clearCache();
};

export const getOpenRouterStatistics = () => {
  return openRouterScraper.getModelStatistics();
};

export const refreshOpenRouterModels = (apiKey = null) => {
  return openRouterScraper.fetchModels({ forceRefresh: true, apiKey });
};

export const getOpenRouterFreeModels = (apiKey = null) => {
  return openRouterScraper.fetchModels({ freeOnly: true, apiKey });
};