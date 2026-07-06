import { MongoDBDark, MongoDBLight } from '@ridemountainpig/svgl-react'
import type { ComponentProps } from 'react'
import { ThemedSvgIcon } from './themed-svg-icon'

const MongoDB = (props: ComponentProps<typeof MongoDBDark>) => (
  <ThemedSvgIcon dark={MongoDBDark} light={MongoDBLight} {...props} />
)

export { MongoDB }
