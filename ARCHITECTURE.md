# Architecture Documentation

This document explains how Stratum Portal works under the hood.

## Table of Contents
1. [High-Level Overview](#high-level-overview)
2. [Authentication Flow](#authentication-flow)
3. [File Structure Explained](#file-structure-explained)
4. [How Microsoft Graph API Works](#how-microsoft-graph-api-works)
5. [Security Architecture](#security-architecture)
6. [Data Flow](#data-flow)
7. [Technology Choices](#technology-choices)

---

## High-Level Overview

```
┌─────────────┐
│   Browser   │
│   (User)    │
└──────┬──────┘
       │
       │ 1. Visit site
       │ 2. Click "Sign in"
       ▼
┌─────────────────────┐
│   Next.js App       │
│ (stratum-portal)    │
│                     │
│  ┌──────────────┐  │
│  │  NextAuth    │  │  3. Redirect to Microsoft
│  └──────┬───────┘  │
└─────────┼──────────┘
          │
          │ 4. OAuth flow
          ▼
┌──────────────────────┐
│  Microsoft Login     │
│  (login.microsoft)   │
└──────────┬───────────┘
           │
           │ 5. User signs in
           │ 6. Microsoft sends tokens back
           ▼
┌──────────────────────┐
│   Next.js App        │
│   (Authenticated)    │
│                      │
│  ┌───────────────┐  │
│  │  Dashboard    │  │
│  └───────┬───────┘  │
│          │           │
│          │ 7. Call /api/graph/me
│          ▼           │
│  ┌───────────────┐  │
│  │ Graph API     │  │
│  └───────┬───────┘  │
└──────────┼──────────┘
           │
           │ 8. Fetch user data
           ▼
┌──────────────────────┐
│  Microsoft Graph API │
│  (graph.microsoft)   │
└──────────────────────┘
```

---

## Authentication Flow

### Step-by-Step: What Happens When You Sign In

#### 1. User Clicks "Sign in with Microsoft"

**File:** `app/page.tsx`
```tsx
<Link href="/api/auth/signin">Sign in with Microsoft</Link>
```

- This is just a regular link
- Points to `/api/auth/signin` endpoint

#### 2. NextAuth Handles the Sign-In Request

**File:** `app/api/auth/[...nextauth]/route.ts`

- The `[...nextauth]` folder name is special syntax
- It creates routes for ALL paths under `/api/auth/`
- NextAuth automatically handles `/signin`, `/signout`, `/callback`, etc.

#### 3. NextAuth Redirects to Microsoft

**File:** `lib/auth.ts` (configuration)

```ts
AzureADProvider({
  clientId: process.env.AZURE_AD_CLIENT_ID!,
  clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
  tenantId: "common", // Allows any Microsoft account
})
```

NextAuth constructs a URL like:
```
https://login.microsoftonline.com/common/oauth2/v2.0/authorize
  ?client_id=YOUR_CLIENT_ID
  &redirect_uri=http://localhost:3000/api/auth/callback/azure-ad
  &response_type=code
  &scope=openid profile email User.Read Organization.Read.All
```

The browser redirects to this URL.

#### 4. User Signs In at Microsoft

- User enters their email and password
- Microsoft may ask for 2FA
- Microsoft asks "Allow Stratum Portal to access your info?"

#### 5. Microsoft Redirects Back with Authorization Code

Microsoft sends the user back to:
```
http://localhost:3000/api/auth/callback/azure-ad?code=AUTHORIZATION_CODE
```

#### 6. NextAuth Exchanges Code for Tokens

Behind the scenes, NextAuth makes a POST request to Microsoft:
```
POST https://login.microsoftonline.com/common/oauth2/v2.0/token
{
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "code": "AUTHORIZATION_CODE",
  "grant_type": "authorization_code"
}
```

Microsoft responds with:
```json
{
  "access_token": "eyJ0eXAiOiJKV1...",
  "refresh_token": "0.ARoA6WgJJ...",
  "expires_in": 3600,
  "id_token": "eyJ0eXAiOiJKV1..."
}
```

#### 7. NextAuth Creates a Session

**File:** `lib/auth.ts` (callbacks)

```ts
async jwt({ token, account }) {
  if (account) {
    token.accessToken = account.access_token  // Store it!
    token.refreshToken = account.refresh_token
    token.expiresAt = account.expires_at
  }
  return token
}
```

The JWT token is:
1. Encrypted using `NEXTAUTH_SECRET`
2. Stored in a cookie named `next-auth.session-token`
3. Sent to the browser

#### 8. User is Redirected to Dashboard

NextAuth redirects to `/dashboard` with the session cookie set.

---

## File Structure Explained

### Core Files

#### `app/layout.tsx` - Root Layout
- Wraps every page
- Imports global CSS
- Sets up HTML structure
- Think of it as the "shell" of your app

#### `app/page.tsx` - Homepage
- The landing page (/)
- Shows sign-in button
- Public (no authentication required)

#### `app/dashboard/page.tsx` - Dashboard
- Protected route (requires authentication)
- Fetches and displays Microsoft Graph data
- Client component (uses React hooks)

#### `app/api/auth/[...nextauth]/route.ts` - Auth Handler
- Creates all NextAuth endpoints
- Handles sign-in, sign-out, callbacks
- You rarely need to touch this file

#### `app/api/graph/me/route.ts` - Graph API Endpoint
- Server-side API route
- Fetches data from Microsoft Graph
- Returns JSON to the dashboard

### Library Files

#### `lib/auth.ts` - NextAuth Configuration
- Defines which providers to use (Azure AD)
- Configures what data to store in session
- Sets up OAuth scopes
- **This is where you add more permissions**

#### `lib/graph.ts` - Graph API Helpers
- Functions for calling Microsoft Graph API
- Handles authentication with access token
- Example functions:
  - `getUserProfile()` - Get user info
  - `getOrganization()` - Get tenant info
  - `getSecureScore()` - Get security score

### Type Definitions

#### `types/next-auth.d.ts` - TypeScript Types
- Extends NextAuth's built-in types
- Tells TypeScript that `session.accessToken` exists
- Prevents type errors in your code

### Configuration Files

#### `package.json` - Dependencies
- Lists all npm packages used
- Defines scripts (`npm run dev`, `npm run build`)
- Version information

#### `tsconfig.json` - TypeScript Config
- Tells TypeScript how to compile
- Sets up path aliases (`@/` = root folder)

#### `tailwind.config.js` - Tailwind CSS Config
- Customizes Tailwind utilities
- Defines brand colors
- Adds custom styles

#### `next.config.js` - Next.js Config
- Next.js framework settings
- Currently minimal (using defaults)

#### `.env.example` - Environment Variables Template
- Shows what secrets are needed
- Never contains actual secrets
- Committed to git

#### `.env.local` - Actual Secrets
- Contains your real API keys and secrets
- **NEVER** committed to git
- Listed in `.gitignore`

---

## How Microsoft Graph API Works

### What is Microsoft Graph?

Microsoft Graph is a REST API that provides access to:
- User data (profile, email, calendar)
- Organization data (tenant info, domains)
- Security data (alerts, secure score, policies)
- Files (OneDrive, SharePoint)
- Teams, Outlook, and more

Documentation: https://learn.microsoft.com/en-us/graph/overview

### Authentication

Every Graph API request needs an **access token**.

**Getting the token:**
```ts
// In dashboard, we get it from the session
const { data: session } = useSession()
const accessToken = session.accessToken
```

**Using the token:**
```ts
// In API route
const client = createGraphClient(accessToken)
const user = await client.api('/me').get()
```

### Common Endpoints

| Endpoint | Returns | Requires Scope |
|----------|---------|----------------|
| `/me` | Current user profile | `User.Read` |
| `/organization` | Tenant information | `Organization.Read.All` |
| `/security/secureScores` | Secure score | `SecurityEvents.Read.All` |
| `/me/messages` | User's emails | `Mail.Read` |
| `/users` | All users in tenant | `User.Read.All` |

### Example API Call

```ts
// lib/graph.ts
export async function getUserProfile(accessToken: string) {
  const client = createGraphClient(accessToken)
  
  // GET https://graph.microsoft.com/v1.0/me
  const user = await client.api('/me').get()
  
  return user
  // Returns: { displayName, mail, userPrincipalName, id, ... }
}
```

### Rate Limits

Microsoft Graph has rate limits:
- **User-level:** 2,000 requests per user per second
- **Tenant-level:** 30,000 requests per app per second

For our use case (scanning one tenant at a time), these limits are generous.

---

## Security Architecture

### 1. OAuth 2.0 Flow (Industry Standard)

We use **delegated permissions**, not application permissions.

**Delegated = User's Permissions**
- App can only access what the user can access
- Requires user to sign in
- Access token represents the user

**Application = App's Permissions**
- App has its own permissions (no user needed)
- Uses client credentials (dangerous if leaked)
- We DON'T use this

### 2. Token Storage

**Where tokens are stored:**
- Access tokens: In encrypted JWT cookie
- JWT cookie: Encrypted with `NEXTAUTH_SECRET`
- Cookie: HttpOnly (can't be accessed by JavaScript)
- Cookie: Secure (only sent over HTTPS in production)

**Token lifetime:**
- Access token: 1 hour (default)
- Refresh token: 90 days (configurable)
- Session cookie: 24 hours (configurable)

### 3. No Database (For MVP)

Currently, we don't store anything persistently:
- No database
- No user records
- No credentials stored

Everything is ephemeral:
- User signs in → gets session cookie
- User makes requests → we use their access token
- User signs out → cookie is deleted

**For production:** You'll add a database to store scan results, not credentials.

### 4. Multi-Tenant Isolation

Each user only sees their own tenant's data:
- Access token is scoped to their tenant
- We never mix data between tenants
- Each request includes the user's access token

**How it works:**
```ts
// User from Tenant A signs in
// Their access token can only query Tenant A's data

// User from Tenant B signs in
// Their access token can only query Tenant B's data

// No cross-tenant data access possible
```

### 5. Read-Only Access

Our app requests **read-only** scopes:
- `User.Read` (not `User.ReadWrite`)
- `Organization.Read.All` (not `Organization.ReadWrite.All`)
- `SecurityEvents.Read.All` (not `SecurityEvents.ReadWrite.All`)

We CANNOT:
- Modify user data
- Change security settings
- Delete anything
- Create new resources

**For Maester integration:** Some checks require read-only access to conditional access policies. We'll add those scopes when needed.

---

## Data Flow

### User Dashboard Load

```
1. Browser requests /dashboard
   ↓
2. Next.js checks session cookie
   ↓
3. If authenticated, render dashboard page
   ↓
4. Dashboard makes fetch('/api/graph/me')
   ↓
5. API route gets session from cookie
   ↓
6. API route extracts accessToken from session
   ↓
7. API route calls Microsoft Graph API with accessToken
   ↓
8. Microsoft Graph returns user + org data
   ↓
9. API route returns JSON to dashboard
   ↓
10. Dashboard displays data to user
```

### Sign Out Flow

```
1. User clicks "Sign Out"
   ↓
2. Calls signOut() from NextAuth
   ↓
3. NextAuth deletes session cookie
   ↓
4. Redirects to homepage
   ↓
5. User is logged out
```

Note: The access token at Microsoft is NOT revoked. It expires naturally after 1 hour.

---

## Technology Choices

### Why Next.js?

- **Full-stack framework:** API routes + frontend in one codebase
- **React-based:** Popular, well-documented, lots of libraries
- **TypeScript support:** Catch errors before runtime
- **App Router:** Modern, server components, better performance
- **Easy deployment:** Vercel is optimized for Next.js

### Why NextAuth?

- **Industry standard:** Most popular auth library for Next.js
- **Built-in providers:** Azure AD, Google, GitHub, etc.
- **Session management:** Handles cookies, JWT, CSRF automatically
- **Secure by default:** Follows OAuth best practices
- **No database required:** Works with JWT strategy

### Why Microsoft Graph?

- **Official Microsoft API:** Stable, well-documented
- **Comprehensive:** Access to all M365 data in one API
- **Consistent:** Same patterns across all endpoints
- **Client libraries:** Official SDKs for JavaScript, Python, etc.

### Why Tailwind CSS?

- **Utility-first:** Faster than writing custom CSS
- **Responsive:** Mobile-first design patterns
- **Customizable:** Easy to add brand colors
- **Small bundle:** Only includes CSS you actually use

### Why TypeScript?

- **Type safety:** Catch errors in VS Code before running code
- **IntelliSense:** Auto-complete for APIs and props
- **Self-documenting:** Types serve as inline documentation
- **Refactoring:** Rename variables safely across files

---

## Next Steps

Now that you understand the architecture:

1. ✅ Authentication is working
2. ✅ Microsoft Graph integration is working
3. 🚧 Add Maester integration (see NEXT_STEPS.md)
4. 🚧 Add database for storing scan results
5. 🚧 Build compliance framework mapping
6. 🚧 Create PDF report generation

Each feature builds on this foundation. The authentication and Graph API access is the hard part - you've got that working!

---

## Useful Resources

- **Next.js Docs:** https://nextjs.org/docs
- **NextAuth Docs:** https://next-auth.js.org/
- **Microsoft Graph Docs:** https://learn.microsoft.com/en-us/graph/
- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/
