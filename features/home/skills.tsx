'use client'

import { Electron } from '@/components/icon/electron'
import { Express } from '@/components/icon/express'
import { Gin } from '@/components/icon/gin'
import { Git } from '@/components/icon/git'
import {
  fileIconMap,
  filenameIconMap,
} from '@/components/markdown/markdown-components/code/language/icon-map'
import { Badge } from '@/components/ui/badge'
import { useMounted } from '@/hooks/use-mounted'
import { createElement } from 'react'

const skills = [
  { name: 'HTML5', icon: fileIconMap.html },
  { name: 'CSS3', icon: fileIconMap.css },
  { name: 'Tailwind CSS', icon: filenameIconMap.tailwind },
  { name: 'Sass', icon: fileIconMap.sass },
  { name: 'JavaScript', icon: fileIconMap.javascript },
  { name: 'TypeScript', icon: fileIconMap.typescript },
  { name: 'Go', icon: fileIconMap.go },
  { name: 'Gin', icon: createElement(Gin) },
  { name: 'React', icon: fileIconMap.react },
  { name: 'Next.js', icon: filenameIconMap.nextjs },
  { name: 'Vue.js', icon: fileIconMap.vue },
  { name: 'Nuxt.js', icon: filenameIconMap.nuxt },
  { name: 'Electron', icon: createElement(Electron) },
  { name: 'Docker', icon: fileIconMap.docker },
  { name: 'Node.js', icon: filenameIconMap.node },
  { name: 'Express.js', icon: createElement(Express) },
  { name: 'NestJS', icon: filenameIconMap.nest },
  { name: 'MongoDB', icon: fileIconMap.mongodb },
  { name: 'MySQL', icon: fileIconMap.mysql },
  { name: 'Supabase', icon: filenameIconMap.supabase },
  { name: 'Git', icon: createElement(Git) },
  { name: 'GitHub', icon: filenameIconMap.github },
  { name: 'Webpack', icon: filenameIconMap.webpack },
  { name: 'Rspack', icon: filenameIconMap.rspack },
  { name: 'Rsbuild', icon: filenameIconMap.rsbuild },
  { name: 'Vite', icon: filenameIconMap.vite },
  { name: 'Rollup', icon: filenameIconMap.rollup },
  { name: 'ESLint', icon: filenameIconMap.eslint },
  { name: 'Jest', icon: filenameIconMap.jest },
  { name: 'Vitest', icon: filenameIconMap.vitest },
  { name: 'Playwright', icon: filenameIconMap.playwright },
] as const

export function Skills() {
  const mounted = useMounted()

  if (!mounted) {
    return null
  }

  return (
    <div className='flex flex-wrap justify-center gap-2'>
      {skills.map((skill) => {
        return (
          <Badge
            key={skill.name}
            variant='secondary'
            className='px-3 py-1 text-sm font-medium transition-all cursor-pointer duration-200 hover:scale-105 backdrop-blur-sm dark:shadow-white-glow light:shadow-black-deep'
          >
            <span className='mr-1.5 inline-flex size-4 items-center justify-center'>
              {skill.icon}
            </span>
            {skill.name}
          </Badge>
        )
      })}
    </div>
  )
}
