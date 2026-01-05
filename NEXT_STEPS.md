# Next Steps & Development Roadmap

Now that authentication is working, here's how to build out the full platform.

## Table of Contents
1. [Immediate Next Steps (Week 1-2)](#immediate-next-steps-week-1-2)
2. [Phase 2: Maester Integration (Week 3-4)](#phase-2-maester-integration-week-3-4)
3. [Phase 3: Database & History (Week 5-6)](#phase-3-database--history-week-5-6)
4. [Phase 4: Compliance Frameworks (Week 7-8)](#phase-4-compliance-frameworks-week-7-8)
5. [Phase 5: Reports & Polish (Week 9-10)](#phase-5-reports--polish-week-9-10)
6. [Deployment to Production](#deployment-to-production)
7. [Business Validation Alongside Development](#business-validation-alongside-development)

---

## Immediate Next Steps (Week 1-2)

### 1. Test with Multiple Tenants

**Goal:** Verify multi-tenant isolation works

**Steps:**
1. Sign in with your work account (business tenant)
2. Sign out
3. Sign in with a different Microsoft account (personal or different work account)
4. Verify you see different data for each account
5. Confirm no data leakage between tenants

**What you're testing:**
- Authentication works for multiple users
- Each user only sees their own tenant data
- Session management is working correctly

### 2. Get Your Co-Founder Testing

**Goal:** External validation that it works

**Steps:**
1. Send them the running app (you'll need to expose it temporarily):
   ```bash
   # Install ngrok (for temporary public URL)
   npm install -g ngrok
   
   # Expose your local dev server
   ngrok http 3000
   ```

2. Send them the ngrok URL (e.g., `https://abc123.ngrok.io`)
3. Update Azure redirect URI temporarily:
   - Add: `https://abc123.ngrok.io/api/auth/callback/azure-ad`
4. Have them sign in with their Microsoft account
5. Verify they see their own tenant data

**What to ask them:**
- Was sign-in intuitive?
- Is the dashboard clear?
- What data would be most useful to see?
- What actions do they want to take?

### 3. Document Your API Permissions

**Goal:** Know what you can and can't do

**Steps:**
1. Create a file `docs/PERMISSIONS.md`
2. List current permissions:
   - `User.Read` - Basic profile
   - `Organization.Read.All` - Tenant info
   - `SecurityEvents.Read.All` - Security alerts
3. List permissions you'll need for Maester:
   - `Policy.Read.All` - Conditional Access policies
   - `Directory.Read.All` - Azure AD config
   - `Application.Read.All` - App registrations
4. Plan when to request admin consent

---

## Phase 2: Maester Integration (Week 3-4)

### Overview

Maester is a PowerShell-based tool for testing M365 security. We need to:
1. Run Maester checks from your Node.js app
2. Parse the results
3. Display them in the dashboard

### Option A: Call Maester via PowerShell (Easier)

**File: `lib/maester.ts`**

```typescript
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function runMaesterTests(accessToken: string) {
  // Run Maester PowerShell script
  const command = `
    pwsh -Command "
      Import-Module Maester;
      Connect-Maester -AccessToken '${accessToken}';
      Invoke-MaesterTests -OutputFormat Json
    "
  `
  
  const { stdout } = await execAsync(command)
  return JSON.parse(stdout)
}
```

**Pros:**
- Uses official Maester tool
- Gets updates when Maester improves
- Familiar tool

**Cons:**
- Requires PowerShell installed on server
- Slower than native API calls
- Harder to control execution

### Option B: Call Graph API Directly (Harder, but Better)

**What Maester checks:**

Maester tests M365 configuration against security best practices. For example:
- Is MFA enforced?
- Are conditional access policies configured?
- Is legacy authentication blocked?
- Are guest user policies secure?

**Implementation:**

```typescript
// lib/security-checks.ts

interface SecurityCheck {
  id: string
  name: string
  description: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  passed: boolean
  details: string
}

export async function checkMfaEnforcement(accessToken: string): Promise<SecurityCheck> {
  const client = createGraphClient(accessToken)
  
  // Get conditional access policies
  const policies = await client.api('/identity/conditionalAccess/policies').get()
  
  // Check if any policy enforces MFA
  const mfaPolicies = policies.value.filter((p: any) => 
    p.grantControls?.builtInControls?.includes('mfa')
  )
  
  return {
    id: 'check-mfa-001',
    name: 'Multi-Factor Authentication Required',
    description: 'Verify that MFA is enforced for all users',
    severity: 'Critical',
    passed: mfaPolicies.length > 0,
    details: mfaPolicies.length > 0 
      ? `Found ${mfaPolicies.length} policies enforcing MFA`
      : 'No MFA enforcement policies found'
  }
}
```

**Start with 5-10 critical checks:**
1. MFA enforcement
2. Legacy authentication blocked
3. Admin MFA required
4. Guest user restrictions
5. Password policies
6. Conditional access configured
7. Security defaults enabled (if no CA policies)
8. Self-service password reset enabled
9. Privileged Identity Management configured
10. Audit logging enabled

**Pros:**
- Full control over checks
- Faster execution
- Works anywhere (no PowerShell needed)
- Easier to customize

**Cons:**
- More work to build
- Need to keep up with Microsoft security best practices
- Requires more Graph API permissions

**Recommendation:** Start with Option B. Build 5-10 critical checks. You can always add Maester later as a supplement.

### Next: Display Results

**File: `app/dashboard/page.tsx`** (add to existing)

```typescript
const [scanResults, setScanResults] = useState<SecurityCheck[]>([])

async function runScan() {
  const response = await fetch('/api/scan/run')
  const results = await response.json()
  setScanResults(results.checks)
}
```

**Add a "Run Scan" button:**
```typescript
<button onClick={runScan}>
  Run Security Scan
</button>
```

**Display results:**
```typescript
{scanResults.map(check => (
  <div key={check.id} className={check.passed ? 'bg-green-50' : 'bg-red-50'}>
    <h3>{check.name}</h3>
    <p>{check.details}</p>
    <span className={`badge ${check.severity.toLowerCase()}`}>
      {check.severity}
    </span>
  </div>
))}
```

---

## Phase 3: Database & History (Week 5-6)

### Why You Need a Database

Right now, every scan is ephemeral - results disappear when you refresh the page. You need to:
- Store scan results
- Track changes over time (drift detection)
- Show historical trends
- Generate reports from past scans

### Database Choice: Supabase (Recommended)

**Why Supabase:**
- Free tier (500MB database)
- PostgreSQL (powerful, reliable)
- Built-in API (auto-generates REST endpoints)
- Real-time subscriptions (optional)
- Easy authentication integration
- Row-level security (each tenant only sees their data)

**Alternative:** Railway, PlanetScale, or plain PostgreSQL

### Schema Design

```sql
-- Tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT UNIQUE NOT NULL, -- Microsoft tenant ID
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Scans table
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  scan_date TIMESTAMP DEFAULT NOW(),
  secure_score INTEGER,
  total_checks INTEGER,
  passed_checks INTEGER,
  failed_checks INTEGER,
  critical_issues INTEGER,
  high_issues INTEGER,
  medium_issues INTEGER,
  low_issues INTEGER
);

-- Check results table
CREATE TABLE check_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES scans(id),
  check_id TEXT NOT NULL,
  check_name TEXT NOT NULL,
  severity TEXT NOT NULL,
  passed BOOLEAN NOT NULL,
  details TEXT,
  remediation TEXT
);
```

### Integration Steps

1. **Sign up for Supabase:** https://supabase.com
2. **Create a new project** (free tier)
3. **Run the schema SQL** in Supabase SQL editor
4. **Get your connection string** from project settings
5. **Install Supabase client:**
   ```bash
   npm install @supabase/supabase-js
   ```

6. **Add to `.env.local`:**
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```

7. **Create Supabase client:**
   ```typescript
   // lib/supabase.ts
   import { createClient } from '@supabase/supabase-js'
   
   export const supabase = createClient(
     process.env.SUPABASE_URL!,
     process.env.SUPABASE_ANON_KEY!
   )
   ```

8. **Save scan results:**
   ```typescript
   // After running scan
   const { data: scan } = await supabase
     .from('scans')
     .insert({
       tenant_id: tenantId,
       secure_score: score,
       total_checks: results.length,
       passed_checks: results.filter(r => r.passed).length,
       failed_checks: results.filter(r => !r.passed).length
     })
     .select()
     .single()
   
   // Save individual check results
   await supabase
     .from('check_results')
     .insert(
       results.map(r => ({
         scan_id: scan.id,
         check_id: r.id,
         check_name: r.name,
         severity: r.severity,
         passed: r.passed,
         details: r.details
       }))
     )
   ```

### Historical Tracking

**Show trend over time:**
```typescript
// Get last 10 scans
const { data: scans } = await supabase
  .from('scans')
  .select('*')
  .eq('tenant_id', tenantId)
  .order('scan_date', { ascending: false })
  .limit(10)

// Display in a chart
<LineChart data={scans}>
  <Line dataKey="passed_checks" stroke="#22c55e" />
  <Line dataKey="failed_checks" stroke="#ef4444" />
</LineChart>
```

**Detect drift (changed results):**
```typescript
// Compare current scan to last scan
const lastScan = scans[1] // Previous scan
const currentScan = scans[0] // Latest scan

const newFailures = currentScan.check_results.filter(current => 
  !current.passed && 
  lastScan.check_results.find(last => 
    last.check_id === current.check_id && last.passed
  )
)

// Alert user: "3 new security issues detected since last scan"
```

---

## Phase 4: Compliance Frameworks (Week 7-8)

### Map Checks to Frameworks

Create a mapping file:

```typescript
// lib/compliance-mappings.ts

export const complianceMappings = {
  'check-mfa-001': {
    gdpr: ['Article 32(1)'], // Security of processing
    iso27001: ['A.9.4.2'], // Secure log-on procedures
    pciDss: ['Requirement 8.3'], // Multi-factor authentication
  },
  'check-legacy-auth-001': {
    gdpr: ['Article 32(1)'],
    iso27001: ['A.9.4.2'],
    pciDss: ['Requirement 8.2.1'], // Use strong cryptography
  },
  // ... map all your checks
}

export function getComplianceScore(
  results: SecurityCheck[],
  framework: 'gdpr' | 'iso27001' | 'pciDss'
): number {
  let total = 0
  let passed = 0
  
  results.forEach(check => {
    const mapping = complianceMappings[check.id]
    if (mapping && mapping[framework]) {
      total += mapping[framework].length
      if (check.passed) {
        passed += mapping[framework].length
      }
    }
  })
  
  return Math.round((passed / total) * 100)
}
```

### Compliance Dashboard

```typescript
<div className="grid grid-cols-3 gap-6">
  <ComplianceCard
    framework="GDPR"
    score={getComplianceScore(results, 'gdpr')}
    failedControls={getFailedControls(results, 'gdpr')}
  />
  <ComplianceCard
    framework="ISO 27001"
    score={getComplianceScore(results, 'iso27001')}
    failedControls={getFailedControls(results, 'iso27001')}
  />
  <ComplianceCard
    framework="PCI-DSS"
    score={getComplianceScore(results, 'pciDss')}
    failedControls={getFailedControls(results, 'pciDss')}
  />
</div>
```

### Framework-Specific Views

Allow filtering by framework:

```typescript
<select onChange={(e) => setSelectedFramework(e.target.value)}>
  <option value="all">All Checks</option>
  <option value="gdpr">GDPR Only</option>
  <option value="iso27001">ISO 27001 Only</option>
  <option value="pciDss">PCI-DSS Only</option>
</select>

{filteredResults.map(check => (
  <CheckResultCard
    check={check}
    frameworks={complianceMappings[check.id]}
  />
))}
```

---

## Phase 5: Reports & Polish (Week 9-10)

### PDF Report Generation

**Install PDF library:**
```bash
npm install jspdf jspdf-autotable
```

**Generate report:**
```typescript
// lib/reports.ts
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function generateComplianceReport(
  tenantName: string,
  scanDate: Date,
  results: SecurityCheck[],
  framework: string
) {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(20)
  doc.text('M365 Security & Compliance Report', 20, 20)
  doc.setFontSize(12)
  doc.text(`Organization: ${tenantName}`, 20, 30)
  doc.text(`Framework: ${framework}`, 20, 37)
  doc.text(`Scan Date: ${scanDate.toLocaleDateString()}`, 20, 44)
  
  // Summary
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  doc.text(`Results: ${passed} passed, ${failed} failed`, 20, 54)
  
  // Table of results
  autoTable(doc, {
    head: [['Check', 'Severity', 'Status', 'Details']],
    body: results.map(r => [
      r.name,
      r.severity,
      r.passed ? 'Pass' : 'Fail',
      r.details
    ]),
    startY: 60
  })
  
  // Save or download
  doc.save(`${tenantName}-compliance-report.pdf`)
}
```

### UI Polish Checklist

- [ ] Loading states (spinners while scanning)
- [ ] Error handling (show friendly errors)
- [ ] Empty states ("No scans yet, click Run Scan")
- [ ] Mobile responsive (test on phone)
- [ ] Keyboard navigation (tab through interface)
- [ ] ARIA labels for accessibility
- [ ] Print styles (if users want to print reports)
- [ ] Dark mode (optional but nice)

### Performance Optimization

- [ ] Lazy load dashboard components
- [ ] Cache Graph API responses (5 minutes)
- [ ] Paginate scan history (10 at a time)
- [ ] Optimize images (if any)
- [ ] Code splitting for large components

---

## Deployment to Production

### Step 1: Prepare for Production

1. **Environment variables:**
   - Create production secrets
   - Use different `NEXTAUTH_SECRET`
   - Update `NEXTAUTH_URL` to your domain

2. **Azure AD updates:**
   - Add production redirect URI: `https://portal.stratumsecurity.co.uk/api/auth/callback/azure-ad`
   - Change app name to "Stratum Portal" (remove "Development")

3. **Database:**
   - Use Supabase production instance (or upgrade to paid)
   - Set up backups
   - Enable row-level security

### Step 2: Deploy to Vercel (Recommended)

**Why Vercel:**
- Built for Next.js
- Free hobby tier
- Automatic HTTPS
- Global CDN
- Easy deployments

**Steps:**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Configure production environment variables:**
   ```bash
   vercel env add NEXTAUTH_SECRET
   vercel env add AZURE_AD_CLIENT_ID
   vercel env add AZURE_AD_CLIENT_SECRET
   # etc.
   ```

4. **Deploy production:**
   ```bash
   vercel --prod
   ```

**Domain setup:**
- Buy domain: `stratumsecurity.co.uk`
- Point to Vercel in DNS settings
- Vercel automatically provisions SSL

### Step 3: Set Up Monitoring

**Tools:**
- **Sentry** (error tracking) - free tier
- **Vercel Analytics** (page views, performance) - included
- **Uptime Robot** (ping your site every 5 minutes) - free

---

## Business Validation Alongside Development

While you're building, your co-founder should be:

### Week 1-2: Problem Validation
- Interview 10 IT managers at target companies
- Ask: "How do you currently handle M365 security audits?"
- Ask: "Would you want continuous visibility vs quarterly reports?"
- Document pain points

### Week 3-4: Pricing Validation
- Show mockups of the portal
- Ask: "Would you pay £750/month for this?"
- Test different tiers (£750, £1,500, £2,500)
- Get verbal commitments (not binding, but signals interest)

### Week 5-6: Feature Validation
- Demo the working portal (even without all features)
- Ask: "What would make this a must-have?"
- Prioritize features based on feedback
- Identify must-haves vs nice-to-haves

### Week 7-8: Pipeline Building
- Create prospect list (100+ companies)
- Cold outreach with demo link
- Book 20+ discovery calls
- Goal: 5 serious prospects

### Week 9-10: Pre-launch
- Offer early adopter discount (e.g., 50% off for 6 months)
- Get 3-5 "Day 1" commitments
- Collect testimonials (even before launch)
- Build urgency

**Launch Trigger:** 
- You have 3-5 Day 1 commitments (£2,250-£3,750/month)
- You have 20+ warm prospects
- The portal has core features working (scan, store, report)
- You have 6 months runway saved

---

## Prioritization Framework

Use this to decide what to build next:

| Feature | Business Impact | Technical Complexity | Priority |
|---------|----------------|---------------------|----------|
| Maester checks | High (core value) | Medium | **P0** |
| Database storage | High (required for history) | Low | **P0** |
| PDF reports | High (deliverable) | Medium | **P0** |
| Compliance mapping | High (differentiator) | Low | **P1** |
| Drift detection | Medium (retention) | Low | **P1** |
| Automated scheduling | Low (manual is fine) | Medium | **P2** |
| Email notifications | Low (nice to have) | Low | **P2** |
| Custom checks | Low (complex UI) | High | **P3** |

**P0 = Build now (MVP)**
**P1 = Build before launch**
**P2 = Build after launch**
**P3 = Build when scaling**

---

## Questions to Answer This Week

Before writing more code, answer:

1. **Who is the first customer?**
   - Name a specific company you'll approach
   - Why are they a good fit?
   - Do you have a contact there?

2. **What's the minimum viable scan?**
   - Which 5-10 checks MUST be in v1?
   - What can you skip for now?

3. **What does "good enough" look like?**
   - Perfect UI or functional UI?
   - All frameworks or just GDPR?
   - Automated or manual triggering?

4. **What's your quit timeline?**
   - 3 months? 6 months? 12 months?
   - What conditions trigger the decision?
   - What's the fallback plan?

Once you have clarity on these, the technical roadmap becomes obvious.

---

## Remember

**You're not building a SaaS unicorn.** You're building a tool that:
- Helps you deliver audits faster
- Justifies retainer pricing
- Positions you as the expert
- Makes your life easier, not harder

Keep it simple. Ship fast. Iterate based on real customer feedback.

Good luck! 🚀
