import { GoDark, GoLight } from '@ridemountainpig/svgl-react'
import type { ComponentProps } from 'react'
import { ThemedSvgIcon } from './themed-svg-icon'

export const Go = (props: ComponentProps<typeof GoDark>) => (
  <ThemedSvgIcon dark={GoDark} light={GoLight} {...props} />
)
