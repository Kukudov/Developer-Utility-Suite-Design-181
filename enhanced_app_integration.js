// Enhanced integration for your existing app.js
document.addEventListener("DOMContentLoaded", function () {
  // Initialize the enhanced scraper
  const enhancedScraper = new EnhancedOpenRouterScraper();
  
  // Store reference globally
  window.enhancedScraper = enhancedScraper;

  // Enhanced fetch function to replace your existing fetchOpenRouterModels
  async function fetchOpenRouterModelsEnhanced() {
    if (!settings.openrouterKey) {
      showNotification("OpenRouter API key is required to fetch models. Please set it in the settings.", "error");
      return;
    }

    try {
      // Show loading with enhanced indicator
      openrouterModelSelect.innerHTML = '<option value="">🔄 Loading all models...</option>';
      
      // Use enhanced scraper
      const models = await enhancedScraper.fetchAllModels({
        apiKey: settings.openrouterKey,
        freeOnly: document.getElementById("free-models-only")?.checked || false,
        forceRefresh: false
      });

      console.log("✅ Enhanced scraper results:", models);

      // Clear current options
      openrouterModelSelect.innerHTML = "";

      if (models.length === 0) {
        openrouterModelSelect.innerHTML = '<option value="">No models available</option>';
        showNotification("No models found with current filters", "info");
        return;
      }

      // Add models to select with enhanced information
      models.forEach((model) => {
        const option = document.createElement("option");
        option.value = model.id;
        
        // Enhanced display with pricing and capabilities
        const freeLabel = model.pricing.isFree ? " 🆓" : "";
        const providerLabel = ` [${model.provider}]`;
        option.textContent = `${model.name}${freeLabel}${providerLabel}`;
        
        // Add data attributes for enhanced information
        option.dataset.promptPrice = model.pricing.prompt;
        option.dataset.completionPrice = model.pricing.completion;
        option.dataset.contextLength = model.context_length;
        option.dataset.provider = model.provider;
        option.dataset.capabilities = JSON.stringify(model.capabilities);
        option.dataset.compatibilityScore = model.compatibility.score;
        option.title = model.description; // Tooltip with description
        
        openrouterModelSelect.appendChild(option);
      });

      const totalModels = models.length;
      const freeModels = models.filter(m => m.pricing.isFree).length;
      const showOnlyFree = document.getElementById("free-models-only")?.checked || false;
      
      showNotification(
        `✅ Successfully loaded ${totalModels} models${showOnlyFree ? ` (${freeModels} free)` : ` (${freeModels} free, ${totalModels - freeModels} paid)`}`, 
        "success"
      );

      // Update cache statistics
      const cacheStats = enhancedScraper.getCacheStats();
      console.log("📊 Cache statistics:", cacheStats);

    } catch (error) {
      console.error("❌ Enhanced scraper error:", error);
      showNotification(`Failed to fetch models: ${error.message}`, "error");
      
      // Reset select with error message
      openrouterModelSelect.innerHTML = '<option value="">❌ Failed to load models</option>';
    }
  }

  // Enhanced controls with additional features
  function enhanceOpenRouterControlsAdvanced() {
    const openrouterContainer = document.getElementById("openrouter-container");
    const openrouterControls = document.createElement("div");
    openrouterControls.className = "openrouter-controls-enhanced";
    openrouterControls.innerHTML = `
      <div class="control-row">
        <button id="refresh-openrouter-enhanced" class="small-button enhanced">
          <i class="fas fa-sync-alt"></i> Fetch All Models
        </button>
        <button id="clear-cache" class="small-button secondary">
          <i class="fas fa-trash"></i> Clear Cache
        </button>
      </div>
      <div class="control-row">
        <div class="checkbox-group">
          <input type="checkbox" id="free-models-only-enhanced" checked>
          <label for="free-models-only-enhanced">🆓 Free only</label>
        </div>
        <div class="checkbox-group">
          <input type="checkbox" id="show-provider-info">
          <label for="show-provider-info">📊 Show provider info</label>
        </div>
      </div>
      <div class="model-stats" id="model-stats" style="display: none;">
        <small class="text-muted">Loading statistics...</small>
      </div>
    `;

    // Insert after the OpenRouter model select
    openrouterContainer.appendChild(openrouterControls);

    // Enhanced event listeners
    document.getElementById("refresh-openrouter-enhanced").addEventListener("click", fetchOpenRouterModelsEnhanced);
    
    document.getElementById("clear-cache").addEventListener("click", () => {
      const clearedCount = enhancedScraper.clearCache();
      showNotification(`🗑️ Cleared ${clearedCount} cache entries`, "success");
    });
    
    document.getElementById("free-models-only-enhanced").addEventListener("change", fetchOpenRouterModelsEnhanced);
    
    document.getElementById("show-provider-info").addEventListener("change", (e) => {
      const statsDiv = document.getElementById("model-stats");
      if (e.target.checked) {
        updateModelStatistics();
        statsDiv.style.display = "block";
      } else {
        statsDiv.style.display = "none";
      }
    });
  }

  // Update model statistics display
  function updateModelStatistics() {
    const statsDiv = document.getElementById("model-stats");
    const cacheStats = enhancedScraper.getCacheStats();
    
    if (cacheStats.entries.length > 0) {
      const latestEntry = cacheStats.entries[0];
      statsDiv.innerHTML = `
        <small class="text-muted">
          📊 ${latestEntry.count} total models, ${latestEntry.freeCount} free models
          | 🕒 Cache age: ${Math.round(latestEntry.age / 1000 / 60)}min
          | ${latestEntry.expired ? '❌ Expired' : '✅ Fresh'}
        </small>
      `;
    } else {
      statsDiv.innerHTML = '<small class="text-muted">No cache data available</small>';
    }
  }

  // Enhanced model selection with detailed info
  function enhanceModelSelection() {
    openrouterModelSelect.addEventListener("change", (e) => {
      const selectedOption = e.target.selectedOptions[0];
      if (selectedOption && selectedOption.dataset.provider) {
        const modelInfo = {
          provider: selectedOption.dataset.provider,
          contextLength: selectedOption.dataset.contextLength,
          capabilities: JSON.parse(selectedOption.dataset.capabilities || '[]'),
          compatibilityScore: selectedOption.dataset.compatibilityScore
        };
        
        console.log("🎯 Selected model info:", modelInfo);
        
        // Optional: Show model info in UI
        if (document.getElementById("show-provider-info")?.checked) {
          showNotification(
            `Selected: ${selectedOption.textContent} | Context: ${Math.round(modelInfo.contextLength / 1000)}K | Score: ${modelInfo.compatibilityScore}`, 
            "info"
          );
        }
      }
    });
  }

  // CSS styles for enhanced controls
  const enhancedStyles = document.createElement("style");
  enhancedStyles.textContent = `
    .openrouter-controls-enhanced {
      margin-top: 10px;
      padding: 10px;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }
    
    .control-row {
      display: flex;
      gap: 10px;
      margin-bottom: 8px;
      align-items: center;
    }
    
    .small-button.enhanced {
      background: linear-gradient(45deg, #4CAF50, #45a049);
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.3s ease;
    }
    
    .small-button.enhanced:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
    }
    
    .small-button.secondary {
      background: #6c757d;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    
    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .checkbox-group label {
      font-size: 12px;
      margin: 0;
    }
    
    .model-stats {
      margin-top: 8px;
      padding: 5px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
    
    .text-muted {
      color: #6c757d;
    }
  `;
  document.head.appendChild(enhancedStyles);

  // Initialize enhanced features
  function initEnhancedFeatures() {
    // Replace the existing enhance function
    enhanceOpenRouterControlsAdvanced();
    enhanceModelSelection();
    
    // Auto-fetch models if API key exists
    if (settings.openrouterKey) {
      setTimeout(fetchOpenRouterModelsEnhanced, 1500);
    }
    
    console.log("🚀 Enhanced OpenRouter scraper initialized!");
  }

  // Call enhanced initialization after your existing init
  setTimeout(initEnhancedFeatures, 1000);
});