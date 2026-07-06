import { MarkdownDark, MarkdownLight } from '@ridemountainpig/svgl-react'
import type { ComponentProps } from 'react'
import { ThemedSvgIcon } from './themed-svg-icon'

const Markdown = (props: ComponentProps<typeof MarkdownDark>) => (
  <ThemedSvgIcon dark={MarkdownDark} light={MarkdownLight} {...props} />
)

export { Markdown }
