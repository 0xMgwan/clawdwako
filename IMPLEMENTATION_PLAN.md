# 🚀 ClawdWako → OpenClaw Deployment Platform

## Mission
Transform ClawdWako from a custom agent platform into a **one-click OpenClaw deployment service** like SimpleClaw.com and Ampere.sh.

Users deploy **full OpenClaw instances** with complete intelligence and capabilities, not simplified custom agents.

---

## Phase 1: Core Infrastructure ✅

### 1.1 Docker Template
- [x] Create `Dockerfile.openclaw` with full OpenClaw installation
- [x] Include all dependencies (Node, Chromium, Playwright)
- [x] Set up health checks
- [x] Configure persistent volumes

### 1.2 Railway Configuration
- [x] Create `railway.json` deployment config
- [ ] Test Docker build locally
- [ ] Push to Railway template repo

---

## Phase 2: Backend Implementation 🔄

### 2.1 Database Schema
```prisma
model OpenClawInstance {
  id                String   @id @default(cuid())
  userId            String
  railwayProjectId  String
  railwayServiceId  String
  deploymentUrl     String
  model             String   // "claude-opus-4.5", "gpt-5.2", "gemini-3-flash"
  channel           String   // "telegram", "discord", "whatsapp"
  status            String   // "deploying", "active", "stopped", "failed"
  
  // Encrypted credentials
  anthropicKey      String?  @db.Text
  openaiKey         String?  @db.Text
  googleKey         String?  @db.Text
  telegramToken     String?  @db.Text
  discordToken      String?  @db.Text
  whatsappToken     String?  @db.Text
  
  // Metrics
  apiCalls          Int      @default(0)
  messageCount      Int      @default(0)
  uptime            Float    @default(0)
  lastActive        DateTime?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model Subscription {
  id                      String   @id @default(cuid())
  userId                  String   @unique
  tier                    String   // "starter", "pro", "enterprise"
  status                  String   // "active", "cancelled", "past_due"
  stripeCustomerId        String?
  stripeSubscriptionId    String?
  currentPeriodStart      DateTime
  currentPeriodEnd        DateTime
  maxInstances            Int      @default(1)
  maxApiCalls             Int      @default(10000)
  
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
}
```

### 2.2 Railway Client Extensions
Add methods to `src/lib/railway.ts`:
- `getDeploymentStatus(projectId, serviceId)`
- `stopService(projectId, serviceId)`
- `redeployService(projectId, serviceId)`
- `getLogs(projectId, serviceId, limit)`
- `updateEnvVars(projectId, serviceId, vars)`

### 2.3 OpenClaw Deployment Service
File: `src/lib/openclaw-deploy.ts`
- [x] `deployOpenClawInstance()` - Main deployment function
- [x] `waitForDeployment()` - Health check polling
- [x] `setupTelegramWebhook()` - Configure Telegram
- [x] `setupDiscordWebhook()` - Configure Discord
- [ ] `stopOpenClawInstance()` - Stop instance
- [ ] `restartOpenClawInstance()` - Restart instance
- [ ] `getOpenClawLogs()` - Fetch logs
- [ ] `updateOpenClawConfig()` - Update env vars

### 2.4 API Endpoints
Create new endpoints:
- `POST /api/openclaw/deploy` - Deploy new instance
- `GET /api/openclaw/instances` - List user instances
- `GET /api/openclaw/instances/[id]` - Get instance details
- `POST /api/openclaw/instances/[id]/stop` - Stop instance
- `POST /api/openclaw/instances/[id]/restart` - Restart instance
- `GET /api/openclaw/instances/[id]/logs` - Get logs
- `PATCH /api/openclaw/instances/[id]` - Update config

---

## Phase 3: Frontend Implementation 🎨

### 3.1 Landing Page Redesign
Transform `src/app/page.tsx` to match SimpleClaw flow:

```
┌────────────────────────────────────────┐
│  Deploy Your OpenClaw Instance         │
│  Under 1 Minute                        │
│                                        │
│  Step 1: Choose AI Model               │
│  ○ Claude Opus 4.5                     │
│  ○ GPT-5.2                             │
│  ○ Gemini 3 Flash                      │
│                                        │
│  Step 2: Select Channel                │
│  ○ Telegram                            │
│  ○ Discord                             │
│  ○ WhatsApp                            │
│                                        │
│  Step 3: Enter Credentials             │
│  [Anthropic API Key]                   │
│  [Telegram Bot Token]                  │
│                                        │
│  [Deploy Now - $9.99/month] →          │
│                                        │
│  ✓ Full OpenClaw Intelligence          │
│  ✓ All Tools & Capabilities            │
│  ✓ 24/7 Uptime                         │
│  ✓ Automatic Updates                   │
└────────────────────────────────────────┘
```

