'use client'

import { useState, useEffect } from 'react'
import { ThemeProvider } from "@/components/theme-provider"
import { SessionTimeoutWarning } from "@/components/session-timeout-warning"
import { useSessionTimeout } from "@/hooks/use-session-timeout"

function SessionTimeoutProvider({ children }: { children: React.ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { showWarning, timeLeft } = useSessionTimeout(refreshTrigger)

  // Function to refresh session settings (can be called from anywhere)
  const refreshSessionSettings = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  // Make refresh function available globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).refreshSessionSettings = refreshSessionSettings
    }
  }, [])

  return (
    <>
      {children}
      <SessionTimeoutWarning isOpen={showWarning} timeLeft={timeLeft} />
    </>
  )
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionTimeoutProvider>{children}</SessionTimeoutProvider>
    </ThemeProvider>
  )
}