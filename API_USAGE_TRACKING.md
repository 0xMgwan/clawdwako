# API Usage Tracking System

## Overview
Complete system to track API calls, token usage, costs, and success rates across all AI models (Claude, GPT, Gemini).

## What Was Implemented

### 1. Database Schema (Prisma)
```prisma
model ApiUsage {
  id            String   @id @default(cuid())
  botId         String
  model         String   // claude-opus, gpt-5, gemini
  provider      String   // anthropic, openai, google
  inputTokens   Int      @default(0)
  outputTokens  Int      @default(0)
  totalTokens   Int      @default(0)
  estimatedCost Float    @default(0)
  requestType   String   // message, api_call
  success       Boolean  @default(true)
  errorMessage  String?
  metadata      Json?
  createdAt     DateTime @default(now())
}
```

**Tracks:**
- Token usage (input/output/total)
- Estimated costs
- Success/failure rates
- Error messages
- Model and provider info
- Timestamps for analytics

### 2. API Routes

#### POST /api/usage
Logs API usage data from bots
```typescript
{
  botId: "bot_123",
  model: "claude-opus",
  provider: "anthropic",
  inputTokens: 150,
  outputTokens: 300,
  totalTokens: 450,
  estimatedCost: 0.00675,
  requestType: "message",
  success: true
}
```

#### GET /api/usage
Retrieves usage statistics
```typescript
// Query params:
?botId=bot_123              // Filter by bot
?startDate=2024-01-01       // Date range start
?endDate=2024-01-31         // Date range end

// Returns:
{
  stats: [
    {
      model: "claude-opus",
      provider: "anthropic",
      _sum: {
        inputTokens: 15000,
        outputTokens: 30000,
        totalTokens: 45000,
        estimatedCost: 0.675
      },
      _count: { id: 100 }
    }
  ],
  recentUsage: [...],
  totalCost: 1.25
}
```

### 3. Bot-Runner Integration

**Automatic Tracking:**
- Every API call is tracked
- Token counts captured from API responses
- Costs calculated using pricing table
- Failed requests logged with error messages

**Pricing Table:**
```javascript
const PRICING = {
  'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },  // per 1M tokens
  'gpt-4o': { input: 2.50, output: 10.00 },
  'gemini-pro': { input: 0.50, output: 1.50 },
};
```

**Example Tracking Call:**
```javascript
// After successful API call
await trackUsage(
  'claude-3-5-sonnet-20241022',
  'anthropic',
  response.usage.input_tokens,    // 150
  response.usage.output_tokens,   // 300
  true                            // success
);

// After failed API call
await trackUsage(
  'claude-3-5-sonnet-20241022',
  'anthropic',
  0,
  0,
  false,
  error.message
);
```

### 4. Environment Variables

Added to Railway deployment:
```bash
BOT_ID=cmlp5dubw000k3p7ivy4r2d9f
PLATFORM_URL=https://clawdwako.vercel.app
```

## How It Works

### Flow Diagram
```
User sends message to Telegram bot
    ↓
Bot receives message on Railway
    ↓
Bot calls AI API (Claude/GPT/Gemini)
    ↓
API returns response with token usage
    ↓
Bot tracks usage → POST /api/usage
    ↓
Usage saved to database
    ↓
Bot sends response to user
    ↓
Dashboard can query usage stats
```

### Data Captured Per Request

1. **Token Usage**
   - Input tokens (prompt)
   - Output tokens (response)
   - Total tokens

2. **Cost Calculation**
   ```
   cost = (inputTokens / 1M × inputPrice) + (outputTokens / 1M × outputPrice)
   ```

3. **Success Tracking**
   - Success: true/false
   - Error message if failed

4. **Metadata**
   - Model version
   - Timestamp
   - Request type

## Usage Examples

### Check Total Usage for a Bot
```bash
curl "https://clawdwako.vercel.app/api/usage?botId=bot_123"
```

### Check Usage for Date Range
```bash
curl "https://clawdwako.vercel.app/api/usage?startDate=2024-01-01&endDate=2024-01-31"
```

### Check All Usage (Admin)
```bash
curl "https://clawdwako.vercel.app/api/usage"
```

## Dashboard Integration (Next Step)

You can now add a usage widget to the dashboard:

```typescript
// Fetch usage stats
const response = await fetch('/api/usage?botId=' + botId);
const { stats, totalCost } = await response.json();

// Display:
- Total API calls this month
- Cost breakdown by model
- Token usage trends
- Success rate
- Recent errors
```

## Benefits

✅ **Automatic Tracking** - No manual work needed
✅ **Real-time Data** - Updated with every API call
✅ **Cost Monitoring** - Know exactly how much you're spending
✅ **Error Detection** - See which API calls are failing
✅ **Analytics Ready** - Query by date, bot, model, etc.
✅ **Scalable** - Works for unlimited bots and requests

## Monitoring Your API Keys

### Option 1: Manual Dashboard Checks
- Anthropic: https://console.anthropic.com
- OpenAI: https://platform.openai.com
- Google: https://ai.google.dev

### Option 2: Your Platform (Now Available!)
```bash
# Check total usage
GET /api/usage

# Check specific bot
GET /api/usage?botId=bot_123

# Check date range
GET /api/usage?startDate=2024-01-01&endDate=2024-01-31
```

### Option 3: Set Billing Alerts
Configure on each platform to get notified when approaching limits.

## Next Steps

1. **Add Dashboard Widget** - Display usage stats on dashboard
2. **Set Up Alerts** - Email when costs exceed threshold
3. **Add Charts** - Visualize usage trends over time
4. **Export Reports** - Generate monthly usage reports

## Files Modified

- `prisma/schema.prisma` - Added ApiUsage model
- `src/app/api/usage/route.ts` - Created usage API endpoints
- `bot-runner/index.js` - Added tracking to all API calls
- `bot-runner/package.json` - Added axios dependency
- `src/lib/railway.ts` - Added BOT_ID to environment variables
- `src/app/api/deploy/route.ts` - Update BOT_ID after deployment

## Database Migration

Migration created and applied:
```bash
npx prisma migrate dev --name add_api_usage_tracking
```

All changes are live and tracking is active! 🎉
