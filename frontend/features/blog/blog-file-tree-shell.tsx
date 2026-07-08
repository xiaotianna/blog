'use client'

import { cn } from '@/lib/utils'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

type BlogFileTreeShellProps = {
  children: ReactNode
  className?: string
}

export function BlogFileTreeShell({
  children,
  className
}: BlogFileTreeShellProps) {
  const shellRef = useRef<HTMLElement>(null)
  const [size, setSize] = useState<{
    height: number
    maxHeight: number
  }>()

  const updateMaxHeight = useCallback(() => {
    const shell = shellRef.current
    const pagination = document.querySelector<HTMLElement>(
      '[data-blog-pagination-actions]'
    )

    if (!shell || !pagination) {
      setSize(undefined)
      return
    }

    const nextMaxHeight =
      pagination.getBoundingClientRect().bottom -
      shell.getBoundingClientRect().top

    if (nextMaxHeight <= 0) {
      setSize(undefined)
      return
    }

    const nextMaxHeightFloor = Math.floor(nextMaxHeight)

    const contentRoot = shell.firstElementChild
    const nav = shell.querySelector('nav')
    const hiddenNavHeight = nav ? nav.scrollHeight - nav.clientHeight : 0
    const contentHeight =
      (contentRoot?.scrollHeight ?? shell.scrollHeight) +
      Math.max(0, hiddenNavHeight)

    setSize({
      height: Math.min(contentHeight, nextMaxHeightFloor),
      maxHeight: nextMaxHeightFloor
    })
  }, [])

  useEffect(() => {
    updateMaxHeight()

    const resizeObserver = new ResizeObserver(updateMaxHeight)
    const observedElements = [
      shellRef.current,
      document.querySelector('[data-blog-pagination-actions]'),
      document.querySelector('#blog')
    ].filter(Boolean)

    observedElements.forEach((element) => {
      resizeObserver.observe(element)
    })

    window.addEventListener('resize', updateMaxHeight)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateMaxHeight)
    }
  }, [updateMaxHeight])

  return (
    <aside
      ref={shellRef}
      className={cn(
        'max-h-[calc(100dvh-9rem)] overflow-hidden lg:sticky lg:top-24',
        className
      )}
      style={
        size
          ? {
              height: size.height,
              maxHeight: size.maxHeight
            }
          : undefined
      }
    >
      {children}
    </aside>
  )
}
