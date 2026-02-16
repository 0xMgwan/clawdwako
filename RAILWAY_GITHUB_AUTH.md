# Railway GitHub Authorization

## Issue
Railway API returned: "User does not have access to the repo"

This means Railway needs permission to access your GitHub repository.

## Solution

### Step 1: Connect Railway to GitHub
1. Go to https://railway.app/dashboard
2. Click on your profile (top right)
3. Go to "Integrations"
4. Find "GitHub" and click "Connect"
5. Authorize Railway to access your GitHub account
6. Select which repositories to grant access to (or allow all)

### Step 2: Verify Connection
After authorizing, Railway will have access to your repositories.

### Step 3: Test Deployment
Run the test again:
```bash
npx tsx test-railway-direct.js
```

## Alternative: Use Railway CLI

If GitHub authorization doesn't work, you can use Railway's CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Navigate to bot-runner directory
cd bot-runner

# Deploy
railway up
```

## Current Status
- ✅ Project created on Railway
- ✅ Service created
- ✅ Environment variables set
- ❌ GitHub connection needs authorization
- ⏳ Waiting for GitHub app connection

## Next Steps
1. Authorize Railway to access GitHub
2. Run test again
3. Verify deployment succeeds
