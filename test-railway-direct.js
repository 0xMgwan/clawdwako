#!/usr/bin/env node

/**
 * Direct test of Railway API to see exact errors
 */

require('dotenv').config();
const { RailwayClient } = require('./src/lib/railway.ts');

async function testRailwayDeployment() {
  console.log('🧪 Testing Railway API Directly');
  console.log('================================');
  console.log('');

  try {
    const client = new RailwayClient(process.env.RAILWAY_API_TOKEN);
    
    console.log('Step 1: Creating project...');
    const project = await client.createProject('test-direct-bot-' + Date.now());
    console.log('✅ Project created:', project.id);
    console.log('');

    console.log('\nStep 2: Creating service...');
    const service = await client.createService(project.id, 'telegram-bot');
    console.log('✅ Service created:', service.id);

    console.log('\nStep 2.5: Disabling service networking...');
    await client.disableServiceNetworking(service.id);
    console.log('✅ Networking disabled (worker service)');

    console.log('\nStep 3: Setting environment variables...');
    await client.setEnvironmentVariables(project.id, service.id, {
      TELEGRAM_BOT_TOKEN: 'test-token',
      SELECTED_MODEL: 'claude-opus',
      ANTHROPIC_API_KEY: 'test-key'
    });
    console.log('✅ Environment variables set');
    console.log('');

    console.log('Step 4: Connecting to GitHub...');
    await client.deployFromGitHub(
      project.id,
      service.id,
      '0xMgwan/clawdwako',
      'main'
    );
    console.log('✅ GitHub connected');
    console.log('Railway will auto-detect the Dockerfile in bot-runner directory');
    console.log('');

    console.log('🎉 All steps completed successfully!');
    console.log('');
    console.log('Project URL: https://railway.app/project/' + project.id);
    console.log('');
    console.log('Check Railway dashboard to see if service is deploying.');

  } catch (error) {
    console.error('');
    console.error('❌ Test failed at some step');
    console.error('');
    console.error('Error message:', error.message);
    console.error('');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    console.error('');
    console.error('Full error:', error);
  }
}

testRailwayDeployment();
