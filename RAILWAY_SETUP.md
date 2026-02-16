# Railway Deployment Setup Guide

## Issue Found
Your Railway API token appears to be incomplete or in the wrong format. The current token is only 36 characters (UUID format), but Railway API tokens are typically much longer.

## How to Get a Valid Railway API Token

1. **Go to Railway Dashboard**
   - Visit: https://railway.app/dashboard

2. **Create an API Token**
   - Click on your profile icon (top right)
   - Select "Account Settings"
   - Go to "API Tokens" section
   - Click "Create Token"
   - Give it a name like "Clawdwako Bot Deployment"
   - Copy the full token (it will be a long string, not just a UUID)

3. **Add to .env**
   ```
   RAILWAY_API_TOKEN=<paste_the_full_token_here>
   ```

4. **Verify the Token**
   ```bash
   node test-railway-token.js
   ```

## Expected Token Format
- Should be a long string (typically 100+ characters)
- Not just a UUID (36 characters)
- Starts with a specific prefix depending on Railway's current format

## Alternative: Use Railway CLI

If the GraphQL API approach continues to fail, we can use Railway's CLI instead:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy bot
railway up
```

## Current Status
- ❌ Railway API token validation failed with "Not Authorized"
- ✅ Bot creation works via webhook
- ⏳ Waiting for valid Railway API token to enable 24/7 deployment

## Next Steps
1. Get a new/valid Railway API token
2. Update .env with the correct token
3. Run `node test-railway-token.js` to verify
4. Run `node test-railway-deploy.js` to test bot deployment
