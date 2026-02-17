# Environment Variables for Vercel Deployment

This document lists all required environment variables for deploying the Clawdwako platform to Vercel.

## Required Environment Variables

### Database
```
DATABASE_URL=postgresql://user:password@host:port/database
```
Your PostgreSQL database connection string. You can use:
- Vercel Postgres
- Supabase
- Railway
- Neon
- Any PostgreSQL provider

### NextAuth.js Configuration
```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-random-secret-here
```
- `NEXTAUTH_URL`: Your Vercel deployment URL
- `NEXTAUTH_SECRET`: Generate with: `openssl rand -base64 32`

### Google OAuth
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```
Get these from: https://console.cloud.google.com/apis/credentials

### AI Model API Keys
```
ANTHROPIC_API_KEY=your-anthropic-api-key
OPENAI_API_KEY=your-openai-api-key
GOOGLE_AI_API_KEY=your-google-ai-api-key
```
Optional: Only needed if you want to provide default API keys for users

### Railway Deployment (Optional)
```
RAILWAY_API_TOKEN=your-railway-token
```
Only needed if you're deploying bots to Railway

### Platform Configuration
```
NEXT_PUBLIC_URL=https://your-domain.vercel.app
```
Your public-facing URL

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the sidebar
4. Add each variable with its value
5. Select the environment (Production, Preview, Development)
6. Click "Save"

## Important Notes

- Never commit `.env` files to Git
- Use different values for Production and Development
- Rotate secrets regularly
- Keep API keys secure
