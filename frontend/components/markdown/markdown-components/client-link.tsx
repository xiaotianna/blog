'use client'

import { ArrowUpRight } from 'lucide-react'
import { useSyncExternalStore } from 'react'

import { cn } from '@/lib/utils'
import { getExternalRel, isInternalUrl } from '@/utils/link'

import { type MarkdownComponentProps } from './shared'

export const ClientLink = ({
  children,
  className,
  rel,
  target,
  ...props
}: MarkdownComponentProps<'a'>) => {
  const currentHost = useCurrentHost()
  const href = typeof props.href === 'string' ? props.href : undefined
  const isInternal = isInternalUrl(href, currentHost)

  return (
    <a
      className={cn(
        'text-(--geist-link-color) no-underline hover:no-underline [&_code]:text-(--geist-link-color) [&_strong]:text-(--geist-link-color)',
        className
      )}
      rel={isInternal ? rel : getExternalRel(rel)}
      target={isInternal ? target : '_blank'}
      {...props}
    >
      {children}
      {!isInternal && (
        <span className='inline-flex not-prose'>
          <ArrowUpRight className='size-3' />
        </span>
      )}
    </a>
  )
}

const emptySubscribe = () => () => {}

function useCurrentHost() {
  return useSyncExternalStore(
    emptySubscribe,
    () => window.location.host,
    () => null
  )
}
