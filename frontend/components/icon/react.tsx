import { ReactDark, ReactLight } from '@ridemountainpig/svgl-react'
import type { ComponentProps } from 'react'
import { ThemedSvgIcon } from './themed-svg-icon'

const React = (props: ComponentProps<typeof ReactDark>) => (
  <ThemedSvgIcon dark={ReactDark} light={ReactLight} {...props} />
)

export { React }
