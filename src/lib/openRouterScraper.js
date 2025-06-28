// Simplified OpenRouter Model Scraper - Focus on working connection
class OpenRouterModelScraper {
  constructor() {
    this.baseUrl = 'https://openrouter.ai/api/v1';
    this.modelsEndpoint = '/models';
    this.cache = new Map();
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
    this.requestTimeout = 10000; // 10 seconds
  }

  /**
   * Main function to fetch models - simplified approach
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

    try {
      // Try direct API call first
      console.log('🌐 Attempting direct OpenRouter API call...');
      const models = await this.fetchDirect(apiKey);
      
      if (models && models.length > 10) {
        console.log(`🎉 SUCCESS! Fetched ${models.length} models from OpenRouter`);
        const processedModels = this.processModels(models, freeOnly);
        this.cacheModels(cacheKey, processedModels);
        return processedModels;
      }
      
      throw new Error('Insufficient models received');
      
    } catch (error) {
      console.error('❌ OpenRouter API failed:', error.message);
      
      // Try CORS proxy fallback
      try {
        console.log('🔄 Trying CORS proxy fallback...');
        const models = await this.fetchWithProxy(apiKey);
        
        if (models && models.length > 10) {
          console.log(`🎉 PROXY SUCCESS! Fetched ${models.length} models`);
          const processedModels = this.processModels(models, freeOnly);
          this.cacheModels(cacheKey, processedModels);
          return processedModels;
        }
      } catch (proxyError) {
        console.error('❌ Proxy also failed:', proxyError.message);
      }
      
      // Only use fallbacks as last resort
      console.warn('⚠️ Using fallback models - API connection failed');
      const fallbackModels = this.getMinimalFallbacks();
      const filteredFallback = freeOnly ? fallbackModels.filter(m => m.pricing.isFree) : fallbackModels;
      return filteredFallback;
    }
  }

  /**
   * Direct API call to OpenRouter
   */
  async fetchDirect(apiKey) {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    // Add auth header if API key provided
    if (apiKey && apiKey.trim()) {
      headers['Authorization'] = `Bearer ${apiKey.trim()}`;
      console.log('🔑 Using API key for authenticated request');
    } else {
      console.log('🌐 Making public request (no API key)');
    }

    const response = await fetch(`${this.baseUrl}${this.modelsEndpoint}`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(this.requestTimeout)
    });

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
  }

  /**
   * CORS proxy fallback
   */
  async fetchWithProxy(apiKey) {
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const targetUrl = encodeURIComponent(`${this.baseUrl}${this.modelsEndpoint}`);
    
    const response = await fetch(`${proxyUrl}${targetUrl}`, {
      method: 'GET',
      signal: AbortSignal.timeout(this.requestTimeout)
    });

    if (!response.ok) {
      throw new Error(`Proxy HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data.data || [];
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
   * Minimal fallback models - only use when API completely fails
   */
  getMinimalFallbacks() {
    console.warn('⚠️ Using minimal fallback models - API connection failed');
    return [
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
        id: 'openai/gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: '$0.50/1K tokens • 16K context • 💻 Code',
        provider: 'OpenAI',
        pricing: { prompt: 0.0005, completion: 0.0015, isFree: false },
        context_length: 16385,
        capabilities: ['chat', 'code'],
        compatibility: { compatible: true, score: 95 }
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