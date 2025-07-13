// thoda zada ts ho gya idhar
export enum SkillNames {
  JS = 'js',
  TS = 'ts',
  HTML = 'html',
  CSS = 'css',
  REACT = 'react',
  VUE = 'vue',
  NEXTJS = 'nextjs',
  SASS = 'sass',
  TAILWIND = 'tailwind',
  WEBPACK = 'webpack',
  ROLLUP = 'rollup',
  VITE = 'vite',
  NODEJS = 'nodejs',
  EXPRESS = 'express',
  NESTJS = 'nestjs',
  ELECTRON = 'electron',
  MYSQL = 'mysql',
  MONGODB = 'mongodb',
  GIT = 'git',
  LINUX = 'linux'
}
export type Skill = {
  id: number
  name: string
  label: string
  color: string
  icon: string
}
export const SKILLS: Record<SkillNames, Skill> = {
  [SkillNames.JS]: {
    id: 1,
    name: 'js',
    label: 'JavaScript',
    color: '#f0db4f',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg'
  },
  [SkillNames.TS]: {
    id: 2,
    name: 'ts',
    label: 'TypeScript',
    color: '#007acc',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg'
  },
  [SkillNames.HTML]: {
    id: 3,
    name: 'html',
    label: 'HTML',
    color: '#e34c26',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg'
  },
  [SkillNames.CSS]: {
    id: 4,
    name: 'css',
    label: 'CSS',
    color: '#563d7c',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg'
  },
  [SkillNames.REACT]: {
    id: 5,
    name: 'react',
    label: 'React',
    color: '#61dafb',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg'
  },
  [SkillNames.VUE]: {
    id: 6,
    name: 'vue',
    label: 'Vue',
    color: '#41b883',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg'
  },
  [SkillNames.NEXTJS]: {
    id: 7,
    name: 'nextjs',
    label: 'Next.js',
    color: '#fff',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg'
  },
  [SkillNames.TAILWIND]: {
    id: 8,
    name: 'tailwind',
    label: 'Tailwind',
    color: '#38bdf8',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg'
  },
  [SkillNames.NODEJS]: {
    id: 9,
    name: 'nodejs',
    label: 'Node.js',
    color: '#6cc24a',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg'
  },
  [SkillNames.EXPRESS]: {
    id: 10,
    name: 'express',
    label: 'Express',
    color: '#fff',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg'
  },
  [SkillNames.MYSQL]: {
    id: 11,
    name: 'mysql',
    label: 'MySQL',
    color: '#336791',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/mysql-original.svg'
  },
  [SkillNames.MONGODB]: {
    id: 12,
    name: 'mongodb',
    label: 'MongoDB',
    color: '#336791',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg'
  },
  [SkillNames.GIT]: {
    id: 13,
    name: 'git',
    label: 'Git',
    color: '#f1502f',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg'
  },
  [SkillNames.SASS]: {
    id: 18,
    name: 'sass',
    label: 'Sass',
    color: '#CC6699',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg'
  },
  [SkillNames.NESTJS]: {
    id: 19,
    name: 'nestjs',
    label: 'NestJS',
    color: '#E0234E',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg'
  },
  [SkillNames.ELECTRON]: {
    id: 20,
    name: 'electron',
    label: 'Electron',
    color: '#4A84FF',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/electron/electron-original.svg'
  },
  [SkillNames.WEBPACK]: {
    id: 0,
    name: "",
    label: "",
    color: "",
    icon: ""
  },
  [SkillNames.ROLLUP]: {
    id: 0,
    name: "",
    label: "",
    color: "",
    icon: ""
  },
  [SkillNames.VITE]: {
    id: 0,
    name: "",
    label: "",
    color: "",
    icon: ""
  },
  [SkillNames.LINUX]: {
    id: 0,
    name: "",
    label: "",
    color: "",
    icon: ""
  }
}
