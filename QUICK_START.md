# Quick Start Checklist

Use this checklist to get Stratum Portal running in the next 30-60 minutes.

## ✅ Phase 1: Environment Setup (15 minutes)

### Install Node.js
- [ ] Go to https://nodejs.org/
- [ ] Download LTS version for Windows
- [ ] Run installer with default settings
- [ ] Open Command Prompt and verify:
  ```bash
  node --version
  npm --version
  ```

### Install VS Code
- [ ] Download from https://code.visualstudio.com/
- [ ] Install with default settings
- [ ] Open VS Code

### Extract Project
- [ ] Download the `stratum-portal` folder
- [ ] Extract to a location you'll remember (e.g., `C:\Projects\stratum-portal`)
- [ ] Open this folder in VS Code (File → Open Folder)

---

## ✅ Phase 2: Azure AD Setup (20 minutes)

### Create App Registration
- [ ] Go to https://portal.azure.com
- [ ] Sign in with your Microsoft account
- [ ] Search for "App registrations"
- [ ] Click "+ New registration"

### Configure Registration
- [ ] Name: `Stratum Portal (Development)`
- [ ] Account types: **Multitenant and personal accounts**
- [ ] Redirect URI: `http://localhost:3000/api/auth/callback/azure-ad`
- [ ] Click "Register"

### Get Client ID
- [ ] On the Overview page, find "Application (client) ID"
- [ ] Click the copy icon
- [ ] Save it somewhere (you'll need it soon)

### Create Client Secret
- [ ] Click "Certificates & secrets" in left menu
- [ ] Click "+ New client secret"
- [ ] Description: `Development`
- [ ] Expires: 6 months
- [ ] Click "Add"
- [ ] **IMMEDIATELY COPY THE VALUE** (you can't see it again!)
- [ ] Save it somewhere secure

### Add API Permissions
- [ ] Click "API permissions" in left menu
- [ ] Click "+ Add a permission"
- [ ] Select "Microsoft Graph"
- [ ] Select "Delegated permissions"
- [ ] Search and add:
  - [x] `Organization.Read.All`
  - [x] `SecurityEvents.Read.All`
- [ ] Click "Add permissions"
- [ ] (Optional) Click "Grant admin consent" if you're an admin

---

## ✅ Phase 3: Configure Environment (5 minutes)

### Create .env.local File
- [ ] In VS Code, find `.env.example` file
- [ ] Right-click → Copy
- [ ] Right-click in file explorer → Paste
- [ ] Rename to `.env.local`

### Generate Secret
- [ ] Go to https://generate-secret.vercel.app/32
- [ ] Copy the generated secret

### Fill in Values
Open `.env.local` and fill in:

```env
NEXTAUTH_SECRET=paste-your-generated-secret-here
NEXTAUTH_URL=http://localhost:3000
AZURE_AD_CLIENT_ID=paste-your-client-id-here
AZURE_AD_CLIENT_SECRET=paste-your-client-secret-here
AZURE_AD_TENANT_ID=common
AZURE_AD_SCOPE=User.Read Organization.Read.All SecurityEvents.Read.All
```

- [ ] Replace all placeholder values
- [ ] Save the file (Ctrl+S)

---

## ✅ Phase 4: Run the App (10 minutes)

### Install Dependencies
- [ ] In VS Code, open integrated terminal (Ctrl + `)
- [ ] Run:
  ```bash
  npm install
  ```
- [ ] Wait 1-3 minutes for installation

### Start Development Server
- [ ] Run:
  ```bash
  npm run dev
  ```
- [ ] You should see: `ready - started server on 0.0.0.0:3000`
- [ ] **Leave this terminal open!**

### Test in Browser
- [ ] Open browser
- [ ] Go to: http://localhost:3000
- [ ] You should see the Stratum Portal homepage
- [ ] Click "Sign in with Microsoft"
- [ ] Sign in with your Microsoft account
- [ ] Grant permissions if asked
- [ ] You should be redirected to the dashboard
- [ ] See your name, organization, and secure score

### Success! 🎉
If you see the dashboard with your data, authentication is working!

---

## 🚨 Common Issues & Quick Fixes

### "Cannot find module 'next'"
```bash
npm install
```

### "NEXTAUTH_SECRET is not defined"
- Check `.env.local` exists (not `.env.example`)
- Make sure `NEXTAUTH_SECRET` is filled in
- Restart dev server (Ctrl+C, then `npm run dev`)

### "Invalid redirect_uri"
- Go to Azure Portal → Your App → Authentication
- Verify redirect URI is exactly: `http://localhost:3000/api/auth/callback/azure-ad`
- Must have `/azure-ad` at the end

### "Failed to fetch data"
- Check Azure AD API permissions are granted
- Make sure client secret was copied correctly
- Check terminal for error messages

---

## 📚 Next: Read the Docs

Now that it's working:

1. **SETUP.md** - Detailed setup instructions (you've already done most of this!)
2. **ARCHITECTURE.md** - How everything works under the hood
3. **NEXT_STEPS.md** - Roadmap for adding features
4. **VERCEL_DEPLOYMENT.md** - Deploy to production

---

## 🎯 Your Next 3 Tasks

### Task 1: Show Your Co-Founder (Today)
- [ ] Get them to sign in with their Microsoft account
- [ ] Verify they see their own tenant data
- [ ] Get feedback on the UI
- [ ] Discuss what features to build next

### Task 2: Plan Your First Feature (This Week)
- [ ] Read NEXT_STEPS.md
- [ ] Decide: Maester integration or manual checks?
- [ ] Choose 5-10 security checks to implement first
- [ ] Map checks to compliance frameworks

### Task 3: Validate with Real Prospects (Next Week)
- [ ] Use ngrok to expose your local app temporarily
- [ ] Show 3-5 potential customers
- [ ] Ask: "Would you pay £750/month for this?"
- [ ] Document their feedback

---

## 💡 Pro Tips

### Keep Learning
- Read the comments in the code files
- Every file has explanations of what it does
- Check Next.js docs when stuck: https://nextjs.org/docs
- Check NextAuth docs: https://next-auth.js.org/

### Use Git
Even if you're not sharing code yet:
```bash
git init
git add .
git commit -m "Initial working version"
```

This lets you roll back changes if you break something.

### Ask for Help
If stuck:
1. Check error message in terminal
2. Check browser console (F12)
3. Read the relevant documentation file
4. Google the error message
5. Ask Claude for help with specific errors

---

## 🎓 What You've Built

You now have:
- ✅ Multi-tenant Microsoft authentication
- ✅ Secure OAuth 2.0 flow
- ✅ Microsoft Graph API integration
- ✅ User and organization data display
- ✅ Microsoft Secure Score retrieval
- ✅ Responsive UI with Tailwind CSS
- ✅ TypeScript for type safety
- ✅ Production-ready architecture

**This is the hard part done.** Everything else builds on this foundation.

---

## 🚀 You're Ready!

The foundation is solid. Now you can:
1. Add security checks
2. Store results in a database
3. Build compliance dashboards
4. Generate reports
5. Launch your business

Good luck with Stratum Security! 💪
