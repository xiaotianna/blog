'use client'

import { GitHub } from '@/components/icon/github'
import { Marquee } from '@/components/ui/marquee'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import type { ComponentType, JSX, SVGProps } from 'react'
import React from 'react'

type LogoComponent = ComponentType<SVGProps<SVGSVGElement>> | JSX.Element

const LogoRender = ({ path, className }: { path: string; className?: string }) => {
  return (
    <>
      <Image
        src={path}
        alt='link-logo'
        width={32}
        height={32}
        className={cn('size-8', className)}
      ></Image>
    </>
  )
}

const linkCards: {
  siteName: string
  href: string
  displayUrl: string
  Logo: LogoComponent
}[] = [
  {
    siteName: 'GitHub',
    href: 'https://github.com/xiaotianna',
    displayUrl: 'github.com/xiaotianna',
    Logo: <GitHub />
  },
  {
    siteName: 'Gitee',
    href: 'https://gitee.com/wifi-skew-f',
    displayUrl: 'gitee.com/wifi-skew-f',
    Logo: <LogoRender path='/icon/gitee.svg' />
  },
  {
    siteName: '掘金',
    href: 'https://juejin.cn/user/3204392469671415',
    displayUrl: 'juejin.cn/user/3204392469671415',
    Logo: <LogoRender path='/icon/juejin.svg' />
  },
  {
    siteName: 'CSDN',
    href: 'https://blog.csdn.net/m0_65519288',
    displayUrl: 'blog.csdn.net/m0_65519288',
    Logo: <LogoRender path='/icon/csdn.svg' />
  }
]

type LinkCardProps = (typeof linkCards)[number]

function LinkCard({ siteName, href, displayUrl, Logo }: LinkCardProps) {
  return (
    <Link
      href={href}
      target='_blank'
      rel='noreferrer'
      className={cn(
        'relative flex h-36 w-72 cursor-pointer flex-col overflow-hidden rounded-xl border transition-colors',
        'border-gray-950/10 bg-gray-950/1 hover:bg-gray-950/5',
        'dark:border-gray-50/10 dark:bg-gray-50/10 dark:hover:bg-gray-50/15'
      )}
    >
      <div className='flex flex-1 items-center justify-center bg-muted/40'>
        <span className='flex size-14 items-center justify-center rounded-xl bg-background shadow-sm ring-1 ring-border/60'>
          {/* <Logo className='size-8' /> */}
          {React.cloneElement(Logo as JSX.Element, {
            className: 'size-8'
          })}
        </span>
      </div>
      <div className='flex items-center gap-3 border-t bg-background/70 px-4 py-3'>
        <span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/70'>
          {/* <Logo className='size-5' /> */}
          {React.cloneElement(Logo as JSX.Element, {
            className: 'size-5'
          })}
        </span>
        <div className='min-w-0'>
          <p className='truncate text-sm font-medium text-foreground'>
            {siteName}
          </p>
          <p className='truncate text-xs text-muted-foreground'>{displayUrl}</p>
        </div>
      </div>
    </Link>
  )
}

export function Links() {
  return (
    <div className='relative flex w-full flex-col items-center justify-center overflow-hidden'>
      <Marquee
        pauseOnHover
        repeat={3}
        className='[--duration:20s]'
      >
        {linkCards.map((link) => (
          <LinkCard
            key={link.siteName}
            {...link}
          />
        ))}
      </Marquee>
      <div className='pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-background' />
      <div className='pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l from-background' />
    </div>
  )
}
