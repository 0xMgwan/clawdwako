# 🚀 ClawdWako - OpenClaw Deployment Platform Architecture

## Vision
Deploy full OpenClaw instances in under 1 minute, like SimpleClaw.com and Ampere.sh. Users get the complete OpenClaw agent with all its intelligence and capabilities, not a simplified custom agent.

---

## Architecture Components

### 1. **OpenClaw Docker Container**
- Pre-built Docker image with full OpenClaw installation
- Includes Gateway + Agent Runtime + All Tools
- Persistent volume for state (sessions, memory, config)
- Environment variables for API keys and channel tokens

### 2. **Deployment Flow**
```
User Selects:
├── AI Model (Claude Opus 4.5 / GPT-5.2 / Gemini 3 Flash)
├── Channel (Telegram / Discord / WhatsApp)
└── API Keys (Anthropic / OpenAI / Google)

Platform Provisions:
├── Spin up OpenClaw container on Railway/Fly.io
├── Configure environment variables
├── Set up persistent volume
├── Connect to selected channel
└── Return connection details to user

User Gets:
├── Full OpenClaw instance (24/7 active)
├── All OpenClaw tools and capabilities
├── Multi-step task execution
├── Memory and context management
└── Access via Telegram/Discord/WhatsApp
```

### 3. **Infrastructure Stack**

**Container Orchestration:**
- Railway.app (primary) - Easy deployment, auto-scaling
- Fly.io (alternative) - Global edge deployment
- Docker containers with OpenClaw pre-installed

**Storage:**
- Persistent volumes for OpenClaw state
- PostgreSQL for user management and billing
- Redis for session caching (optional)

**Networking:**
- HTTPS endpoints for webhooks (Telegram, Discord)
- WebSocket support for real-time communication
- Tailscale for secure remote access (optional)

---

## Deployment Architecture

### **Option A: Railway Deployment (Recommended)**

```yaml
# railway.json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile.openclaw"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100
  }
}
```

**Dockerfile.openclaw:**
```dockerfile
FROM node:20-alpine

# Install OpenClaw
RUN npm install -g openclaw

# Set up workspace
WORKDIR /openclaw
RUN openclaw init

# Expose ports
EXPOSE 3000 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start OpenClaw Gateway
CMD ["openclaw", "start", "--gateway"]
```

**Environment Variables:**
```bash
# AI Provider Keys
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx
GOOGLE_API_KEY=xxx

# Channel Tokens
TELEGRAM_BOT_TOKEN=xxx
DISCORD_BOT_TOKEN=xxx
WHATSAPP_TOKEN=xxx

# OpenClaw Config
OPENCLAW_WORKSPACE=/openclaw/workspace
OPENCLAW_PORT=3000
OPENCLAW_LOG_LEVEL=info
```

### **Option B: Fly.io Deployment**

```toml
# fly.toml
app = "openclaw-{user-id}"

[build]
  dockerfile = "Dockerfile.openclaw"

[env]
  OPENCLAW_PORT = "3000"

[[services]]
  internal_port = 3000
  protocol = "tcp"

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

[mounts]
  source = "openclaw_data"
  destination = "/openclaw/workspace"
```

---

## User Flow

### **Landing Page (One-Click Deploy)**

```
┌─────────────────────────────────────┐
│  Deploy Your OpenClaw Instance      │
│                                     │
│  1. Choose AI Model:                │
│     ○ Claude Opus 4.5               │
│     ○ GPT-5.2                       │
│     ○ Gemini 3 Flash                │
│                                     │
│  2. Select Channel:                 │
│     ○ Telegram                      │
│     ○ Discord                       │
│     ○ WhatsApp                      │
│                                     │
│  3. Enter API Keys:                 │
│     [Anthropic API Key]             │
│     [OpenAI API Key]                │
│     [Google API Key]                │
│                                     │
│  4. Channel Token:                  │
│     [Telegram Bot Token]            │
│                                     │
│  [Deploy OpenClaw - $9.99/month]    │
└─────────────────────────────────────┘
```

### **Deployment Process (Backend)**

