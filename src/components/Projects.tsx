'use client';

import { motion } from 'framer-motion';
import { FiExternalLink, FiGithub } from 'react-icons/fi';

type Project = {
  title: string;
  description: string;
  techStack: string[];
  previewUrl?: string;
  repoUrl?: string;
  image?: string;
};

const projects: Project[] = [
  {
    title: 'Mini Markdown Editor',
    description: '基于React构建的轻量级Markdown编辑器',
    techStack: ['React', 'TypeScript', 'Markdown'],
    previewUrl: '/preview?url=https://github.com/xiaotianna/mini-markdown-editor.git',
    repoUrl: 'https://github.com/xiaotianna/mini-markdown-editor'
  },
  {
    title: 'Code Blocks 低代码开发平台',
    description: 'Vue构建的全栈低代码开发平台',
    techStack: ['Vue', 'Vite', 'Element-Plus', 'Nest.js'],
    previewUrl: '/preview?url=https://github.com/xiaotianna/code-blocks.git',
    repoUrl: 'https://github.com/xiaotianna/code-blocks'
  },
  {
    title: '歪fChat',
    description: 'Vue构建的桌面端聊天软件，包含音视频通话，集成了LLM大模型功能',
    techStack: ['Vue', 'Vite', 'Electron', 'Express', 'MongoDB'],
    previewUrl: '/preview?url=https://gitee.com/wifi-skew-f/waif-chat-desktop.git',
    repoUrl: 'https://gitee.com/wifi-skew-f/waif-chat-desktop'
  },
];

export default function Projects() {
  return (
    <section className="py-20 bg-dark">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center mb-12"
        >
          项目展示
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl p-6 hover:shadow-xl transition-shadow duration-300"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex flex-col h-full">
                <h3 className="text-2xl font-bold mb-4">{project.title}</h3>
                <p className="text-gray-300 mb-6 flex-grow">{project.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.techStack.map((tech) => (
                    <span 
                      key={tech}
                      className="px-3 py-1 bg-gray-700 rounded-full text-sm text-blue-400"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex space-x-4 mt-auto">
                  {project.previewUrl && (
                    <a
                      href={project.previewUrl}
                      className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                      rel="noopener noreferrer"
                    >
                      <FiExternalLink className="mr-2" />
                      在线预览
                    </a>
                  )}
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      className="flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FiGithub className="mr-2" />
                      源代码
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}