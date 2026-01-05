/**
 * HOME PAGE
 * 
 * This is the landing page (/) that users see when they first visit.
 * 
 * What it does:
 * - Shows Stratum Security branding
 * - Displays "Sign in with Microsoft" button
 * - Explains what the portal does
 * 
 * The sign-in button redirects to /api/auth/signin which is handled by NextAuth.
 * After successful login, users are redirected to /dashboard
 */

import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          
          {/* Header/Logo Section */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-white mb-4">
              Stratum Portal
            </h1>
            <p className="text-2xl text-slate-300">
              M365 Security & Compliance Monitoring
            </p>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-lg shadow-2xl p-8 md:p-12">
            
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              Continuous Compliance Visibility
            </h2>
            
            <p className="text-lg text-slate-600 mb-8">
              Monitor your Microsoft 365 environment against GDPR, ISO27001, and PCI-DSS frameworks. 
              Track security drift, identify compliance gaps, and get actionable remediation guidance.
            </p>

            {/* Features List */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-sky-500 text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-slate-900">Security Assessments</h3>
                  <p className="text-slate-600">Automated scans of your M365 configuration</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-sky-500 text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-slate-900">Compliance Tracking</h3>
                  <p className="text-slate-600">Map findings to GDPR, ISO27001, PCI-DSS</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-sky-500 text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-slate-900">Drift Detection</h3>
                  <p className="text-slate-600">Track changes to your security posture over time</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-sky-500 text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-slate-900">Actionable Reports</h3>
                  <p className="text-slate-600">Clear remediation guidance for every finding</p>
                </div>
              </div>
            </div>

            {/* Sign In Button */}
            <div className="text-center">
              <Link 
                href="/api/auth/signin"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-lg transition-colors duration-200"
              >
                <svg className="w-6 h-6 mr-3" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.5 0H0V11.5H11.5V0Z" fill="#F25022"/>
                  <path d="M23 0H11.5V11.5H23V0Z" fill="#7FBA00"/>
                  <path d="M11.5 11.5H0V23H11.5V11.5Z" fill="#00A4EF"/>
                  <path d="M23 11.5H11.5V23H23V11.5Z" fill="#FFB900"/>
                </svg>
                Sign in with Microsoft
              </Link>
              
              <p className="mt-4 text-sm text-slate-500">
                Secure authentication via Microsoft Entra ID (Azure AD)
              </p>
            </div>

          </div>

          {/* Footer */}
          <div className="text-center mt-12 text-slate-400">
            <p>Powered by Stratum Security | Enterprise-grade security for SMEs</p>
          </div>

        </div>
      </div>
    </main>
  )
}
