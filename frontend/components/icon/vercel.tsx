import { VercelDark, VercelLight } from '@ridemountainpig/svgl-react'
import type { ComponentProps } from 'react'
import { ThemedSvgIcon } from './themed-svg-icon'

const Vercel = (props: ComponentProps<typeof VercelDark>) => (
  <ThemedSvgIcon dark={VercelDark} light={VercelLight} {...props} />
)

export { Vercel }
