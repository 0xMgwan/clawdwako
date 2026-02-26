const axios = require('axios');

// Memory management for persistent agent intelligence
class AgentMemory {
  constructor(botId, chatId, platformUrl) {
    this.botId = botId;
    this.chatId = chatId;
    this.platformUrl = platformUrl;
    this.conversationHistory = [];
    this.memories = new Map();
    this.maxHistoryMessages = 20; // Keep last 20 messages in context
  }

  // Save a conversation message
  async saveMessage(role, content, toolCalls = null, toolResults = null, model = '', tokenCount = 0) {
    try {
      const message = {
        botId: this.botId,
        chatId: this.chatId,
        role,
        content,
        toolCalls,
        toolResults,
        model,
        tokenCount
      };

      await axios.post(`${this.platformUrl}/api/memory/messages`, message);
      
      // Add to local history
      this.conversationHistory.push({ role, content });
      
      // Keep only recent messages in memory
      if (this.conversationHistory.length > this.maxHistoryMessages) {
        this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryMessages);
      }

      console.log(`💾 Saved ${role} message to memory`);
    } catch (error) {
      console.error('Failed to save message:', error.message);
    }
  }

  // Load conversation history
  async loadHistory(limit = 20) {
    try {
      const response = await axios.get(`${this.platformUrl}/api/memory/messages`, {
        params: {
          botId: this.botId,
          chatId: this.chatId,
          limit
        }
      });

      if (response.data && response.data.messages) {
        this.conversationHistory = response.data.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        console.log(`📖 Loaded ${this.conversationHistory.length} messages from history`);
      }
    } catch (error) {
      console.error('Failed to load history:', error.message);
    }
  }

  // Save a long-term memory
  async saveMemory(memoryType, key, value, importance = 5, metadata = null) {
    try {
      const memory = {
        botId: this.botId,
        chatId: this.chatId,
        memoryType,
        key,
        value,
        importance,
        metadata
      };

      await axios.post(`${this.platformUrl}/api/memory/save`, memory);
      
      // Cache locally
      this.memories.set(key, { value, importance, memoryType });
      
      console.log(`🧠 Saved memory: ${key} = ${value}`);
    } catch (error) {
      console.error('Failed to save memory:', error.message);
    }
  }

  // Retrieve memories
  async loadMemories() {
    try {
      const response = await axios.get(`${this.platformUrl}/api/memory/retrieve`, {
        params: {
          botId: this.botId,
          chatId: this.chatId
        }
      });

      if (response.data && response.data.memories) {
        response.data.memories.forEach(mem => {
          this.memories.set(mem.key, {
            value: mem.value,
            importance: mem.importance,
            memoryType: mem.memoryType
          });
        });
        console.log(`🧠 Loaded ${this.memories.size} memories`);
      }
    } catch (error) {
      console.error('Failed to load memories:', error.message);
    }
  }

  // Get memory by key
  getMemory(key) {
    return this.memories.get(key);
  }

  // Get all memories as context
  getMemoriesContext() {
    if (this.memories.size === 0) return '';

    const memoryLines = [];
    
    // Sort by importance
    const sortedMemories = Array.from(this.memories.entries())
      .sort((a, b) => b[1].importance - a[1].importance);

    for (const [key, data] of sortedMemories) {
      memoryLines.push(`- ${key}: ${data.value}`);
    }

    return `\n\n**Agent Memory:**\n${memoryLines.join('\n')}`;
  }

  // Get conversation history for context
  getHistoryContext() {
    if (this.conversationHistory.length === 0) return [];

    return this.conversationHistory;
  }

  // Build system prompt with memories
  buildSystemPrompt() {
    const basePrompt = `You are a personal AI agent with persistent memory and execution capabilities. You remember past conversations and learn about your user over time.

IMPORTANT CAPABILITIES:
- When users share URLs (especially .md files or task instructions), USE the read_task tool to fetch and parse them automatically
- You can read content from URLs directly - don't ask users to paste content
- Execute multi-step tasks by combining your available tools
- Be proactive - if you see a URL with instructions, read it immediately
- Use web_scrape for general webpages, read_task for task instructions`;
    
    const memoriesContext = this.getMemoriesContext();
    
    if (memoriesContext) {
      return `${basePrompt}${memoriesContext}\n\nUse this information to provide personalized, context-aware responses.`;
    }
    
    return basePrompt;
  }

  // Extract and save important facts from conversation
  async extractAndSaveMemories(userMessage, assistantResponse) {
    // Simple pattern matching for common memory types
    const patterns = {
      name: /my name is (\w+)/i,
      preference: /i (like|love|prefer|enjoy) (.+)/i,
      location: /i (live|am) in (.+)/i,
      job: /i (work|am) (as|a) (.+)/i,
      language: /i (speak|code in|use) (.+)/i
    };

    const combined = `${userMessage} ${assistantResponse}`;

    for (const [type, pattern] of Object.entries(patterns)) {
      const match = combined.match(pattern);
      if (match) {
        let key, value;
        
        switch(type) {
          case 'name':
            key = 'user_name';
            value = match[1];
            break;
          case 'preference':
            key = `preference_${Date.now()}`;
            value = match[2];
            break;
          case 'location':
            key = 'user_location';
            value = match[2];
            break;
          case 'job':
            key = 'user_job';
            value = match[3];
            break;
          case 'language':
            key = 'preferred_language';
            value = match[2];
            break;
        }

        if (key && value) {
          await this.saveMemory('fact', key, value, 8);
        }
      }
    }
  }

  // Create conversation summary
  async createSummary() {
    if (this.conversationHistory.length < 10) return;

    try {
      const summary = {
        botId: this.botId,
        chatId: this.chatId,
        messageCount: this.conversationHistory.length,
        startDate: new Date(Date.now() - 3600000), // 1 hour ago
        endDate: new Date()
      };

      await axios.post(`${this.platformUrl}/api/memory/summary`, summary);
      console.log('📝 Created conversation summary');
    } catch (error) {
      console.error('Failed to create summary:', error.message);
    }
  }
}

module.exports = { AgentMemory };
