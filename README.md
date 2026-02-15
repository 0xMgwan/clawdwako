# ClawdWako Platform

Deploy your AI agent to Telegram in under 60 seconds. No technical experience required.

![ClawdWako](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Railway](https://img.shields.io/badge/Railway-Deploy-purple?style=flat-square&logo=railway)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 🚀 Features

- **One-Click Deployment** - Deploy AI agents to Railway with a single click
- **Telegram Integration** - Connect your Telegram bot from @BotFather instantly
- **Multiple AI Models** - Support for Claude Opus 4.5, GPT-5.2, and Gemini 3 Flash
- **Flexible API Keys** - Use platform credits or bring your own AI API keys
- **Real-time Dashboard** - Monitor bot status, usage stats, and performance
- **Light/Dark Mode** - Beautiful UI with theme switching
- **Database Integration** - Neon PostgreSQL with Prisma ORM
- **Authentication** - Google OAuth with NextAuth.js (optional)

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A [Railway](https://railway.app) account and API token
- A [Neon](https://neon.tech) PostgreSQL database
- AI API keys (Anthropic, OpenAI, or Google AI)
- A Telegram bot token from [@BotFather](https://t.me/BotFather)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/0xMgwan/clawdwako.git
cd clawdwako
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host.neon.tech/clawdwako?sslmode=require"

# NextAuth (Optional - for Google OAuth)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"  # Generate with: openssl rand -base64 32

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Railway API (Required for deployment)
RAILWAY_API_TOKEN="your-railway-token"

# AI API Keys (Platform keys - used when users don't provide their own)
ANTHROPIC_API_KEY="sk-ant-your-key"
OPENAI_API_KEY="sk-your-key"
GOOGLE_AI_API_KEY="your-key"
```

### 4. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📦 Project Structure

```
clawdwako/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/   # NextAuth endpoints
│   │   │   ├── deploy/               # Railway deployment API
│   │   │   └── telegram/             # Telegram bot verification
│   │   ├── dashboard/                # Bot management dashboard
│   │   └── page.tsx                  # Homepage
│   ├── components/
│   │   ├── DeploymentSuccessModal.tsx
│   │   ├── TelegramBotModal.tsx
│   │   └── ui/                       # Shadcn UI components
│   ├── lib/
│   │   ├── prisma.ts                 # Database client
│   │   ├── railway.ts                # Railway API integration
│   │   └── telegram.ts               # Telegram API helpers
│   └── types/                        # TypeScript type definitions
├── prisma/
│   └── schema.prisma                 # Database schema
└── public/                           # Static assets
```

## 🎯 Usage

### For End Users

1. **Select AI Model** - Choose between Claude, GPT, or Gemini
2. **Add API Key (Optional)** - Use your own AI credits or platform credits
3. **Connect Telegram Bot** - Paste your bot token from @BotFather
4. **Deploy** - Click "Deploy OpenClaw" and your bot goes live!
5. **Manage** - View dashboard to monitor status, usage, and logs

### For Developers

#### Deploy a Bot Programmatically

```typescript
const response = await fetch('/api/deploy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    botToken: 'your-telegram-bot-token',
    botUsername: 'YourBotName',
    selectedModel: 'claude-opus',
    userApiKeys: {
      anthropic: 'sk-ant-your-key', // Optional
    }
  })
});

const { bot } = await response.json();
console.log(`Bot deployed: @${bot.username}`);
```

#### Verify Telegram Bot Token

```typescript
const response = await fetch('/api/telegram/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: 'your-bot-token' })
});

const { botInfo } = await response.json();
console.log(`Bot verified: @${botInfo.username}`);
```

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/new)
3. Import your repository
4. Add environment variables
5. Deploy!

**Important:** Update `NEXTAUTH_URL` with your Vercel URL after first deployment.

### Deploy to Railway

The platform itself can be deployed to Railway:

```bash
railway login
railway init
railway up
```

## 🔧 Configuration

### Database Schema

The platform uses Prisma with PostgreSQL. Key models:

- **User** - User accounts (for OAuth)
- **Bot** - Deployed Telegram bots
- **Deployment** - Deployment records and logs

### AI Model Configuration

Supported models are defined in the homepage. To add a new model:

1. Add model option in `src/app/page.tsx`
2. Update Railway deployment logic in `src/lib/railway.ts`
3. Add corresponding API key handling

### Railway Integration

The platform uses Railway's GraphQL API to:
- Create projects
- Deploy services
- Set environment variables
- Manage deployments

## 📊 Dashboard Features

- **Bot Status** - Online/Offline/Error states
- **Usage Stats** - Messages sent, users, uptime
- **Cost Tracking** - Monthly AI API costs
- **Logs Viewer** - Real-time bot logs (coming soon)
- **Model Switching** - Change AI models on the fly (coming soon)
- **API Key Management** - Update API keys without redeployment (coming soon)

## 🔐 Security

- Environment variables are never exposed to the client
- API keys are encrypted in the database
- Railway deployments use secure environment variables
- NextAuth handles OAuth securely
- Database connections use SSL

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built by [Neda Labs](https://nedapay.xyz)
- Powered by [Railway](https://railway.app)
- Database by [Neon](https://neon.tech)
- UI components from [shadcn/ui](https://ui.shadcn.com)

## 📧 Support

For support, email support@nedapay.xyz or open an issue on GitHub.

## 🗺️ Roadmap

- [ ] Google OAuth authentication
- [ ] Real-time deployment logs
- [ ] Usage analytics dashboard
- [ ] Multi-bot management
- [ ] Discord and WhatsApp integration
- [ ] Custom AI model fine-tuning
- [ ] Billing and subscription management

---

**Built with ❤️ by Neda Labs**
