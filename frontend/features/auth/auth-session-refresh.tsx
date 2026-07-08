'use client'

import { clearInvalidAuthAction } from '@/features/auth/actions'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

const CLEAR_DELAY = 1500

export function AuthSessionRefresh() {
  const hasHandledSession = useRef(false)

  useEffect(() => {
    if (hasHandledSession.current) {
      return
    }

    hasHandledSession.current = true
    let isMounted = true

    async function clearSession() {
      if (!isMounted) {
        return
      }

      await clearInvalidAuthAction()
    }

    toast.warning('登录状态已失效，请重新登录')
    const clearTimer = setTimeout(clearSession, CLEAR_DELAY)

    return () => {
      isMounted = false
      clearTimeout(clearTimer)
    }
  }, [])

  return null
}
