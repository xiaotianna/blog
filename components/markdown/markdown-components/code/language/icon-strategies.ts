import type { FileIconKey, FilenameIconKey } from './icon-map'

type FileStrategy = {
  key: string
  aliases: string[]
  icon: FileIconKey
}

export const fileStrategies: FileStrategy[] = [
  {
    key: 'typescript',
    aliases: ['ts', 'typescript'],
    icon: 'typescript',
  },
  {
    key: 'javascript',
    aliases: ['js', 'javascript', 'mjs', 'cjs'],
    icon: 'javascript',
  },
  {
    key: 'react',
    aliases: ['jsx', 'tsx', 'react'],
    icon: 'react',
  },
  {
    key: 'vue',
    aliases: ['vue'],
    icon: 'vue',
  },
  {
    key: 'svelte',
    aliases: ['svelte'],
    icon: 'svelte',
  },
  {
    key: 'html',
    aliases: ['html', 'htm'],
    icon: 'html',
  },
  {
    key: 'css',
    aliases: ['css', 'scss', 'sass', 'less', 'stylus'],
    icon: 'css',
  },
  {
    key: 'terminal',
    aliases: ['bash', 'shell', 'sh', 'zsh', 'fish', 'ksh', 'powershell', 'ps1'],
    icon: 'terminal',
  },
  {
    key: 'json',
    aliases: ['json', 'jsonc', 'json5'],
    icon: 'json',
  },
  {
    key: 'markdown',
    aliases: ['md', 'mdx', 'markdown'],
    icon: 'markdown',
  },
  {
    key: 'yaml',
    aliases: ['yml', 'yaml'],
    icon: 'yaml',
  },
  {
    key: 'env',
    aliases: ['env', 'dotenv', 'environment', 'properties'],
    icon: 'env',
  },
  {
    key: 'go',
    aliases: ['go', 'golang'],
    icon: 'go',
  },
  {
    key: 'python',
    aliases: ['py', 'python', 'python3'],
    icon: 'python',
  },
  {
    key: 'rust',
    aliases: ['rs', 'rust'],
    icon: 'rust',
  },
  {
    key: 'sql',
    aliases: ['sql', 'sqlite'],
    icon: 'sql',
  },
  {
    key: 'mysql',
    aliases: ['mysql', 'mariadb'],
    icon: 'mysql',
  },
  {
    key: 'mongodb',
    aliases: ['mongodb', 'mongo'],
    icon: 'mongodb',
  },
  {
    key: 'postgresql',
    aliases: ['postgresql', 'postgres', 'pgsql'],
    icon: 'postgresql',
  },
  {
    key: 'docker',
    aliases: ['docker', 'dockerfile', 'compose', 'docker-compose'],
    icon: 'docker',
  },
]

type FilenameStrategy = {
  icon: FilenameIconKey
  fileNames?: string[]
  patterns?: RegExp[]
}

export const filenameStrategies: FilenameStrategy[] = [
  {
    icon: 'vite',
    patterns: [/^vite\.config\.(?:[cm]?js|[cm]?ts)$/],
  },
  {
    icon: 'vitest',
    patterns: [/^vitest\.(?:config|workspace|projects)\.(?:[cm]?js|[cm]?ts)$/],
  },
  {
    icon: 'webpack',
    patterns: [/^webpack(?:\.(?:config|dev|prod|common))?\.(?:[cm]?js|ts)$/],
  },
  {
    icon: 'rollup',
    patterns: [/^rollup\.config(?:\.(?:dev|prod|common))?\.(?:[cm]?js|ts)$/],
  },
  {
    icon: 'rolldown',
    patterns: [/^rolldown\.config\.(?:[cm]?js|[cm]?ts)$/],
  },
  {
    icon: 'rspack',
    patterns: [/^rspack\.config\.(?:[cm]?js|ts)$/],
  },
  {
    icon: 'rsbuild',
    patterns: [/^rsbuild\.config\.(?:[cm]?js|[cm]?ts)$/],
  },
  {
    icon: 'rslib',
    patterns: [/^rslib\.config\.(?:[cm]?js|ts)$/],
  },
  {
    icon: 'rspress',
    patterns: [/^rspress\.config\.(?:[cm]?js|ts)$/],
  },
  {
    icon: 'swc',
    fileNames: ['.swcrc'],
  },
  {
    icon: 'babel',
    patterns: [/^(?:\.babelrc|babel\.config\.(?:[cm]?js|json))$/],
  },
  {
    icon: 'tsup',
    patterns: [/^tsup\.config\.(?:[cm]?js|[cm]?ts)$/],
  },
  {
    icon: 'tsdown',
    patterns: [/^tsdown\.config\.(?:[cm]?js|ts)$/],
  },
  {
    icon: 'unbuild',
    patterns: [/^(?:build|unbuild)\.config\.(?:[cm]?js|ts)$/],
  },
  {
    icon: 'nextjs',
    patterns: [/^next\.config\.(?:mjs|js|ts)$/],
  },
  {
    icon: 'vueconfig',
    patterns: [/^(?:\.vuerc|vue\.config\.(?:[cm]?js))$/],
  },
  {
    icon: 'nuxt',
    patterns: [/^(?:\.nuxtrc|\.nuxtignore|nuxt\.config\.(?:[cm]?js|ts))$/],
  },
  {
    icon: 'angular',
    fileNames: ['angular.json', '.angular-cli.json'],
  },
  {
    icon: 'docusaurus',
    patterns: [/^docusaurus\.config\.(?:js|ts)$/],
  },
  {
    icon: 'storybook',
    patterns: [/^(?:.+\.(?:stories|story)\.[jt]sx?|(?:^|\/)\.storybook(?:\/.+)?)$/],
  },
  {
    icon: 'node',
    patterns: [/^(?:\.node-version|\.nvmrc|node\.config\.json)$/],
  },
  {
    icon: 'pnpm',
    patterns: [/^(?:pnpm-lock\.yaml|pnpm-workspace\.yaml|\.pnpmfile\.cjs)$/],
  },
  {
    icon: 'npm',
    patterns: [/^(?:package\.json|package-lock\.json|\.npmrc|\.npmignore)$/],
  },
  {
    icon: 'yarn',
    patterns: [/^(?:yarn\.lock|\.yarnrc|\.yarnrc\.yml|\.yarnignore)$/],
  },
  {
    icon: 'bun',
    patterns: [/^(?:bun\.lock|bun\.lockb|bunfig\.toml|\.bun-version)$/],
  },
  {
    icon: 'deno',
    patterns: [/^deno\.(?:json|jsonc|lock)$/],
  },
  {
    icon: 'tailwind',
    patterns: [/^(?:tailwind\.config\.(?:[cm]?js|[cm]?ts|json)|\.tailwindrc(?:\..+)?)$/],
  },
  {
    icon: 'postcss',
    patterns: [/^(?:postcss\.config\.(?:[cm]?js|[cm]?ts)|\.postcssrc(?:\..+)?)$/],
  },
  {
    icon: 'stylelint',
    patterns: [/^(?:stylelint\.config\.(?:[cm]?js|[cm]?ts)|\.stylelintrc(?:\..+)?)$/],
  },
  {
    icon: 'unocss',
    patterns: [/^uno\.config\.(?:[cm]?js|ts)$/],
  },
  {
    icon: 'windicss',
    patterns: [/^windi\.config\.(?:js|ts)$/],
  },
  {
    icon: 'eslint',
    patterns: [/^(?:eslint\.config\.(?:[cm]?js|ts)|\.eslintrc(?:\..+)?|\.eslintignore)$/],
  },
  {
    icon: 'prettier',
    patterns: [/^(?:prettier\.config\.(?:[cm]?js|ts)|\.prettierrc(?:\..+)?|\.prettierignore)$/],
  },
  {
    icon: 'oxlint',
    fileNames: ['.oxlintrc.json', '.oxlintignore'],
  },
  {
    icon: 'oxfmt',
    fileNames: ['.oxfmtrc.json'],
  },
  {
    icon: 'husky',
    patterns: [/^(?:^|\/)\.husky(?:\/.+)?$/],
  },
  {
    icon: 'jest',
    patterns: [/^jest\.config\.(?:[cm]?js|ts|json)$/],
  },
  {
    icon: 'playwright',
    patterns: [/^playwright\.config\.(?:[cm]?js|[cm]?ts)$/],
  },
  {
    icon: 'cypress',
    patterns: [/^(?:cypress\.config\.(?:[cm]?js|ts)|cypress\.json)$/],
  },
  {
    icon: 'turbo',
    patterns: [/^turbo\.jsonc?$/],
  },
  {
    icon: 'nx',
    fileNames: ['nx.json', '.nxignore'],
  },
  {
    icon: 'lerna',
    fileNames: ['lerna.json'],
  },
  {
    icon: 'nest',
    fileNames: ['nest-cli.json'],
  },
  {
    icon: 'nestmodule',
    patterns: [/^.+\.module\.ts$/],
  },
  {
    icon: 'nestservice',
    patterns: [/^.+\.service\.ts$/],
  },
  {
    icon: 'nestcontroller',
    patterns: [/^.+\.controller\.ts$/],
  },
  {
    icon: 'prisma',
    fileNames: ['schema.prisma'],
  },
  {
    icon: 'prismaconfig',
    patterns: [/^prisma\.config\.(?:js|ts)$/],
  },
  {
    icon: 'typeorm',
    patterns: [/^(?:ormconfig\..+|data-source\.ts)$/],
  },
  {
    icon: 'graphql',
    patterns: [/^(?:\.graphqlrc(?:\..+)?|graphql\.config\..+)$/],
  },
  {
    icon: 'docker',
    patterns: [/^(?:dockerfile|docker-compose\.ya?ml|compose\.ya?ml)$/],
  },
  {
    icon: 'env',
    patterns: [/^\.env(?:\..+)?$/],
  },
  {
    icon: 'typescript',
    patterns: [/^tsconfig(?:\..+)?\.json$/],
  },
  {
    icon: 'nginx',
    fileNames: ['nginx.conf'],
  },
  {
    icon: 'vercel',
    patterns: [/^(?:vercel\.json|\.vercelignore|now\.json)$/],
  },
  {
    icon: 'supabase',
    patterns: [/^(?:supabase\/config\.toml|supabase\.ts)$/],
  },
  {
    icon: 'github',
    patterns: [/^(?:^|\/)\.github\/workflows\/.+\.ya?ml$/],
  },
  {
    icon: 'gitlab',
    fileNames: ['.gitlab-ci.yml'],
  },
]
