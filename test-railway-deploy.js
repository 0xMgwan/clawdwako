#!/usr/bin/env node

/**
 * Test script to verify Railway deployment flow
 * Run with: node test-railway-deploy.js
 */

const http = require('http');

// Test bot credentials
const testBot = {
  botToken: 'test-bot-token-' + Date.now(),
  botUsername: 'test_bot_' + Math.random().toString(36).substr(2, 9),
  selectedModel: 'claude-opus',
  userApiKeys: {
    anthropic: process.env.ANTHROPIC_API_KEY || 'test-key',
    openai: process.env.OPENAI_API_KEY || 'test-key',
    google: process.env.GOOGLE_AI_API_KEY || 'test-key',
  }
};

console.log('🚀 Testing Railway Deployment Flow');
console.log('=====================================');
console.log('Test Bot Details:');
console.log(`  - Bot Token: ${testBot.botToken}`);
console.log(`  - Bot Username: ${testBot.botUsername}`);
console.log(`  - Selected Model: ${testBot.selectedModel}`);
console.log('');

// Make request to deploy endpoint
const postData = JSON.stringify(testBot);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/deploy',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('📤 Sending deployment request to http://localhost:3000/api/deploy');
console.log('');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📥 Response Status:', res.statusCode);
    console.log('');
    
    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 200 && response.success) {
        console.log('✅ DEPLOYMENT SUCCESSFUL!');
        console.log('');
        console.log('Bot Details:');
        console.log(`  - Bot ID: ${response.bot.id}`);
        console.log(`  - Username: ${response.bot.username}`);
        console.log(`  - Status: ${response.bot.status}`);
        console.log(`  - Railway Project ID: ${response.bot.railwayProjectId || 'Not deployed'}`);
        console.log(`  - Railway Service ID: ${response.bot.railwayServiceId || 'Not deployed'}`);
        console.log('');
        console.log('Message:', response.message);
        console.log('');
        
        if (response.bot.railwayProjectId) {
          console.log('🎉 Railway deployment successful!');
          console.log(`   View your bot on Railway: https://railway.app/project/${response.bot.railwayProjectId}`);
        } else {
          console.log('⚠️  Bot created but Railway deployment may have failed.');
          console.log('   Check server logs for more details.');
        }
      } else {
        console.log('❌ DEPLOYMENT FAILED!');
        console.log('');
        console.log('Error:', response.error || 'Unknown error');
        console.log('');
        console.log('Full Response:', JSON.stringify(response, null, 2));
      }
    } catch (e) {
      console.log('❌ Failed to parse response');
      console.log('');
      console.log('Raw Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request failed:', e.message);
  console.log('');
  console.log('Make sure:');
  console.log('  1. The development server is running (npm run dev)');
  console.log('  2. You are on http://localhost:3000');
  console.log('  3. Your .env file has RAILWAY_API_TOKEN set');
});

req.write(postData);
req.end();
