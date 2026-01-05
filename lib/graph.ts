/**
 * MICROSOFT GRAPH API CLIENT
 * 
 * This file provides helper functions for calling Microsoft Graph API.
 * 
 * What is Microsoft Graph API?
 * It's Microsoft's unified API for accessing M365 data:
 * - User information (email, name, photo)
 * - Organization details (tenant name, domains)
 * - Security data (alerts, secure score)
 * - And much more...
 * 
 * Documentation: https://learn.microsoft.com/en-us/graph/overview
 * 
 * How to use this:
 * 1. Get the user's access token from their session
 * 2. Pass it to createGraphClient()
 * 3. Make API calls using the client
 * 
 * Example:
 *   const client = createGraphClient(accessToken);
 *   const user = await client.api('/me').get();
 */

import { Client } from "@microsoft/microsoft-graph-client"

/**
 * Create a Microsoft Graph API client
 * 
 * @param accessToken - OAuth access token from user's session
 * @returns Graph API client ready to make authenticated requests
 */
export function createGraphClient(accessToken: string) {
  return Client.init({
    authProvider: (done) => {
      // Provide the access token for every request
      done(null, accessToken)
    },
  })
}

/**
 * Get the current user's profile information
 * 
 * Returns:
 * - displayName: User's full name
 * - mail: User's email address
 * - userPrincipalName: User's UPN (login name)
 * - id: User's unique ID
 * 
 * Requires: User.Read scope
 */
export async function getUserProfile(accessToken: string) {
  try {
    const client = createGraphClient(accessToken)
    const user = await client.api("/me").get()
    return user
  } catch (error) {
    console.error("Error fetching user profile:", error)
    throw new Error("Failed to fetch user profile from Microsoft Graph")
  }
}

/**
 * Get organization (tenant) information
 * 
 * Returns:
 * - displayName: Organization name
 * - id: Tenant ID
 * - verifiedDomains: List of verified domains
 * - technicalNotificationMails: Tech contact emails
 * 
 * Requires: Organization.Read.All scope
 * 
 * This is useful for identifying which M365 tenant the user belongs to
 */
export async function getOrganization(accessToken: string) {
  try {
    const client = createGraphClient(accessToken)
    // Note: /organization returns an array, we want the first (and usually only) item
    const organizations = await client.api("/organization").get()
    return organizations.value[0] // First organization in the tenant
  } catch (error) {
    console.error("Error fetching organization:", error)
    throw new Error("Failed to fetch organization from Microsoft Graph")
  }
}

/**
 * Get Microsoft Secure Score
 * 
 * Returns the tenant's current secure score, which measures
 * security posture across M365 services.
 * 
 * Requires: SecurityEvents.Read.All scope
 * 
 * This will be useful later for showing compliance metrics
 */
export async function getSecureScore(accessToken: string) {
  try {
    const client = createGraphClient(accessToken)
    // Get the latest secure score
    const response = await client
      .api("/security/secureScores")
      .top(1) // Get just the most recent score
      .get()
    return response.value[0]
  } catch (error) {
    console.error("Error fetching secure score:", error)
    // Don't throw here - secure score might not be available in all tenants
    return null
  }
}

/**
 * Test connection to Microsoft Graph API
 * 
 * Makes a simple API call to verify:
 * 1. Access token is valid
 * 2. User has required permissions
 * 3. API is accessible
 * 
 * Returns true if successful, false otherwise
 */
export async function testGraphConnection(accessToken: string): Promise<boolean> {
  try {
    const client = createGraphClient(accessToken)
    await client.api("/me").get()
    return true
  } catch (error) {
    console.error("Graph API connection test failed:", error)
    return false
  }
}
