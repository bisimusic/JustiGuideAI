# Vercel Setup Instructions

Quick guide to set up your JustiGuide AI project on Vercel.

## Step 1: Create/Link Project

### Option A: Via Dashboard (Recommended - Easiest)

1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository: `bisimusic/JustiGuideAI`
4. Configure:
   - **Project Name**: `justiguide-ai` (or your preferred name)
   - **Framework Preset**: Other
   - **Root Directory**: `.` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`
5. Click **"Deploy"** (you can skip env vars for now)

### Option B: Via CLI

```bash
# This will create a new project interactively
npx vercel

# Or link to existing project
npx vercel link
```

## Step 2: Set Environment Variables

### Via Dashboard (Easiest)

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:

#### Required Variables:

**SESSION_SECRET**
```
cae1fb47e76247ade42ec1747cd92eb606b76e08428d38d5998126692819e05d
```
- Environments: Production, Preview, Development

**NODE_ENV**
```
production
```
- Environments: Production only

**DATABASE_URL**
```
postgresql://user:password@host:5432/database
```
- Get from Neon, Supabase, or Railway
- Environments: Production, Preview, Development

**ANTHROPIC_API_KEY** (or OPENAI_API_KEY, or GOOGLE_AI_API_KEY)
```
your_api_key_here
```
- Environments: Production, Preview, Development

### Via CLI

After linking the project:

```bash
# SESSION_SECRET
echo "cae1fb47e76247ade42ec1747cd92eb606b76e08428d38d5998126692819e05d" | npx vercel env add SESSION_SECRET production

# NODE_ENV
echo "production" | npx vercel env add NODE_ENV production

# DATABASE_URL (you'll need to provide this)
npx vercel env add DATABASE_URL production

# API Keys (you'll need to provide these)
npx vercel env add ANTHROPIC_API_KEY production
npx vercel env add OPENAI_API_KEY production
npx vercel env add GOOGLE_AI_API_KEY production
```

## Step 3: Set Up Database

### Option 1: Neon (Recommended - Free tier)

1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Set as `DATABASE_URL` in Vercel
5. Run migrations:
   ```bash
   DATABASE_URL=your_neon_connection_string npm run db:push
   ```

### Option 2: Supabase

1. Sign up at https://supabase.com
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string
5. Set as `DATABASE_URL` in Vercel
6. Run migrations:
   ```bash
   DATABASE_URL=your_supabase_connection_string npm run db:push
   ```

### Option 3: Railway

1. Sign up at https://railway.app
2. Create a PostgreSQL service
3. Copy the connection string
4. Set as `DATABASE_URL` in Vercel
5. Run migrations:
   ```bash
   DATABASE_URL=your_railway_connection_string npm run db:push
   ```

## Step 4: Deploy

### First Deployment

```bash
npx vercel --prod
```

Or trigger from the Vercel Dashboard by pushing to your main branch.

## Step 5: Verify

1. Check deployment logs in Vercel Dashboard
2. Visit your deployment URL
3. Test health endpoint: `https://your-app.vercel.app/api/health`

## Troubleshooting

### Project not linked
```bash
npx vercel link
```

### Environment variables not loading
- Make sure they're set for the correct environment (Production/Preview/Development)
- Redeploy after adding new variables

### Build failures
- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Verify build command: `npm run build`

### Database connection errors
- Verify `DATABASE_URL` is correct
- Check database is accessible from Vercel's IPs
- Ensure migrations have been run

## Quick Checklist

- [ ] Project created/linked in Vercel
- [ ] `SESSION_SECRET` set
- [ ] `NODE_ENV=production` set
- [ ] `DATABASE_URL` set (production database)
- [ ] At least one AI API key set
- [ ] Database migrations run
- [ ] First deployment successful
- [ ] Health endpoint responding

## Next Steps

After successful deployment:
- Set up custom domain
- Configure monitoring
- Set up CI/CD (automatic deployments on push)
