# ClawdWako Backend Architecture

## Overview
The backend handles the complete flow from user authentication to AI agent deployment on cloud infrastructure.

## Flow Diagram
```
User → Google OAuth → Create Account → Link Telegram Bot → Deploy → Provision Server → Install OpenClaw → Configure & Start
```

## Required Components

### 1. **Database (PostgreSQL + Prisma)**
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  googleId      String    @unique
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  bots          Bot[]
  subscription  Subscription?
}

model Bot {
  id                String    @id @default(cuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id])
  name              String
  telegramBotToken  String    @unique
  telegramBotUsername String
  selectedModel     String    // claude-opus, gpt-5, gemini
  status            String    @default("pending") // pending, deploying, active, stopped, failed
  serverId          String?
  serverIp          String?
  deployedAt        DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  deployment        Deployment?
}

model Deployment {
  id              String    @id @default(cuid())
  botId           String    @unique
  bot             Bot       @relation(fields: [botId], references: [id])
  cloudProvider   String    // hetzner, digitalocean
  instanceId      String
  instanceType    String
  region          String
  publicIp        String
  privateIp       String?
  sshKeyId        String
  status          String    @default("provisioning")
  logs            Json?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Subscription {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id])
  plan            String    // starter, pro, enterprise
  status          String    // active, cancelled, expired
  currentPeriodEnd DateTime
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

### 2. **Environment Variables Required**

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/clawdwako"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Cloud Providers
HETZNER_API_TOKEN="your-hetzner-token"
DIGITALOCEAN_API_TOKEN="your-do-token"

# AI Model API Keys (for the deployed bots)
ANTHROPIC_API_KEY="your-claude-key"
OPENAI_API_KEY="your-openai-key"
GOOGLE_AI_API_KEY="your-gemini-key"

# Telegram
TELEGRAM_BOT_VERIFICATION_TOKEN="your-verification-token"

# SSH Keys (for server access)
SSH_PRIVATE_KEY="your-private-key"
SSH_PUBLIC_KEY="your-public-key"

# Redis (for queue management)
REDIS_URL="redis://localhost:6379"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
```

### 3. **API Endpoints Needed**

#### Authentication
- `POST /api/auth/callback/google` - Handle Google OAuth callback
- `GET /api/auth/session` - Get current user session

#### Bot Management
- `POST /api/bots/create` - Create new bot with Telegram token
- `GET /api/bots` - List user's bots
- `GET /api/bots/:id` - Get bot details
- `PUT /api/bots/:id` - Update bot configuration
- `DELETE /api/bots/:id` - Delete bot and destroy server

#### Telegram Integration
- `POST /api/telegram/verify-token` - Verify Telegram bot token with BotFather
- `POST /api/telegram/set-webhook` - Set webhook for bot
- `GET /api/telegram/bot-info` - Get bot information from Telegram

#### Deployment
- `POST /api/deploy` - Trigger deployment process
- `GET /api/deploy/:botId/status` - Get deployment status
- `GET /api/deploy/:botId/logs` - Get deployment logs
- `POST /api/deploy/:botId/stop` - Stop running bot
- `POST /api/deploy/:botId/restart` - Restart bot

#### Cloud Provider Integration
- `POST /api/cloud/provision` - Provision new server
- `GET /api/cloud/servers` - List servers
- `DELETE /api/cloud/servers/:id` - Destroy server
- `GET /api/cloud/available-regions` - Get available regions

### 4. **Background Jobs (Bull Queue + Redis)**

```typescript
// Job Types
enum JobType {
  PROVISION_SERVER = 'provision_server',
  INSTALL_DEPENDENCIES = 'install_dependencies',
  DEPLOY_OPENCLAW = 'deploy_openclaw',
  CONFIGURE_BOT = 'configure_bot',
  START_BOT = 'start_bot',
  DESTROY_SERVER = 'destroy_server'
}

// Job Flow
1. User clicks "Deploy OpenClaw"
2. Create bot record in DB
3. Queue: PROVISION_SERVER job
4. Queue: INSTALL_DEPENDENCIES job (after server ready)
5. Queue: DEPLOY_OPENCLAW job
6. Queue: CONFIGURE_BOT job
7. Queue: START_BOT job
8. Update bot status to "active"
```

### 5. **Deployment Automation Scripts**

#### Server Provisioning (Hetzner/DigitalOcean)
```typescript
// Create server with:
- Ubuntu 22.04 LTS
- 2GB RAM minimum
- SSH key access
- Firewall rules (allow 80, 443, 22)
```

#### Installation Script (runs on server via SSH)
```bash
#!/bin/bash
# install-openclaw.sh

