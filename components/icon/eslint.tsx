import { ESLintDark, ESLintLight } from '@ridemountainpig/svgl-react'
import type { ComponentProps } from 'react'
import { ThemedSvgIcon } from './themed-svg-icon'

const ESLint = (props: ComponentProps<typeof ESLintDark>) => (
  <ThemedSvgIcon dark={ESLintDark} light={ESLintLight} {...props} />
)

export { ESLint }
