# Setup Guide

Complete instructions for setting up Stratum Portal on your Windows machine.

## Table of Contents
1. [Install Node.js](#1-install-nodejs)
2. [Install VS Code](#2-install-vs-code)
3. [Create Azure AD App Registration](#3-create-azure-ad-app-registration)
4. [Configure Environment Variables](#4-configure-environment-variables)
5. [Install Dependencies](#5-install-dependencies)
6. [Run the Application](#6-run-the-application)
7. [Test Authentication](#7-test-authentication)
8. [Troubleshooting](#troubleshooting)

---

## 1. Install Node.js

Node.js is required to run this Next.js application.

### Download and Install

1. Go to https://nodejs.org/
2. Download the **LTS (Long Term Support)** version for Windows
3. Run the installer (.msi file)
4. Follow the installer:
   - ✅ Accept the license agreement
   - ✅ Choose default installation location
   - ✅ Check "Automatically install necessary tools" (important!)
   - Click Install

### Verify Installation

Open PowerShell or Command Prompt and run:
```bash
node --version
npm --version
```

You should see version numbers (e.g., `v20.11.0` and `10.2.4`).

If you see "command not found", restart your computer and try again.

---

## 2. Install VS Code

Visual Studio Code is the recommended editor for this project.

1. Download from: https://code.visualstudio.com/
2. Install with default settings
3. (Optional) Install these helpful extensions:
   - "ESLint" by Microsoft
   - "Prettier - Code formatter"
   - "Tailwind CSS IntelliSense"

---

## 3. Create Azure AD App Registration

This is the most important step. Your app needs permission to authenticate users with Microsoft.

### Step 3.1: Access Azure Portal

1. Go to https://portal.azure.com
2. Sign in with your Microsoft account
3. Search for **"App registrations"** in the top search bar
4. Click **"App registrations"** from the results

### Step 3.2: Create New Registration

1. Click **"+ New registration"** at the top
2. Fill in the form:

   **Name:**
   ```
   Stratum Portal (Development)
   ```

   **Supported account types:**
   - Select **"Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts"**
   - This allows any M365 tenant to sign in

   **Redirect URI:**
   - Platform: **Web**
   - URI: `http://localhost:3000/api/auth/callback/azure-ad`
   - ⚠️ **CRITICAL:** This must be exact, including `/azure-ad` at the end

3. Click **"Register"**

### Step 3.3: Copy Your Client ID

You'll now see the app overview page.

1. Find **"Application (client) ID"** (it looks like: `12345678-1234-1234-1234-123456789abc`)
2. Click the copy icon next to it
3. Save this somewhere - you'll need it for `.env.local`

### Step 3.4: Create a Client Secret

1. In the left menu, click **"Certificates & secrets"**
2. Click **"+ New client secret"**
3. Description: `Stratum Portal Development`
4. Expires: **6 months** (you'll need to create a new one after this)
5. Click **"Add"**
6. **IMMEDIATELY COPY THE VALUE** (the long string in the "Value" column)
   - ⚠️ **You can only see this once!** If you lose it, you'll need to create a new secret
7. Save this somewhere secure - you'll need it for `.env.local`

### Step 3.5: Configure API Permissions

1. In the left menu, click **"API permissions"**
2. You should see **"Microsoft Graph: User.Read"** already added
3. Click **"+ Add a permission"**
4. Click **"Microsoft Graph"**
5. Click **"Delegated permissions"**
6. Add these permissions:
   - Search for "Organization" → Check **"Organization.Read.All"**
   - Search for "Security" → Check **"SecurityEvents.Read.All"**
7. Click **"Add permissions"**
8. ⚠️ **Important:** Click **"Grant admin consent for [your tenant]"**
   - If you don't have admin rights, ask your IT admin to do this
   - Or skip this for now - the app will work with just User.Read

Your app registration is now complete! ✅

---

## 4. Configure Environment Variables

Environment variables store your secrets and configuration.

### Step 4.1: Create .env.local File

1. In VS Code, open the `stratum-portal` folder
2. Find the file `.env.example`
3. Right-click it and select **"Copy"**
4. Right-click in the file explorer and **"Paste"**
5. Rename the copy to `.env.local`

**Important:** The `.env.local` file is git-ignored. It will never be committed to version control.

### Step 4.2: Fill in Your Values

Open `.env.local` and update these values:

```env
# 1. Generate a secret key
# Option A: Use this website: https://generate-secret.vercel.app/32
# Option B: Run this in PowerShell: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
NEXTAUTH_SECRET=your-generated-secret-here

# 2. Leave this as-is for local development
NEXTAUTH_URL=http://localhost:3000

# 3. Paste your Application (client) ID from Azure
AZURE_AD_CLIENT_ID=12345678-1234-1234-1234-123456789abc

# 4. Paste your client secret value from Azure
AZURE_AD_CLIENT_SECRET=your-secret-value-here

# 5. Use "common" for multi-tenant
AZURE_AD_TENANT_ID=common

# 6. Scopes (leave as-is)
AZURE_AD_SCOPE=User.Read Organization.Read.All SecurityEvents.Read.All
```

### Example .env.local (with fake values)

```env
NEXTAUTH_SECRET=dGhpc0lzQVJhbmRvbVNlY3JldEtleUZvckF1dGg=
NEXTAUTH_URL=http://localhost:3000
AZURE_AD_CLIENT_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
AZURE_AD_CLIENT_SECRET=XyZ9~aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789
AZURE_AD_TENANT_ID=common
AZURE_AD_SCOPE=User.Read Organization.Read.All SecurityEvents.Read.All
```

Save the file.

---

## 5. Install Dependencies

Open PowerShell or Command Prompt in the `stratum-portal` folder.

**If using VS Code:**
1. Open the folder in VS Code
2. Press `Ctrl + `` (backtick) to open integrated terminal

**Run this command:**
```bash
npm install
```

This downloads all required packages (Next.js, React, NextAuth, etc.). It takes 1-3 minutes.

You should see:
```
added 324 packages in 45s
```

---

## 6. Run the Application

Start the development server:

```bash
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

**Leave this terminal window open.** This is your server running.

---

## 7. Test Authentication

### Step 7.1: Open the App

1. Open your browser
2. Go to: http://localhost:3000
3. You should see the Stratum Portal homepage

### Step 7.2: Sign In

1. Click **"Sign in with Microsoft"**
2. You'll be redirected to Microsoft's login page
3. Sign in with your Microsoft account (work or personal)
4. If prompted, grant permissions to the app
5. You'll be redirected back to the dashboard

### Step 7.3: Verify It Works

On the dashboard, you should see:
- Your name and email
- Your organization name (if work account)
- Microsoft Secure Score (if available)
- Green success message: "Authentication Successful! 🎉"

**If you see this, everything is working!** ✅

---

## Troubleshooting

### Error: "NEXTAUTH_SECRET is not defined"

**Problem:** You didn't set a secret in `.env.local`

**Solution:**
1. Generate a secret: https://generate-secret.vercel.app/32
2. Add it to `.env.local` as `NEXTAUTH_SECRET=your-secret-here`
3. Restart the server (`npm run dev`)

---

### Error: "Invalid redirect_uri"

**Problem:** The redirect URI in Azure doesn't match your app

**Solution:**
1. Go to Azure Portal → App registrations → Your app
2. Click "Authentication" in the left menu
3. Under "Redirect URIs", make sure you have: `http://localhost:3000/api/auth/callback/azure-ad`
4. Click "Save"
5. Try signing in again

---

### Error: "Failed to fetch data from Microsoft Graph API"

**Problem:** Missing API permissions or admin consent not granted

**Solution:**
1. Go to Azure Portal → App registrations → Your app → API permissions
2. Make sure these are added:
   - User.Read
   - Organization.Read.All
   - SecurityEvents.Read.All
3. Click "Grant admin consent"
4. Sign out of the app and sign in again

---

### Error: "Cannot find module 'next'"

**Problem:** Dependencies not installed

**Solution:**
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

### Port 3000 Already in Use

**Problem:** Another app is using port 3000

**Solution:**
```bash
# Use a different port
npm run dev -- -p 3001

# Update .env.local:
NEXTAUTH_URL=http://localhost:3001

# Update Azure redirect URI:
http://localhost:3001/api/auth/callback/azure-ad
```

---

### Changes Not Showing Up

**Problem:** Next.js caches files

**Solution:**
1. Stop the server (Ctrl+C)
2. Delete `.next` folder
3. Run `npm run dev` again

---

## Next Steps

Once authentication is working:

1. ✅ You've proven the foundation works
2. 📖 Read `ARCHITECTURE.md` to understand how it all connects
3. 🚀 Read `NEXT_STEPS.md` for adding features (Maester, database, etc.)
4. 💬 Test with your co-founder - get them to sign in with their account

---

## Quick Reference: Common Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production (later)
npm run build

# Start production server (after build)
npm start

# Check for linting errors
npm run lint
```

---

## Security Checklist

Before sharing this code or deploying:

- ✅ `.env.local` is git-ignored (check `.gitignore`)
- ✅ Never commit `.env.local` to version control
- ✅ Never share your `AZURE_AD_CLIENT_SECRET` publicly
- ✅ Use different secrets for development vs production
- ✅ Rotate client secrets every 6 months

---

## Getting Help

**If you're stuck:**
1. Check the error message in your terminal
2. Check the browser console (F12 → Console tab)
3. Read the comments in the code files
4. Search the error message on Google
5. Check Next.js docs: https://nextjs.org/docs
6. Check NextAuth docs: https://next-auth.js.org/
