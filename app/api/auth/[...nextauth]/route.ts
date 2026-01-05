/**
 * NEXTAUTH API ROUTE HANDLER
 * 
 * This file creates all the authentication endpoints:
 * - /api/auth/signin - Redirects to Microsoft login
 * - /api/auth/signout - Signs the user out
 * - /api/auth/callback - Microsoft redirects here after login
 * - /api/auth/session - Returns current session data
 * 
 * The [...nextauth] folder name is special Next.js syntax for "catch-all routes"
 * It means this file handles ALL paths under /api/auth/
 * 
 * You don't need to modify this file - it's just wiring NextAuth to Next.js
 * 
 * Learn more: https://next-auth.js.org/configuration/initialization#route-handlers-app
 */

import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// Create the handler using our auth configuration
const handler = NextAuth(authOptions)

// Export for both GET and POST requests
// NextAuth uses both depending on the authentication flow
export { handler as GET, handler as POST }
