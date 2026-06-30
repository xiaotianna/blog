import { TurborepoDark, TurborepoLight } from '@ridemountainpig/svgl-react'
import type { ComponentProps } from 'react'
import { ThemedSvgIcon } from './themed-svg-icon'

const Turbo = (props: ComponentProps<typeof TurborepoDark>) => (
  <ThemedSvgIcon dark={TurborepoDark} light={TurborepoLight} {...props} />
)

export { Turbo }
