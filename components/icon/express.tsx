import { ExpressjsDark, ExpressjsLight } from '@ridemountainpig/svgl-react'
import type { ComponentProps } from 'react'
import { ThemedSvgIcon } from './themed-svg-icon'

const Express = (props: ComponentProps<typeof ExpressjsDark>) => (
  <ThemedSvgIcon dark={ExpressjsDark} light={ExpressjsLight} {...props} />
)

export { Express }
