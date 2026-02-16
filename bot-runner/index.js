const TelegramBot = require('node-telegram-bot-api');
const Anthropic = require('@anthropic-ai/sdk').default;
const OpenAI = require('openai').default;
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Get environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SELECTED_MODEL = process.env.SELECTED_MODEL;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

if (!TELEGRAM_BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN is required');
  process.exit(1);
}

console.log('Starting Telegram bot...');
console.log('Selected Model:', SELECTED_MODEL);

// Create bot instance with polling
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

console.log('Bot is running and listening for messages...');

// Handle incoming messages
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
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [{ role: 'user', content: userMessage }]
        });

        aiResponse = response.content[0].text;
      } catch (error) {
        console.error('Anthropic API error:', error);
        aiResponse = `I'm having trouble connecting to Claude right now. Error: ${error.message}`;
      }
    } else if (SELECTED_MODEL.includes('gpt')) {
      // Use OpenAI API
      try {
        const openai = new OpenAI({
          apiKey: OPENAI_API_KEY
        });

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: userMessage }],
          max_tokens: 1024
        });

        aiResponse = response.choices[0].message.content;
      } catch (error) {
        console.error('OpenAI API error:', error);
        aiResponse = `I'm having trouble connecting to GPT right now. Error: ${error.message}`;
      }
    } else if (SELECTED_MODEL.includes('gemini')) {
      // Use Google Generative AI API
      try {
        const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const result = await model.generateContent(userMessage);
        const response = await result.response;
        aiResponse = response.text();
      } catch (error) {
        console.error('Google AI API error:', error);
        aiResponse = `I'm having trouble connecting to Gemini right now. Error: ${error.message}`;
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
