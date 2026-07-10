import { ErrorState } from '@/components/error-state'

export default function TagNotFound() {
  return (
    <ErrorState
      message='该 Tag 不存在或已被删除'
      variant='not-found'
    />
  )
}
