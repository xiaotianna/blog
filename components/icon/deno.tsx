import { DenoDark, DenoLight } from '@ridemountainpig/svgl-react'
import type { ComponentProps } from 'react'
import { ThemedSvgIcon } from './themed-svg-icon'

const Deno = (props: ComponentProps<typeof DenoDark>) => (
  <ThemedSvgIcon dark={DenoDark} light={DenoLight} {...props} />
)

export { Deno }
