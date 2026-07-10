'use client'

import { ChevronDown } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useState } from 'react'

import { homeCategoryCardAnimations } from '@/config/home-category-card-animations'
import type {
  HomeArticleStatus,
  HomeCategoryCard
} from '@/features/home/home-category-data'

const articleStatusLabels: Record<HomeArticleStatus, string> = {
  publish: '已发布',
  private: '私密',
  draft: '草稿',
}

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

type CategoryBlockProps = HomeCategoryCard & {
  canManageArticles: boolean
  gradientClassName: string
}

function CategoryBlock({
  articles,
  canManageArticles,
  category,
  gradientClassName,
}: CategoryBlockProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(
    articles.length > 0 ? 0 : null,
  )

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
          {category.name}
        </h3>
        {category.description ? (
          <p className='mb-6 max-w-2xl text-sm font-normal leading-relaxed text-white/85 sm:text-base'>
            {category.description}
          </p>
        ) : null}
        <Link
          href={`/blog/${category.path}`}
          className='rounded-xl bg-neutral-900 px-8 py-3.5 text-base font-semibold text-white shadow-[0_10px_20px_rgba(0,0,0,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.4)]'
        >
          进入目录
        </Link>
      </motion.div>

      <motion.div
        variants={sectionItemVariants}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className='flex flex-col justify-center gap-3'
      >
        {articles.map((article, index) => {
          const isActive = activeIndex === index

          return (
            <div
              key={article.id}
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
                <span className='flex min-w-0 items-center gap-2'>
                  <span>{article.title}</span>
                  {canManageArticles ? (
                    <span className='shrink-0 rounded-full border px-2 py-0.5 text-xs text-muted-foreground'>
                      {articleStatusLabels[article.status]}
                    </span>
                  ) : null}
                </span>
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
                {article.description ? (
                  <span
                    className='mt-3 overflow-hidden text-sm leading-relaxed text-muted-foreground'
                    style={{
                      display: '-webkit-box',
                      lineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                    }}
                  >
                    {article.description}
                  </span>
                ) : null}
                <span className='mt-3 flex justify-end'>
                  <Link
                    href={`/post/${article.path}`}
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

type CategoriesProps = {
  canManageArticles: boolean
  items: HomeCategoryCard[]
}

export function Categories({ canManageArticles, items }: CategoriesProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className='flex flex-col gap-14 sm:gap-16 mt-2'>
      {items.map(({ articles, category }, index) => (
        <CategoryBlock
          articles={articles}
          canManageArticles={canManageArticles}
          category={category}
          key={category.id}
          gradientClassName={
            homeCategoryCardAnimations[
              index % homeCategoryCardAnimations.length
            ]
          }
        />
      ))}
    </div>
  )
}