```javascript
// Simplified deployment flow
async function deployOpenClaw(config) {
  // 1. Create Railway project
  const project = await railway.createProject({
    name: `openclaw-${userId}`,
    repo: 'clawdwako/openclaw-template'
  });

  // 2. Set environment variables
  await railway.setEnvVars(project.id, {
    ANTHROPIC_API_KEY: config.anthropicKey,
    TELEGRAM_BOT_TOKEN: config.telegramToken,
    OPENCLAW_MODEL: config.selectedModel,
    // ... other vars
  });

  // 3. Deploy container
  const deployment = await railway.deploy(project.id);

  // 4. Wait for health check
  await waitForHealthy(deployment.url);

  // 5. Configure webhook
  await setupTelegramWebhook(
    config.telegramToken,
    `${deployment.url}/telegram/webhook`
  );

  // 6. Return instance details
  return {
    instanceUrl: deployment.url,
    status: 'active',
    channel: config.channel,
    model: config.selectedModel
  };
}
```

---

## Dashboard Features

### **User Dashboard**

```
My OpenClaw Instances
┌────────────────────────────────────┐
│ Instance: openclaw-abc123          │
│ Status: ● Active                   │
│ Model: Claude Opus 4.5             │
│ Channel: Telegram                  │
│ Uptime: 99.9%                      │
│                                    │
│ [View Logs] [Restart] [Settings]   │
└────────────────────────────────────┘

Usage This Month:
- API Calls: 15,234
- Messages: 1,456
- Cost: $12.34

[Add New Instance] [Billing]
```

### **Instance Management**

- View logs in real-time
- Restart/stop/start instance
- Update API keys
- Change AI model
- Add/remove channels
- Monitor usage and costs

---

## Pricing Model

### **Subscription Tiers**

**Starter - $9.99/month**
- 1 OpenClaw instance
- 1 channel (Telegram or Discord)
- 10,000 API calls/month
- Community support

**Pro - $29.99/month**
- 3 OpenClaw instances
- All channels (Telegram, Discord, WhatsApp)
- 50,000 API calls/month
- Priority support
- Custom domains

**Enterprise - Custom**
- Unlimited instances
- Dedicated infrastructure
- SLA guarantees
- White-label option

---

## Technical Implementation

### **Database Schema Updates**

```prisma
model OpenClawInstance {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  
  // Deployment info
  railwayProjectId String
  railwayServiceId String
  deploymentUrl    String
  
  // Configuration
  model           String   // "claude-opus-4.5", "gpt-5.2", etc.
  channel         String   // "telegram", "discord", "whatsapp"
  status          String   // "active", "stopped", "deploying"
  
  // API Keys (encrypted)
  anthropicKey    String?  @db.Text
  openaiKey       String?  @db.Text
  googleKey       String?  @db.Text
  
  // Channel tokens (encrypted)
  telegramToken   String?  @db.Text
  discordToken    String?  @db.Text
  whatsappToken   String?  @db.Text
  
  // Metrics
  apiCalls        Int      @default(0)
  messageCount    Int      @default(0)
  lastActive      DateTime?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Subscription {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  
  tier            String   // "starter", "pro", "enterprise"
  status          String   // "active", "cancelled", "past_due"
  
  // Stripe integration
  stripeCustomerId      String?
  stripeSubscriptionId  String?
  
  currentPeriodStart    DateTime
  currentPeriodEnd      DateTime
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

## Key Differences from Current Platform

### **Before (Custom Agents):**
- ❌ Simplified tool system
- ❌ Limited intelligence
- ❌ Custom implementation
- ❌ Users complain about capabilities

### **After (Full OpenClaw):**
- ✅ Complete OpenClaw installation
- ✅ Full AI agent intelligence
- ✅ All OpenClaw tools and features
- ✅ Multi-step task execution
- ✅ Memory and context management
- ✅ Canvas, browser automation, etc.
- ✅ Identical to running OpenClaw locally

---

## Next Steps

1. **Create OpenClaw Docker template**
2. **Build one-click deployment API**
3. **Update landing page UI**
4. **Add subscription/billing**
5. **Create instance management dashboard**
6. **Test full deployment flow**
7. **Launch beta**

---

## Competitive Advantage

**vs SimpleClaw:**
- More cloud provider options (Railway + Fly.io)
- Better pricing ($9.99 vs their pricing)
- Enhanced dashboard with real-time logs
- Multi-instance support from day 1

**vs Ampere.sh:**
- Easier setup (no CLI required)
- Web-based management
- Better UI/UX
- Transparent pricing

**vs Self-hosting:**
- No technical knowledge required
- No server management
- Automatic updates
- 24/7 uptime guarantee
- One-click deployment
