// Enhanced OpenRouter Model Scraper - Optimized for Speed
class OpenRouterModelScraper {
  constructor() {
    this.baseUrl = 'https://openrouter.ai/api/v1';
    this.modelsEndpoint = '/models';
    this.cache = new Map();
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
    this.requestTimeout = 8000; // Reduced from 15s to 8s
    this.retryAttempts = 2; // Reduced from 3 to 2
    this.retryDelay = 1000; // Reduced from 2s to 1s
    
    // Speed optimizations
    this.preloadCache = new Map();
    this.loadingPromise = null;
    this.backgroundRefreshInterval = null;
    
    // Bind methods to maintain context
    this.isValidModelFast = this.isValidModelFast.bind(this);
    this.isModelFreeFast = this.isModelFreeFast.bind(this);
    this.fastTransformModel = this.fastTransformModel.bind(this);
    
    // Initialize background loading
    this.initializeBackgroundLoading();
  }

  /**
   * Initialize background loading and preloading strategies
   */
  initializeBackgroundLoading() {
    // Start background refresh every 25 minutes (before cache expires)
    this.backgroundRefreshInterval = setInterval(() => {
      this.backgroundRefresh();
    }, 25 * 60 * 1000);

    // Preload on user interaction
    this.setupPreloadTriggers();
  }

  /**
   * Setup preload triggers for faster perceived loading
   */
  setupPreloadTriggers() {
    // Preload on any user interaction
    const preloadEvents = ['mouseenter', 'focus', 'touchstart'];
    
    preloadEvents.forEach(event => {
      document.addEventListener(event, this.handlePreloadTrigger.bind(this), { 
        once: true, 
        passive: true 
      });
    });
  }

  /**
   * Handle preload triggers
   */
  handlePreloadTrigger() {
    if (!this.loadingPromise && this.shouldPreload()) {
      console.log('🚀 Preloading models on user interaction...');
      this.preloadModels();
    }
  }

  /**
   * Check if preloading should occur
   */
  shouldPreload() {
    // Don't preload if we have fresh cache
    for (const [key, value] of this.cache.entries()) {
      if (Date.now() - value.timestamp < this.cacheExpiry) {
        return false;
      }
    }
    return true;
  }

  /**
   * Preload models in background
   */
  async preloadModels() {
    try {
      await this.fetchModels({ 
        freeOnly: true, 
        preload: true 
      });
    } catch (error) {
      console.log('Preload failed silently:', error.message);
    }
  }

  /**
   * Background refresh to keep cache warm
   */
  async backgroundRefresh() {
    if (this.loadingPromise) return; // Don't refresh if actively loading
    
    try {
      console.log('🔄 Background refresh starting...');
      await this.fetchModels({ 
        forceRefresh: true, 
        background: true,
        freeOnly: true 
      });
      console.log('✅ Background refresh completed');
    } catch (error) {
      console.log('Background refresh failed silently:', error.message);
    }
  }

