'use client'

import { ChevronDown } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useState } from 'react'

const categories = [
  {
    question: '这个博客主要写什么？',
    answer:
      '这里会记录前端工程、全栈实践、性能优化、开发工具，以及真实产品开发里那些容易被忽略的小决策。',
  },
  {
    question: '会经常出现哪些技术栈？',
    answer:
      'React、TypeScript、Next.js、Vite、Tailwind CSS、Node.js、Go、数据库、测试和现代构建工具都会经常出现。',
  },
  {
    question: '内容更偏教程还是笔记？',
    answer:
      '两者都会有。有些文章是一步步拆解的教程，有些则是调试、重构和交付功能时沉淀下来的现场笔记。',
  },
  {
    question: '适合谁阅读？',
    answer:
      '适合关注实现细节、界面质量、工程取舍的前端和全栈开发者，也适合正在搭建自己知识体系的人。',
  },
  {
    question: '更新频率会是怎样？',
    answer:
      '不会为了更新而更新。通常会在解决了一个问题、整理出一个模式，或者找到更清晰的解释方式后发布。',
  },
]

const sectionContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.08,
    },
  },
}

const sectionItemVariants = {
  hidden: { opacity: 0, y: 42, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
}

const ctaFaqVariants = [
  {
    id: 'warm',
    gradientClassName: 'c5-animated-gradient',
  },
  {
    id: 'blue-cyan',
    gradientClassName: 'c5-animated-gradient c5-animated-gradient-blue-cyan',
  },
  {
    id: 'purple-pink',
    gradientClassName: 'c5-animated-gradient c5-animated-gradient-purple-pink',
  },
  {
    id: 'mint-lime-yellow',
    gradientClassName:
      'c5-animated-gradient c5-animated-gradient-mint-lime-yellow',
  },
  {
    id: 'coral-peach-cream',
    gradientClassName:
      'c5-animated-gradient c5-animated-gradient-coral-peach-cream',
  },
  {
    id: 'lake-seafoam-warm',
    gradientClassName:
      'c5-animated-gradient c5-animated-gradient-lake-seafoam-warm',
  },
  {
    id: 'lavender-rose-apricot',
    gradientClassName:
      'c5-animated-gradient c5-animated-gradient-lavender-rose-apricot',
  },
  {
    id: 'berry-grape-rose',
    gradientClassName:
      'c5-animated-gradient c5-animated-gradient-berry-grape-rose',
  },
  {
    id: 'indigo-violet-cool-pink',
    gradientClassName:
      'c5-animated-gradient c5-animated-gradient-indigo-violet-cool-pink',
  },
  {
    id: 'gold-turquoise-grass',
    gradientClassName:
      'c5-animated-gradient c5-animated-gradient-gold-turquoise-grass',
  },
  {
    id: 'sky-sunset-soft-orange',
    gradientClassName:
      'c5-animated-gradient c5-animated-gradient-sky-sunset-soft-orange',
  },
]

type CategoryBlockProps = {
  gradientClassName: string
}

function CategoryBlock({ gradientClassName }: CategoryBlockProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(0)

  return (
    <motion.div
      className='grid w-full grid-cols-1 items-stretch gap-8 lg:grid-cols-[1.6fr_1fr]'
      variants={sectionContainerVariants}
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, amount: 0.28 }}
    >
      <motion.div
        variants={sectionItemVariants}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className={`${gradientClassName} flex min-h-[240px] flex-col items-center justify-center rounded-3xl px-8 py-10 text-center text-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] sm:min-h-[280px] sm:px-10 lg:min-h-[320px]`}
      >
        <h3 className='mb-3 text-4xl font-normal leading-[1.08] sm:text-5xl lg:text-6xl'>
          阅读我的
          <br />
          技术笔记
        </h3>
        <p className='mb-6 max-w-2xl text-sm font-normal leading-relaxed text-white/85 sm:text-base'>
          关于 React、TypeScript、Go、工程化和产品化 UI 的实践记录。
        </p>
        <Link
          href='/blog'
          className='rounded-xl bg-neutral-900 px-8 py-3.5 text-base font-semibold text-white shadow-[0_10px_20px_rgba(0,0,0,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.4)]'
        >
          开始阅读
        </Link>
      </motion.div>

      <motion.div
        variants={sectionItemVariants}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className='flex flex-col justify-center gap-3'
      >
        {categories.slice(0, 3).map((category, index) => {
          const isActive = activeIndex === index

          return (
            <div
              key={category.question}
              className='rounded-[10px] border bg-card px-5 py-[18px] text-left shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-200 hover:border-border dark:bg-card'
              style={{
                borderColor: isActive
                  ? 'var(--border)'
                  : 'color-mix(in oklab, var(--border) 72%, transparent)',
                boxShadow: isActive
                  ? '0 4px 12px rgba(0,0,0,0.04)'
                  : '0 2px 8px rgba(0,0,0,0.02)',
              }}
            >
              <button
                type='button'
                className='flex w-full items-center justify-between gap-4 text-left text-base font-normal text-foreground'
                aria-expanded={isActive}
                onClick={() => {
                  setActiveIndex((currentIndex) =>
                    currentIndex === index ? null : index,
                  )
                }}
              >
                <span>{category.question}</span>
                <motion.span
                  animate={{ rotate: isActive ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className='flex shrink-0'
                >
                  <ChevronDown
                    size={20}
                    aria-hidden='true'
                  />
                </motion.span>
              </button>
              <motion.span
                initial={false}
                animate={{
                  height: isActive ? 'auto' : 0,
                  opacity: isActive ? 1 : 0,
                }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className='block overflow-hidden'
              >
                <span
                  className='mt-3 overflow-hidden text-sm leading-relaxed text-muted-foreground'
                  style={{
                    display: '-webkit-box',
                    lineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2,
                  }}
                >
                  {category.answer}
                </span>
                <span className='mt-3 flex justify-end'>
                  <Link
                    href='/blog'
                    className='rounded-lg cursor-pointer bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent'
                  >
                    详情
                  </Link>
                </span>
              </motion.span>
            </div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}

export function Categories() {
  return (
    <div className='flex flex-col gap-14 sm:gap-16 mt-2'>
      {ctaFaqVariants.map((variant) => (
        <CategoryBlock
          key={variant.id}
          gradientClassName={variant.gradientClassName}
        />
      ))}
    </div>
  )
}
