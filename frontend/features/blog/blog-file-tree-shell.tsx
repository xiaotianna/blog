import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type BlogFileTreeShellProps = {
  children: ReactNode
  className?: string
}

export function BlogFileTreeShell({
  children,
  className
}: BlogFileTreeShellProps) {
  return (
    <aside
      className={cn(
        'h-[calc(100dvh-18rem)] max-h-[calc(100dvh-18rem)] overflow-hidden lg:sticky lg:top-24',
        className
      )}
    >
      {children}
    </aside>
  )
}
