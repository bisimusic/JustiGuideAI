# Troubleshooting App Loading Issues

## Quick Fixes

### 1. Check if dependencies are installed
```bash
npm install
```

### 2. Clear Next.js cache and rebuild
```bash
rm -rf .next
npm run dev
```

### 3. Check for TypeScript errors
```bash
npx tsc --noEmit
```

### 4. Check if port 3002 is available
```bash
lsof -ti:3002
# If something is using it, kill it:
kill -9 $(lsof -ti:3002)
```

### 5. Check environment variables
```bash
# Make sure .env file exists and has DATABASE_URL
cat .env | grep DATABASE_URL
```

### 6. Run dev server and see errors
```bash
npm run dev
# Watch the terminal for error messages
```

## Common Issues

### Issue: "Module not found"
**Solution:** Run `npm install`

### Issue: "Port already in use"
**Solution:** 
```bash
kill -9 $(lsof -ti:3002)
npm run dev
```

### Issue: "Database connection error"
**Solution:** 
- Check DATABASE_URL in .env
- Make sure Express server is running on port 5000

### Issue: Build errors
**Solution:**
```bash
rm -rf .next
npm run build
npm run dev
```

## Check Server Status

1. **Is the server running?**
   ```bash
   curl http://localhost:3002
   ```

2. **Check Express server (port 5000)**
   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Check for errors in terminal**
   - Look for red error messages
   - Check for missing modules
   - Check for TypeScript errors
