import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { aiService } from '../lib/aiService';
import { fetchOpenRouterModels, clearOpenRouterCache, getOpenRouterStatistics, refreshOpenRouterModels, getOpenRouterFreeModels } from '../lib/openRouterScraper';

const { FiMessageSquare, FiSend, FiBot, FiUser, FiSettings, FiTrash2, FiCopy, FiRefreshCw, FiChevronDown, FiZap, FiSearch, FiYoutube, FiGlobe, FiCheck, FiPlus, FiSave, FiCpu, FiLoader, FiFilter, FiInfo, FiDollarSign, FiGift, FiTool, FiEye, FiClock } = FiIcons;

const AiChatAgent = ({ onNewChatClick }) => {
  const { user, trackActivity, getUserSettings } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('general');
  const [selectedModel, setSelectedModel] = useState('');
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [apiKeys, setApiKeys] = useState({});
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [openRouterModels, setOpenRouterModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelLoadError, setModelLoadError] = useState(null);
  const [showFreeOnly, setShowFreeOnly] = useState(true);
  const [modelStats, setModelStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('all');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (user) {
      trackActivity('ai_chat_viewed');
      loadApiKeys();
      loadChatSessions();
      // Load OpenRouter models after API keys are loaded
      setTimeout(() => loadOpenRouterModels(), 500);
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update selected model when agent changes
  useEffect(() => {
    const agentData = agents.find(a => a.id === selectedAgent);
    if (agentData) {
      const availableModels = getAvailableModels(agentData);
      if (availableModels.length > 0 && !availableModels.some(m => m.id === selectedModel)) {
        setSelectedModel(availableModels[0].id);
      }
    }
  }, [selectedAgent, apiKeys, openRouterModels, showFreeOnly, searchTerm, selectedProvider]);

  const loadApiKeys = async () => {
    try {
      const settings = await getUserSettings();
      if (settings) {
        const newApiKeys = {
          openrouter: settings.openrouter_api_key || '',
          openai: settings.openai_api_key || '',
          claude: settings.claude_api_key || '',
          anthropic: settings.anthropic_api_key || '',
          gemini: settings.gemini_api_key || '',
          huggingface: settings.huggingface_api_key || ''
        };
        setApiKeys(newApiKeys);
        console.log('🔑 API Keys loaded:', Object.keys(newApiKeys).filter(k => newApiKeys[k]));
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
  };

  const loadOpenRouterModels = async (forceRefresh = false) => {
    setLoadingModels(true);
    setModelLoadError(null);
    
    console.log('🚀 Starting OpenRouter model load...', { 
      showFreeOnly, 
      hasOpenRouterKey: !!apiKeys.openrouter,
      forceRefresh 
    });
    
    try {
      const apiKey = apiKeys.openrouter || null;
      
      let models;
      if (showFreeOnly) {
        console.log('🆓 Fetching free models only...');
        models = await getOpenRouterFreeModels(apiKey);
      } else {
        console.log('🌐 Fetching all models...');
        models = await fetchOpenRouterModels({ freeOnly: false, apiKey, forceRefresh });
      }

      console.log(`📊 OpenRouter response: ${models.length} models`);
      
      if (models && models.length > 3) { // Accept if we got more than fallback count
        setOpenRouterModels(models);
        setModelLoadError(null);
        
        // Update statistics
        const stats = getOpenRouterStatistics();
        setModelStats(stats);
        
        const freeCount = models.filter(m => m.pricing?.isFree).length;
        console.log(`✅ Successfully loaded ${models.length} models (${freeCount} free)`);
        
        // Track successful load
        if (user) {
          trackActivity('openrouter_models_loaded', null, {
            count: models.length,
            freeCount: freeCount,
            freeOnly: showFreeOnly,
            hasApiKey: !!apiKey,
            source: models.length > 10 ? 'api' : 'fallback'
          });
        }
      } else {
        throw new Error('No models received from OpenRouter');
      }

    } catch (error) {
      console.error('❌ Failed to load OpenRouter models:', error);
      setModelLoadError(`Failed to load models: ${error.message}`);
      
      // Set minimal fallback for display
      const fallbackModels = [
        {
          id: 'openai/gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          description: 'Fast and efficient • $0.50/1K tokens',
          provider: 'OpenAI',
          pricing: { isFree: false }
        }
      ];
      
      setOpenRouterModels(fallbackModels);
      
    } finally {
      setLoadingModels(false);
    }
  };

  const refreshModels = async () => {
    console.log('🔄 Manual refresh requested');
    await loadOpenRouterModels(true);
  };

  const clearModelsCache = () => {
    const clearedCount = clearOpenRouterCache();
    setModelStats(null);
    console.log(`🗑️ Cleared ${clearedCount} cached entries`);
    loadOpenRouterModels(true);
  };

  const toggleFreeOnly = () => {
    console.log(`🔄 Toggling free only: ${!showFreeOnly}`);
    setShowFreeOnly(!showFreeOnly);
    // Reload models with new filter
    setTimeout(() => loadOpenRouterModels(true), 100);
  };

  // Load chat sessions
  const loadChatSessions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_chat_sessions_devbox_2024')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setChatSessions(data || []);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  };

  const createNewSession = async (agentType = 'general') => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('ai_chat_sessions_devbox_2024')
        .insert({
          user_id: user.id,
          session_name: `${agents.find(a => a.id === agentType)?.name || 'General'} Chat`,
          agent_type: agentType
        })
        .select()
        .single();

      if (error) throw error;
      
      setCurrentSession(data);
      setMessages([]);
      await loadChatSessions();
      
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  };

  // Expose createNewSession to parent component
  useEffect(() => {
    if (onNewChatClick) {
      window.createNewChatSession = () => createNewSession(selectedAgent);
    }
  }, [onNewChatClick, selectedAgent]);

  const loadSessionMessages = async (sessionId) => {
    try {
      const { data, error } = await supabase
        .from('ai_chat_messages_devbox_2024')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = data.map(msg => ({
        id: msg.id,
        type: msg.message_type,
        content: msg.content,
        agent: msg.agent_type,
        provider: msg.provider,
        timestamp: new Date(msg.created_at),
        metadata: msg.metadata
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const saveMessage = async (messageData) => {
    if (!currentSession) return;

    try {
      const { data, error } = await supabase
        .from('ai_chat_messages_devbox_2024')
        .insert({
          session_id: currentSession.id,
          user_id: user.id,
          message_type: messageData.type,
          content: messageData.content,
          agent_type: selectedAgent,
          provider: messageData.provider || '',
          metadata: messageData.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const agents = [
    {
      id: 'general',
      name: 'General Assistant',
      icon: FiBot,
      color: 'from-blue-500 to-cyan-500',
      description: 'General AI assistant for various tasks and questions',
      prompt: 'You are a helpful AI assistant. Provide clear, accurate, and helpful responses to user questions. Format your responses with markdown for better readability.',
      supportedProviders: ['openrouter', 'openai', 'claude', 'anthropic']
    },
    {
      id: 'web-scraper',
      name: 'Web Scraper Expert',
      icon: FiGlobe,
      color: 'from-green-500 to-emerald-500',
      description: 'Specialized in web scraping guidance and data extraction',
      prompt: 'You are a web scraping expert. Help users with web scraping techniques, tools, legal considerations, and best practices. Provide code examples using popular tools like BeautifulSoup, Scrapy, Puppeteer, or Selenium. Always include ethical and legal considerations.',
      supportedProviders: ['openrouter', 'openai', 'claude']
    },
    {
      id: 'research-generator',
      name: 'Research Generator',
      icon: FiSearch,
      color: 'from-purple-500 to-pink-500',
      description: 'Assists with research planning and content generation',
      prompt: 'You are a research specialist. Help users plan research projects, find reliable sources, create research outlines, and generate comprehensive research content. Focus on methodology, credible sources, and structured analysis.',
      supportedProviders: ['openrouter', 'openai', 'claude', 'anthropic']
    },
    {
      id: 'youtube-transcriber',
      name: 'YouTube Transcriber',
      icon: FiYoutube,
      color: 'from-red-500 to-orange-500',
      description: 'Helps with YouTube content analysis and transcription',
      prompt: 'You are a YouTube content specialist. Help users with video transcription techniques, content analysis, subtitle generation, and YouTube API usage. Provide guidance on tools and methods for extracting and analyzing video content.',
      supportedProviders: ['openrouter', 'openai', 'gemini']
    },
    {
      id: 'search-pro',
      name: 'Search Pro',
      icon: FiZap,
      color: 'from-yellow-500 to-orange-500',
      description: 'Advanced search strategies and information retrieval',
      prompt: 'You are a search optimization expert. Help users with advanced search techniques, Boolean operators, search engine optimization, and information retrieval strategies. Provide tips for finding specific information efficiently across different platforms and databases.',
      supportedProviders: ['openrouter', 'openai', 'claude']
    }
  ];

  // Available models for each provider
  const modelsByProvider = {
    openrouter: openRouterModels,
    openai: [
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Latest GPT-4 with improved performance' },
      { id: 'gpt-4', name: 'GPT-4', description: 'Most capable GPT model' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
      { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16K', description: 'Extended context length' }
    ],
    claude: [
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most powerful Claude model' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: 'Balanced performance' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fastest Claude model' }
    ],
    anthropic: [
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most powerful Claude model' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: 'Balanced performance' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fastest Claude model' }
    ],
    gemini: [
      { id: 'gemini-pro', name: 'Gemini Pro', description: 'Google\'s advanced model' },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', description: 'With image understanding' }
    ]
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getAvailableApiKey = (agent) => {
    const supportedProviders = agent.supportedProviders;
    for (const provider of supportedProviders) {
      if (apiKeys[provider]) {
        return { provider, key: apiKeys[provider] };
      }
    }

    // Fallback to any available key
    if (apiKeys.openrouter) return { provider: 'openrouter', key: apiKeys.openrouter };
    if (apiKeys.openai) return { provider: 'openai', key: apiKeys.openai };
    if (apiKeys.claude) return { provider: 'claude', key: apiKeys.claude };
    if (apiKeys.anthropic) return { provider: 'anthropic', key: apiKeys.anthropic };
    if (apiKeys.gemini) return { provider: 'gemini', key: apiKeys.gemini };

    return null;
  };

  const getAvailableModels = (agent) => {
    const availableApiKey = getAvailableApiKey(agent);
    if (!availableApiKey) return [];

    const provider = availableApiKey.provider;
    let models = modelsByProvider[provider] || [];

    // Filter by free only if using OpenRouter and the toggle is on
    if (provider === 'openrouter' && showFreeOnly) {
      models = models.filter(model => model.pricing?.isFree);
    }

    // Filter by search term if using OpenRouter
    if (searchTerm && provider === 'openrouter') {
      models = models.filter(model =>
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by provider if selected
    if (selectedProvider && selectedProvider !== 'all' && provider === 'openrouter') {
      models = models.filter(model =>
        model.provider?.toLowerCase().includes(selectedProvider.toLowerCase())
      );
    }

    return models;
  };

  const getUniqueProviders = () => {
    if (!openRouterModels.length) return [];
    const providers = [...new Set(openRouterModels.map(m => m.provider).filter(Boolean))];
    return providers.sort();
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const selectedAgentData = agents.find(a => a.id === selectedAgent);
    const apiKey = getAvailableApiKey(selectedAgentData);

    // Create session if none exists
    let session = currentSession;
    if (!session) {
      session = await createNewSession(selectedAgent);
      if (!session) return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Save user message
      await saveMessage(userMessage);

      // Track activity
      if (user) {
        await trackActivity('ai_chat_message_sent', selectedAgent, {
          agent: selectedAgent,
          provider: apiKey?.provider || 'simulation',
          model: selectedModel,
          messageLength: inputMessage.length,
          sessionId: session.id
        });
      }

      let aiResponse;
      let provider = 'simulation';

      if (apiKey && apiKey.key) {
        try {
          // Use selected model or fallback to agent's default
          const modelToUse = selectedModel || selectedAgentData.model || 'gpt-3.5-turbo';

          // Try real API call
          aiResponse = await aiService.sendMessage(
            apiKey.provider,
            apiKey.key,
            inputMessage,
            { ...selectedAgentData, model: modelToUse }
          );
          provider = apiKey.provider;

        } catch (apiError) {
          console.error('API call failed, falling back to simulation:', apiError);
          // Fallback to simulation
          aiResponse = await aiService.simulateAIResponse(inputMessage, selectedAgentData, apiKey.provider);
          provider = `${apiKey.provider}-simulation`;
        }
      } else {
        // No API key available, use simulation
        aiResponse = await aiService.simulateAIResponse(inputMessage, selectedAgentData, 'demo');
        // Add API configuration notice to response
        aiResponse = `🔧 **Demo Mode** - Configure API keys in Settings to enable real AI responses.\n\n${aiResponse}`;
      }

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        agent: selectedAgent,
        provider: provider,
        model: selectedModel,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Save AI message
      await saveMessage({ ...aiMessage, provider });

      // Update session timestamp
      await supabase
        .from('ai_chat_sessions_devbox_2024')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', session.id);

    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage = {
        id: Date.now() + 1,
        type: 'system',
        content: 'Sorry, there was an error processing your message. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);

    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    if (currentSession) {
      try {
        // Delete all messages in the session
        await supabase
          .from('ai_chat_messages_devbox_2024')
          .delete()
          .eq('session_id', currentSession.id);

        setMessages([]);

        if (user) {
          trackActivity('ai_chat_cleared', selectedAgent);
        }
      } catch (error) {
        console.error('Error clearing chat:', error);
      }
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await supabase
        .from('ai_chat_sessions_devbox_2024')
        .delete()
        .eq('id', sessionId);

      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }

      await loadChatSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const selectSession = async (session) => {
    setCurrentSession(session);
    setSelectedAgent(session.agent_type);
    await loadSessionMessages(session.id);
  };

  const copyMessage = async (content, messageId) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectedAgentData = agents.find(a => a.id === selectedAgent);
  const availableApiKey = getAvailableApiKey(selectedAgentData);
  const availableModels = getAvailableModels(selectedAgentData);
  const selectedModelData = availableModels.find(m => m.id === selectedModel);
  const uniqueProviders = getUniqueProviders();

  if (!user) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <SafeIcon icon={FiMessageSquare} className="text-slate-600 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-slate-400">Please sign in to use the AI Chat Agent.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2.5 min-h-screen">
      <div className="flex gap-2.5 h-full">
        {/* Session Sidebar */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 h-full p-2.5">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-white font-semibold">Chat Sessions</h3>
            </div>

            {/* Session List */}
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => selectSession(session)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                    currentSession?.id === session.id
                      ? 'bg-green-500/20 border border-green-500/30'
                      : 'hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-medium truncate">
                        {session.session_name}
                      </h4>
                      <p className="text-slate-400 text-xs">
                        {new Date(session.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <SafeIcon icon={FiTrash2} className="text-xs" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-2.5">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700"
          >
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <SafeIcon icon={FiMessageSquare} className="mr-3 text-green-400" />
              AI Chat Agent
            </h1>
            <p className="text-slate-400 text-lg">
              Chat with specialized AI agents using OpenRouter models
              {openRouterModels.length > 0 && (
                <span className="ml-2 text-green-400 text-sm">
                  ({openRouterModels.filter(m => m.pricing?.isFree).length} free models available)
                </span>
              )}
            </p>
          </motion.div>

          {/* Agent & Model Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 relative z-20"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Agent Selection */}
              <div className="lg:col-span-1">
                <label className="block text-white font-medium mb-3">Select AI Agent</label>
                <div className="relative">
                  <button
                    onClick={() => setShowAgentDropdown(!showAgentDropdown)}
                    className="w-full flex items-center justify-between space-x-3 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white hover:border-slate-500 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 bg-gradient-to-br ${selectedAgentData.color} rounded-lg flex items-center justify-center`}>
                        <SafeIcon icon={selectedAgentData.icon} className="text-white text-sm" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm">{selectedAgentData.name}</div>
                      </div>
                    </div>
                    <SafeIcon icon={FiChevronDown} className="text-slate-400" />
                  </button>

                  <AnimatePresence>
                    {showAgentDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-40 max-h-96 overflow-y-auto"
                      >
                        {agents.map((agent) => (
                          <button
                            key={agent.id}
                            onClick={() => {
                              setSelectedAgent(agent.id);
                              setShowAgentDropdown(false);
                              if (user) {
                                trackActivity('ai_agent_selected', agent.id);
                              }
                            }}
                            className="w-full flex items-start space-x-3 p-4 hover:bg-slate-700 transition-colors text-left border-b border-slate-700 last:border-b-0"
                          >
                            <div className={`w-10 h-10 bg-gradient-to-br ${agent.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <SafeIcon icon={agent.icon} className="text-white text-lg" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white font-medium">{agent.name}</h3>
                              <p className="text-slate-400 text-sm mt-1">{agent.description}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {agent.supportedProviders.map(provider => (
                                  <span
                                    key={provider}
                                    className={`px-2 py-1 text-xs rounded ${
                                      apiKeys[provider] 
                                        ? 'bg-green-500/20 text-green-400' 
                                        : 'bg-slate-600/50 text-slate-500'
                                    }`}
                                  >
                                    {provider}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Model Selection */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-white font-medium">Select Model</label>
                  {availableApiKey?.provider === 'openrouter' && (
                    <div className="flex items-center space-x-2">
                      {/* Free Only Toggle */}
                      <button
                        onClick={toggleFreeOnly}
                        className={`p-1.5 rounded-md transition-colors ${
                          showFreeOnly 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-slate-600/50 text-slate-400'
                        }`}
                        title={`${showFreeOnly ? 'Show all' : 'Show free only'} models`}
                      >
                        <SafeIcon icon={showFreeOnly ? FiGift : FiDollarSign} className="text-xs" />
                      </button>

                      {/* Refresh Button */}
                      <button
                        onClick={refreshModels}
                        disabled={loadingModels}
                        className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-md hover:bg-slate-600"
                        title="Refresh OpenRouter models"
                      >
                        <SafeIcon icon={FiRefreshCw} className={`text-xs ${loadingModels ? 'animate-spin' : ''}`} />
                      </button>

                      {/* Clear Cache Button */}
                      <button
                        onClick={clearModelsCache}
                        className="p-1.5 text-slate-400 hover:text-red-400 transition-colors rounded-md hover:bg-slate-600"
                        title="Clear model cache"
                      >
                        <SafeIcon icon={FiTrash2} className="text-xs" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Search and Filter for OpenRouter */}
                {availableApiKey?.provider === 'openrouter' && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="relative">
                      <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs" />
                      <input
                        type="text"
                        placeholder="Search models..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-sm bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:border-green-500 transition-colors"
                      />
                    </div>

                    <select
                      value={selectedProvider}
                      onChange={(e) => setSelectedProvider(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:border-green-500 transition-colors"
                    >
                      <option value="all">All Providers</option>
                      {uniqueProviders.map(provider => (
                        <option key={provider} value={provider}>{provider}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="relative">
                  <button
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    disabled={!availableApiKey || availableModels.length === 0 || loadingModels}
                    className="w-full flex items-center justify-between space-x-3 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white hover:border-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={loadingModels ? FiLoader : FiCpu} className={`text-purple-400 ${loadingModels ? 'animate-spin' : ''}`} />
                      <div className="text-left">
                        <div className="font-medium text-sm">
                          {loadingModels 
                            ? 'Loading models...' 
                            : selectedModelData?.name || `Select Model (${availableModels.length} available)`
                          }
                        </div>
                        {selectedModelData?.pricing?.isFree && (
                          <div className="text-green-400 text-xs">🆓 Free Model</div>
                        )}
                      </div>
                    </div>
                    <SafeIcon icon={FiChevronDown} className="text-slate-400" />
                  </button>

                  <AnimatePresence>
                    {showModelDropdown && !loadingModels && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-40 max-h-96 overflow-y-auto"
                      >
                        {availableModels.length > 0 ? (
                          availableModels.map((model) => (
                            <button
                              key={model.id}
                              onClick={() => {
                                setSelectedModel(model.id);
                                setShowModelDropdown(false);
                              }}
                              className="w-full flex items-start space-x-3 p-4 hover:bg-slate-700 transition-colors text-left border-b border-slate-700 last:border-b-0"
                            >
                              <SafeIcon icon={FiCpu} className="text-purple-400 mt-1 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-white font-medium">{model.name}</h3>
                                  <div className="flex items-center space-x-2">
                                    {model.pricing?.isFree && (
                                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                                        FREE
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p className="text-slate-400 text-sm mt-1">{model.description}</p>
                                {model.provider && (
                                  <p className="text-slate-500 text-xs mt-1">by {model.provider}</p>
                                )}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-slate-400">
                            {modelLoadError || 'No models available'}
                            {availableApiKey?.provider === 'openrouter' && showFreeOnly && (
                              <div className="mt-2">
                                <button
                                  onClick={toggleFreeOnly}
                                  className="text-blue-400 hover:text-blue-300 text-sm underline"
                                >
                                  Show all models
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {modelLoadError && (
                  <p className="text-red-400 text-xs mt-2">
                    {modelLoadError}
                  </p>
                )}

                {/* Model Statistics */}
                {modelStats && availableApiKey?.provider === 'openrouter' && (
                  <div className="mt-2 text-xs text-slate-500">
                    <div className="flex items-center justify-between">
                      <span>
                        {availableModels.length} models shown • {openRouterModels.filter(m => m.pricing?.isFree).length} free
                        {showFreeOnly && ' (filtered)'}
                      </span>
                      {modelStats.lastUpdated && (
                        <div className="flex items-center space-x-2">
                          <SafeIcon icon={FiClock} className="text-xs" />
                          <span>
                            Updated {new Date(modelStats.lastUpdated).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* API Status */}
            <div className="mt-4 bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {availableApiKey ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-green-400 font-medium">Connected</span>
                      <span className="text-slate-400 text-sm">
                        via {availableApiKey.provider}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <span className="text-yellow-400 font-medium">Demo Mode</span>
                    </div>
                  )}

                  {selectedModelData && (
                    <div className="flex items-center space-x-2 text-sm">
                      <SafeIcon icon={FiCpu} className="text-purple-400" />
                      <span className="text-white">{selectedModelData.name}</span>
                      {selectedModelData.pricing?.isFree && (
                        <span className="text-green-400 text-xs">FREE</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-xs text-slate-400">
                  Supported: {selectedAgentData.supportedProviders.join(', ')}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Chat Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden flex-1"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/80">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${selectedAgentData.color} rounded-lg flex items-center justify-center`}>
                  <SafeIcon icon={selectedAgentData.icon} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{selectedAgentData.name}</h3>
                  <p className="text-slate-400 text-sm">
                    {messages.length} messages • {availableApiKey ? `Using ${availableApiKey.provider}` : 'Demo mode'}
                    {selectedModelData && ` • ${selectedModelData.name}`}
                    {selectedModelData?.pricing?.isFree && ' (Free)'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {currentSession && (
                  <button
                    onClick={clearChat}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-700"
                    title="Clear chat"
                  >
                    <SafeIcon icon={FiTrash2} />
                  </button>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ height: 'calc(100vh - 435px)' }}>
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className={`w-20 h-20 bg-gradient-to-br ${selectedAgentData.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <SafeIcon icon={selectedAgentData.icon} className="text-white text-3xl" />
                  </div>
                  <h3 className="text-white font-semibold text-xl mb-3">Start chatting with {selectedAgentData.name}</h3>
                  <p className="text-slate-400 max-w-md mx-auto mb-6">
                    {selectedAgentData.description}. Ask questions or request assistance to get started!
                  </p>
                  {!availableApiKey && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-yellow-400 text-sm">
                        Configure API keys in Settings to enable real AI responses, or try the demo mode!
                      </p>
                    </div>
                  )}
                  {availableApiKey?.provider === 'openrouter' && openRouterModels.length > 0 && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 max-w-md mx-auto mt-4">
                      <p className="text-blue-400 text-sm">
                        🎉 {openRouterModels.filter(m => m.pricing?.isFree).length} free models available via OpenRouter!
                        {!showFreeOnly && ` (${openRouterModels.length} total models)`}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-4 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-br from-green-500 to-blue-500' 
                          : message.type === 'system' 
                            ? 'bg-yellow-500/20 border border-yellow-500/30'
                            : `bg-gradient-to-br ${selectedAgentData.color}`
                      }`}>
                        <SafeIcon icon={
                          message.type === 'user' ? FiUser :
                          message.type === 'system' ? FiSettings :
                          selectedAgentData.icon
                        } className="text-white" />
                      </div>

                      {/* Message Content */}
                      <div className={`rounded-xl p-4 ${
                        message.type === 'user' 
                          ? 'bg-green-500/20 border border-green-500/30' 
                          : message.type === 'system'
                            ? 'bg-yellow-500/10 border border-yellow-500/20'
                            : 'bg-slate-700/50 border border-slate-600'
                      }`}>
                        <div className="prose prose-invert max-w-none">
                          <div className="text-white whitespace-pre-wrap text-sm leading-relaxed">
                            {message.content}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-600/50">
                          <div className="flex items-center space-x-3">
                            <span className="text-slate-400 text-xs">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                            {message.provider && (
                              <span className="text-slate-500 text-xs">
                                via {message.provider}
                              </span>
                            )}
                            {message.model && (
                              <span className="text-slate-500 text-xs">
                                • {availableModels.find(m => m.id === message.model)?.name || message.model}
                              </span>
                            )}
                          </div>
                          {message.type !== 'system' && (
                            <button
                              onClick={() => copyMessage(message.content, message.id)}
                              className="text-slate-400 hover:text-white transition-colors p-1 rounded"
                              title="Copy message"
                            >
                              <SafeIcon icon={copiedMessageId === message.id ? FiCheck : FiCopy} className={`text-xs ${copiedMessageId === message.id ? 'text-green-400' : ''}`} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-4 max-w-[85%]">
                    <div className={`w-10 h-10 bg-gradient-to-br ${selectedAgentData.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <SafeIcon icon={selectedAgentData.icon} className="text-white" />
                    </div>
                    <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-700 bg-slate-800/80">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={availableApiKey ? `Ask ${selectedAgentData.name} anything...` : 'Try the demo mode or configure API keys in Settings...'}
                    rows={1}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500 transition-colors resize-none"
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <SafeIcon icon={isLoading ? FiRefreshCw : FiSend} className={isLoading ? 'animate-spin' : ''} />
                </button>
              </div>

              <div className="flex items-center justify-between mt-2">
                <p className="text-slate-400 text-xs">
                  Press Enter to send, Shift+Enter for new line
                </p>
                {availableApiKey ? (
                  <p className="text-slate-500 text-xs">
                    Using {availableApiKey.provider} API
                    {selectedModelData && ` • ${selectedModelData.name}`}
                    {selectedModelData?.pricing?.isFree && (
                      <span className="text-green-400 ml-1">FREE</span>
                    )}
                  </p>
                ) : (
                  <p className="text-yellow-500 text-xs">
                    Demo mode - Configure API keys for real responses
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* API Configuration Notice */}
          {!availableApiKey && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6"
            >
              <div className="flex items-start space-x-4">
                <SafeIcon icon={FiSettings} className="text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-yellow-400 font-medium mb-2">API Configuration Available</h4>
                  <p className="text-slate-400 mb-4">
                    You're currently using demo mode. To enable real AI responses, configure at least one API key in your settings. 
                    This agent supports: <strong>{selectedAgentData.supportedProviders.join(', ')}</strong>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="text-white font-medium mb-1">OpenRouter</h5>
                      <p className="text-slate-400 text-sm">
                        Access 400+ AI models with one key
                        {openRouterModels.filter(m => m.pricing?.isFree).length > 0 && (
                          <span className="block text-green-400 text-xs mt-1">
                            {openRouterModels.filter(m => m.pricing?.isFree).length} free models available!
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-white font-medium mb-1">OpenAI</h5>
                      <p className="text-slate-400 text-sm">GPT-4 and GPT-3.5 models</p>
                    </div>
                    <div>
                      <h5 className="text-white font-medium mb-1">Claude</h5>
                      <p className="text-slate-400 text-sm">Anthropic's Claude models</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiChatAgent;