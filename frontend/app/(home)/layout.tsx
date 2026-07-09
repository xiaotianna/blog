import { SiteShell } from '@/components/site-shell'

export default function HomeLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return <SiteShell>{children}</SiteShell>
}
