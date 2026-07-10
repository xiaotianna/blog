import { ErrorState } from '@/components/error-state'
import { buildPageMetadata } from '@/lib/metadata'
import type { Metadata } from 'next'

export const metadata: Metadata = buildPageMetadata({
  description: '你访问的页面不存在或已经移动。',
  label: 'NOT FOUND',
  noIndex: true,
  title: '页面不存在'
})

export default function HomeNotFound() {
  return <ErrorState variant='not-found' />
}
