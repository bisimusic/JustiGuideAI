# Production Database Setup Guide

Quick guide to set up a PostgreSQL database for Vercel deployment.

## Option 1: Neon (Recommended - Free Tier Available)

### Steps:

1. **Sign Up**
   - Go to https://neon.tech
   - Click "Sign Up" (can use GitHub)
   - Free tier includes 0.5GB storage

2. **Create Project**
   - Click "Create Project"
   - Name: `justiguide-ai` (or your choice)
   - Region: Choose closest to your users
   - PostgreSQL version: 15 or 16 (latest)

3. **Get Connection String**
   - After project creation, you'll see the connection string
   - Format: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`
   - Click "Copy" to copy the connection string

4. **Run Migrations**
   ```bash
   DATABASE_URL="your_neon_connection_string" npm run db:push
   ```

5. **Add to Vercel**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `DATABASE_URL` = your connection string
   - Environment: Production, Preview, Development

## Option 2: Supabase (Free Tier Available)

### Steps:

1. **Sign Up**
   - Go to https://supabase.com
   - Click "Start your project"
   - Free tier includes 500MB database

2. **Create Project**
   - Click "New Project"
   - Name: `justiguide-ai`
   - Database Password: (save this!)
   - Region: Choose closest
   - Wait for project to be ready (~2 minutes)

3. **Get Connection String**
   - Go to Settings → Database
   - Scroll to "Connection string"
   - Select "URI" tab
   - Copy the connection string
   - Replace `[YOUR-PASSWORD]` with your database password

4. **Run Migrations**
   ```bash
   DATABASE_URL="your_supabase_connection_string" npm run db:push
   ```

5. **Add to Vercel**
   - Same as Neon above

## Option 3: Railway (Easy Setup)

### Steps:

1. **Sign Up**
   - Go to https://railway.app
   - Click "Start a New Project"
   - Can use GitHub login

2. **Create PostgreSQL**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway automatically provisions it

3. **Get Connection String**
   - Click on the PostgreSQL service
   - Go to "Variables" tab
   - Copy `DATABASE_URL` value

4. **Run Migrations**
   ```bash
   DATABASE_URL="your_railway_connection_string" npm run db:push
   ```

5. **Add to Vercel**
   - Same as above

## Quick Comparison

| Provider | Free Tier | Setup Time | Best For |
|----------|-----------|------------|----------|
| **Neon** | 0.5GB | 2 min | Best overall, modern |
| **Supabase** | 500MB | 3 min | Full-featured platform |
| **Railway** | $5 credit | 1 min | Simple, fast setup |

## After Setup

1. ✅ Database created
2. ✅ Connection string copied
3. ✅ Migrations run
4. ✅ Added to Vercel environment variables
5. ✅ Ready to deploy!

## Troubleshooting

### Connection Issues
- Make sure SSL is enabled (most providers require it)
- Check firewall/network settings
- Verify connection string format

### Migration Issues
- Ensure `DATABASE_URL` is correct
- Check database is accessible
- Verify Drizzle config is correct

### SSL Errors
- Most cloud databases require SSL
- Connection string should include `?sslmode=require`
- Neon and Supabase include this automatically
