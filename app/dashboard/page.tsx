/**
 * DASHBOARD PAGE
 * 
 * This is the main dashboard that users see after signing in.
 * 
 * What it does:
 * 1. Checks if user is authenticated (redirects to sign-in if not)
 * 2. Fetches user and organization data from Microsoft Graph API
 * 3. Displays the data in a clean interface
 * 
 * This is a client component because it:
 * - Uses React hooks (useState, useEffect)
 * - Handles user interactions
 * - Fetches data after page load
 * 
 * Security:
 * - Only accessible to authenticated users
 * - Uses the user's session token to call Graph API
 * - No sensitive data is exposed in the URL or visible to other users
 */

'use client'

import { useSession, signOut, SessionProvider } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Type definition for the data we get from /api/graph/me
interface GraphData {
  user: {
    name: string
    email: string
    id: string
  }
  organization: {
    name: string
    id: string
    domains: string[]
  }
  secureScore: {
    current: number
    max: number
    percentage: number
  } | null
  message: string
}

function DashboardContent() {
  const router = useRouter()
  const { data: session, status } = useSession()
  
  // State for storing Graph API data
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect to home if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  // Fetch data from Microsoft Graph API when session is ready
  useEffect(() => {
    async function fetchGraphData() {
      if (status === 'authenticated') {
        try {
          setLoading(true)
          const response = await fetch('/api/graph/me')
          
          if (!response.ok) {
            throw new Error('Failed to fetch data from Microsoft Graph')
          }
          
          const data = await response.json()
          setGraphData(data)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unknown error occurred')
        } finally {
          setLoading(false)
        }
      }
    }

    fetchGraphData()
  }, [status])

  // Show loading spinner while checking authentication
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error if data fetch failed
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Data</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Stratum Portal</h1>
            <p className="text-sm text-slate-600">M365 Security & Compliance Dashboard</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-4 py-2 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome, {session?.user?.name}!
          </h2>
          <p className="text-slate-600">
            Here's an overview of your Microsoft 365 environment
          </p>
        </div>

        {/* Data Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          
          {/* User Information Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Your Profile
            </h3>
            {graphData && (
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-slate-500">Name</dt>
                  <dd className="text-base text-slate-900">{graphData.user.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Email</dt>
                  <dd className="text-base text-slate-900">{graphData.user.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">User ID</dt>
                  <dd className="text-xs text-slate-600 font-mono">{graphData.user.id}</dd>
                </div>
              </dl>
            )}
          </div>

          {/* Organization Information Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Organization
            </h3>
            {graphData && (
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-slate-500">Name</dt>
                  <dd className="text-base text-slate-900">{graphData.organization.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Tenant ID</dt>
                  <dd className="text-xs text-slate-600 font-mono">{graphData.organization.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Verified Domains</dt>
                  <dd className="text-sm text-slate-900">
                    {graphData.organization.domains.join(', ')}
                  </dd>
                </div>
              </dl>
            )}
          </div>

        </div>

        {/* Secure Score Card (if available) */}
        {graphData?.secureScore && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Microsoft Secure Score
            </h3>
            <div className="flex items-end">
              <div className="text-5xl font-bold text-slate-900">
                {graphData.secureScore.current}
              </div>
              <div className="text-2xl text-slate-500 ml-2 mb-1">
                / {graphData.secureScore.max}
              </div>
              <div className="ml-4 mb-1">
                <span className="text-2xl font-semibold text-sky-600">
                  {graphData.secureScore.percentage}%
                </span>
              </div>
            </div>
            <div className="mt-4 bg-slate-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-sky-600 h-full transition-all duration-500"
                style={{ width: `${graphData.secureScore.percentage}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Your organization's current security posture across Microsoft 365 services
            </p>
          </div>
        )}

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-lg font-semibold text-green-900 mb-2">
                Authentication Successful! 🎉
              </h4>
              <p className="text-green-800 mb-2">
                {graphData?.message}
              </p>
              <p className="text-sm text-green-700">
                Your Microsoft 365 tenant is successfully connected to Stratum Portal. 
                This proves that OAuth authentication is working and we can access your 
                tenant's data via Microsoft Graph API.
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps Section */}
        <div className="mt-8 bg-sky-50 border border-sky-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-sky-900 mb-3">
            What's Next?
          </h4>
          <ul className="space-y-2 text-sky-800">
            <li className="flex items-start">
              <span className="text-sky-600 mr-2">→</span>
              <span>Add Maester integration to run security checks</span>
            </li>
            <li className="flex items-start">
              <span className="text-sky-600 mr-2">→</span>
              <span>Build compliance framework mapping (GDPR, ISO27001, PCI-DSS)</span>
            </li>
            <li className="flex items-start">
              <span className="text-sky-600 mr-2">→</span>
              <span>Create historical tracking to detect security drift</span>
            </li>
            <li className="flex items-start">
              <span className="text-sky-600 mr-2">→</span>
              <span>Generate PDF reports with remediation guidance</span>
            </li>
          </ul>
        </div>

      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <SessionProvider>
      <DashboardContent />
    </SessionProvider>
  )
}
