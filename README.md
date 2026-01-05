# Stratum Portal

**M365 Security & Compliance Monitoring Platform**

A white-labeled web portal for running automated security assessments on Microsoft 365 tenants, tracking compliance against frameworks (GDPR, ISO27001, PCI-DSS), detecting security drift, and providing remediation guidance.

## 🎯 Project Status: MVP Phase 1

**Current Features:**
- ✅ Multi-tenant Microsoft authentication (works with any M365 organization)
- ✅ OAuth 2.0 secure authentication flow
- ✅ Microsoft Graph API integration
- ✅ User and organization data display
- ✅ Microsoft Secure Score retrieval

**Coming Soon:**
- 🚧 Maester security check integration
- 🚧 Compliance framework mapping
- 🚧 Historical tracking and drift detection
- 🚧 PDF report generation
- 🚧 Database for storing scan results

## 🏗️ Architecture Overview

```
stratum-portal/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Homepage (sign-in page)
│   ├── dashboard/               # Protected dashboard route
│   │   └── page.tsx            # Main dashboard after sign-in
│   ├── api/                     # API routes
│   │   ├── auth/               # NextAuth authentication endpoints
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   └── graph/              # Microsoft Graph API endpoints
│   │       └── me/
│   │           └── route.ts
│   ├── layout.tsx              # Root layout wrapper
│   └── globals.css             # Global styles with Tailwind
├── lib/                         # Utility libraries
│   ├── auth.ts                 # NextAuth configuration
│   └── graph.ts                # Microsoft Graph API helpers
├── types/                       # TypeScript type definitions
│   └── next-auth.d.ts          # Extended NextAuth types
├── .env.example                 # Environment variables template
├── package.json                # Dependencies and scripts
└── Documentation/              # Setup and architecture docs
    ├── SETUP.md
    ├── ARCHITECTURE.md
    └── NEXT_STEPS.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Microsoft account (personal or work)
- Azure account for creating app registration

### Installation

1. **Clone or extract this project**
   ```bash
   cd stratum-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example file
   copy .env.example .env.local
   
   # Edit .env.local with your Azure AD credentials
   # See SETUP.md for detailed instructions
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup instructions including:
  - Installing Node.js on Windows
  - Creating Azure AD app registration
  - Configuring environment variables
  - Testing the application

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical documentation covering:
  - How authentication works
  - How Microsoft Graph API integration works
  - Project file structure explained
  - Security considerations

- **[NEXT_STEPS.md](./NEXT_STEPS.md)** - Roadmap and development guide:
  - Adding Maester integration
  - Building compliance features
  - Database setup
  - Deployment to production

## 🔒 Security Features

- OAuth 2.0 authentication (industry standard)
- Encrypted JWT sessions (no passwords stored)
- Read-only Microsoft Graph API access
- Multi-tenant isolation (users only see their own tenant data)
- No browser storage (no localStorage/sessionStorage)
- Environment variables for secrets (never committed to git)

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (React, TypeScript)
- **Authentication:** NextAuth.js with Azure AD provider
- **API:** Microsoft Graph API
- **Styling:** Tailwind CSS
- **Deployment:** Vercel (recommended)

## 📊 Current State

This MVP demonstrates:
1. Users can sign in with their Microsoft 365 account
2. The app fetches their profile and organization data via Graph API
3. Secure multi-tenant authentication works
4. Microsoft Secure Score can be retrieved

**This proves the foundation works.** Now you can build on top:
- Add security scanning (Maester)
- Store results in a database
- Build compliance dashboards
- Generate reports

## 🤝 Development Team

- **Technical Lead:** You (building the platform)
- **Commercial Lead:** Your co-founder (validation, sales, marketing)

## 📞 Support

For questions or issues:
1. Check the documentation in `SETUP.md` and `ARCHITECTURE.md`
2. Review error messages in the browser console (F12)
3. Check server logs in your terminal where `npm run dev` is running

## 📝 License

Private/Proprietary - Stratum Security
