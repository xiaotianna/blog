import { PrismaDark, PrismaLight } from '@ridemountainpig/svgl-react'
import type { ComponentProps } from 'react'
import { ThemedSvgIcon } from './themed-svg-icon'

const Prisma = (props: ComponentProps<typeof PrismaDark>) => (
  <ThemedSvgIcon dark={PrismaDark} light={PrismaLight} {...props} />
)

export { Prisma }
