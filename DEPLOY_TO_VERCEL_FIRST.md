# Deploy to Vercel First (Skip Local Setup)

This guide gets your portal live on Vercel in 30-45 minutes without setting up Node.js locally.

**Why this approach:**
- No need to install Node.js, VS Code, etc.
- Get a live URL immediately
- Test with real Microsoft authentication
- Show your co-founder right away

You can always set up local development later if you want to modify code.

---

## ✅ Step 1: Create GitHub Account (5 minutes)

If you don't have one already:

1. Go to https://github.com
2. Click "Sign up"
3. Create free account
4. Verify your email

---

## ✅ Step 2: Upload Code to GitHub (10 minutes)

### Option A: Via GitHub Web Interface (Easiest)

1. **Extract your `stratum-portal` folder** to your computer

2. **Go to GitHub** and sign in

3. **Create new repository:**
   - Click the "+" icon (top right)
   - Select "New repository"
   - Name: `stratum-portal`
   - Description: `M365 Security & Compliance Portal`
   - Visibility: **Private** (keep it secret for now)
   - ⚠️ **DO NOT** check "Add a README"
   - Click "Create repository"

4. **Upload files:**
   - Click "uploading an existing file"
   - Drag and drop ALL files from your `stratum-portal` folder
   - ⚠️ **EXCEPT** `.env.local` if it exists (don't upload secrets!)
   - Add commit message: "Initial commit"
   - Click "Commit changes"

### Option B: Via Git Command Line (If Comfortable)

```bash
cd stratum-portal
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/stratum-portal.git
git push -u origin main
```

**Important:** Make sure `.env.local` is listed in `.gitignore` (it already is in the project).

---

## ✅ Step 3: Deploy to Vercel (5 minutes)

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Click "Sign Up"
   - Choose "Continue with GitHub"
   - Authorize Vercel to access your GitHub

2. **Import your repository:**
   - Click "Add New..." → "Project"
   - Find `stratum-portal` in the list
   - Click "Import"

3. **Configure project:**
   - Framework: Next.js (should auto-detect)
   - Root Directory: `./`
   - Build settings: Leave as default
   - **DON'T DEPLOY YET** - we need to add environment variables first

4. **Add environment variables:**
   Click "Environment Variables" and add these (we'll fill in the values in Step 4):
   
   ```
   NEXTAUTH_SECRET = (leave blank for now)
   NEXTAUTH_URL = (leave blank for now)
   AZURE_AD_CLIENT_ID = (leave blank for now)
   AZURE_AD_CLIENT_SECRET = (leave blank for now)
   AZURE_AD_TENANT_ID = common
   AZURE_AD_SCOPE = User.Read Organization.Read.All SecurityEvents.Read.All
   ```

5. **Click "Deploy"**
   - It will fail initially (missing variables)
   - But you'll get your Vercel URL: `https://stratum-portal-abc123.vercel.app`
   - **Copy this URL** - you need it for Azure setup

---

## ✅ Step 4: Azure AD Setup (15 minutes)

### Create App Registration

1. **Go to Azure Portal:**
   - Visit https://portal.azure.com
   - Sign in with your Microsoft account
   - Search for "App registrations"

2. **Create new registration:**
   - Click "+ New registration"
   - Name: `Stratum Portal`
   - Account types: **Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts**
   - Redirect URI:
     - Platform: **Web**
     - URI: `https://your-vercel-url.vercel.app/api/auth/callback/azure-ad`
     - (Replace `your-vercel-url` with your actual Vercel URL)
   - Click "Register"

### Get Your Credentials

1. **Copy Application (client) ID:**
   - On the Overview page
   - Click the copy icon next to "Application (client) ID"
   - Save it somewhere

2. **Create Client Secret:**
   - Click "Certificates & secrets" (left menu)
   - Click "+ New client secret"
   - Description: `Vercel Production`
   - Expires: 24 months
   - Click "Add"
   - **IMMEDIATELY COPY THE VALUE** (the long string under "Value")
   - ⚠️ You can only see this once!

3. **Add API Permissions:**
   - Click "API permissions" (left menu)
   - Click "+ Add a permission"
   - Select "Microsoft Graph"
   - Select "Delegated permissions"
   - Search and check:
     - `Organization.Read.All`
     - `SecurityEvents.Read.All`
   - Click "Add permissions"
   - (Optional) Click "Grant admin consent" if you're an admin

---

## ✅ Step 5: Configure Vercel Environment Variables (5 minutes)

1. **Generate NEXTAUTH_SECRET:**
   - Go to https://generate-secret.vercel.app/32
   - Copy the generated secret

2. **Go back to Vercel:**
   - Go to your project
   - Click "Settings" → "Environment Variables"

3. **Update the blank variables:**
   
   | Variable | Value |
   |----------|-------|
   | `NEXTAUTH_SECRET` | Paste your generated secret |
   | `NEXTAUTH_URL` | Your Vercel URL (e.g., `https://stratum-portal-abc123.vercel.app`) |
   | `AZURE_AD_CLIENT_ID` | Paste your Application ID from Azure |
   | `AZURE_AD_CLIENT_SECRET` | Paste your Client Secret from Azure |

4. **Save all changes**

---

## ✅ Step 6: Redeploy (2 minutes)

1. **Trigger a new deployment:**
   - Go to your project in Vercel
   - Click "Deployments" tab
   - Click the three dots on the latest deployment
   - Click "Redeploy"
   - Wait 2-3 minutes

2. **Or push a change to GitHub:**
   ```bash
   # Make a small change to README.md
   git add .
   git commit -m "Trigger redeploy"
   git push
   ```

---

## ✅ Step 7: Test It! (5 minutes)

1. **Visit your Vercel URL:**
   - Open `https://your-app.vercel.app`
   - You should see the Stratum Portal homepage

2. **Click "Sign in with Microsoft"**

3. **Sign in with your Microsoft account:**
   - Work account or personal account
   - Grant permissions when asked

4. **You should see the dashboard:**
   - Your name and email
   - Your organization name (if work account)
   - Microsoft Secure Score (if available)
   - Green success message

### Success! 🎉

Your portal is now live on the internet!

---

## 🎯 Next Steps

### Share with Your Co-Founder

Send them:
1. Your Vercel URL
2. Ask them to sign in with their Microsoft account
3. Get feedback on what they see

### Add Your Custom Domain (Optional)

1. **Buy domain:**
   - Go to Namecheap or Cloudflare
   - Buy `stratumsecurity.co.uk` (~£10-15/year)

2. **Add to Vercel:**
   - Vercel Dashboard → Settings → Domains
   - Enter `stratumsecurity.co.uk`
   - Follow DNS instructions

3. **Update environment variables:**
   - Change `NEXTAUTH_URL` to `https://stratumsecurity.co.uk`

4. **Update Azure redirect URI:**
   - Add `https://stratumsecurity.co.uk/api/auth/callback/azure-ad`

### Set Up Local Development (Later)

When you're ready to add features:
1. Follow SETUP.md to install Node.js and VS Code
2. Clone your GitHub repo
3. Add local `.env.local` file
4. Run `npm install` and `npm run dev`

---

## 🔄 How Updates Work

Every time you push code to GitHub, Vercel automatically deploys:

```bash
# Edit files locally (once you have local setup)
git add .
git commit -m "Add new feature"
git push

# Vercel automatically deploys in ~2 minutes
# Check your live URL to see changes
```

---

## 🚨 Troubleshooting

### "Redirect URI mismatch"

**Solution:**
- Go to Azure Portal → Your App → Authentication
- Verify redirect URI exactly matches: `https://your-vercel-url.vercel.app/api/auth/callback/azure-ad`
- Must include `/azure-ad` at the end

### "Failed to fetch data from Microsoft Graph"

**Solution:**
- Check Vercel environment variables are set correctly
- Verify API permissions in Azure AD
- Check client secret was copied correctly (no extra spaces)

### Build Failed

**Solution:**
- Go to Vercel → Deployments → Click failed deployment → View logs
- Look for the error message
- Common issues:
  - Missing environment variables
  - Typo in environment variable names

### Still Not Working?

1. Go to Vercel → Your Project → Deployments
2. Click the latest deployment
3. Click "View Function Logs"
4. Look for error messages
5. Search the error on Google or ask Claude

---

## 📊 Monitoring Your Live App

### View Analytics

Vercel Dashboard → Your Project → Analytics
- See page views
- Monitor performance
- Track visitor geography

### View Logs

Vercel Dashboard → Your Project → Functions
- See real-time function execution
- Debug authentication issues
- Monitor API calls

---

## 💰 Cost

**Current setup:**
- Vercel: **Free** (hobby tier)
- GitHub: **Free** (private repos included)
- Azure AD: **Free**
- Total: **£0/month**

**When you add a domain:**
- Domain: ~£1/month
- Total: ~£1/month

**Still incredibly cheap!**

---

## 🎓 What You've Accomplished

You now have:
- ✅ Live web application on the internet
- ✅ Custom URL (or can add custom domain later)
- ✅ Multi-tenant Microsoft authentication
- ✅ Automatic HTTPS/SSL
- ✅ Auto-deployments from GitHub
- ✅ Production-ready architecture

And you didn't even need to install Node.js locally!

---

## 🚀 You're Live!

Your portal is now accessible to anyone with the URL. You can:
- Demo to potential customers
- Get feedback from your co-founder
- Test with different Microsoft accounts
- Show it to advisors/investors

When you're ready to add features (Maester checks, compliance frameworks, etc.), follow NEXT_STEPS.md and set up local development.

**Welcome to production!** 🎉
