'use client';

import { motion } from 'framer-motion';
import { FaReact, FaNodeJs } from 'react-icons/fa';
import { SiTypescript, SiNextdotjs, SiTailwindcss, SiMongodb, SiVuedotjs, SiNuxtdotjs, SiWebpack, SiVite, SiExpress, SiNestjs, SiMysql, SiRollupdotjs } from 'react-icons/si';

const technologies = [
  { name: 'React', icon: FaReact, color: 'text-blue-400' },
  { name: 'Vue', icon: SiVuedotjs, color: 'text-green-400' },
  { name: 'Node.js', icon: FaNodeJs, color: 'text-green-500' },
  { name: 'Next.js', icon: SiNextdotjs, color: 'text-white' },
  { name: 'Nuxt.js', icon: SiNuxtdotjs, color: 'text-green-600' },
  { name: 'TypeScript', icon: SiTypescript, color: 'text-blue-600' },
  { name: 'Tailwind', icon: SiTailwindcss, color: 'text-cyan-400' },
  { name: 'Webpack', icon: SiWebpack, color: 'text-blue-500' },
  { name: 'Vite', icon: SiVite, color: 'text-purple-500' },
  { name: 'Rollup', icon: SiRollupdotjs, color: 'text-red-500' },
  { name: 'Express', icon: SiExpress, color: 'text-gray-400' },
  { name: 'Nest.js', icon: SiNestjs, color: 'text-red-600' },
  { name: 'MySQL', icon: SiMysql, color: 'text-blue-500' },
  { name: 'MongoDB', icon: SiMongodb, color: 'text-green-400' },
];

export default function TechStack() {
  return (
    <section className="py-20 bg-dark">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center mb-12"
        >
          技术栈
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              <motion.div
                whileHover={{ scale: 1.1, filter: 'drop-shadow(0 0 8px currentColor)' }}
                className={`text-5xl ${tech.color} animate-skill-bounce transition-all duration-300 hover:opacity-90`}
              >
                <tech.icon />
              </motion.div>
              <p className="mt-4 text-lg font-medium text-gray-300">{tech.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}