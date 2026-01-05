# Vercel Deployment Guide

This guide walks through deploying Stratum Portal to Vercel for production use.

## Why Vercel?

- **Built for Next.js** (same company that makes Next.js)
- **Free tier** includes:
  - 100GB bandwidth per month
  - Unlimited API requests
  - Automatic HTTPS
  - Global CDN
  - Serverless functions
- **Easy deployments** (git push = auto deploy)
- **Environment variables** management
- **Custom domains** included

## Before You Deploy

### 1. Update Azure AD Redirect URIs

1. Go to Azure Portal → App Registrations → Your App
2. Click "Authentication" in left menu
3. Under "Redirect URIs", add:
   ```
   https://your-project-name.vercel.app/api/auth/callback/azure-ad
   ```
   (Vercel will give you this URL after first deployment)
4. Click "Save"

### 2. Prepare Production Secrets

Generate a new `NEXTAUTH_SECRET` for production:
```bash
openssl rand -base64 32
```

**Important:** Use a DIFFERENT secret than your development environment.

---

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push code to GitHub:**
   ```bash
   # Initialize git (if not already)
   git init
   git add .
   git commit -m "Initial commit"
   
   # Create repo on GitHub, then:
   git remote add origin https://github.com/yourusername/stratum-portal.git
   git push -u origin main
   ```

2. **Sign up for Vercel:**
   - Go to https://vercel.com
   - Click "Sign Up"
   - Choose "Continue with GitHub"

3. **Import your repository:**
   - Click "Add New" → "Project"
   - Select your `stratum-portal` repository
   - Click "Import"

4. **Configure project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (leave as-is)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

5. **Add environment variables:**
   - Click "Environment Variables"
   - Add each variable from your `.env.local`:
   
   ```
   NEXTAUTH_SECRET=your-new-production-secret
   NEXTAUTH_URL=https://your-project-name.vercel.app
   AZURE_AD_CLIENT_ID=your-client-id
   AZURE_AD_CLIENT_SECRET=your-client-secret
   AZURE_AD_TENANT_ID=common
   AZURE_AD_SCOPE=User.Read Organization.Read.All SecurityEvents.Read.All
   ```

6. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - You'll get a URL like: `https://stratum-portal.vercel.app`

7. **Update Azure AD redirect URI:**
   - Copy your Vercel URL
   - Add to Azure: `https://your-project-name.vercel.app/api/auth/callback/azure-ad`

8. **Test:**
   - Visit your Vercel URL
   - Click "Sign in with Microsoft"
   - Should work exactly like localhost

---

### Option 2: Deploy via Vercel CLI (Advanced)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy to preview:**
   ```bash
   vercel
   ```
   
   This creates a preview deployment for testing.

4. **Add environment variables:**
   ```bash
   vercel env add NEXTAUTH_SECRET production
   vercel env add NEXTAUTH_URL production
   vercel env add AZURE_AD_CLIENT_ID production
   vercel env add AZURE_AD_CLIENT_SECRET production
   vercel env add AZURE_AD_TENANT_ID production
   vercel env add AZURE_AD_SCOPE production
   ```

5. **Deploy to production:**
   ```bash
   vercel --prod
   ```

---

## Custom Domain Setup

### 1. Buy Your Domain

Buy `stratumsecurity.co.uk` from:
- **Namecheap** (cheapest)
- **Cloudflare** (includes free WHOIS privacy)
- **Google Domains**

Cost: ~£10-15/year

### 2. Add Domain to Vercel

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Enter: `stratumsecurity.co.uk`
4. Click "Add"

### 3. Configure DNS

Vercel will give you DNS records to add. Typically:

**For apex domain (stratumsecurity.co.uk):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

Add these records in your domain registrar's DNS settings.

### 4. Wait for DNS Propagation

- Usually takes 5-30 minutes
- Check status: https://dnschecker.org
- Vercel will automatically provision SSL certificate

### 5. Update Environment Variables

```bash
vercel env add NEXTAUTH_URL production
# Enter: https://stratumsecurity.co.uk
```

### 6. Update Azure AD Redirect URI

Add: `https://stratumsecurity.co.uk/api/auth/callback/azure-ad`

---

## Automatic Deployments

Once connected to GitHub, Vercel automatically deploys:

- **main branch** → Production (stratumsecurity.co.uk)
- **other branches** → Preview URLs (for testing)
- **Pull requests** → Preview URLs (for reviewing changes)

**Workflow:**
```bash
# Make changes locally
git checkout -b feature/new-dashboard
# ... edit files ...
git add .
git commit -m "Add new dashboard layout"
git push origin feature/new-dashboard

# Create pull request on GitHub
# Vercel automatically deploys a preview
# Test the preview URL
# Merge PR → automatically deploys to production
```

---

## Environment Management

### Development vs Production

You'll have two environments:

| Environment | URL | Database | Purpose |
|-------------|-----|----------|---------|
| Development | localhost:3000 | None (or local) | Building features |
| Production | stratumsecurity.co.uk | Supabase prod | Live customer data |

**Best practices:**
- Use separate Azure AD apps for dev and prod
- Use separate Supabase projects for dev and prod
- Never mix customer data with test data

