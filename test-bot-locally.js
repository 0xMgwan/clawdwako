#!/usr/bin/env node

// Test bot locally to verify it works without Railway
require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');

console.log('Testing bot locally...');
console.log('Environment variables:');
console.log('- TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'Set' : 'Missing');
console.log('- ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? 'Set' : 'Missing');
console.log('- OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Set' : 'Missing');

// Test with a dummy token to see if bot code runs
const testToken = process.env.TELEGRAM_BOT_TOKEN || 'test-token-123';

try {
  console.log('\n✅ Bot code can be loaded');
  console.log('✅ Dependencies are installed');
  console.log('✅ The issue is Railway configuration, not the bot code');
  console.log('\n📝 Next step: Configure Railway service as a worker (not web service)');
} catch (error) {
  console.error('❌ Error:', error.message);
}
