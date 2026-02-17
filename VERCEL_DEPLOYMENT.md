# Deploy Clawdwako Platform to Vercel

Complete guide to deploy your Clawdwako platform (including admin dashboard) to Vercel.

## Prerequisites

1. **Vercel Account** - Sign up at https://vercel.com
2. **GitHub Repository** - Your code should be pushed to GitHub
3. **PostgreSQL Database** - Set up a database (recommended: Vercel Postgres, Supabase, or Neon)
4. **Google OAuth Credentials** - From Google Cloud Console

---

## Step 1: Set Up PostgreSQL Database

### Option A: Vercel Postgres (Recommended)

1. Go to your Vercel dashboard
2. Click "Storage" → "Create Database"
3. Select "Postgres"
4. Choose a name and region
5. Click "Create"
6. Copy the `DATABASE_URL` connection string

### Option B: Supabase (Free Tier Available)

1. Go to https://supabase.com
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (use "Connection Pooling" mode)
5. Format: `postgresql://postgres:[password]@[host]:6543/postgres`

### Option C: Neon (Serverless Postgres)

1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string

---

## Step 2: Configure Google OAuth

1. Go to https://console.cloud.google.com/apis/credentials
2. Create a new OAuth 2.0 Client ID (or use existing)
3. Add authorized redirect URIs:
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```
4. Copy the Client ID and Client Secret

---

## Step 3: Deploy to Vercel

### Method 1: Deploy via Vercel Dashboard (Easiest)

1. Go to https://vercel.com/new
2. Import your GitHub repository: `0xMgwan/clawdwako`
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `clawdwako-platform` (if in monorepo)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

4. Add Environment Variables (click "Environment Variables"):
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   NEXT_PUBLIC_URL=https://your-domain.vercel.app
   
   # Optional - AI API Keys (if providing defaults)
   ANTHROPIC_API_KEY=your-key
   OPENAI_API_KEY=your-key
   GOOGLE_AI_API_KEY=your-key
   
   # Optional - Railway deployment
   RAILWAY_API_TOKEN=your-token
   ```

5. Click "Deploy"

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to your project
cd /Users/macbookpro/clawdwako/clawdwako-platform

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? clawdwako-platform
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add NEXT_PUBLIC_URL

# Deploy to production
vercel --prod
```

---

## Step 4: Run Database Migrations

After deployment, you need to set up the database schema:

```bash
# Set your production DATABASE_URL
export DATABASE_URL="postgresql://..."

# Run Prisma migrations
npx prisma migrate deploy

# Or generate and push schema
npx prisma db push
```

**Alternative**: Use Vercel CLI to run migrations:

```bash
# Connect to your Vercel project
vercel link

# Run migration command
vercel env pull .env.local
npx prisma migrate deploy
```

---

## Step 5: Update Google OAuth Redirect URIs

1. Go back to Google Cloud Console
2. Update OAuth 2.0 Client ID
3. Add your Vercel domain to authorized redirect URIs:
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```

---

## Step 6: Access Your Admin Dashboard

Once deployed, access your admin dashboard at:

```
https://your-domain.vercel.app/admin
```

You can monitor:
- ✅ All users who sign up
- ✅ Total users, bots, and activity
- ✅ Individual user details
- ✅ Bot deployments and status

---

## Step 7: Set Up Custom Domain (Optional)

1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain (e.g., `clawdwako.ai`)
4. Follow DNS configuration instructions
5. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_URL` to use custom domain

---

## Troubleshooting

### Database Connection Issues

- Ensure `DATABASE_URL` is correct
- Check if database allows connections from Vercel IPs
- For Supabase, use connection pooling mode (port 6543)

### OAuth Issues

- Verify redirect URIs match exactly
- Check `NEXTAUTH_URL` matches your deployment URL
- Ensure `NEXTAUTH_SECRET` is set

### Build Failures

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript types are correct

### Environment Variables Not Working

- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)
- Ensure variables are set for "Production" environment

---

## Monitoring & Analytics

### Vercel Analytics (Built-in)

1. Go to your project dashboard
2. Click "Analytics" tab
3. View page views, visitors, and performance

### Admin Dashboard (Custom)

Access at: `https://your-domain.vercel.app/admin`

Monitor:
- User signups
- Bot deployments
- Platform activity
- User details

### Database Monitoring

Use Prisma Studio to view database:

```bash
# Pull environment variables
vercel env pull .env.local

# Open Prisma Studio
npx prisma studio
```

---

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

- **Push to `main` branch** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Preview deployment with unique URL

---

## Security Best Practices

1. ✅ Never commit `.env` files
2. ✅ Use different secrets for production and development
3. ✅ Rotate `NEXTAUTH_SECRET` regularly
4. ✅ Keep API keys secure in Vercel environment variables
5. ✅ Enable Vercel's security features (DDoS protection, etc.)
6. ✅ Use HTTPS only (Vercel provides this automatically)

---

## Cost Considerations

**Vercel Free Tier:**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless functions
- ✅ Automatic HTTPS

**Database Costs:**
- Vercel Postgres: Starts at $20/month
- Supabase: Free tier available (500MB)
- Neon: Free tier available (3GB)

---

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs

---

## Quick Deploy Button (Optional)

Add this to your README.md for one-click deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/0xMgwan/clawdwako)
