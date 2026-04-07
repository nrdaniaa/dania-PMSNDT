import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface SessionSettings {
  sessionTimeout: number
  warningTime: number
}

export function useSessionTimeout(refreshTrigger?: number) {
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [sessionSettings, setSessionSettings] = useState<SessionSettings | null>(null)

  const router = useRouter()
  const routerRef = useRef(router)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  const isMountedRef = useRef(false)

  // Keep router ref in sync
  useEffect(() => {
    routerRef.current = router
  }, [router])

  // Set mounted flag on mount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Fetch session settings
  const fetchSessionSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session-settings')
      if (response.ok && isMountedRef.current) {
        const settings = await response.json()
        setSessionSettings(settings)
      }
    } catch (error) {
      console.error('Failed to fetch session settings:', error)
    }
  }, [])

  // Clear auth token and redirect to login
  const logout = useCallback(() => {
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    // Use setTimeout to ensure router navigation happens after render cycle completes
    setTimeout(() => {
      if (routerRef.current) {
        routerRef.current.push('/login')
      }
    }, 0)
  }, [])

  // Reset timers
  const resetTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
      warningTimeoutRef.current = null
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
    if (isMountedRef.current) {
      setShowWarning(false)
      setTimeLeft(0)
    }
    lastActivityRef.current = Date.now()
  }, [])

  // Start session timeout
  const startTimeout = useCallback(() => {
    if (!sessionSettings) return

    resetTimers()

    const warningTime = sessionSettings.sessionTimeout - sessionSettings.warningTime

    // Set warning timeout
    warningTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setShowWarning(true)
        setTimeLeft(Math.floor(sessionSettings.warningTime / 1000))
      }

      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        if (isMountedRef.current) {
          setTimeLeft(prev => {
            if (prev <= 1) {
              if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current)
                countdownIntervalRef.current = null
              }
              logout()
              return 0
            }
            return prev - 1
          })
        }
      }, 1000)
    }, warningTime)

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      logout()
    }, sessionSettings.sessionTimeout)
  }, [sessionSettings, resetTimers, logout])

  // Activity handler
  const handleActivity = useCallback(() => {
    if (sessionSettings) {
      startTimeout()
    }
  }, [sessionSettings, startTimeout])

  // Initialize
  useEffect(() => {
    fetchSessionSettings()
  }, [fetchSessionSettings])

  // Re-fetch settings when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchSessionSettings()
    }
  }, [refreshTrigger, fetchSessionSettings])

  // Start timeout when settings are loaded
  useEffect(() => {
    if (sessionSettings) {
      startTimeout()
    }
  }, [sessionSettings, startTimeout])

  // Set up activity listeners
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

    const handleActivityEvent = () => {
      handleActivity()
    }

    events.forEach(event => {
      document.addEventListener(event, handleActivityEvent, true)
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivityEvent, true)
      })
    }
  }, [handleActivity])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current)
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
  }, [])

  return {
    showWarning,
    timeLeft,
    resetTimers
  }
}