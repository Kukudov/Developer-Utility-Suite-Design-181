// AI Service for handling different API providers
class AIService {
  constructor() {
    this.baseURLs = {
      openrouter: 'https://openrouter.ai/api/v1',
      openai: 'https://api.openai.com/v1',
      anthropic: 'https://api.anthropic.com/v1',
      gemini: 'https://generativelanguage.googleapis.com/v1beta'
    };
  }

  async sendMessage(provider, apiKey, message, agentConfig) {
    try {
      switch (provider) {
        case 'openrouter':
          return await this.sendOpenRouterMessage(apiKey, message, agentConfig);
        case 'openai':
          return await this.sendOpenAIMessage(apiKey, message, agentConfig);
        case 'anthropic':
        case 'claude':
          return await this.sendAnthropicMessage(apiKey, message, agentConfig);
        case 'gemini':
          return await this.sendGeminiMessage(apiKey, message, agentConfig);
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error with ${provider}:`, error);
      throw error;
    }
  }

  async sendOpenRouterMessage(apiKey, message, agentConfig) {
    const response = await fetch(`${this.baseURLs.openrouter}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'DevBox Tools AI Chat'
      },
      body: JSON.stringify({
        model: agentConfig.model || 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: agentConfig.prompt },
          { role: 'user', content: message }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async sendOpenAIMessage(apiKey, message, agentConfig) {
    const response = await fetch(`${this.baseURLs.openai}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: agentConfig.model || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: agentConfig.prompt },
          { role: 'user', content: message }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async sendAnthropicMessage(apiKey, message, agentConfig) {
    const response = await fetch(`${this.baseURLs.anthropic}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: agentConfig.model || 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        system: agentConfig.prompt,
        messages: [
          { role: 'user', content: message }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  async sendGeminiMessage(apiKey, message, agentConfig) {
    const response = await fetch(`${this.baseURLs.gemini}/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${agentConfig.prompt}\n\nUser: ${message}` }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  // Simulate AI response for demo purposes
  async simulateAIResponse(message, agentConfig, provider) {
    // Add realistic delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const responses = {
      'general': `As your general AI assistant using **${provider}**, I'd be happy to help with: "${message}". 

This is a simulated response for demonstration. In production, this would connect to the ${provider} API using your configured key.

**Key Features:**
• Real-time AI assistance
• Multiple provider support
• Conversation history
• Specialized agent types`,

      'web-scraper': `🕷️ **Web Scraping Analysis** (via ${provider})

For "${message}", I recommend:

**Tools & Libraries:**
• Python: BeautifulSoup, Scrapy, Selenium
• JavaScript: Puppeteer, Playwright, Cheerio
• Browser: Chrome DevTools, Headers inspection

**Best Practices:**
• Check robots.txt and terms of service
• Implement rate limiting and delays
• Use rotating proxies if needed
• Handle dynamic content with headless browsers

**Code Example:**
\`\`\`python
import requests
from bs4 import BeautifulSoup

headers = {
    'User-Agent': 'Mozilla/5.0 (compatible; DevBox Tools)'
}
response = requests.get(url, headers=headers)
soup = BeautifulSoup(response.content, 'html.parser')
\`\`\`

Would you like specific code examples for your use case?`,

      'research-generator': `📊 **Research Plan** (powered by ${provider})

For research on "${message}":

**Phase 1: Source Identification**
• Academic databases (JSTOR, Google Scholar)
• Government publications (.gov, .edu domains)
• Industry reports and white papers
• Primary source interviews

**Phase 2: Methodology**
• Define research questions
• Set scope and limitations
• Choose data collection methods
• Establish timeline

**Phase 3: Analysis Framework**
• Qualitative vs quantitative approach
• Bias identification and mitigation
• Credibility assessment criteria
• Peer review process

**Deliverables:**
• Executive summary
• Detailed findings
• Recommendations
• Supporting data visualizations

Let me help you develop a detailed research outline!`,

      'youtube-transcriber': `🎥 **YouTube Content Analysis** (via ${provider})

For "${message}" content analysis:

**Transcription Methods:**
• YouTube API for metadata extraction
• Whisper AI for audio transcription
• Google Speech-to-Text API
• Rev.ai for professional transcription

**Content Analysis Tools:**
• Sentiment analysis of comments
• Topic modeling and keyword extraction
• Engagement metrics correlation
• Automated subtitle generation

**Implementation Guide:**
\`\`\`python
import yt_dlp
import whisper

# Extract audio and transcribe
ydl_opts = {'format': 'bestaudio/best'}
with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    ydl.download([video_url])

model = whisper.load_model("base")
result = model.transcribe("audio.mp3")
print(result["text"])
\`\`\`

**Advanced Features:**
• Speaker diarization
• Timestamp synchronization
• Multi-language support
• Custom vocabulary training

Need help with implementation or specific use cases?`,

      'search-pro': `🔍 **Advanced Search Strategy** (${provider} powered)

For optimizing "${message}" searches:

**Boolean Operators:**
• AND, OR, NOT for precise results
• Parentheses for complex queries
• Quotation marks for exact phrases
• Wildcards (*) for partial matches

**Advanced Techniques:**
• \`site:domain.com\` - specific websites
• \`filetype:pdf\` - document types
• \`intitle:"keyword"\` - title searches
• \`daterange:\` for time-specific results
• \`related:url\` - similar sites

**Search Engine Optimization:**
• Google: Best for general queries
• DuckDuckGo: Privacy-focused
• Bing: Good for academic content
• Specialized databases for niche topics

**Pro Tips:**
• Use synonyms and related terms
• Try different keyword combinations
• Check multiple pages of results
• Use advanced search filters

**Search Query Example:**
\`\`\`
("web scraping" OR "data extraction") 
site:stackoverflow.com OR site:github.com
filetype:py OR filetype:js
-advertisement -spam
\`\`\`

Want me to create a customized search strategy for your specific needs?`
    };

    return responses[agentConfig.id] || responses['general'];
  }
}

export const aiService = new AIService();