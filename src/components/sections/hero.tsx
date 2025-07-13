import { cn } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'
import { usePreloader } from '../preloader'
import { BlurIn } from '../reveal-animations'
import ScrollDownIcon from '../scroll-down-icon'
import { SiCsdn, SiGitee, SiGithub, SiJuejin } from 'react-icons/si'

const HeroSection = () => {
  const { isLoading } = usePreloader()

  return (
    <section
      id='hero'
      className={cn('relative w-full h-screen')}
    >
      <div className='grid md:grid-cols-2'>
        <div
          className={cn(
            'h-[calc(100dvh-3rem)] md:h-[calc(100dvh-4rem)] z-[2]',
            'col-span-1',
            'flex flex-col justify-start md:justify-center items-center md:items-start',
            'pt-28 sm:pt-0 sm:pb-32 md:p-24 lg:p-40 xl:p-48'
          )}
        >
          {!isLoading && (
            <>
              <div className=''>
                <BlurIn delay={0.7}>
                  <p
                    className={cn(
                      'md:self-start mt-4 font-normal text-md text-slate-500 dark:text-zinc-400 ml-3',
                      'cursor-default font-display sm:text-xl md:text-xl whitespace-nowrap bg-clip-text',
                      'chinese-text'
                    )}
                  >
                    你好，我是
                    <br className='md:hidden' />
                  </p>
                </BlurIn>
                <BlurIn delay={1}>
                  <h1
                    className={cn(
                      'font-medium text-6xl text-transparent text-slate-800 ml-1 text-left',
                      'cursor-default text-edge-outline font-display sm:text-7xl md:text-9xl tracking-wide',
                      'chinese-text'
                    )}
                  >
                    小天
                  </h1>
                </BlurIn>
                <BlurIn delay={1.2}>
                  <p
                    className={cn(
                      'md:self-start md:mt-4 font-normal text-md text-slate-500 dark:text-zinc-400 ml-3',
                      'cursor-default font-display sm:text-xl md:text-xl whitespace-nowrap bg-clip-text',
                      'chinese-text'
                    )}
                  >
                    🚀 一个全栈Web开发人员
                  </p>
                </BlurIn>
              </div>
              <div className='mt-8 md:ml-2 flex flex-col gap-3'>
                <div className='md:self-start flex gap-3'>
                  {/* github */}
                  <Link
                    href={'https://github.com/xiaotianna/'}
                    target='_blank'
                  >
                    <Button variant={'outline'}>
                      <SiGithub size={24} />
                    </Button>
                  </Link>
                  {/* gitee */}
                  <Link
                    href={'https://gitee.com/wifi-skew-f'}
                    target='_blank'
                  >
                    <Button variant={'outline'}>
                      <SiGitee size={24} />
                    </Button>
                  </Link>
                  {/* csdn */}
                  <Link
                    href={'https://blog.csdn.net/m0_65519288'}
                    target='_blank'
                  >
                    <Button variant={'outline'}>
                      <SiCsdn size={24} />
                    </Button>
                  </Link>
                  {/* 掘金 */}
                  <Link
                    href={'https://juejin.cn/user/3204392469671415'}
                    target='_blank'
                  >
                    <Button variant={'outline'}>
                      <SiJuejin size={24} />
                    </Button>
                  </Link>
                </div>
                <div className='w-full md:self-start flex gap-3'>
                  <Link
                    href={'/about'}
                    target='_self'
                    className='flex-1'
                  >
                    <Button className='w-full' variant={'outline'}>
                      自我介绍
                    </Button>
                  </Link>
                  <Link
                    href={'/blog'}
                    target='_self'
                    className='flex-1'
                  >
                    <Button className='w-full' variant={'outline'}>
                      我的博客
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
        <div className='grid col-span-1'></div>
      </div>
      <div className='absolute bottom-10 left-[50%] translate-x-[-50%]'>
        <ScrollDownIcon />
      </div>
    </section>
  )
}

export default HeroSection
