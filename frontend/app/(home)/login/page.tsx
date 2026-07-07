import BlurFade from '@/components/magicui/blur-fade'
import { LoginForm } from '@/features/auth/login-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '登录',
  description: '使用手机号和密码登录。'
}

const BLUR_FADE_DELAY = 0.04

export default function LoginPage() {
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

      <LoginForm delay={BLUR_FADE_DELAY * 2} />
    </main>
  )
}
