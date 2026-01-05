/**
 * NEXTAUTH CONFIGURATION
 * 
 * This is the core authentication configuration for the application.
 * 
 * What it does:
 * 1. Configures Microsoft/Azure AD as the authentication provider
 * 2. Handles the OAuth flow (redirect to Microsoft, get tokens back)
 * 3. Stores the access token in the session for API calls
 * 4. Supports multi-tenant authentication (any M365 organization)
 * 
 * Security notes:
 * - Access tokens are stored in encrypted JWT cookies
 * - Refresh tokens allow getting new access tokens without re-login
 * - Session expires when Microsoft access token expires
 * 
 * Learn more about NextAuth: https://next-auth.js.org/
 * Learn more about Azure AD provider: https://next-auth.js.org/providers/azure-ad
 */

import { NextAuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    AzureADProvider({
      // These come from your Azure AD App Registration
      // See SETUP.md for instructions on getting these values
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      
      // Tenant configuration
      // "common" = multi-tenant (any Microsoft account can sign in)
      // Use a specific tenant ID to restrict to one organization
      tenantId: process.env.AZURE_AD_TENANT_ID || "common",
      
      // Authorization parameters
      authorization: {
        params: {
          // Scopes determine what data your app can access
          // User.Read = basic profile info (email, name)
          // Organization.Read.All = tenant info (name, domain)
          // SecurityEvents.Read.All = security alerts (for future features)
          // offline_access = get refresh token
          scope: "openid profile email User.Read Organization.Read.All SecurityEvents.Read.All offline_access",
        },
      },
    }),
  ],

  // Callbacks allow you to control what happens at various stages
  callbacks: {
    /**
     * JWT Callback
     * 
     * Runs whenever a JWT is created or updated.
     * This is where we add the Microsoft access token to our JWT.
     * 
     * Flow:
     * 1. User signs in with Microsoft
     * 2. Microsoft sends back account data and tokens
     * 3. We store those tokens in the JWT
     * 4. JWT is encrypted and stored in a cookie
     */
    async jwt({ token, account, profile }) {
      // On initial sign in, account object will exist
      if (account) {
        // Store the access token from Microsoft
        token.accessToken = account.access_token
        
        // Store the refresh token (to get new access tokens)
        token.refreshToken = account.refresh_token
        
        // Store when this token expires (Unix timestamp)
        token.expiresAt = account.expires_at
        
        // Store tenant ID from the profile
        // This tells us which M365 organization the user is from
        token.tenantId = (profile as any)?.tid
      }

      // TODO: Add token refresh logic here
      // When token.expiresAt is in the past, use refresh_token to get new access_token
      // For MVP, tokens last 1 hour - users just re-login if expired

      return token
    },

    /**
     * Session Callback
     * 
     * Runs whenever session data is accessed (every page load).
     * This is where we add the access token to the session object.
     * 
     * Why:
     * The session object is what's available in your React components.
     * By adding accessToken here, you can call Microsoft Graph API from any page.
     */
    async session({ session, token }) {
      // Add the access token to the session
      // Now you can access it via: session.accessToken
      session.accessToken = token.accessToken as string
      
      // Add tenant ID to session
      if (session.user) {
        session.user.tenantId = token.tenantId as string
      }

      return session
    },
  },

  // Custom pages
  pages: {
    // Redirect to homepage if sign in fails
    signIn: "/",
    // You can customize these later:
    // signOut: '/auth/signout',
    // error: '/auth/error',
  },

  // Session strategy
  // "jwt" = sessions stored in encrypted cookies (no database needed)
  session: {
    strategy: "jwt",
    // Sessions last 24 hours by default
    maxAge: 24 * 60 * 60, // 24 hours in seconds
  },

  // Enable debug messages in development
  debug: process.env.NODE_ENV === "development",
}
