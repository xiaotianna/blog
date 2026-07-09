import { ErrorState } from '@/components/error-state'
import { SiteShell } from '@/components/site-shell'

export default function NotFound() {
  return (
    <SiteShell>
      <ErrorState variant='not-found' />
    </SiteShell>
  )
}