### 3.2 Instance Dashboard
Create `src/app/instances/page.tsx`:

```
My OpenClaw Instances

┌─────────────────────────────────────┐
│ openclaw-abc123                     │
│ ● Active                            │
│ Model: Claude Opus 4.5              │
│ Channel: Telegram                   │
│ Uptime: 99.9% | 15,234 API calls    │
│                                     │
│ [View Logs] [Restart] [Settings]    │
└─────────────────────────────────────┘

[+ Deploy New Instance]
```

### 3.3 Instance Details Page
Create `src/app/instances/[id]/page.tsx`:
- Real-time logs viewer
- Metrics dashboard (API calls, uptime, messages)
- Configuration editor
- Stop/Start/Restart controls

---

## Phase 4: Billing Integration 💳

### 4.1 Stripe Setup
- Create Stripe products:
  - Starter: $9.99/month (1 instance, 10K calls)
  - Pro: $29.99/month (3 instances, 50K calls)
  - Enterprise: Custom pricing
  
### 4.2 Subscription Flow
- `POST /api/billing/create-checkout` - Start subscription
- `POST /api/billing/webhook` - Handle Stripe webhooks
- `GET /api/billing/portal` - Customer portal link

### 4.3 Usage Tracking
- Track API calls per instance
- Enforce limits based on tier
- Send usage alerts at 80%, 100%

---

## Phase 5: Testing & Launch 🚀

### 5.1 Local Testing
- [ ] Build Docker image locally
- [ ] Test OpenClaw initialization
- [ ] Verify all tools work
- [ ] Test Telegram connection

### 5.2 Railway Testing
- [ ] Deploy test instance
- [ ] Verify webhook setup
- [ ] Test multi-step tasks
- [ ] Monitor logs and health

### 5.3 Beta Launch
- [ ] Deploy to production
- [ ] Invite 10 beta users
- [ ] Collect feedback
- [ ] Fix critical issues

### 5.4 Public Launch
- [ ] Update marketing site
- [ ] Create documentation
- [ ] Set up support system
- [ ] Launch on Product Hunt

---

## Key Differences: Before vs After

### Before (Custom Agents)
- ❌ Simplified tool system (16 basic tools)
- ❌ Limited intelligence
- ❌ Custom implementation
- ❌ Users complain about capabilities
- ❌ Can't execute complex tasks
- ❌ No browser automation
- ❌ No canvas support

### After (Full OpenClaw)
- ✅ Complete OpenClaw installation
- ✅ Full AI agent intelligence
- ✅ 100+ built-in tools
- ✅ Multi-step task execution
- ✅ Browser automation (Playwright)
- ✅ Canvas for visual outputs
- ✅ Memory and context management
- ✅ Scheduled actions (cron)
- ✅ Webhook support
- ✅ Multi-agent routing
- ✅ Voice mode support
- ✅ Identical to self-hosted OpenClaw

---

## Success Metrics

### Technical
- Deployment time: < 60 seconds
- Instance uptime: > 99.5%
- Health check response: < 500ms
- Webhook latency: < 1s

### Business
- Beta users: 50 in first month
- Conversion rate: > 20%
- Churn rate: < 5%
- MRR: $5,000 in 3 months

---

## Next Immediate Steps

1. **Extend Railway client** with missing methods
2. **Update Prisma schema** with OpenClawInstance model
3. **Create deployment API** endpoint
4. **Redesign landing page** for one-click deploy
5. **Build instance dashboard**
6. **Test full flow** end-to-end
7. **Add Stripe billing**
8. **Launch beta**

---

## Competitive Positioning

**vs SimpleClaw:**
- ✅ Better pricing ($9.99 vs higher)
- ✅ More cloud options (Railway + Fly.io)
- ✅ Real-time log viewer
- ✅ Multi-instance from day 1
- ✅ Better UI/UX

**vs Ampere.sh:**
- ✅ No CLI required
- ✅ Web-based management
- ✅ Transparent pricing
- ✅ Faster deployment

**vs Self-hosting:**
- ✅ Zero technical knowledge needed
- ✅ No server management
- ✅ Automatic updates
- ✅ 24/7 uptime guarantee
- ✅ < 1 minute deployment
