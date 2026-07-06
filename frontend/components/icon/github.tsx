import { GitHubDark, GitHubLight } from '@ridemountainpig/svgl-react'
import type { ComponentProps } from 'react'
import { ThemedSvgIcon } from './themed-svg-icon'

const GitHub = (props: ComponentProps<typeof GitHubDark>) => (
  <ThemedSvgIcon dark={GitHubDark} light={GitHubLight} {...props} />
)

export { GitHub }
