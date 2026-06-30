import { LanguageIconKey } from "./language-icon"

type LanguageStrategy = {
  key: string
  label: string
  aliases: string[]
  icon: LanguageIconKey
}

const languageStrategies: LanguageStrategy[] = [
  {
    key: 'typescript',
    label: 'TypeScript',
    aliases: ['ts', 'typescript'],
    icon: 'typescript',
  },
  {
    key: 'javascript',
    label: 'JavaScript',
    aliases: ['js', 'javascript', 'mjs', 'cjs'],
    icon: 'javascript',
  },
  {
    key: 'react',
    label: 'React',
    aliases: ['jsx', 'tsx', 'react'],
    icon: 'react',
  },
  {
    key: 'vue',
    label: 'Vue',
    aliases: ['vue'],
    icon: 'vue',
  },
  {
    key: 'svelte',
    label: 'Svelte',
    aliases: ['svelte'],
    icon: 'svelte',
  },
  {
    key: 'html',
    label: 'HTML',
    aliases: ['html', 'htm'],
    icon: 'html',
  },
  {
    key: 'css',
    label: 'CSS',
    aliases: ['css', 'scss', 'sass', 'less', 'stylus'],
    icon: 'css',
  },
  {
    key: 'terminal',
    label: 'Terminal',
    aliases: ['bash', 'shell', 'sh', 'zsh', 'fish', 'ksh', 'powershell', 'ps1'],
    icon: 'terminal',
  },
  {
    key: 'json',
    label: 'JSON',
    aliases: ['json', 'jsonc', 'json5'],
    icon: 'json',
  },
  {
    key: 'markdown',
    label: 'Markdown',
    aliases: ['md', 'mdx', 'markdown'],
    icon: 'markdown',
  },
  {
    key: 'yaml',
    label: 'YAML',
    aliases: ['yml', 'yaml'],
    icon: 'yaml',
  },
  {
    key: 'env',
    label: 'ENV',
    aliases: ['env', 'dotenv', 'environment', 'properties'],
    icon: 'env',
  },
  {
    key: 'go',
    label: 'Go',
    aliases: ['go', 'golang'],
    icon: 'go',
  },
  {
    key: 'python',
    label: 'Python',
    aliases: ['py', 'python', 'python3'],
    icon: 'python',
  },
  {
    key: 'rust',
    label: 'Rust',
    aliases: ['rs', 'rust'],
    icon: 'rust',
  },
  {
    key: 'sql',
    label: 'SQL',
    aliases: ['sql', 'sqlite'],
    icon: 'sql',
  },
  {
    key: 'mysql',
    label: 'MySQL',
    aliases: ['mysql', 'mariadb'],
    icon: 'mysql',
  },
  {
    key: 'mongodb',
    label: 'MongoDB',
    aliases: ['mongodb', 'mongo'],
    icon: 'mongodb',
  },
  {
    key: 'postgresql',
    label: 'PostgreSQL',
    aliases: ['postgresql', 'postgres', 'pgsql'],
    icon: 'postgresql',
  },
  {
    key: 'docker',
    label: 'Docker',
    aliases: ['docker', 'dockerfile', 'compose', 'docker-compose'],
    icon: 'docker',
  },
]

// alias -> strategy
const languageStrategyMap = new Map<string, LanguageStrategy>()

for (const strategy of languageStrategies) {
  for (const alias of strategy.aliases) {
    languageStrategyMap.set(alias, strategy)
  }
}

function normalizeLanguage(language?: string) {
  return language?.trim().toLowerCase() || ''
}

function formatUnknownLanguage(language: string) {
  return language ? language[0].toUpperCase() + language.slice(1) : 'Text'
}

export function getLanguageLabel(language: string) {
  const normalized = normalizeLanguage(language)
  const strategy = languageStrategyMap.get(normalized)

  return strategy?.label ?? formatUnknownLanguage(normalized)
}

export function getLanguageKey(language: string) {
  const normalized = normalizeLanguage(language)
  const strategy = languageStrategyMap.get(normalized)

  return (strategy?.key ?? normalized) || 'text'
}

export function getLanguageIconKey(language: string): LanguageIconKey {
  const normalized = normalizeLanguage(language)
  const strategy = languageStrategyMap.get(normalized)

  return strategy?.icon ?? 'text'
}
