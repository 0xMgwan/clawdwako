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
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV || 'development');

const TelegramBot = require('node-telegram-bot-api');
const Anthropic = require('@anthropic-ai/sdk').default;
const OpenAI = require('openai').default;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const http = require('http');
const { getAllClaudeTools, getAllGPTTools, getAllGeminiTools, executeAnyTool } = require('./tools');

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
async function handleClaudeWithTools(userMessage) {
  try {
    const anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY
    });

    const messages = [{ role: 'user', content: userMessage }];
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    // Agentic loop - allow up to 5 tool calls
    for (let i = 0; i < 5; i++) {
      const response = await anthropic.messages.create({
        model: SELECTED_MODEL,
        max_tokens: 2048,
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
async function handleGPTWithTools(userMessage) {
  try {
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY
    });

    const messages = [{ role: 'user', content: userMessage }];
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
async function handleGeminiWithTools(userMessage) {
  try {
    const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: SELECTED_MODEL,
      tools: getAllGeminiTools()
    });

    const chat = model.startChat({
      history: [],
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
  
  bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  console.log(`Received message from ${chatId}: ${userMessage}`);

  try {
    let aiResponse = '';

    // Check if API keys are configured
    const hasApiKeys = ANTHROPIC_API_KEY || OPENAI_API_KEY || GOOGLE_AI_API_KEY;

    if (!hasApiKeys) {
      aiResponse = `🤖 Test Mode Response\n\nYou said: "${userMessage}"\n\nThis is a test response. The bot is working! Add API keys to enable AI responses.`;
    } else if (SELECTED_MODEL.includes('claude')) {
      // Use Anthropic API with tool calling
      aiResponse = await handleClaudeWithTools(userMessage);
    } else if (SELECTED_MODEL.includes('gpt') || SELECTED_MODEL.includes('o1') || SELECTED_MODEL.includes('o3')) {
      // Use OpenAI API with function calling
      aiResponse = await handleGPTWithTools(userMessage);
    } else if (SELECTED_MODEL.includes('gemini')) {
      // Use Google Generative AI API with function calling
      aiResponse = await handleGeminiWithTools(userMessage);
    } else {
      aiResponse = `Model ${SELECTED_MODEL} is not configured properly.`;
    }

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
