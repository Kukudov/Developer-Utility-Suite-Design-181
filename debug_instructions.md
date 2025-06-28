# OpenRouter Connection Debug Instructions

## 🔍 Problem Analysis
The issue is that the OpenRouter scraper is falling back to minimal models instead of successfully fetching from the API. Here's how to debug and fix it:

## 🛠️ Debug Steps

### 1. Check Browser Console
Open your browser's Developer Tools (F12) and look for these logs in the Console tab:

**Expected Success Logs:**
```
🚀 Starting OpenRouter model load...
🔑 API Keys loaded: ['openrouter']
🌐 Attempting direct OpenRouter API call...
🎉 SUCCESS! Fetched 400+ models from OpenRouter
✅ Successfully loaded 400+ models (100+ free)
```

**Failure Logs to Look For:**
```
❌ OpenRouter API failed: [error message]
⚠️ Using minimal fallback models - API connection failed
```

### 2. Test Direct API Call
In your browser console, run this test:

```javascript
// Test direct OpenRouter API call
fetch('https://openrouter.ai/api/v1/models')
  .then(response => response.json())
  .then(data => {
    console.log('Direct API test:', data.data?.length || data.length, 'models');
  })
  .catch(error => {
    console.error('Direct API test failed:', error);
  });
```

### 3. Check API Key Configuration
1. Go to Settings in your app
2. Verify your OpenRouter API key is saved
3. Check console for: `🔑 API Keys loaded: ['openrouter']`

### 4. Verify Network Issues
In Developer Tools > Network tab:
- Look for requests to `openrouter.ai/api/v1/models`
- Check if they return 200 status or show errors
- Look for CORS errors (red text in console)

## 🔧 Quick Fixes

### Fix 1: Force Refresh Models
Click the refresh button (🔄) in the model selector area to force a fresh API call.

### Fix 2: Clear Cache
Click the trash button (🗑️) to clear the model cache and force a fresh fetch.

### Fix 3: Check API Key Format
Your OpenRouter API key should start with `sk-or-` and be about 48 characters long.

### Fix 4: Network/CORS Issues
If you see CORS errors, the fallback proxy should automatically activate. Look for:
```
🔄 Trying CORS proxy fallback...
🎉 PROXY SUCCESS! Fetched 400+ models
```

## 🎯 Expected Behavior

**Working Correctly:**
- Model dropdown shows 100+ models with names like "Llama 3.2 3B Instruct 🆓 [Meta]"
- Free models have 🆓 indicators
- Search and provider filtering work
- Console shows successful API calls

**Not Working (Fallback Mode):**
- Only 3-5 models shown
- Console shows "Using minimal fallback models"
- Limited model options

## 📊 Debugging Output

Add this to see what's happening:

```javascript
// In browser console, check current state:
console.log('Current models:', window.openRouterModels?.length);
console.log('API Keys:', Object.keys(window.apiKeys || {}));
console.log('Loading state:', window.loadingModels);
```

## 🚨 Common Issues & Solutions

### Issue 1: Invalid API Key
**Symptoms:** 401/403 errors in console
**Solution:** Verify your OpenRouter API key in settings

### Issue 2: CORS Blocking
**Symptoms:** CORS errors in console, no models loaded
**Solution:** The proxy fallback should handle this automatically

### Issue 3: Rate Limiting
**Symptoms:** 429 errors in console
**Solution:** Wait a moment and try refreshing

### Issue 4: Network Issues
**Symptoms:** Timeout errors, no response
**Solution:** Check your internet connection

## ✅ Verification Checklist

- [ ] API key is configured and starts with `sk-or-`
- [ ] Console shows "Starting OpenRouter model load"
- [ ] No CORS errors in console
- [ ] Network tab shows successful requests to openrouter.ai
- [ ] Model count is 100+ instead of 3-5
- [ ] Free models show 🆓 indicators

If you're still seeing only 3-5 models, please share the console output so I can help debug further!