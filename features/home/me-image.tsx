"use client"

import confetti from "canvas-confetti"
import type { ReactNode } from "react"

interface MeImageProps {
  children: ReactNode
}

export function MeImage({ children }: MeImageProps) {
  const handleClick = () => {
    const end = Date.now() + 3 * 1000
    const colors = [
      "#ff4fa3",
      "#ffd23f",
      "#32e875",
      "#26c6ff",
      "#9b5cff",
      "#ff8a3d",
      "#ff6b6b",
      "#2dd4bf"
    ]

    const frame = () => {
      if (Date.now() > end) return

      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors
      })
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors
      })
      requestAnimationFrame(frame)
    }

    frame()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Click Me🎉"
      title="Click Me🎉"
      className="order-1 size-24 shrink-0 rounded-full md:order-2 md:size-32"
    >
      {children}
    </button>
  )
}
