import { PnpmDark, PnpmLight } from '@ridemountainpig/svgl-react'
import type { ComponentProps } from 'react'
import { ThemedSvgIcon } from './themed-svg-icon'

const Pnpm = (props: ComponentProps<typeof PnpmDark>) => (
  <ThemedSvgIcon dark={PnpmDark} light={PnpmLight} {...props} />
)

export { Pnpm }
