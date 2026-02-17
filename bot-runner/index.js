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

// Get environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SELECTED_MODEL = process.env.SELECTED_MODEL;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const BOT_ID = process.env.BOT_ID;
const PLATFORM_URL = process.env.PLATFORM_URL || 'https://clawdwako.vercel.app';

// Pricing per 1M tokens (approximate)
const PRICING = {
  'claude-opus-4-20250514': { input: 15.00, output: 75.00 },
  'gpt-5': { input: 5.00, output: 15.00 },
  'gemini-2.0-flash-exp': { input: 0.00, output: 0.00 }, // Free during preview
};

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

// Now initialize bot
console.log('Starting Telegram bot...');
console.log('Selected Model:', SELECTED_MODEL);
console.log('Bot ID:', BOT_ID);
console.log('Platform URL:', PLATFORM_URL);

if (!TELEGRAM_BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN is required');
  console.log('HTTP server will continue running for healthchecks');
  // Don't exit - keep HTTP server running
}

// Create bot instance with polling (only if token exists)
let bot;
if (TELEGRAM_BOT_TOKEN && TELEGRAM_BOT_TOKEN !== 'test-bot-token') {
  try {
    bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
    console.log('✅ Telegram bot polling started successfully');
  } catch (error) {
    console.error('❌ Failed to start Telegram polling:', error.message);
    console.log('HTTP server will continue running for healthchecks');
  }
} else {
  console.log('⚠️  No valid Telegram token - skipping bot initialization');
  console.log('HTTP server will continue running for healthchecks');
}

// Keep process alive and log heartbeat
setInterval(() => {
  console.log('Bot is running... Polling for messages');
}, 60000); // Log every minute

console.log('Bot is running and listening for messages...');

// Handle incoming messages (only if bot initialized successfully)
if (bot) {
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
      // Use Anthropic API
      try {
        const anthropic = new Anthropic({
          apiKey: ANTHROPIC_API_KEY
        });

        const response = await anthropic.messages.create({
          model: 'claude-opus-4-20250514',
          max_tokens: 1024,
          messages: [{ role: 'user', content: userMessage }]
        });

        aiResponse = response.content[0].text;
        
        // Track usage
        await trackUsage(
          'claude-opus-4-20250514',
          'anthropic',
          response.usage.input_tokens,
          response.usage.output_tokens,
          true
        );
      } catch (error) {
        console.error('Anthropic API error:', error);
        aiResponse = `I'm having trouble connecting to Claude right now. Error: ${error.message}`;
        
        // Track failed usage
        await trackUsage('claude-opus-4-20250514', 'anthropic', 0, 0, false, error.message);
      }
    } else if (SELECTED_MODEL.includes('gpt')) {
      // Use OpenAI API
      try {
        const openai = new OpenAI({
          apiKey: OPENAI_API_KEY
        });

        const response = await openai.chat.completions.create({
          model: 'gpt-5',
          messages: [{ role: 'user', content: userMessage }],
          max_tokens: 1024
        });

        aiResponse = response.choices[0].message.content;
        
        // Track usage
        await trackUsage(
          'gpt-5',
          'openai',
          response.usage.prompt_tokens,
          response.usage.completion_tokens,
          true
        );
      } catch (error) {
        console.error('OpenAI API error:', error);
        aiResponse = `I'm having trouble connecting to GPT right now. Error: ${error.message}`;
        
        // Track failed usage
        await trackUsage('gpt-5', 'openai', 0, 0, false, error.message);
      }
    } else if (SELECTED_MODEL.includes('gemini')) {
      // Use Google Generative AI API
      try {
        const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const result = await model.generateContent(userMessage);
        const response = await result.response;
        aiResponse = response.text();
        
        // Gemini doesn't provide token counts in the same way, estimate based on text length
        const inputTokens = Math.ceil(userMessage.length / 4);
        const outputTokens = Math.ceil(aiResponse.length / 4);
        
        // Track usage
        await trackUsage(
          'gemini-2.0-flash-exp',
          'google',
          inputTokens,
          outputTokens,
          true
        );
      } catch (error) {
        console.error('Google AI API error:', error);
        aiResponse = `I'm having trouble connecting to Gemini right now. Error: ${error.message}`;
        
        // Track failed usage
        await trackUsage('gemini-2.0-flash-exp', 'google', 0, 0, false, error.message);
      }
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
    bot.stopPolling();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('Shutting down bot...');
    bot.stopPolling();
    process.exit(0);
  });
} else {
  console.log('Bot not initialized - only HTTP server is running');
}
