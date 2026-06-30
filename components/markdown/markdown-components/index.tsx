import { type Components } from 'react-markdown'
import { Code } from './code'

export const MarkdownComponents: Components = {
  pre: ({ children }) => <>{children}</>,
  code: Code,
  blockquote: ({ children }) => (
    <blockquote className='p-3 text-sm'>{children}</blockquote>
  )
}
