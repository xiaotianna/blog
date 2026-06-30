import { PrettierDark, PrettierLight } from '@ridemountainpig/svgl-react'
import type { ComponentProps } from 'react'
import { ThemedSvgIcon } from './themed-svg-icon'

const Prettier = (props: ComponentProps<typeof PrettierDark>) => (
  <ThemedSvgIcon dark={PrettierDark} light={PrettierLight} {...props} />
)

export { Prettier }
