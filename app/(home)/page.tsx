import { Highlighter } from '@/components/ui/highlighter'
import { SparklesText } from '@/components/ui/sparkles-text'
import { Categories } from '@/features/home/categories'
import { MeImage } from '@/features/home/me-image'
import { Skills } from '@/features/home/skills'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Markdown from 'react-markdown'

const profile = {
  name: 'T1an',
  description:
    '全栈（偏前端）开发者，关注前端工程化、构建工具、Go 与 AI 应用，热衷于理解技术底层实现。',
  avatarUrl: '/image/me.png',
  summary: `
我喜欢把复杂的问题拆成清晰的结构，再用代码把它们变成真正可用的东西。相比单纯完成一个功能，我更在意它背后的设计是否合理、交互是否自然、体验是否顺畅，以及未来是否容易扩展和维护。

在开发过程中，我习惯从整体结构出发思考问题：一个功能为什么这样设计、数据如何流动、状态如何管理、模块之间如何协作，以及它在长期迭代中会不会变得难以理解。对我来说，好的代码不只是能跑起来，还应该具备清晰的边界、稳定的结构和足够好的可读性。

平时我会关注一些能提升开发效率和产品体验的方向，也喜欢研究工具背后的实现原理。无论是一个页面、一个组件、一个工程方案，还是一个小工具，我都希望它不是临时拼出来的结果，而是经过思考、打磨，并且真的能解决问题的东西。

技术对我来说，不只是解决问题的手段，也是一种理解系统、打磨细节和表达想法的方式。我享受从想法到原型，再到真正可用产品的过程，也相信持续深入底层、理解原理，才能做出更有生命力的作品。
`
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className='text-xl font-bold tracking-tight'>{children}</h2>
}

export default function Home() {
  return (
    <main className='mx-auto flex min-h-dvh w-full flex-col gap-14 px-6 pb-20 pt-4 sm:px-8 lg:px-0'>
      <section id='hero'>
        <div className='flex flex-col gap-6 md:flex-row md:items-start md:justify-between'>
          <div className='order-2 flex flex-col gap-2 md:order-1'>
            <h1 className='text-4xl font-semibold tracking-tight text-foreground sm:text-5xl flex items-center gap-2'>
              Hi, I&apos;m <SparklesText>{profile.name}</SparklesText>
            </h1>
            <p className='max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl'>
              {profile.description}
            </p>
          </div>
          <MeImage>
            <Image
              src={profile.avatarUrl}
              alt={profile.name}
              width={128}
              height={128}
              className='size-full rounded-full border object-cover shadow-lg ring-4 ring-muted transition-transform duration-300 ease-out hover:scale-110'
            />
          </MeImage>
        </div>
        <div className='mt-4'>
          <span className='cursor-pointer inline-block'>
            <Highlighter
              action='underline'
              color='#FF9800'
            >
              <Link
                href='/blog'
                className='flex items-center gap-1'
              >
                翻翻我的笔记
                𐔌՞. .՞𐦯 ᢉ𐭩.ᐟ🍮
                <ArrowRight className='size-4' />
              </Link>
            </Highlighter>
          </span>
        </div>
      </section>

      <section
        id='about'
        className='flex flex-col gap-4'
      >
        <SectionTitle>About</SectionTitle>
        <div className='prose max-w-none font-sans leading-relaxed text-muted-foreground dark:prose-invert'>
          <Markdown>{profile.summary}</Markdown>
        </div>
      </section>

      <section
        id='skills'
        className='flex flex-col gap-4'
      >
        <SectionTitle>Skills</SectionTitle>
        <Skills />
      </section>

      <section
        id='categories'
        className='flex flex-col gap-4'
      >
        <SectionTitle>Categories</SectionTitle>
        <Categories />
      </section>
    </main>
  )
}
