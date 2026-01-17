# API Keys Setup Guide

Guide to getting your AI API keys for JustiGuide AI.

## Required API Keys

You need **at least one** of these AI API keys:

1. **ANTHROPIC_API_KEY** (Claude AI)
2. **OPENAI_API_KEY** (GPT models)
3. **GOOGLE_AI_API_KEY** (Gemini models)

## Option 1: Anthropic (Claude) - Recommended

### Steps:

1. **Sign Up**
   - Go to https://console.anthropic.com
   - Click "Sign Up" or "Log In"
   - Can use Google/GitHub

2. **Get API Key**
   - Go to "API Keys" in the dashboard
   - Click "Create Key"
   - Name: `justiguide-ai`
   - Copy the key (starts with `sk-ant-...`)
   - ⚠️ Save it - you won't see it again!

3. **Add to Vercel**
   - Vercel Dashboard → Project → Settings → Environment Variables
   - Add: `ANTHROPIC_API_KEY` = your key
   - Environment: Production, Preview, Development

### Pricing:
- Pay-as-you-go
- Claude 3.5 Sonnet: ~$3/million input tokens, $15/million output tokens
- Free tier: $5 credit to start

## Option 2: OpenAI (GPT)

### Steps:

1. **Sign Up**
   - Go to https://platform.openai.com
   - Click "Sign Up" or "Log In"
   - Verify email/phone

2. **Get API Key**
   - Go to "API Keys" section
   - Click "Create new secret key"
   - Name: `justiguide-ai`
   - Copy the key (starts with `sk-...`)
   - ⚠️ Save it - you won't see it again!

3. **Add to Vercel**
   - Same as Anthropic above

### Pricing:
- Pay-as-you-go
- GPT-4: ~$30/million input tokens, $60/million output tokens
- GPT-3.5 Turbo: Much cheaper
- Free tier: $5 credit to start

## Option 3: Google AI (Gemini)

### Steps:

1. **Sign Up**
   - Go to https://aistudio.google.com
   - Sign in with Google account
   - Accept terms

2. **Get API Key**
   - Click "Get API Key" in left sidebar
   - Create API key in new project
   - Copy the key
   - ⚠️ Save it securely!

3. **Add to Vercel**
   - Same as above

### Pricing:
- Free tier: 60 requests/minute
- Paid: Pay-as-you-go
- Very affordable

## Which Should You Use?

### For Development/Testing:
- **Google AI** - Best free tier
- **Anthropic** - Good free credit

### For Production:
- **Anthropic Claude** - Best quality, good pricing
- **OpenAI GPT-4** - Most capable, more expensive
- **OpenAI GPT-3.5** - Good balance of cost/quality

### Recommendation:
Start with **Anthropic** for best quality, or **Google AI** for free tier testing.

## Setting Multiple Keys

You can set all three if you want fallback options:

```bash
# In Vercel Dashboard, add all three:
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=...
```

The app will use them in order of preference.

## Security Best Practices

1. ✅ **Never commit** API keys to git
2. ✅ **Use environment variables** (not hardcoded)
3. ✅ **Rotate keys** regularly
4. ✅ **Monitor usage** in provider dashboards
5. ✅ **Set usage limits** if available

## Cost Management

### Set Usage Limits:

**Anthropic:**
- Go to Settings → Usage Limits
- Set monthly budget

**OpenAI:**
- Go to Settings → Limits
- Set hard/soft limits

**Google AI:**
- Set quotas in Google Cloud Console

### Monitor Usage:

- Check provider dashboards regularly
- Set up billing alerts
- Review usage in Vercel logs

## Quick Checklist

- [ ] Signed up for at least one AI provider
- [ ] Created API key
- [ ] Copied key securely
- [ ] Added to Vercel environment variables
- [ ] Set for Production, Preview, Development
- [ ] Verified key works (test deployment)

## Testing Your Keys

After adding to Vercel, test with a deployment:

```bash
# Deploy to preview
npx vercel

# Check logs for API key errors
npx vercel logs
```

If you see authentication errors, verify:
- Key is correct (no extra spaces)
- Key is active in provider dashboard
- Environment variable name matches exactly
