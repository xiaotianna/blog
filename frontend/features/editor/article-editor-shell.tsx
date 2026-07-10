'use client'

import { updateArticleContentAction } from '@/features/blog/actions'
import type { BlogArticleDetail } from '@/features/blog/blog-data'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  EditorHeader,
  type EditorMode,
  type SaveState
} from './editor-header'
import { EditorImageDialog } from './editor-image-dialog'
import type { EditorImageInput } from './editor-image-markdown'
import { MdxSourceEditor } from './mdx-source-editor'
import { MobileEditorDock } from './mobile-editor-dock'
import {
  RichTextEditor,
  openImageDialogEventName,
  type EditorCommandHandle
} from './rich-text-editor'

type ArticleEditorShellProps = {
  article: BlogArticleDetail
}

const AUTOSAVE_DELAY = 1500

export function ArticleEditorShell({ article }: ArticleEditorShellProps) {
  const editorRef = useRef<EditorCommandHandle>(null)
  const latestContentRef = useRef(article.content)
  const lastSavedContentRef = useRef(article.content)
  const [content, setContent] = useState(article.content)
  const [mode, setMode] = useState<EditorMode>('rich')
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [commandRevision, setCommandRevision] = useState(0)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)

  const saveContent = useCallback(
    (nextContent: string, silent = false) => {
      if (nextContent === lastSavedContentRef.current) {
        setSaveState('saved')
        return
      }

      setSaveState('saving')
      void (async () => {
        try {
          const result = await updateArticleContentAction({
            article: {
              id: article.id,
              title: article.title,
              slug: article.slug,
              description: article.description,
              status: article.status,
              tagIds: article.tags.map((tag) => tag.id)
            },
            content: nextContent
          })

          if (!result.ok) {
            setSaveState('error')
            if (!silent) {
              toast.error(result.message ?? '保存失败，请稍后重试')
            }
            return
          }

          lastSavedContentRef.current = nextContent
          setSaveState(
            latestContentRef.current === nextContent ? 'saved' : 'dirty'
          )
          if (!silent) {
            toast.success(result.message ?? '文章已保存')
          }
        } catch {
          setSaveState('error')
          if (!silent) {
            toast.error('保存失败，请稍后重试')
          }
        }
      })()
    },
    [article.description, article.id, article.slug, article.status, article.tags, article.title]
  )

  const handleChange = useCallback((nextContent: string) => {
    latestContentRef.current = nextContent
    setContent(nextContent)
    setSaveState((current) => (current === 'saving' ? current : 'dirty'))
    setCommandRevision((value) => value + 1)
  }, [])

  const handleManualSave = useCallback(() => {
    const nextContent = editorRef.current?.getContent() ?? content
    latestContentRef.current = nextContent
    setContent(nextContent)
    saveContent(nextContent)
  }, [content, saveContent])

  const handleModeChange = useCallback(
    (nextMode: EditorMode) => {
      const nextContent = editorRef.current?.getContent() ?? content
      latestContentRef.current = nextContent
      setContent(nextContent)
      setMode(nextMode)
      setCommandRevision((value) => value + 1)
    },
    [content]
  )

  const handleUndo = useCallback(() => {
    editorRef.current?.undo()
    setCommandRevision((value) => value + 1)
  }, [])

  const handleRedo = useCallback(() => {
    editorRef.current?.redo()
    setCommandRevision((value) => value + 1)
  }, [])

  const handleInsertImage = useCallback((image: EditorImageInput) => {
    const insertedContent = editorRef.current?.insertImage(image)
    const nextContent =
      insertedContent ?? editorRef.current?.getContent() ?? latestContentRef.current

    latestContentRef.current = nextContent
    setContent(nextContent)
    setSaveState((current) => (current === 'saving' ? current : 'dirty'))
    setCommandRevision((value) => value + 1)
  }, [])

  useEffect(() => {
    if (content === lastSavedContentRef.current || saveState !== 'dirty') {
      return
    }

    const timer = window.setTimeout(() => saveContent(content, true), AUTOSAVE_DELAY)

    return () => window.clearTimeout(timer)
  }, [content, saveContent, saveState])

  useEffect(() => {
    const handleOpenImageDialog = () => setImageDialogOpen(true)

    window.addEventListener(openImageDialogEventName, handleOpenImageDialog)

    return () => {
      window.removeEventListener(openImageDialogEventName, handleOpenImageDialog)
    }
  }, [])

  const canUndo = editorRef.current?.canUndo() ?? false
  const canRedo = editorRef.current?.canRedo() ?? false

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <EditorHeader
        canRedo={canRedo}
        canUndo={canUndo}
        mode={mode}
        onModeChange={handleModeChange}
        onImage={() => setImageDialogOpen(true)}
        onRedo={handleRedo}
        onSave={handleManualSave}
        onUndo={handleUndo}
        saveState={saveState}
        title={article.title}
      />

      <main
        className='pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0'
        data-command-revision={commandRevision}
      >
        {mode === 'rich' ? (
          <RichTextEditor
            content={content}
            onChange={handleChange}
            ref={editorRef}
          />
        ) : (
          <MdxSourceEditor
            content={content}
            onChange={handleChange}
            ref={editorRef}
          />
        )}
      </main>

      <MobileEditorDock
        canRedo={canRedo}
        canUndo={canUndo}
        mode={mode}
        onImage={() => setImageDialogOpen(true)}
        onModeChange={handleModeChange}
        onRedo={handleRedo}
        onUndo={handleUndo}
      />

      <EditorImageDialog
        articleId={article.id}
        onInsert={handleInsertImage}
        onOpenChange={setImageDialogOpen}
        open={imageDialogOpen}
      />
    </div>
  )
}
