'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileTree } from '@/components/ui/file-tree'
import { Loader2 } from 'lucide-react'
import { CodeBlock, getLanguageFromPath } from '@/components/ui/code-block'
import { useToast } from '@/components/ui/use-toast'
import { ToastProvider } from '@/components/ui/toast'
import { FiArrowLeft } from 'react-icons/fi'
import Link from 'next/link'

export default function Preview() {
  const [url, setUrl] = useState('')
  const [structure, setStructure] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // 获取URL参数
    const searchParams = new URLSearchParams(window.location.search)
    const repoUrl = searchParams.get('url')
    if (repoUrl) {
      setUrl(repoUrl)
    } else {
      // 如果没有URL参数，显示提示信息
      toast({
        title: '提示',
        description: '请在URL中添加?url=仓库地址来预览项目'
      })
    }
  }, [])

  useEffect(() => {
    if (url) {
      handleUrlSubmit(null)
    }
  }, [url])

  const handleUrlSubmit = async (e: React.FormEvent | null) => {
    if (e) e.preventDefault()
    if (!url) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/repo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch repository structure')
      }

      const data = await response.json()
      setStructure(data)
    } catch (error) {
      console.error('Error fetching repository structure:', error)
      toast({
        variant: 'destructive',
        title: '错误',
        description: '获取仓库结构失败，请检查URL是否正确且可访问'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = async (path: string) => {
    try {
      setIsLoading(true)
      setSelectedFile(path)
      // TODO: 从Git仓库获取文件内容的逻辑
      const response = await fetch(
        `/api/content?path=${encodeURIComponent(
          path
        )}&repoUrl=${encodeURIComponent(url)}`
      )
      if (!response.ok) throw new Error('Failed to fetch file content')
      const content = await response.text()
      setFileContent(content)
    } catch (error) {
      console.error('Error fetching file content:', error)
      setFileContent('Error loading file content')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ToastProvider>
      <div className='min-h-screen bg-gradient-to-br from-gray-950 to-black text-white p-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='max-w-7xl mx-auto'
        >
          <h1 className='text-3xl font-bold mb-8 flex items-center'>
            <Link
              href='/'
              className='mr-2 flex items-center text-blue-400 hover:text-blue-300 transition-colors'
              aria-label="返回首页"
            >
              <FiArrowLeft className='w-8 h-8 mr-0' />
            </Link>
            项目预览
          </h1>

          <form
            onSubmit={handleUrlSubmit}
            className='mb-8'
          >
            <div className='flex gap-4'>
              <input
                type='text'
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder='输入Git项目URL'
                className='flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500'
              />
              <button
                type='submit'
                className='px-6 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors'
              >
                加载
              </button>
            </div>
          </form>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-240px)]'>
            {/* 目录树 */}
            <div className='bg-gray-800 rounded-lg p-4 overflow-auto'>
              <ScrollArea className='h-full'>
                {structure ? (
                  <FileTree
                    structure={structure}
                    onFileSelect={handleFileSelect}
                  />
                ) : (
                  <div className='text-gray-400 text-center py-8'>
                    请输入Git项目URL以查看目录结构
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* 代码展示 */}
            <div className='md:col-span-2 bg-gray-900 rounded-lg p-4 overflow-auto h-full'>
              <ScrollArea className='h-full'>
                {isLoading ? (
                  <div className='flex items-center justify-center h-full'>
                    <Loader2 className='w-8 h-8 animate-spin text-blue-500' />
                  </div>
                ) : selectedFile && fileContent ? (
                  <CodeBlock
                    code={fileContent}
                    language={getLanguageFromPath(selectedFile)}
                    showLineNumbers={true}
                  />
                ) : (
                  <div className='text-gray-400 text-center py-8'>
                    选择文件以查看源代码
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </motion.div>
      </div>
    </ToastProvider>
  )
}
