import { Angular } from '@/components/icon/angular'
import { Babel } from '@/components/icon/babel'
import { Bun } from '@/components/icon/bun'
import { createElement } from 'react'
import { CSS } from '@/components/icon/css'
import { Cypress } from '@/components/icon/cypress'
import { Deno } from '@/components/icon/deno'
import { Docker } from '@/components/icon/docker'
import { Docusaurus } from '@/components/icon/docusaurus'
import { Env } from '@/components/icon/env'
import { GitHub } from '@/components/icon/github'
import { GitLab } from '@/components/icon/gitlab'
import { Go } from '@/components/icon/go'
import { GraphQL } from '@/components/icon/graphql'
import { HTML5 } from '@/components/icon/html'
import { JavaScript } from '@/components/icon/javascript'
import { Jest } from '@/components/icon/jest'
import { JSON } from '@/components/icon/json'
import { Markdown } from '@/components/icon/markdown'
import { MongoDB } from '@/components/icon/mongodb'
import { MySQL } from '@/components/icon/mysql'
import { Nest } from '@/components/icon/nest'
import { NestController } from '@/components/icon/nestcontroller'
import { NestModule } from '@/components/icon/nestmodule'
import { NestService } from '@/components/icon/nestservice'
import { Nextjs } from '@/components/icon/nextjs'
import { Nginx } from '@/components/icon/nginx'
import { Node } from '@/components/icon/node'
import { Nuxt } from '@/components/icon/nuxt'
import { Nx } from '@/components/icon/nx'
import { Playwright } from '@/components/icon/playwright'
import { Pnpm } from '@/components/icon/pnpm'
import { PostCSS } from '@/components/icon/postcss'
import { PostgreSQL } from '@/components/icon/postgresql'
import { Prettier } from '@/components/icon/prettier'
import { Prisma } from '@/components/icon/prisma'
import { Python } from '@/components/icon/python'
import { React as ReactIcon } from '@/components/icon/react'
import { Rolldown } from '@/components/icon/rolldown'
import { Rsbuild } from '@/components/icon/rsbuild'
import { Rspack } from '@/components/icon/rspack'
import { Rust } from '@/components/icon/rust'
import { Sql } from '@/components/icon/sql'
import { Storybook } from '@/components/icon/storybook'
import { Supabase } from '@/components/icon/supabase'
import { SWC } from '@/components/icon/swc'
import { Svelte } from '@/components/icon/svelte'
import { Tailwind } from '@/components/icon/tailwind'
import { Bash } from '@/components/icon/terminal'
import { Text } from '@/components/icon/text'
import { Turbo } from '@/components/icon/turbo'
import { TypeORM } from '@/components/icon/typeorm'
import { TypeScript } from '@/components/icon/typescript'
import { UnoCSS } from '@/components/icon/unocss'
import { Vercel } from '@/components/icon/vercel'
import { Vite } from '@/components/icon/vite'
import { Vitest } from '@/components/icon/vitest'
import { Vue } from '@/components/icon/vue'
import { VueConfig } from '@/components/icon/vueconfig'
import { WindiCSS } from '@/components/icon/windicss'
import { YAML } from '@/components/icon/yaml'
import { Yarn } from '@/components/icon/yarn'

// 文件icon映射
export const fileIconMap = {
  typescript: createElement(TypeScript),
  javascript: createElement(JavaScript),
  react: createElement(ReactIcon),
  vue: createElement(Vue),
  svelte: createElement(Svelte),
  html: createElement(HTML5),
  css: createElement(CSS),
  terminal: createElement(Bash),
  json: createElement(JSON),
  markdown: createElement(Markdown),
  yaml: createElement(YAML),
  env: createElement(Env),
  go: createElement(Go),
  python: createElement(Python),
  rust: createElement(Rust),
  sql: createElement(Sql),
  mysql: createElement(MySQL),
  mongodb: createElement(MongoDB),
  postgresql: createElement(PostgreSQL),
  docker: createElement(Docker),
  text: createElement(Text),
} as const

// 文件名icon映射
export const filenameIconMap = {
  vite: createElement(Vite),
  vitest: createElement(Vitest),
  webpack: createElement(Text),
  rollup: createElement(Text),
  rolldown: createElement(Rolldown),
  rspack: createElement(Rspack),
  rsbuild: createElement(Rsbuild),
  rslib: createElement(Text),
  rspress: createElement(Text),
  nextjs: createElement(Nextjs),
  swc: createElement(SWC),
  babel: createElement(Babel),
  tsup: createElement(Text),
  tsdown: createElement(Text),
  unbuild: createElement(Text),
  vueconfig: createElement(VueConfig),
  nuxt: createElement(Nuxt),
  angular: createElement(Angular),
  docusaurus: createElement(Docusaurus),
  storybook: createElement(Storybook),
  node: createElement(Node),
  npm: createElement(Text),
  pnpm: createElement(Pnpm),
  yarn: createElement(Yarn),
  bun: createElement(Bun),
  deno: createElement(Deno),
  tailwind: createElement(Tailwind),
  postcss: createElement(PostCSS),
  stylelint: createElement(Text),
  unocss: createElement(UnoCSS),
  windicss: createElement(WindiCSS),
  eslint: createElement(Text),
  prettier: createElement(Prettier),
  oxlint: createElement(Text),
  oxfmt: createElement(Text),
  husky: createElement(Text),
  jest: createElement(Jest),
  playwright: createElement(Playwright),
  cypress: createElement(Cypress),
  turbo: createElement(Turbo),
  nx: createElement(Nx),
  lerna: createElement(Text),
  nest: createElement(Nest),
  nestmodule: createElement(NestModule),
  nestservice: createElement(NestService),
  nestcontroller: createElement(NestController),
  prisma: createElement(Prisma),
  prismaconfig: createElement(Text),
  typeorm: createElement(TypeORM),
  graphql: createElement(GraphQL),
  docker: createElement(Docker),
  nginx: createElement(Nginx),
  vercel: createElement(Vercel),
  supabase: createElement(Supabase),
  github: createElement(GitHub),
  gitlab: createElement(GitLab),
  env: createElement(Env),
  typescript: createElement(TypeScript),
} as const

export type FileIconKey = keyof typeof fileIconMap
export type FilenameIconKey = keyof typeof filenameIconMap
