/**
 * MICROSOFT GRAPH API ENDPOINT
 * 
 * This API route fetches data from Microsoft Graph API.
 * 
 * Endpoint: GET /api/graph/me
 * 
 * What it does:
 * 1. Gets the user's access token from their session
 * 2. Calls Microsoft Graph API to get user profile and organization info
 * 3. Returns the data as JSON
 * 
 * Security:
 * - Only authenticated users can access this endpoint
 * - Uses the user's own access token (they can only see their own data)
 * - No data is stored - it's fetched fresh from Microsoft each time
 * 
 * This is a proof-of-concept that authentication works.
 * Later, you'll add similar endpoints for:
 * - /api/scan/run - Run Maester security checks
 * - /api/compliance/status - Get compliance scores
 * - /api/reports/generate - Generate PDF reports
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getUserProfile, getOrganization, getSecureScore } from "@/lib/graph"

/**
 * GET /api/graph/me
 * 
 * Returns:
 * - user: Current user's profile (name, email, etc.)
 * - organization: Tenant information (name, domains, etc.)
 * - secureScore: Microsoft Secure Score (if available)
 */
export async function GET(request: NextRequest) {
  try {
    // Get the user's session (contains access token)
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      )
    }

    // Fetch data from Microsoft Graph API using the user's access token
    const [user, organization, secureScore] = await Promise.all([
      getUserProfile(session.accessToken),
      getOrganization(session.accessToken),
      getSecureScore(session.accessToken), // May return null if not available
    ])

    // Return the data
    return NextResponse.json({
      user: {
        name: user.displayName,
        email: user.mail || user.userPrincipalName,
        id: user.id,
      },
      organization: {
        name: organization.displayName,
        id: organization.id,
        domains: organization.verifiedDomains?.map((d: any) => d.name),
      },
      secureScore: secureScore
        ? {
            current: secureScore.currentScore,
            max: secureScore.maxScore,
            percentage: Math.round(
              (secureScore.currentScore / secureScore.maxScore) * 100
            ),
          }
        : null,
      message: "Successfully connected to Microsoft Graph API",
    })
  } catch (error) {
    console.error("Error in /api/graph/me:", error)

    // Return error response
    return NextResponse.json(
      {
        error: "Failed to fetch data from Microsoft Graph API",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
