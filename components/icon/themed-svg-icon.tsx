'use client'

import type { ComponentType, SVGProps } from 'react'
import { useTheme } from 'next-themes'
import { useMounted } from '@/hooks/use-mounted'

type SvgIconComponent = ComponentType<SVGProps<SVGSVGElement>>

export function ThemedSvgIcon({
  dark: DarkIcon,
  light: LightIcon,
  ...props
}: SVGProps<SVGSVGElement> & {
  dark: SvgIconComponent
  light: SvgIconComponent
}) {
  const mounted = useMounted()
  const { resolvedTheme } = useTheme()
  const Icon = !mounted
    ? LightIcon
    : resolvedTheme === 'dark'
      ? DarkIcon
      : LightIcon

  return <Icon {...props} />
}
