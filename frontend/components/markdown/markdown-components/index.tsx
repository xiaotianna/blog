import { type ComponentProps, type ComponentType } from 'react'
import { type Components } from 'react-markdown'

import { cn } from '@/lib/utils'

import { MarkdownBlockquote } from './alert'
import { Code } from './code'
import { Link } from './link'

export type MarkdownComponentProps<TagName extends keyof Components> =
  ComponentProps<Extract<NonNullable<Components[TagName]>, ComponentType>>

export const MarkdownComponents: Components = {
  pre: ({ children }) => <>{children}</>,
  code: Code,
  strong: ({ children }) => (
    <strong className='font-semibold'>{children}</strong>
  ),
  a: Link,
  ul: ({ children, className }) => (
    <ul
      className={cn(
        "list-none pl-3 [&>li]:relative [&>li]:pl-3 [&>li::before]:absolute [&>li::before]:-mt-px [&>li::before]:ml-[-22px] [&>li::before]:text-(--accents-4) [&>li::before]:content-['-']",
        className
      )}
    >
      {children}
    </ul>
  ),
  ol: ({ children, className }) => (
    <ol
      className={cn(
        "[counter-reset:list] list-none p-0 [&>li]:relative [&>li]:pl-0 [&>li::before]:mr-[0.5em] [&>li::before]:translate-x-0.5 [&>li::before]:tabular-nums [&>li::before]:[counter-increment:list] [&>li::before]:content-[counter(list)_'.'] [&>li>p]:inline",
        className
      )}
    >
      {children}
    </ol>
  ),
  blockquote: MarkdownBlockquote,
  table: ({ children, className, ...props }) => (
    <div className='my-8 w-full max-w-full overflow-x-auto overscroll-x-contain'>
      <table
        className={cn('my-0 w-full min-w-max table-auto', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  th: ({ children, className, ...props }) => (
    <th
      className={cn('first:pl-0 last:pr-0', className)}
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, className, ...props }) => (
    <td
      className={cn('first:pl-0 last:pr-0', className)}
      {...props}
    >
      {children}
    </td>
  )
}
