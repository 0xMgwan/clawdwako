// Catch any uncaught errors
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  console.error('Stack:', error.stack);
  // Don't exit - keep HTTP server running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
  // Don't exit - keep HTTP server running
});

console.log('=== Bot Runner Starting ===');
console.log('Version: 2.0 - With Task Execution & Memory');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV || 'development');

const TelegramBot = require('node-telegram-bot-api');
const Anthropic = require('@anthropic-ai/sdk').default;
const OpenAI = require('openai').default;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const http = require('http');
const { getAllClaudeTools, getAllGPTTools, getAllGeminiTools, executeAnyTool } = require('./tools');
const { AgentMemory } = require('./memory');

// Get environment variables
const BOT_ID = process.env.BOT_ID;
const PLATFORM_URL = process.env.PLATFORM_URL || 'https://clawdwako.vercel.app';

// These will be fetched from database
let TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
let SELECTED_MODEL = process.env.SELECTED_MODEL;
let ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
let OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

// Advanced tool configuration
const TOOL_CONFIG = {
  githubToken: process.env.GITHUB_TOKEN,
  emailConfig: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    service: process.env.EMAIL_SERVICE || 'gmail'
  }
};

// Pricing per 1M tokens (approximate)
const PRICING = {
  'claude-opus-4-20250514': { input: 15.00, output: 75.00 },
  'gpt-5': { input: 5.00, output: 15.00 },
  'gemini-2.0-flash-exp': { input: 0.00, output: 0.00 }, // Free during preview
};

