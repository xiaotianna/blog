'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_RESET_DELAY = 1200

interface UseCopyToClipboardOptions {
  resetDelay?: number
}

export const useCopyToClipboard = ({
  resetDelay = DEFAULT_RESET_DELAY,
}: UseCopyToClipboardOptions = {}) => {
  const [isCopied, setIsCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearResetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const copy = useCallback(
    async (value: string) => {
      if (!navigator.clipboard) {
        return false
      }

      try {
        await navigator.clipboard.writeText(value)
      } catch {
        return false
      }

      clearResetTimer()
      setIsCopied(true)

      timeoutRef.current = setTimeout(() => {
        setIsCopied(false)
        timeoutRef.current = null
      }, resetDelay)

      return true
    },
    [clearResetTimer, resetDelay]
  )

  useEffect(() => clearResetTimer, [clearResetTimer])

  return {
    copy,
    isCopied,
  }
}
