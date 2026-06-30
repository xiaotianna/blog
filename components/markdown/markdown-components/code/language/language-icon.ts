import { createElement } from 'react'
import { CSS } from '@/components/icon/css'
import { Docker } from '@/components/icon/docker'
import { Env } from '@/components/icon/env'
import { Go } from '@/components/icon/go'
import { HTML5 } from '@/components/icon/html'
import { JavaScript } from '@/components/icon/javascript'
import { JSON } from '@/components/icon/json'
import { Markdown } from '@/components/icon/markdown'
import { MongoDB } from '@/components/icon/mongodb'
import { MySQL } from '@/components/icon/mysql'
import { PostgreSQL } from '@/components/icon/postgresql'
import { Python } from '@/components/icon/python'
import { React as ReactIcon } from '@/components/icon/react'
import { Rust } from '@/components/icon/rust'
import { Sql } from '@/components/icon/sql'
import { Svelte } from '@/components/icon/svelte'
import { Bash } from '@/components/icon/terminal'
import { Text } from '@/components/icon/text'
import { TypeScript } from '@/components/icon/typescript'
import { Vue } from '@/components/icon/vue'
import { YAML } from '@/components/icon/yaml'
import { getLanguageIconKey } from './get-language-info'

export const languageIconMap = {
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

export type LanguageIconKey = keyof typeof languageIconMap

export function LanguageIcon({ language }: { language: string }) {
  return languageIconMap[getLanguageIconKey(language)]
}