// Fetch bot configuration from database
async function fetchBotConfig() {
  if (!BOT_ID) {
    console.log('⚠️  No BOT_ID provided, using environment variables only');
    return false;
  }

  try {
    console.log(`🔍 Fetching bot configuration from database for BOT_ID: ${BOT_ID}`);
    const response = await axios.get(`${PLATFORM_URL}/api/bots/${BOT_ID}`);
    
    if (response.data && response.data.bot) {
      const bot = response.data.bot;
      console.log('✅ Bot configuration fetched from database');
      
      // Update variables with database values (fallback to env vars if not in DB)
      TELEGRAM_BOT_TOKEN = bot.telegramBotToken || TELEGRAM_BOT_TOKEN;
      SELECTED_MODEL = bot.selectedModel || SELECTED_MODEL;
      ANTHROPIC_API_KEY = bot.anthropicApiKey || ANTHROPIC_API_KEY;
      OPENAI_API_KEY = bot.openaiApiKey || OPENAI_API_KEY;
      GOOGLE_AI_API_KEY = bot.googleApiKey || GOOGLE_AI_API_KEY;
      
      console.log('📋 Configuration loaded:', {
        hasToken: !!TELEGRAM_BOT_TOKEN,
        model: SELECTED_MODEL,
        hasAnthropicKey: !!ANTHROPIC_API_KEY,
        hasOpenAIKey: !!OPENAI_API_KEY,
        hasGoogleKey: !!GOOGLE_AI_API_KEY
      });
      
      return true;
    } else {
      console.log('⚠️  No bot found in database, using environment variables');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to fetch bot config from database:', error.message);
    console.log('⚠️  Falling back to environment variables');
    return false;
  }
}

// Track API usage
async function trackUsage(model, provider, inputTokens, outputTokens, success, errorMessage = null) {
  try {
    const totalTokens = inputTokens + outputTokens;
    
    // Calculate estimated cost
    const pricing = PRICING[model] || { input: 1.00, output: 3.00 };
    const estimatedCost = (inputTokens / 1000000 * pricing.input) + (outputTokens / 1000000 * pricing.output);

    await axios.post(`${PLATFORM_URL}/api/usage`, {
      botId: BOT_ID,
      model: SELECTED_MODEL,
      provider,
      inputTokens,
      outputTokens,
      totalTokens,
      estimatedCost,
      requestType: 'message',
      success,
      errorMessage,
      metadata: {
        modelVersion: model,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Failed to track usage:', error.message);
    // Don't fail the bot if usage tracking fails
  }
}

// Start HTTP server FIRST (before any bot initialization)
const PORT = process.env.PORT || 8080;
console.log('Starting HTTP server on port', PORT);

const server = http.createServer((req, res) => {
  console.log(`Received ${req.method} request to ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('OK');
});

server.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('Failed to start HTTP server:', err);
    process.exit(1);
  }
  console.log(`✅ HTTP server listening on 0.0.0.0:${PORT}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('HTTP server error:', err);
});

// Now initialize bot (async function to fetch config first)
let bot;

(async () => {
  try {
    // Fetch bot configuration from database
    await fetchBotConfig();
    
    console.log('Starting Telegram bot...');
    console.log('Selected Model:', SELECTED_MODEL);
    console.log('Bot ID:', BOT_ID);
    console.log('Platform URL:', PLATFORM_URL);

    if (!TELEGRAM_BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN is required');
      console.log('HTTP server will continue running for healthchecks');
      return;
    }

    // Create bot instance with polling (only if token exists)
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_BOT_TOKEN !== 'test-bot-token') {
      try {
        bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
        console.log('✅ Telegram bot polling started successfully');
        
        // Set up message handler
        setupMessageHandler();
      } catch (error) {
        console.error('❌ Failed to start Telegram polling:', error.message);
        console.log('HTTP server will continue running for healthchecks');
      }
    } else {
      console.log('⚠️  No valid Telegram token - skipping bot initialization');
      console.log('HTTP server will continue running for healthchecks');
    }
  } catch (error) {
    console.error('❌ Error during bot initialization:', error);
  }
})();

// Keep process alive and log heartbeat
setInterval(() => {
  console.log('Bot is running... Polling for messages');
}, 60000); // Log every minute

console.log('Bot is running and listening for messages...');

// Handler for Claude with tool calling
async function handleClaudeWithTools(userMessage, memory = null) {
  try {
    const anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY
    });

    // Build messages with conversation history and memory context
    const messages = [];
    
    // Add conversation history if available
    if (memory) {
      const history = memory.getHistoryContext();
      messages.push(...history);
    }
    
    // Add current user message
    messages.push({ role: 'user', content: userMessage });
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    // Agentic loop - allow up to 5 tool calls
    for (let i = 0; i < 5; i++) {
      // Build system prompt with memories
      const systemPrompt = memory ? memory.buildSystemPrompt() : 'You are a helpful AI assistant with tool-calling capabilities.';
      
      const response = await anthropic.messages.create({
        model: SELECTED_MODEL,
        max_tokens: 2048,
        system: systemPrompt,
        tools: getAllClaudeTools(),
        messages: messages
      });

      totalInputTokens += response.usage.input_tokens;
      totalOutputTokens += response.usage.output_tokens;

      // Check if Claude wants to use tools
      const toolUseBlock = response.content.find(block => block.type === 'tool_use');
      
      if (!toolUseBlock) {
        // No tool use, return the text response
        const textBlock = response.content.find(block => block.type === 'text');
        await trackUsage(SELECTED_MODEL, 'anthropic', totalInputTokens, totalOutputTokens, true);
        return textBlock ? textBlock.text : 'I processed your request.';
      }

      // Execute the tool
      console.log(`🔧 Claude wants to use tool: ${toolUseBlock.name}`);
      const toolResult = await executeAnyTool(toolUseBlock.name, toolUseBlock.input, TOOL_CONFIG);

      // Add assistant response and tool result to messages
      messages.push({
        role: 'assistant',
        content: response.content
      });
      messages.push({
        role: 'user',
        content: [{
          type: 'tool_result',
          tool_use_id: toolUseBlock.id,
          content: JSON.stringify(toolResult)
        }]
      });
    }

    // If we've exhausted tool calls, return last response
    await trackUsage(SELECTED_MODEL, 'anthropic', totalInputTokens, totalOutputTokens, true);
    return 'I completed the task using multiple tools.';

  } catch (error) {
    console.error('Claude tool calling error:', error);
    await trackUsage(SELECTED_MODEL, 'anthropic', 0, 0, false, error.message);
    return `I'm having trouble processing your request. Error: ${error.message}`;
  }
}

// Handler for GPT with function calling
async function handleGPTWithTools(userMessage, memory = null) {
  try {
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY
    });

    // Build messages with conversation history and memory context
    const messages = [];
    
    // Add system prompt with memories
    if (memory) {
      messages.push({ role: 'system', content: memory.buildSystemPrompt() });
      
      // Add conversation history
      const history = memory.getHistoryContext();
      messages.push(...history);
    } else {
      messages.push({ role: 'system', content: 'You are a helpful AI assistant with function-calling capabilities.' });
    }
    
    // Add current user message
    messages.push({ role: 'user', content: userMessage });
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    // Agentic loop - allow up to 5 function calls
    for (let i = 0; i < 5; i++) {
      const response = await openai.chat.completions.create({
        model: SELECTED_MODEL,
        messages: messages,
        tools: getAllGPTTools(),
        max_tokens: 2048
      });

      const message = response.choices[0].message;
      totalInputTokens += response.usage.prompt_tokens;
      totalOutputTokens += response.usage.completion_tokens;

      // Check if GPT wants to call a function
      if (!message.tool_calls || message.tool_calls.length === 0) {
        // No function call, return the response
        await trackUsage(SELECTED_MODEL, 'openai', totalInputTokens, totalOutputTokens, true);
        return message.content || 'I processed your request.';
      }

      // Add assistant message to conversation
      messages.push(message);

      // Execute all tool calls
      for (const toolCall of message.tool_calls) {
        console.log(`🔧 GPT wants to use function: ${toolCall.function.name}`);
        const args = JSON.parse(toolCall.function.arguments);
        const toolResult = await executeAnyTool(toolCall.function.name, args, TOOL_CONFIG);

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult)
        });
      }
    }

    // If we've exhausted function calls, return last response
    await trackUsage(SELECTED_MODEL, 'openai', totalInputTokens, totalOutputTokens, true);
    return 'I completed the task using multiple functions.';

  } catch (error) {
    console.error('GPT function calling error:', error);
    await trackUsage(SELECTED_MODEL, 'openai', 0, 0, false, error.message);
    return `I'm having trouble processing your request. Error: ${error.message}`;
  }
}

