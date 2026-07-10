import { Code } from './code'
import { Link } from './link'
import { createMarkdownComponents } from './shared'
export type { MarkdownComponentProps } from './shared'

export const MarkdownComponents = createMarkdownComponents({
  Code,
  Link
})
