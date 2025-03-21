'use client'

import { motion } from 'framer-motion'
import { FiGithub } from 'react-icons/fi'
import TechStack from '@/components/TechStack'
import Projects from '@/components/Projects'
import { TypeAnimation } from 'react-type-animation'

export default function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 to-black text-white'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className='container mx-auto px-4 py-10'
      >
        <nav className='flex justify-between items-center mb-20'>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className='text-2xl font-bold'
          >
            小天Blog
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className='flex justify-center space-x-8'
          >
            <motion.a
              whileHover={{ y: -3 }}
              href='https://github.com/xiaotianna'
              target="_blank"
              className='text-2xl hover:text-blue-400 transition-colors'
            >
              <FiGithub />
            </motion.a>
          </motion.div>
        </nav>

        <main className='text-center'>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className='text-6xl font-bold mb-6'
          >
            <TypeAnimation
              sequence={['探索、创造、分享', 3000, '']}
              speed={50}
              repeat={Infinity}
            />
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className='text-xl text-gray-300 mb-12 max-w-2xl mx-auto'
          >
            一个喜欢前端开发的全栈菜鸡，喜欢探索新的技术，喜欢分享自己的经验，对前端架构有浓厚的兴趣。
          </motion.p>
        </main>
        <TechStack />
        <Projects />
      </motion.div>
    </div>
  )
}
