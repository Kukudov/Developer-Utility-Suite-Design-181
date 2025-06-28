// Enhanced OpenRouter Model Scraper for Web Applications
class EnhancedOpenRouterScraper {
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
   * Main function to fetch all OpenRouter models with enhanced strategies
   * @param {Object} options - Configuration options
   * @param {string} options.apiKey - OpenRouter API key
   * @param {boolean} options.freeOnly - Only fetch free models
   * @param {boolean} options.forceRefresh - Force refresh bypassing cache
   * @returns {Promise<Array>} Array of processed model objects
   */
  async fetchAllModels(options = {}) {
    const { apiKey = null, freeOnly = false, forceRefresh = false } = options;
    const cacheKey = `models_${freeOnly ? 'free' : 'all'}_${apiKey ? 'auth' : 'public'}`;
    
    // Check cache first (unless forcing refresh)
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        console.log(`✅ Using cached models: ${cached.data.length} models`);
        return cached.data;
      }
    }

    console.log('🔄 Fetching fresh models from OpenRouter API...', { 
      freeOnly, 
      hasApiKey: !!apiKey,
      forceRefresh 
    });

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
          const processedModels = await this.processModels(models, freeOnly);
          
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

    console.error('❌ All strategies failed, using fallback models');
    const fallbackModels = this.getFallbackModels();
    const filteredFallback = freeOnly ? fallbackModels.filter(m => m.pricing.isFree) : fallbackModels;
    
    // Cache fallback models with shorter expiry
    this.cacheModels(cacheKey, filteredFallback, 5 * 60 * 1000);
    
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
      'HTTP-Referer': window.location.origin,
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
      'HTTP-Referer': window.location.origin,
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
      'HTTP-Referer': window.location.origin,
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
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }

      const data = await response.json();
      
      // Handle different response formats
      if (data.data && Array.isArray(data.data)) {
        return data.data;
      } else if (Array.isArray(data)) {
        return data;
      } else if (data.models && Array.isArray(data.models)) {
        return data.models;
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
   * Retry requests with exponential backoff
   */
  async retryRequest(requestFunction) {
    let lastError = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const result = await requestFunction();
        return result;
      } catch (error) {
        lastError = error;
        
        if (attempt < this.retryAttempts) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          console.log(`⏳ Retry ${attempt} failed, waiting ${delay}ms...`);
          await this.delay(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Process and transform raw models
   */
  async processModels(rawModels, freeOnly = false) {
    console.log(`🔄 Processing ${rawModels.length} raw models...`);

    // Filter and validate models
    const validModels = rawModels.filter(model => this.isValidModel(model));
    console.log(`✅ ${validModels.length} valid models after filtering`);

    // Filter for free models if requested
    let modelsToProcess = validModels;
    if (freeOnly) {
      modelsToProcess = validModels.filter(model => this.isModelFree(model));
      console.log(`🆓 ${modelsToProcess.length} free models found`);
    }

    // Transform models
    const transformedModels = modelsToProcess.map(model => this.transformModel(model));

    // Sort models intelligently
    return this.sortModels(transformedModels);
  }

  /**
   * Enhanced model validation
   */
  isValidModel(model) {
    if (!model || typeof model !== 'object') {
      return false;
    }

    // Must have ID and name
    if (!model.id || !model.name) {
      return false;
    }

    // Must have pricing information
    if (!model.pricing || typeof model.pricing !== 'object') {
      return false;
    }

    // Check for known problematic patterns
    const problematicPatterns = [
      'deprecated',
      'disabled',
      'unavailable',
      'maintenance',
      'beta.*unstable'
    ];

    const modelText = `${model.id} ${model.name} ${model.description || ''}`.toLowerCase();
    if (problematicPatterns.some(pattern => new RegExp(pattern, 'i').test(modelText))) {
      return false;
    }

    return true;
  }

  /**
   * Enhanced free model detection
   */
  isModelFree(model) {
    const pricing = model.pricing || {};
    
    // Strategy 1: Check pricing values
    const promptPrice = this.parsePrice(pricing.prompt);
    const completionPrice = this.parsePrice(pricing.completion);
    const isPricingFree = promptPrice === 0 && completionPrice === 0;
    
    // Strategy 2: Check model ID patterns
    const freeIdPatterns = [
      ':free',
      '/free',
      '-free',
      '_free',
      'free-',
      'free_'
    ];
    const hasFreePattern = freeIdPatterns.some(pattern => 
      model.id.toLowerCase().includes(pattern)
    );
    
    // Strategy 3: Check model name patterns
    const freeNamePatterns = [
      'free',
      'gratis',
      'complimentary',
      'no cost'
    ];
    const hasFreeName = freeNamePatterns.some(pattern =>
      model.name.toLowerCase().includes(pattern)
    );

    return isPricingFree || hasFreePattern || hasFreeName;
  }

  /**
   * Parse price values safely
   */
  parsePrice(priceValue) {
    if (priceValue === null || priceValue === undefined || priceValue === '') {
      return 0;
    }
    
    if (typeof priceValue === 'number') {
      return priceValue;
    }
    
    if (typeof priceValue === 'string') {
      const cleanPrice = priceValue.replace(/[$€£¥₹]/g, '').trim();
      const parsed = parseFloat(cleanPrice);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    return 0;
  }

  /**
   * Transform raw model to enhanced format
   */
  transformModel(model) {
    const pricing = model.pricing || {};
    const promptPrice = this.parsePrice(pricing.prompt);
    const completionPrice = this.parsePrice(pricing.completion);
    const isFree = this.isModelFree(model);

    return {
      id: model.id,
      name: this.formatModelName(model.name || model.id),
      description: this.formatModelDescription(model, isFree),
      provider: this.extractProvider(model.id),
      pricing: {
        prompt: promptPrice,
        completion: completionPrice,
        isFree,
        currency: pricing.currency || 'USD'
      },
      context_length: this.parseContextLength(model.context_length),
      architecture: model.architecture || 'transformer',
      capabilities: this.extractCapabilities(model),
      compatibility: {
        compatible: true,
        score: this.calculateCompatibilityScore(model)
      },
      metadata: {
        created: model.created,
        updated: model.updated,
        top_provider: model.top_provider
      },
      raw: model
    };
  }

  /**
   * Parse context length with fallbacks
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
      
      if (cleaned.includes('m')) {
        const num = parseFloat(cleaned.replace('m', ''));
        return isNaN(num) ? 4096 : num * 1000000;
      }
      
      const parsed = parseInt(cleaned);
      return isNaN(parsed) ? 4096 : parsed;
    }
    
    return 4096;
  }

  /**
   * Extract model capabilities
   */
  extractCapabilities(model) {
    const capabilities = [];
    const modelText = `${model.id} ${model.name} ${model.description || ''}`.toLowerCase();
    
    const capabilityMap = {
      'vision': ['vision', 'image', 'visual', 'multimodal'],
      'code': ['code', 'programming', 'coding', 'developer'],
      'chat': ['chat', 'conversation', 'instruct'],
      'completion': ['completion', 'generate', 'text'],
      'function_calling': ['function', 'tool', 'api'],
      'reasoning': ['reasoning', 'logic', 'analysis'],
      'math': ['math', 'calculation', 'arithmetic']
    };

    for (const [capability, keywords] of Object.entries(capabilityMap)) {
      if (keywords.some(keyword => modelText.includes(keyword))) {
        capabilities.push(capability);
      }
    }

    return capabilities;
  }

  /**
   * Calculate compatibility score
   */
  calculateCompatibilityScore(model) {
    let score = 50;
    
    // Context length scoring
    const contextLength = this.parseContextLength(model.context_length);
    if (contextLength >= 128000) score += 25;
    else if (contextLength >= 32000) score += 20;
    else if (contextLength >= 16000) score += 15;
    else if (contextLength >= 8000) score += 10;
    else if (contextLength >= 4000) score += 5;
    
    // Provider reputation
    const topProviders = ['openai', 'anthropic', 'google', 'meta', 'microsoft'];
    if (topProviders.some(p => model.id.toLowerCase().includes(p))) score += 15;
    
    // Capability scoring
    const capabilities = this.extractCapabilities(model);
    score += Math.min(capabilities.length * 2, 10);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Smart model sorting
   */
  sortModels(models) {
    return models.sort((a, b) => {
      // Free models first
      if (a.pricing.isFree && !b.pricing.isFree) return -1;
      if (!a.pricing.isFree && b.pricing.isFree) return 1;
      
      // Higher compatibility score
      if (a.compatibility.score !== b.compatibility.score) {
        return b.compatibility.score - a.compatibility.score;
      }
      
      // Alphabetical by name
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Format model description
   */
  formatModelDescription(model, isFree) {
    const parts = [];
    
    if (isFree) {
      parts.push('🆓 Free');
    } else {
      const pricing = model.pricing || {};
      const promptPrice = this.parsePrice(pricing.prompt);
      if (promptPrice > 0) {
        parts.push(`$${promptPrice.toFixed(4)}/1K tokens`);
      }
    }

    const contextLength = this.parseContextLength(model.context_length);
    if (contextLength >= 1000) {
      parts.push(`${Math.round(contextLength / 1000)}K context`);
    }

    const capabilities = this.extractCapabilities(model);
    if (capabilities.includes('vision')) parts.push('👁️ Vision');
    if (capabilities.includes('code')) parts.push('💻 Code');

    return parts.join(' • ') || 'Language Model';
  }

  /**
   * Extract provider from model ID
   */
  extractProvider(modelId) {
    const providerMap = {
      'openai/': 'OpenAI',
      'anthropic/': 'Anthropic',
      'google/': 'Google',
      'meta-llama/': 'Meta',
      'mistralai/': 'Mistral AI',
      'microsoft/': 'Microsoft'
    };

    for (const [prefix, provider] of Object.entries(providerMap)) {
      if (modelId.toLowerCase().includes(prefix.toLowerCase())) {
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
   * Format model name
   */
  formatModelName(name) {
    return name
      .replace(/^[^/]+\//, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  }

  /**
   * Cache models with metadata
   */
  cacheModels(cacheKey, models, customExpiry = null) {
    this.cache.set(cacheKey, {
      data: models,
      timestamp: Date.now(),
      expiry: customExpiry || this.cacheExpiry,
      count: models.length,
      freeCount: models.filter(m => m.pricing.isFree).length
    });
  }

  /**
   * Get fallback models
   */
  getFallbackModels() {
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
        description: '$0.0005/1K tokens • 16K context • 💻 Code',
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
    console.log(`🗑️ Cleared ${count} cached entries`);
    return count;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const stats = {
      totalEntries: this.cache.size,
      entries: []
    };

    for (const [key, value] of this.cache.entries()) {
      stats.entries.push({
        key,
        count: value.count,
        freeCount: value.freeCount,
        age: Date.now() - value.timestamp,
        expired: Date.now() - value.timestamp > value.expiry
      });
    }

    return stats;
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use in your application
window.EnhancedOpenRouterScraper = EnhancedOpenRouterScraper;