---

## Monitoring & Logs

### Vercel Analytics (Built-in)

Vercel includes analytics:
- Page views
- Load times
- Visitor geography
- Core Web Vitals

View at: Vercel Dashboard → Your Project → Analytics

### Function Logs

View serverless function logs:
1. Vercel Dashboard → Your Project → Functions
2. Click on any function
3. See real-time logs

**Useful for debugging:**
- Authentication errors
- Microsoft Graph API errors
- Database connection issues

### Real-Time Logs

```bash
# Stream logs in terminal
vercel logs --follow
```

---

## Performance Optimization

### Edge Caching

Vercel automatically caches:
- Static assets (CSS, JS, images)
- API routes (if you add cache headers)

**Add caching to API routes:**
```typescript
// app/api/graph/me/route.ts
export async function GET(request: NextRequest) {
  const response = NextResponse.json(data)
  
  // Cache for 5 minutes
  response.headers.set('Cache-Control', 's-maxage=300')
  
  return response
}
```

### Serverless Function Regions

By default, functions run in US East. For UK customers:

1. Go to Vercel Dashboard → Project → Settings
2. Scroll to "Function Region"
3. Select "London, UK (lhr1)"
4. Click "Save"

**Result:** Faster API responses for UK users

---

## Security Checklist

Before going live:

- [ ] Different `NEXTAUTH_SECRET` for production
- [ ] Separate Azure AD app for production
- [ ] HTTPS only (automatic with Vercel)
- [ ] Environment variables are set correctly
- [ ] `.env.local` is git-ignored
- [ ] No secrets in code
- [ ] Azure AD redirect URIs include production URL
- [ ] Row-level security enabled in Supabase (if using)
- [ ] Admin consent granted for Graph API permissions

---

## Troubleshooting

### "Redirect URI mismatch"

**Problem:** Azure AD doesn't recognize your Vercel URL

**Solution:**
1. Go to Azure Portal → App Registrations → Your App → Authentication
2. Add exact URL: `https://your-project.vercel.app/api/auth/callback/azure-ad`
3. Must include `/azure-ad` at the end
4. Must use `https://` not `http://`

### "NEXTAUTH_URL doesn't match"

**Problem:** `NEXTAUTH_URL` environment variable is wrong

**Solution:**
```bash
vercel env rm NEXTAUTH_URL production
vercel env add NEXTAUTH_URL production
# Enter your actual domain
```

### "Failed to fetch user data"

**Problem:** Environment variables not set correctly

**Solution:**
```bash
# Check what's set
vercel env ls

# Pull production variables to local file
vercel env pull .env.production.local

# Review the file
cat .env.production.local
```

### Build Fails

**Problem:** Code works locally but fails on Vercel

**Solution:**
1. Check build logs in Vercel dashboard
2. Common issues:
   - TypeScript errors
   - Missing dependencies
   - Environment variables not set
3. Test build locally:
   ```bash
   npm run build
   ```

### Slow Page Loads

**Problem:** Dashboard takes 5+ seconds to load

**Solutions:**
- Enable caching on API routes
- Move to London region (if UK customers)
- Add loading states in UI
- Lazy load heavy components
- Use Next.js Image component for images

---

## Scaling Considerations

### Free Tier Limits

Vercel free tier includes:
- ✅ 100GB bandwidth/month
- ✅ 100,000 function invocations/month
- ✅ 100 hours function execution/month

**For Stratum Portal:**
- Each customer visit: ~10 function calls
- Assuming 1,000 visits/month: ~10,000 calls
- **You're well within limits**

### When to Upgrade ($20/month)

Upgrade to Pro when you have:
- 50+ customers
- Custom domain needs (more than 1)
- Priority support needs
- Advanced analytics needs

---

## Backup & Rollback

### Rollback to Previous Version

If a deployment breaks something:

1. Go to Vercel Dashboard → Your Project → Deployments
2. Find the last working deployment
3. Click "..." menu → "Promote to Production"
4. Previous version is now live

**Or via CLI:**
```bash
vercel rollback
```

### Export Environment Variables

Backup your production config:
```bash
vercel env pull .env.production.backup
```

Store this file securely (NOT in git).

---

## Cost Breakdown

**Total monthly cost for production:**

| Service | Tier | Cost |
|---------|------|------|
| Vercel | Free | £0 |
| Domain | .co.uk | £1/month |
| Supabase | Free | £0 |
| Azure AD | Free | £0 |
| **Total** | | **£1/month** |

**When you scale (50+ customers):**

| Service | Tier | Cost |
|---------|------|------|
| Vercel | Pro | £15/month |
| Domain | .co.uk | £1/month |
| Supabase | Pro | £20/month |
| Azure AD | Free | £0 |
| **Total** | | **£36/month** |

Still incredibly cheap for a SaaS platform!

---

## Next: Connect Your Domain

Once deployed to Vercel:
1. Buy `stratumsecurity.co.uk`
2. Follow "Custom Domain Setup" above
3. Update all environment variables with new URL
4. Update Azure AD redirect URI
5. Test sign-in

You'll be live! 🚀
