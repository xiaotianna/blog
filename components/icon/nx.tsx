import { NxDark, NxLight } from '@ridemountainpig/svgl-react'
import type { ComponentProps } from 'react'
import { ThemedSvgIcon } from './themed-svg-icon'

const Nx = (props: ComponentProps<typeof NxDark>) => (
  <ThemedSvgIcon dark={NxDark} light={NxLight} {...props} />
)

export { Nx }