// Handler for Gemini with function calling
async function handleGeminiWithTools(userMessage, memory = null) {
  try {
    const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
    
    // Build system instruction with memories
    const systemInstruction = memory ? memory.buildSystemPrompt() : 'You are a helpful AI assistant with function-calling capabilities.';
    
    const model = genAI.getGenerativeModel({
      model: SELECTED_MODEL,
      tools: getAllGeminiTools(),
      systemInstruction
    });

    // Build chat history from memory
    const history = memory ? memory.getHistoryContext().map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    })) : [];
    
    const chat = model.startChat({
      history,
    });

    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    // Agentic loop - allow up to 5 function calls
    for (let i = 0; i < 5; i++) {
      const result = await chat.sendMessage(userMessage);
      const response = await result.response;

      // Estimate tokens
      totalInputTokens += Math.ceil(userMessage.length / 4);
      const responseText = response.text();
      totalOutputTokens += Math.ceil(responseText.length / 4);

      // Check for function calls
      const functionCalls = response.functionCalls();
      
      if (!functionCalls || functionCalls.length === 0) {
        // No function call, return the response
        await trackUsage(SELECTED_MODEL, 'google', totalInputTokens, totalOutputTokens, true);
        return responseText;
      }

      // Execute all function calls
      const functionResponses = [];
      for (const call of functionCalls) {
        console.log(`🔧 Gemini wants to use function: ${call.name}`);
        const toolResult = await executeAnyTool(call.name, call.args, TOOL_CONFIG);
        functionResponses.push({
          name: call.name,
          response: toolResult
        });
      }

      // Send function results back
      const functionResult = await chat.sendMessage(functionResponses);
      const finalResponse = await functionResult.response;
      const finalText = finalResponse.text();
      
      totalOutputTokens += Math.ceil(finalText.length / 4);
      
      // Check if this response has more function calls
      if (!finalResponse.functionCalls() || finalResponse.functionCalls().length === 0) {
        await trackUsage(SELECTED_MODEL, 'google', totalInputTokens, totalOutputTokens, true);
        return finalText;
      }
    }

    // If we've exhausted function calls, return last response
    await trackUsage(SELECTED_MODEL, 'google', totalInputTokens, totalOutputTokens, true);
    return 'I completed the task using multiple functions.';

  } catch (error) {
    console.error('Gemini function calling error:', error);
    await trackUsage(SELECTED_MODEL, 'google', 0, 0, false, error.message);
    return `I'm having trouble processing your request. Error: ${error.message}`;
  }
}