# Update system
apt-get update && apt-get upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install Git
apt-get install -y git

# Clone OpenClaw
git clone https://github.com/anthropics/openclaw.git /opt/openclaw
cd /opt/openclaw

# Install dependencies
npm install

# Create .env file with bot configuration
cat > .env << EOF
TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
OPENAI_API_KEY=${OPENAI_API_KEY}
GOOGLE_AI_API_KEY=${GOOGLE_AI_API_KEY}
SELECTED_MODEL=${SELECTED_MODEL}
EOF

# Start with PM2
pm2 start npm --name "openclaw-bot" -- start
pm2 save
pm2 startup
```

### 6. **Technology Stack**

**Backend:**
- Next.js 14 (App Router) - API routes
- Prisma - ORM
- PostgreSQL - Database
- NextAuth.js - Authentication
- Bull - Job queue
- Redis - Queue storage & caching
- SSH2 - Server management
- Axios - HTTP client

**Cloud Providers:**
- Hetzner Cloud API
- DigitalOcean API

**Monitoring:**
- Sentry - Error tracking
- PM2 - Process monitoring on servers
- Custom health checks

### 7. **Security Considerations**

- Store SSH keys securely (encrypted in DB or use secrets manager)
- Validate Telegram bot tokens before deployment
- Rate limit API endpoints
- Implement CSRF protection
- Use environment-specific API keys
- Encrypt sensitive data at rest
- Implement proper RBAC
- Audit logs for all deployments

### 8. **Deployment Flow Details**

**Step 1: User Signs in with Google**
- NextAuth handles OAuth flow
- Create/update user in database
- Redirect to dashboard

**Step 2: User Provides Telegram Bot Token**
- User creates bot via BotFather
- User pastes bot token in UI
- Backend verifies token with Telegram API
- Store bot token encrypted in database

**Step 3: User Selects Model & Clicks Deploy**
- Create bot record with selected model
- Queue deployment job
- Show real-time progress to user

**Step 4: Backend Provisions Server**
- Call Hetzner/DigitalOcean API
- Create server with SSH key
- Wait for server to be ready (~60 seconds)
- Store server details in database

**Step 5: Backend Installs OpenClaw**
- SSH into server
- Run installation script
- Install Node.js, dependencies
- Clone OpenClaw repository
- Configure environment variables

**Step 6: Backend Starts Bot**
- Start OpenClaw with PM2
- Set up Telegram webhook
- Verify bot is responding
- Update bot status to "active"

**Step 7: User Can Interact**
- Bot is live on Telegram
- User can chat with their AI agent
- Dashboard shows bot status & metrics

### 9. **Cost Estimation**

**Per Bot:**
- Server: $5-10/month (Hetzner CX11 or DO Basic Droplet)
- AI API costs: Variable based on usage
- Database: Shared PostgreSQL instance
- Redis: Shared instance

**Infrastructure:**
- Database: $15/month (managed PostgreSQL)
- Redis: $10/month (managed Redis)
- Total platform overhead: ~$25/month

### 10. **Scaling Considerations**

- Use connection pooling for database
- Implement job queue for async operations
- Cache frequently accessed data in Redis
- Use CDN for static assets
- Implement rate limiting per user
- Monitor server resources
- Auto-scale based on demand

## Next Steps to Implement

1. **Set up Prisma & Database**
   - Install Prisma
   - Create schema
   - Run migrations
   - Set up connection

2. **Implement Authentication**
   - Configure NextAuth with Google
   - Create user management endpoints
   - Add session handling

3. **Build Telegram Integration**
   - Token verification endpoint
   - Bot info retrieval
   - Webhook setup

4. **Implement Cloud Provider SDKs**
   - Hetzner Cloud API integration
   - DigitalOcean API integration
   - Server provisioning logic

5. **Create Deployment System**
   - Job queue setup with Bull
   - SSH connection management
   - Installation script execution
   - Status tracking

6. **Build Dashboard API**
   - Bot listing
   - Deployment status
   - Logs retrieval
   - Bot management (stop/start/delete)

7. **Add Monitoring & Logging**
   - Error tracking with Sentry
   - Deployment logs
   - Bot health checks
   - Usage metrics
