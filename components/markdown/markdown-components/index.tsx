import { type Components } from 'react-markdown'

import { cn } from '@/lib/utils'

import { Code } from './code'

export const MarkdownComponents: Components = {
  pre: ({ children }) => <>{children}</>,
  code: Code,
  strong: ({ children }) => <strong className='font-semibold'>{children}</strong>,
  a: ({ children, className, ...props }) => (
    <a
      className={cn('text-(--geist-link-color) no-underline hover:no-underline [&_code]:border-[color-mix(in_oklab,var(--geist-link-color)_18%,#ededed)] [&_code]:text-(--geist-link-color) [&_strong]:text-(--geist-link-color)', className)}
      {...props}
    >
      {children}
    </a>
  ),
  ul: ({ children, className }) => (
    <ul className={cn("list-none pl-3 [&>li]:relative [&>li]:pl-3 [&>li::before]:absolute [&>li::before]:-mt-px [&>li::before]:-ml-[22px] [&>li::before]:text-(--accents-4) [&>li::before]:content-['-']", className)}>
      {children}
    </ul>
  ),
  ol: ({ children, className }) => (
    <ol className={cn("[counter-reset:list] list-none p-0 [&>li]:relative [&>li]:pl-0 [&>li::before]:mr-[0.5em] [&>li::before]:translate-x-0.5 [&>li::before]:tabular-nums [&>li::before]:[counter-increment:list] [&>li::before]:content-[counter(list)_'.'] [&>li>p]:inline", className)}>
      {children}
    </ol>
  ),
  blockquote: ({ children, className }) => (
    <blockquote className={cn('p-3 text-sm [&>p]:leading-[1.5] [&>p:first-child]:mt-0 [&>p:last-child]:mb-0', className)}>
      {children}
    </blockquote>
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
