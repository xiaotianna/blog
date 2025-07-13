import Link from 'next/link'
import React from 'react'
import { BoxReveal } from '../reveal-animations'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'

const SkillsSection = () => {
  return (
    <section
      id='skills'
      className='w-full h-screen md:h-[150dvh]'
    >
      <div className='top-[80px] sticky mb-96'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={'#skills'}>
              <BoxReveal width='100%'>
                <h2
                  className={cn(
                    'bg-clip-text text-4xl text-center text-transparent md:text-5xl',
                    'bg-gradient-to-b from-black/80 to-black/50',
                    'dark:bg-gradient-to-b dark:from-white/80 dark:to-white/20 dark:bg-opacity-50 '
                  )}
                >
                  技能
                </h2>
              </BoxReveal>
            </Link>
          </TooltipTrigger>
          <TooltipContent side='bottom'>
            <p className='mx-auto line-clamp-4 max-w-3xl font-normal text-base text-center text-neutral-300'>
              提示：按下任意键
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </section>
  )
}

export default SkillsSection