  /**
   * Main function to fetch models - optimized for speed
   */
  async fetchModels(options = {}) {
    const { freeOnly = false, apiKey = null, forceRefresh = false, preload = false, background = false } = options;
    const cacheKey = `models_${freeOnly ? 'free' : 'all'}_${apiKey ? 'auth' : 'public'}`;

    // Return existing loading promise if already loading
    if (this.loadingPromise && !forceRefresh) {
      console.log('⏳ Returning existing loading promise...');
      return this.loadingPromise;
    }

    // Check cache first (unless forcing refresh)
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        console.log(`⚡ Cache hit: ${cached.data.length} models loaded instantly`);
        return cached.data;
      }
    }

    // Check preload cache for instant loading
    if (this.preloadCache.has(cacheKey)) {
      const preloaded = this.preloadCache.get(cacheKey);
      if (Date.now() - preloaded.timestamp < this.cacheExpiry) {
        console.log(`🚀 Preload cache hit: ${preloaded.data.length} models`);
        // Move to main cache
        this.cacheModels(cacheKey, preloaded.data);
        this.preloadCache.delete(cacheKey);
        return preloaded.data;
      }
    }

    // Create loading promise
    this.loadingPromise = this.performFetch(cacheKey, freeOnly, apiKey, background);
    
    try {
      const result = await this.loadingPromise;
      return result;
    } finally {
      this.loadingPromise = null;
    }
  }

  /**
   * Perform the actual fetch with speed optimizations
   */
  async performFetch(cacheKey, freeOnly, apiKey, background = false) {
    if (!background) {
      console.log('🚀 Fast fetch starting...', { freeOnly, hasApiKey: !!apiKey });
    }

    // Speed-optimized strategies (reduced from 4 to 2 for faster execution)
    const strategies = [
      () => this.fastAuthenticatedFetch(apiKey),
      () => this.fastPublicFetch()
    ];

    let lastError = null;
    
    for (let i = 0; i < strategies.length; i++) {
      try {
        if (!background) {
          console.log(`⚡ Strategy ${i + 1}/${strategies.length} (fast)`);
        }
        
        const models = await this.retryRequest(strategies[i]);
        
        if (models && models.length > 0) {
          if (!background) {
            console.log(`✅ Success! ${models.length} raw models in ${Date.now()}ms`);
          }
          
          // Fast processing
          const processedModels = this.fastProcessModels(models, freeOnly);
          
          // Cache the results
          if (background) {
            this.preloadCache.set(cacheKey, {
              data: processedModels,
              timestamp: Date.now()
            });
          } else {
            this.cacheModels(cacheKey, processedModels);
          }
          
          if (!background) {
            console.log(`🎉 ${processedModels.length} models ready (${processedModels.filter(m => m.pricing.isFree).length} free)`);
          }
          
          return processedModels;
        }
      } catch (error) {
        if (!background) {
          console.warn(`❌ Fast strategy ${i + 1} failed:`, error.message);
        }
        lastError = error;
        
        // Shorter wait between strategies for speed
        if (i < strategies.length - 1) {
          await this.delay(500); // Reduced from 1000ms
        }
      }
    }

    // Fast fallback
    console.log('⚡ Using optimized fallback models');
    const fallbackModels = this.getOptimizedFallbacks();
    const filteredFallback = freeOnly ? fallbackModels.filter(m => m.pricing.isFree) : fallbackModels;
    
    // Cache fallback with shorter expiry
    this.cacheModels(cacheKey, filteredFallback);
    return filteredFallback;
  }

  /**
   * Fast authenticated fetch with timeout optimization
   */
  async fastAuthenticatedFetch(apiKey) {
    if (!apiKey) {
      throw new Error('No API key provided');
    }

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://localhost'
    };

    return await this.fastRequest(`${this.baseUrl}${this.modelsEndpoint}`, { headers });
  }

  /**
   * Fast public fetch with minimal headers
   */
  async fastPublicFetch() {
    const headers = {
      'Accept': 'application/json',
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://localhost'
    };

    return await this.fastRequest(`${this.baseUrl}${this.modelsEndpoint}`, { headers });
  }

  /**
   * Optimized HTTP request with minimal overhead
   */
  async fastRequest(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit',
        cache: 'default', // Use browser cache when possible
        keepalive: true // Optimize connection reuse
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Fast response format handling
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
   * Fast retry with reduced attempts and delays
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
        
        // Fast exponential backoff
        const delay = this.retryDelay * attempt;
        await this.delay(delay);
      }
    }
    
    throw lastError;
  }

  /**
   * Fast model processing with optimized algorithms
   */
  fastProcessModels(rawModels, freeOnly = false) {
    console.log(`⚡ Fast processing ${rawModels.length} models...`);

    // Pre-filter for performance
    let modelsToProcess = rawModels.filter(this.isValidModelFast);
    
    if (freeOnly) {
      modelsToProcess = modelsToProcess.filter(this.isModelFreeFast);
    }

    // Fast transformation with minimal processing
    const transformedModels = modelsToProcess.map(this.fastTransformModel);

    // Quick sort: free first, then by name
    return transformedModels.sort((a, b) => {
      if (a.pricing.isFree && !b.pricing.isFree) return -1;
      if (!a.pricing.isFree && b.pricing.isFree) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Fast model validation (simplified)
   */
  isValidModelFast(model) {
    return model && model.id && model.name && model.pricing;
  }

  /**
   * Fast free model detection (optimized)
   */
  isModelFreeFast(model) {
    const pricing = model.pricing || {};
    const promptPrice = typeof pricing.prompt === 'number' ? pricing.prompt : parseFloat(pricing.prompt || '0');
    const completionPrice = typeof pricing.completion === 'number' ? pricing.completion : parseFloat(pricing.completion || '0');
    
    return promptPrice === 0 && completionPrice === 0 || model.id.includes(':free');
  }

  /**
   * Fast model transformation (minimal processing)
   */
  fastTransformModel(model) {
    const pricing = model.pricing || {};
    const promptPrice = typeof pricing.prompt === 'number' ? pricing.prompt : 0;
    const completionPrice = typeof pricing.completion === 'number' ? pricing.completion : 0;
    const isFree = promptPrice === 0 && completionPrice === 0;

    return {
      id: model.id,
      name: this.fastFormatName(model.name || model.id),
      description: this.fastFormatDescription(model, isFree),
      provider: this.fastExtractProvider(model.id),
      pricing: {
        prompt: promptPrice,
        completion: completionPrice,
        isFree,
        currency: pricing.currency || 'USD'
      },
      context_length: this.fastParseContextLength(model.context_length),
      capabilities: this.fastExtractCapabilities(model),
      compatibility: {
        compatible: true,
        score: 85 // Default score for speed
      }
    };
  }

  /**
   * Fast name formatting
   */
  fastFormatName(name) {
    return name
      .replace(/^[^/]+\//, '') // Remove provider prefix
      .replace(/[-_]/g, ' ') // Replace dashes/underscores
      .replace(/\b\w/g, l => l.toUpperCase()) // Title case
      .trim();
  }

  /**
   * Fast description formatting
   */
  fastFormatDescription(model, isFree) {
    const parts = [];
    if (isFree) {
      parts.push('🆓 Free');
    } else {
      const pricing = model.pricing || {};
      const promptPrice = typeof pricing.prompt === 'number' ? pricing.prompt : 0;
      if (promptPrice > 0) {
        if (promptPrice < 0.001) {
          parts.push(`$${(promptPrice * 1000000).toFixed(1)}/1M tokens`);
        } else {
          parts.push(`$${(promptPrice * 1000).toFixed(2)}/1K tokens`);
        }
      }
    }

    const contextLength = this.fastParseContextLength(model.context_length);
    if (contextLength >= 1000) {
      parts.push(`${Math.round(contextLength / 1000)}K context`);
    }

    return parts.join(' • ') || 'Language Model';
  }

  /**
   * Fast provider extraction
   */
  fastExtractProvider(modelId) {
    const providers = {
      'openai/': 'OpenAI',
      'anthropic/': 'Anthropic',
      'google/': 'Google',
      'meta-llama/': 'Meta',
      'mistralai/': 'Mistral',
      'microsoft/': 'Microsoft'
    };

    for (const [prefix, provider] of Object.entries(providers)) {
      if (modelId.includes(prefix)) {
        return provider;
      }
    }

    const parts = modelId.split('/');
    return parts.length > 1 ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'OpenRouter';
  }

  /**
   * Fast context length parsing
   */
  fastParseContextLength(contextLength) {
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
   * Fast capability extraction
   */
  fastExtractCapabilities(model) {
    const capabilities = [];
    const modelText = `${model.id} ${model.name}`.toLowerCase();
    
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
   * Cache models with optimized storage
   */
  cacheModels(cacheKey, models) {
    this.cache.set(cacheKey, {
      data: models,
      timestamp: Date.now(),
      count: models.length,
      freeCount: models.filter(m => m.pricing.isFree).length
    });
    
    // Clean old cache entries to prevent memory bloat
    if (this.cache.size > 10) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Optimized fallback models (reduced set for speed)
   */
  getOptimizedFallbacks() {
    return [
      // Top free models only for speed
      {
        id: 'anthropic/claude-3-haiku:free',
        name: 'Claude 3 Haiku',
        description: '🆓 Free • 200K context • Fast responses',
        provider: 'Anthropic',
        pricing: { prompt: 0, completion: 0, isFree: true },
        context_length: 200000,
        capabilities: ['chat', 'reasoning'],
        compatibility: { compatible: true, score: 88 }
      },
      {
        id: 'openai/gpt-4o-mini:free',
        name: 'GPT-4o Mini',
        description: '🆓 Free • 128K context • 💻 Code',
        provider: 'OpenAI',
        pricing: { prompt: 0, completion: 0, isFree: true },
        context_length: 128000,
        capabilities: ['chat', 'code'],
        compatibility: { compatible: true, score: 90 }
      },
      {
        id: 'google/gemini-2-5-flash:free',
        name: 'Gemini 2.5 Flash',
        description: '🆓 Free • 1M context • ⚡ Ultra-fast',
        provider: 'Google',
        pricing: { prompt: 0, completion: 0, isFree: true },
        context_length: 1000000,
        capabilities: ['chat', 'code'],
        compatibility: { compatible: true, score: 92 }
      },
      {
        id: 'meta/llama-4-maverick:free',
        name: 'Llama 4 Maverick',
        description: '🆓 Free • 128K context • 💻 Code',
        provider: 'Meta',
        pricing: { prompt: 0, completion: 0, isFree: true },
        context_length: 128000,
        capabilities: ['chat', 'code'],
        compatibility: { compatible: true, score: 92 }
      },
      {
        id: 'deepseek/deepseek-v3:free',
        name: 'DeepSeek V3',
        description: '🆓 Free • 64K context • 💻 Code',
        provider: 'DeepSeek',
        pricing: { prompt: 0, completion: 0, isFree: true },
        context_length: 65536,
        capabilities: ['chat', 'code'],
        compatibility: { compatible: true, score: 88 }
      },
      // Top premium models
      {
        id: 'openai/gpt-4o',
        name: 'GPT-4o',
        description: '$2.50/1M tokens • 128K context • 👁️ Vision • 💻 Code',
        provider: 'OpenAI',
        pricing: { prompt: 0.0000025, completion: 0.00001, isFree: false },
        context_length: 128000,
        capabilities: ['chat', 'code', 'vision'],
        compatibility: { compatible: true, score: 95 }
      },
      {
        id: 'anthropic/claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet',
        description: '$3.00/1M tokens • 200K context • 👁️ Vision • 💻 Code',
        provider: 'Anthropic',
        pricing: { prompt: 0.000003, completion: 0.000015, isFree: false },
        context_length: 200000,
        capabilities: ['chat', 'code', 'vision'],
        compatibility: { compatible: true, score: 96 }
      }
    ];
  }

  /**
   * Clear cache
   */
  clearCache() {
    const count = this.cache.size + this.preloadCache.size;
    this.cache.clear();
    this.preloadCache.clear();
    console.log(`🗑️ Cleared ${count} cache entries`);
    return count;
  }

  /**
   * Get cache statistics
   */
  getModelStatistics() {
    const stats = {
      totalEntries: this.cache.size,
      preloadEntries: this.preloadCache.size,
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

  /**
   * Cleanup method
   */
  dispose() {
    if (this.backgroundRefreshInterval) {
      clearInterval(this.backgroundRefreshInterval);
    }
    this.clearCache();
  }

  /**
   * Utility delay function
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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