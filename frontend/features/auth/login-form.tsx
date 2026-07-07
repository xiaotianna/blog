'use client'

import BlurFade from '@/components/magicui/blur-fade'
import { Button } from '@/components/ui/button'
import { loginAction } from '@/features/auth/actions'
import { LoaderCircle, LockKeyhole, LogIn, Phone } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FormEvent, useMemo, useState } from 'react'
import { toast } from 'sonner'

type LoginFormProps = {
  delay: number
  redirectTo: string
}

const PHONE_PATTERN = /^1[3-9]\d{9}$/

export function LoginForm({ delay, redirectTo }: LoginFormProps) {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = useMemo(
    () => PHONE_PATTERN.test(phone) && password.length > 0 && !isSubmitting,
    [isSubmitting, password, phone]
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!PHONE_PATTERN.test(phone)) {
      toast.error('请输入正确的手机号')
      return
    }

    if (!password) {
      toast.error('请输入密码')
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData(event.currentTarget)
      const result = await loginAction(formData)

      if (!result.ok) {
        throw new Error(result.message ?? '登录失败，请稍后重试')
      }

      router.push(result.redirectTo ?? '/blog')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '登录失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      autoComplete='off'
      className='space-y-5'
      onSubmit={handleSubmit}
    >
      <input
        type='hidden'
        name='redirectTo'
        value={redirectTo}
      />
      <BlurFade delay={delay}>
        <label
          className='mb-2 block text-sm font-medium'
          htmlFor='phone'
        >
          手机号
        </label>
        <div className='group flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 transition-colors focus-within:border-foreground/50'>
          <Phone
            aria-hidden
            className='size-4 text-muted-foreground transition-colors group-focus-within:text-foreground'
          />
          <input
            autoComplete='off'
            className='h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
            id='phone'
            inputMode='numeric'
            maxLength={11}
            name='phone'
            onChange={(event) => setPhone(event.target.value.trim())}
            placeholder='请输入手机号'
            type='tel'
            value={phone}
          />
        </div>
      </BlurFade>

      <BlurFade delay={delay + 0.05}>
        <label
          className='mb-2 block text-sm font-medium'
          htmlFor='password'
        >
          密码
        </label>
        <div className='group flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 transition-colors focus-within:border-foreground/50'>
          <LockKeyhole
            aria-hidden
            className='size-4 text-muted-foreground transition-colors group-focus-within:text-foreground'
          />
          <input
            autoComplete='new-password'
            className='h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
            id='password'
            name='password'
            onChange={(event) => setPassword(event.target.value)}
            placeholder='请输入密码'
            type='password'
            value={password}
          />
        </div>
      </BlurFade>

      <BlurFade delay={delay + 0.1}>
        <Button
          className='w-full'
          disabled={!canSubmit}
          size='lg'
          type='submit'
        >
          {isSubmitting ? (
            <LoaderCircle className='size-4 animate-spin' />
          ) : (
            <LogIn className='size-4' />
          )}
          登录
        </Button>
      </BlurFade>
    </form>
  )
}
