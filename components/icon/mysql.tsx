import { MySQLDark, MySQLLight } from '@ridemountainpig/svgl-react'
import type { ComponentProps } from 'react'
import { ThemedSvgIcon } from './themed-svg-icon'

const MySQL = (props: ComponentProps<typeof MySQLDark>) => (
  <ThemedSvgIcon dark={MySQLDark} light={MySQLLight} {...props} />
)

export { MySQL }
