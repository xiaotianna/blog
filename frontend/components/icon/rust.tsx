import { RustDark, RustLight } from '@ridemountainpig/svgl-react'
import type { ComponentProps } from 'react'
import { ThemedSvgIcon } from './themed-svg-icon'

const Rust = (props: ComponentProps<typeof RustDark>) => (
  <ThemedSvgIcon dark={RustDark} light={RustLight} {...props} />
)

export { Rust }
