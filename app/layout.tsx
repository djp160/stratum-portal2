/**
 * ROOT LAYOUT
 * 
 * This is the root layout that wraps your entire application.
 * 
 * What it does:
 * - Sets up HTML structure and metadata
 * - Imports global styles
 * - Provides SessionProvider for authentication context
 * 
 * This file runs on every page, so keep it lightweight.
 * 
 * Learn more: https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts
 */

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stratum Portal | M365 Security & Compliance',
  description: 'Enterprise-grade Microsoft 365 security and compliance monitoring for SMEs',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* 
          All pages render inside this children prop.
          Authentication context is available to all pages via NextAuth.
        */}
        {children}
      </body>
    </html>
  )
}
