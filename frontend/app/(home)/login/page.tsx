import BlurFade from '@/components/magicui/blur-fade'
import { LoginForm } from '@/features/auth/login-form'
import { normalizeInternalRedirect } from '@/lib/redirect'
import { getCurrentUser } from '@/lib/server/current-user'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/metadata'
import { redirect } from 'next/navigation'

export const metadata: Metadata = buildPageMetadata({
  title: '登录',
  description: '使用手机号和密码登录。',
  label: 'ACCOUNT',
  noIndex: true,
  path: '/login'
})

const BLUR_FADE_DELAY = 0.04

type LoginPageProps = {
  searchParams?: Promise<{
    redirect?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const redirectTo = normalizeInternalRedirect(params?.redirect ?? null)

  if (await getCurrentUser()) {
    redirect(redirectTo)
  }

  return (
    <main className='mx-auto flex min-h-[calc(100dvh-12rem)] w-full max-w-sm flex-col justify-center px-1 pb-10'>
      <BlurFade delay={BLUR_FADE_DELAY}>
        <div className='mb-6'>
          <p className='mb-2 font-mono text-xs uppercase tracking-normal text-muted-foreground'>
            Account
          </p>
          <h1 className='text-2xl font-semibold tracking-tight'>登录</h1>
        </div>
      </BlurFade>

      <LoginForm
        delay={BLUR_FADE_DELAY * 2}
        redirectTo={redirectTo}
      />
    </main>
  )
}
