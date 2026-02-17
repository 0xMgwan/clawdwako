# Vercel Deployment Checklist

Quick checklist to deploy Clawdwako platform to Vercel.

## ✅ Pre-Deployment Checklist

### 1. Database Setup
- [ ] PostgreSQL database created (Vercel Postgres, Supabase, or Neon)
- [ ] `DATABASE_URL` connection string obtained
- [ ] Database accessible from internet

### 2. Google OAuth Setup
- [ ] Google Cloud project created
- [ ] OAuth 2.0 credentials created
- [ ] Authorized redirect URI added: `https://your-domain.vercel.app/api/auth/callback/google`
- [ ] Client ID and Client Secret obtained

### 3. Environment Variables Ready
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_URL` - Your Vercel deployment URL
- [ ] `NEXTAUTH_SECRET` - Generated with `openssl rand -base64 32`
- [ ] `GOOGLE_CLIENT_ID` - From Google Cloud Console
- [ ] `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- [ ] `NEXT_PUBLIC_URL` - Your public URL
- [ ] `ANTHROPIC_API_KEY` - (Optional) Default Anthropic key
- [ ] `OPENAI_API_KEY` - (Optional) Default OpenAI key
- [ ] `GOOGLE_AI_API_KEY` - (Optional) Default Google AI key
- [ ] `RAILWAY_API_TOKEN` - (Optional) For Railway deployments

### 4. Code Ready
- [ ] All changes committed to Git
- [ ] Code pushed to GitHub repository
- [ ] `package.json` includes all dependencies
- [ ] Build script includes `prisma generate`

---

## 🚀 Deployment Steps

### Step 1: Deploy to Vercel

**Option A: Via Vercel Dashboard**
1. Go to https://vercel.com/new
2. Import GitHub repository: `0xMgwan/clawdwako`
3. Configure:
   - Framework: Next.js
   - Root Directory: `clawdwako-platform` (if needed)
   - Build Command: `npm run build`
4. Add all environment variables
5. Click "Deploy"

**Option B: Via CLI**
```bash
cd /Users/macbookpro/clawdwako/clawdwako-platform
vercel login
vercel
# Follow prompts
vercel --prod
```

### Step 2: Run Database Migrations

```bash
# Set DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy

# Or push schema
npx prisma db push
```

### Step 3: Update Google OAuth

1. Go to Google Cloud Console
2. Add production redirect URI:
   ```
   https://your-actual-domain.vercel.app/api/auth/callback/google
   ```

### Step 4: Test Deployment

- [ ] Visit your Vercel URL
- [ ] Test Google sign-in
- [ ] Check admin dashboard: `/admin`
- [ ] Verify database connection
- [ ] Test bot deployment

---

## 📊 Access Admin Dashboard

Once deployed, access your admin dashboard:

```
https://your-domain.vercel.app/admin
```

**Features:**
- View all users who signed up
- Monitor total users, bots, and activity
- See new signups daily
- View individual user details
- Check bot deployment status

---

## 🔧 Post-Deployment

### Update Environment Variables (if needed)

**Via Vercel Dashboard:**
1. Go to project settings
2. Click "Environment Variables"
3. Add/Edit variables
4. Redeploy

**Via CLI:**
```bash
vercel env add VARIABLE_NAME
vercel env rm VARIABLE_NAME
```

### Monitor Your Platform

**Vercel Analytics:**
- Dashboard → Analytics tab
- View traffic, performance, errors

**Admin Dashboard:**
- `/admin` - User management
- View signups, bots, activity

**Database:**
```bash
vercel env pull .env.local
npx prisma studio
```

---

## 🔒 Security Checklist

- [ ] All environment variables set in Vercel (not in code)
- [ ] `.env` files in `.gitignore`
- [ ] `NEXTAUTH_SECRET` is random and secure
- [ ] Google OAuth redirect URIs match exactly
- [ ] Database has strong password
- [ ] HTTPS enabled (automatic with Vercel)

---

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all dependencies in `package.json`
- Ensure `prisma generate` runs in build script

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Check database allows external connections
- For Supabase, use connection pooling (port 6543)

### OAuth Not Working
- Verify redirect URIs match exactly
- Check `NEXTAUTH_URL` is correct
- Ensure `NEXTAUTH_SECRET` is set

### Admin Dashboard Empty
- Run database migrations
- Check if users table exists
- Verify Prisma schema is applied

---

## 📝 Quick Commands

```bash
# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# Pull environment variables
vercel env pull .env.local

# Run database migrations
npx prisma migrate deploy

# View database
npx prisma studio

# Check deployment status
vercel inspect [deployment-url]
```

---

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ Platform loads at Vercel URL
- ✅ Users can sign in with Google
- ✅ Admin dashboard shows users at `/admin`
- ✅ Database stores user data
- ✅ Bot deployment works
- ✅ No errors in Vercel logs

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **NextAuth Docs**: https://next-auth.js.org

---

## 🚀 You're Ready!

Follow the checklist above and your platform will be live on Vercel with full admin monitoring capabilities.

**Admin Dashboard URL**: `https://your-domain.vercel.app/admin`
