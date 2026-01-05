/**
 * TYPE DEFINITIONS
 * 
 * This file extends NextAuth types to include custom properties
 * that we get from Microsoft authentication.
 * 
 * Why this is needed:
 * - By default, NextAuth session doesn't know about accessToken
 * - We need the accessToken to call Microsoft Graph API
 * - TypeScript needs to know these properties exist
 */

import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

// Extend the built-in session type
declare module "next-auth" {
  interface Session {
    // Add accessToken to the session
    // This is the OAuth token we'll use to call Microsoft Graph API
    accessToken?: string
    
    // Keep the standard user info
    user: {
      // User's email, name, etc. from Microsoft
      email?: string | null
      name?: string | null
      image?: string | null
      
      // Add tenant ID - useful for tracking which M365 tenant they're from
      tenantId?: string
    } & DefaultSession["user"]
  }
}

// Extend the JWT type to include our custom properties
declare module "next-auth/jwt" {
  interface JWT {
    // Store the access token in the JWT
    accessToken?: string
    
    // Store refresh token (for when access token expires)
    refreshToken?: string
    
    // Store tenant ID
    tenantId?: string
    
    // Store when the token expires (Unix timestamp)
    expiresAt?: number
  }
}
