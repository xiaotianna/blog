import { use } from 'react'
import { headers } from 'next/headers'
import { cn } from "@/lib/utils"
import { ArrowUpRight } from "lucide-react"
import { getExternalRel, isInternalUrl } from '@/utils/link'

import { type MarkdownComponentProps } from '..'

export const Link = ({
  children,
  className,
  rel,
  target,
  ...props
}: MarkdownComponentProps<'a'>) => {
  const headersList = use(headers())
  const currentHost = headersList.get('x-forwarded-host') ?? headersList.get('host')
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
