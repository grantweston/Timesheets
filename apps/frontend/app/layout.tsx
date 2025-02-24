import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/app/providers/theme-provider"
import { ClerkProvider } from '@clerk/nextjs'
import { SupabaseProvider } from '@/app/providers/supabase-provider'
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TimeTrack AI",
  description: "AI-Powered Time Tracking and Invoicing",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <SupabaseProvider>
              {children}
            </SupabaseProvider>
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: 'rgb(var(--background))',
                  color: 'rgb(var(--foreground))',
                  border: '1px solid rgb(var(--border))',
                },
                className: 'dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700',
              }}
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}



import './globals.css'