#!/usr/bin/env node

/**
 * Test script to verify Railway API token is configured
 */

require('dotenv').config();

const token = process.env.RAILWAY_API_TOKEN;

console.log('🔍 Checking Railway API Token Configuration');
console.log('==========================================');
console.log('');

if (!token) {
  console.log('❌ RAILWAY_API_TOKEN is NOT set in .env');
  console.log('');
  console.log('To fix this:');
  console.log('1. Go to https://railway.app/account/tokens');
  console.log('2. Create a new API token');
  console.log('3. Add it to your .env file:');
  console.log('   RAILWAY_API_TOKEN=your_token_here');
  process.exit(1);
} else {
  console.log('✅ RAILWAY_API_TOKEN is configured');
  console.log('');
  console.log('Token (first 20 chars):', token.substring(0, 20) + '...');
  console.log('Token length:', token.length);
  console.log('');
  
  // Test the token with a simple GraphQL query
  const axios = require('axios');
  
  const query = `
    query {
      me {
        id
        email
      }
    }
  `;
  
  console.log('🧪 Testing Railway API connection...');
  console.log('');
  
  axios.post('https://backboard.railway.app/graphql/v2', 
    { query },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    }
  ).then(response => {
    if (response.data.errors) {
      console.log('❌ API returned errors:');
      console.log(JSON.stringify(response.data.errors, null, 2));
    } else if (response.data.data) {
      console.log('✅ API connection successful!');
      console.log('');
      console.log('User Info:');
      console.log('  - ID:', response.data.data.me.id);
      console.log('  - Email:', response.data.data.me.email);
    }
  }).catch(error => {
    console.log('❌ API connection failed:');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  });
}
