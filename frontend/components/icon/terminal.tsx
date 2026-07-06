import { BashDark, BashLight } from '@ridemountainpig/svgl-react'
import type { ComponentProps } from 'react'
import { ThemedSvgIcon } from './themed-svg-icon'

const Bash = (props: ComponentProps<typeof BashDark>) => (
  <ThemedSvgIcon dark={BashDark} light={BashLight} {...props} />
)

export { Bash }
