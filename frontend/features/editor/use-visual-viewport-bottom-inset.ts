'use client'

import { useEffect, useState } from 'react'

function readVisualViewportBottomInset() {
  const viewport = window.visualViewport

  if (!viewport) return 0

  return Math.max(
    0,
    Math.round(window.innerHeight - viewport.height - viewport.offsetTop)
  )
}

export function useVisualViewportBottomInset() {
  const [bottomInset, setBottomInset] = useState(0)

  useEffect(() => {
    const viewport = window.visualViewport
    const updateInset = () => setBottomInset(readVisualViewportBottomInset())

    updateInset()
    viewport?.addEventListener('resize', updateInset)
    viewport?.addEventListener('scroll', updateInset)
    window.addEventListener('orientationchange', updateInset)

    return () => {
      viewport?.removeEventListener('resize', updateInset)
      viewport?.removeEventListener('scroll', updateInset)
      window.removeEventListener('orientationchange', updateInset)
    }
  }, [])

  return bottomInset
}