// Message handler function
function setupMessageHandler() {
  if (!bot) {
    console.log('⚠️  Bot not initialized, cannot set up message handler');
    return;
  }
  
  // Command handlers
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `🤖 **Welcome to Your Personal AI Agent!**

I'm an intelligent agent with persistent memory and execution capabilities.

**Quick Commands:**
/help - See all my capabilities
/skills - View available tools
/memory - Check what I remember about you

Just chat with me naturally - I'll remember our conversations and can execute tasks for you!`;
    
    await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
  });

  bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `🦾 **Agent Capabilities**

**🧠 Intelligence:**
• Persistent memory - I remember our conversations
• Context-aware responses
• Learn your preferences over time
• Multi-step task execution

**🛠️ Tools & Skills:**

**Web & Research:**
• Web search (DuckDuckGo)
• Web scraping & content extraction
• Get current time/date

**Code & Development:**
• Execute code safely (JavaScript)
• Generate code in any language
• Create and manage files

**GitHub Integration:**
• Create repositories
• Create issues
• List your repos

**Email & Communication:**
• Send emails (Gmail)

**Task Management:**
• Schedule recurring tasks (cron)
• List scheduled tasks
• Cancel tasks

**File Operations:**
• Read files
• Write files
• List workspace files

**💬 How to Use:**
Just chat naturally! Examples:
• "Search for AI news"
• "Create a GitHub repo called my-project"
• "Send an email to john@example.com"
• "Generate a Python script for CSV parsing"
• "Schedule a daily reminder at 9am"
• "What's my name?" (I'll remember!)

Type /skills for detailed tool information.`;
    
    await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  });

  bot.onText(/\/skills/, async (msg) => {
    const chatId = msg.chat.id;
    const skillsMessage = `🔧 **Available Tools & Skills**

**1. web_search**
Search the web using DuckDuckGo
Example: "Search for latest AI developments"

**2. web_scrape**
Extract content from any webpage
Example: "Summarize https://example.com"

**3. execute_code**
Run JavaScript code safely
Example: "Calculate 15% tip on $87.50"

**4. get_current_time**
Get current date/time with timezone
Example: "What time is it?"

**5. github_create_repo**
Create a new GitHub repository
Example: "Create a repo called my-app"

**6. github_create_issue**
Create an issue on a repository
Example: "Create an issue on owner/repo about bug XYZ"

**7. github_list_repos**
List your GitHub repositories
Example: "Show me my GitHub repos"

**8. send_email**
Send emails via Gmail
Example: "Email john@example.com about the meeting"

**9. write_file**
Create/write files in workspace
Example: "Write my TODO list to tasks.txt"

**10. read_file**
Read file contents
Example: "Read my notes.txt file"

**11. list_files**
List all workspace files
Example: "Show me all my files"

**12. generate_code**
Generate code and save to file
Example: "Generate a Python CSV parser"

**13. schedule_task**
Schedule recurring tasks (cron)
Example: "Remind me daily at 9am to check emails"

**14. list_scheduled_tasks**
View all scheduled tasks
Example: "What tasks are scheduled?"

**15. cancel_scheduled_task**
Cancel a scheduled task
Example: "Cancel the daily reminder"

**16. read_task**
Read and execute tasks from URLs or text
Example: "Read https://example.com/task.md and follow the instructions"

**🎯 I can combine multiple tools to complete complex tasks!**

Just like OpenClaw, I can:
• Read task instructions from URLs
• Parse multi-step tasks
• Execute each step automatically
• Use multiple tools in sequence

Type /memory to see what I remember about you.`;
    
    await bot.sendMessage(chatId, skillsMessage, { parse_mode: 'Markdown' });
  });

  bot.onText(/\/memory/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
      const memory = new AgentMemory(BOT_ID, chatId.toString(), PLATFORM_URL);
      await memory.loadMemories();
      
      const memories = memory.memories;
      
      if (memories.size === 0) {
        await bot.sendMessage(chatId, "🧠 I don't have any memories about you yet. Chat with me and I'll learn about you!");
        return;
      }
      
      let memoryText = "🧠 **What I Remember About You:**\n\n";
      
      // Sort by importance
      const sortedMemories = Array.from(memories.entries())
        .sort((a, b) => b[1].importance - a[1].importance);
      
      for (const [key, data] of sortedMemories) {
        const emoji = data.importance >= 8 ? '⭐' : data.importance >= 5 ? '📌' : '💡';
        memoryText += `${emoji} **${key}**: ${data.value}\n`;
      }
      
      memoryText += `\n_Total memories: ${memories.size}_`;
      
      await bot.sendMessage(chatId, memoryText, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error loading memories:', error);
      await bot.sendMessage(chatId, "Sorry, I couldn't load my memories right now.");
    }
  });

  bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  // Skip if it's a command
  if (userMessage && userMessage.startsWith('/')) {
    return;
  }

  console.log(`Received message from ${chatId}: ${userMessage}`);

  try {
    // Initialize memory for this conversation
    const memory = new AgentMemory(BOT_ID, chatId.toString(), PLATFORM_URL);
    
    // Load conversation history and memories
    await memory.loadHistory(20);
    await memory.loadMemories();
    
    let aiResponse = '';

    // Check if API keys are configured
    const hasApiKeys = ANTHROPIC_API_KEY || OPENAI_API_KEY || GOOGLE_AI_API_KEY;

    if (!hasApiKeys) {
      aiResponse = `🤖 Test Mode Response\n\nYou said: "${userMessage}"\n\nThis is a test response. The bot is working! Add API keys to enable AI responses.`;
    } else if (SELECTED_MODEL.includes('claude')) {
      // Use Anthropic API with tool calling and memory
      aiResponse = await handleClaudeWithTools(userMessage, memory);
    } else if (SELECTED_MODEL.includes('gpt') || SELECTED_MODEL.includes('o1') || SELECTED_MODEL.includes('o3')) {
      // Use OpenAI API with function calling and memory
      aiResponse = await handleGPTWithTools(userMessage, memory);
    } else if (SELECTED_MODEL.includes('gemini')) {
      // Use Google Generative AI API with function calling and memory
      aiResponse = await handleGeminiWithTools(userMessage, memory);
    } else {
      aiResponse = `Model ${SELECTED_MODEL} is not configured properly.`;
    }

    // Save conversation to memory
    await memory.saveMessage('user', userMessage, null, null, SELECTED_MODEL);
    await memory.saveMessage('assistant', aiResponse, null, null, SELECTED_MODEL);
    
    // Extract and save important facts
    await memory.extractAndSaveMemories(userMessage, aiResponse);

    // Send response back to user
    await bot.sendMessage(chatId, aiResponse);
    console.log(`Sent response to ${chatId}`);

  } catch (error) {
    console.error('Error processing message:', error);
    await bot.sendMessage(chatId, 'Sorry, I encountered an error processing your message.');
  }
});

  // Handle errors
  bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down bot...');
    if (bot) bot.stopPolling();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('Shutting down bot...');
    if (bot) bot.stopPolling();
    process.exit(0);
  });
}
