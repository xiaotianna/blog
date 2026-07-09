'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Extension, type Range } from '@tiptap/core'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import { Markdown } from '@tiptap/markdown'
import { PluginKey } from '@tiptap/pm/state'
import { EditorContent, ReactRenderer, useEditor, type Editor } from '@tiptap/react'
import Suggestion, {
  type SuggestionKeyDownProps,
  type SuggestionPositionData,
  type SuggestionProps
} from '@tiptap/suggestion'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Code2,
  Heading1,
  Heading2,
  Info,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  type LucideIcon
} from 'lucide-react'
import {
  type FormEvent,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState
} from 'react'

import { protectMdxForRichText, restoreMdxFromRichText } from './mdx-content'
import { RichTextAlertBlockquote } from './rich-text-alert-blockquote'
import { RichTextBlockControls } from './rich-text-block-controls'
import { RichTextCodeBlock } from './rich-text-code-block'

export type EditorCommandHandle = {
  canRedo: () => boolean
  canUndo: () => boolean
  focus: () => void
  getContent: () => string
  redo: () => void
  undo: () => void
}

type RichTextEditorProps = {
  content: string
  onChange: (content: string) => void
}

type MarkdownEditor = Editor & {
  getMarkdown: () => string
}

type SlashCommandItem = {
  icon: LucideIcon
  label: string
  searchTerms: string[]
  description: string
  command: (props: { editor: Editor; range: Range }) => void
}

type SlashCommandListProps = SuggestionProps<
  SlashCommandItem,
  SlashCommandItem
>

type SlashCommandListHandle = {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean
}

type PendingLinkCommand = {
  editor: Editor
  range: Range
}

type OpenLinkDialogEvent = CustomEvent<PendingLinkCommand>

const slashCommandPluginKey = new PluginKey('slash-command')
const openLinkDialogEventName = 'rich-text-editor:open-link-dialog'
const slashCommandMenuMaxHeight = 384
const slashCommandMenuWidth = 288
const slashCommandViewportPadding = 12
const slashCommandTopSafeArea = 112

function normalizeLinkHref(href: string) {
  const value = href.trim()

  if (!value) return ''
  if (/^(?:[a-z][a-z\d+.-]*:|#|\/)/i.test(value)) return value

  return `https://${value}`
}

function createLinkedTextContent(text: string, href: string) {
  return {
    type: 'text',
    text,
    marks: [
      {
        type: 'link',
        attrs: { href }
      }
    ]
  }
}

function insertAlertBlock(
  editor: Editor,
  range: Range,
  marker: 'NOTE' | 'TIP' | 'IMPORTANT' | 'WARNING' | 'CAUTION',
  placeholder: string
) {
  editor
    .chain()
    .focus()
    .deleteRange(range)
    .insertContent(`\n\n> [!${marker}]\n> ${placeholder}\n\n`, {
      contentType: 'markdown'
    })
    .run()
}

const slashCommandItems: SlashCommandItem[] = [
  {
    icon: Heading1,
    label: '一级标题',
    searchTerms: ['h1', 'heading1', 'title', 'biaoti'],
    description: '大标题',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
  },
  {
    icon: Heading2,
    label: '二级标题',
    searchTerms: ['h2', 'heading2', 'subtitle', 'biaoti'],
    description: '小节标题',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
  },
  {
    icon: Bold,
    label: '加粗',
    searchTerms: ['bold', 'strong', 'jiacu'],
    description: '切换粗体',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBold().run()
  },
  {
    icon: Italic,
    label: '斜体',
    searchTerms: ['italic', 'xieti'],
    description: '切换斜体',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleItalic().run()
  },
  {
    icon: Link2,
    label: '链接',
    searchTerms: ['link', 'url', 'href', 'lianjie'],
    description: '插入链接',
    command: ({ editor, range }) => {
      window.dispatchEvent(
        new CustomEvent<PendingLinkCommand>(openLinkDialogEventName, {
          detail: { editor, range }
        })
      )
    }
  },
  {
    icon: Quote,
    label: '引用',
    searchTerms: ['quote', 'blockquote', 'yinyong'],
    description: '引用块',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run()
  },
  {
    icon: Info,
    label: 'Github 警报块',
    searchTerms: [
      'alert',
      'github',
      'note',
      'tip',
      'important',
      'warning',
      'caution',
      'jingbao'
    ],
    description: '插入 GitHub 风格警报块',
    command: ({ editor, range }) =>
      insertAlertBlock(editor, range, 'NOTE', 'Useful information that users should know.')
  },
  {
    icon: List,
    label: '无序列表',
    searchTerms: ['bullet', 'list', 'wuxu'],
    description: '项目符号列表',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
  },
  {
    icon: ListOrdered,
    label: '有序列表',
    searchTerms: ['ordered', 'number', 'list', 'youxu'],
    description: '数字列表',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
  },
  {
    icon: Code2,
    label: '代码块',
    searchTerms: ['code', 'block', 'daima'],
    description: '插入代码块',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
  }
]

const SlashCommand = Extension.create({
  name: 'slashCommand',

  addProseMirrorPlugins() {
    return [
      Suggestion<SlashCommandItem, SlashCommandItem>({
        editor: this.editor,
        char: '/',
        allowedPrefixes: null,
        pluginKey: slashCommandPluginKey,
        command: ({ editor, range, props }) => {
          props.command({ editor, range })
        },
        items: ({ query }) => {
          const normalizedQuery = query.trim().toLowerCase()

          if (!normalizedQuery) {
            return slashCommandItems
          }

          return slashCommandItems.filter((item) =>
            [item.label, item.description, ...item.searchTerms]
              .join(' ')
              .toLowerCase()
              .includes(normalizedQuery)
          )
        },
        render: () => {
          let component: ReactRenderer<SlashCommandListHandle, SlashCommandListProps> | null = null
          let unmount: (() => void) | null = null

          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashCommandList, {
                editor: props.editor,
                props
              })
              unmount = props.mount(component.element, {
                onPosition: (position) =>
                  positionSlashCommandList(component?.element, position)
              })
            },
            onUpdate: (props) => {
              component?.updateProps(props)
            },
            onKeyDown: (props) => component?.ref?.onKeyDown(props) ?? false,
            onExit: () => {
              unmount?.()
              component?.destroy()
              unmount = null
              component = null
            }
          }
        }
      })
    ]
  }
})

function positionSlashCommandList(
  element: HTMLElement | null | undefined,
  position: SuggestionPositionData
) {
  if (!element) return

  const elementHeight = Math.min(
    element.offsetHeight || slashCommandMenuMaxHeight,
    slashCommandMenuMaxHeight
  )
  const maxLeft = Math.max(
    slashCommandViewportPadding,
    window.innerWidth - slashCommandMenuWidth - slashCommandViewportPadding
  )
  const maxTop = Math.max(
    slashCommandViewportPadding,
    window.innerHeight - elementHeight - slashCommandViewportPadding
  )
  const minTop = Math.min(slashCommandTopSafeArea, maxTop)
  const left = Math.min(Math.max(position.x, slashCommandViewportPadding), maxLeft)
  const top = Math.min(Math.max(position.y, minTop), maxTop)

  element.style.position = position.strategy
  element.style.left = `${left}px`
  element.style.top = `${top}px`
}

export const RichTextEditor = forwardRef<EditorCommandHandle, RichTextEditorProps>(
  function RichTextEditor({ content, onChange }, ref) {
    const protectedContent = useMemo(() => protectMdxForRichText(content), [content])
    const [linkHref, setLinkHref] = useState('')
    const [linkText, setLinkText] = useState('')
    const [pendingLinkCommand, setPendingLinkCommand] =
      useState<PendingLinkCommand | null>(null)
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          blockquote: false,
          codeBlock: false,
          link: {
            autolink: true,
            linkOnPaste: true,
            openOnClick: false
          }
        }),
        RichTextAlertBlockquote,
        RichTextCodeBlock,
        Table.configure({
          resizable: true
        }),
        TableRow,
        TableHeader,
        TableCell,
        SlashCommand,
        RichTextBlockControls,
        Placeholder.configure({
          placeholder: ({ node }) => {
            if (node.type.name === 'heading') {
              return '标题'
            }

            return "输入 '/' 插入内容，或直接开始写作"
          }
        }),
        Markdown.configure({
          markedOptions: {
            gfm: true
          }
        })
      ],
      content: protectedContent,
      contentType: 'markdown',
      editorProps: {
        attributes: {
          class:
            'article-content rich-editor-content relative mx-auto min-h-[calc(100dvh-11rem)] w-full max-w-3xl px-5 py-12 outline-none'
        }
      },
      immediatelyRender: false,
      onUpdate: ({ editor }) => {
        onChange(restoreMdxFromRichText((editor as MarkdownEditor).getMarkdown()))
      }
    })

    useImperativeHandle(
      ref,
      () => ({
        canRedo: () => editor?.can().redo() ?? false,
        canUndo: () => editor?.can().undo() ?? false,
        focus: () => editor?.commands.focus(),
        getContent: () =>
          editor
            ? restoreMdxFromRichText((editor as MarkdownEditor).getMarkdown())
            : content,
        redo: () => editor?.chain().focus().redo().run(),
        undo: () => editor?.chain().focus().undo().run()
      }),
      [content, editor]
    )

    useEffect(() => {
      if (!editor) return

      let cancelled = false

      const current = restoreMdxFromRichText(
        (editor as MarkdownEditor).getMarkdown()
      )

      if (current !== content) {
        queueMicrotask(() => {
          if (cancelled || editor.isDestroyed) return

          editor.commands.setContent(protectedContent, { contentType: 'markdown' })
        })
      }

      return () => {
        cancelled = true
      }
    }, [content, editor, protectedContent])

    useEffect(() => {
      const handleOpenLinkDialog = (event: Event) => {
        const detail = (event as OpenLinkDialogEvent).detail

        setLinkHref('')
        setLinkText('')
        setPendingLinkCommand(detail)
      }

      window.addEventListener(openLinkDialogEventName, handleOpenLinkDialog)

      return () => {
        window.removeEventListener(openLinkDialogEventName, handleOpenLinkDialog)
      }
    }, [])

    const closeLinkDialog = (options: { deleteTrigger?: boolean } = {}) => {
      if (options.deleteTrigger && pendingLinkCommand) {
        pendingLinkCommand.editor
          .chain()
          .focus()
          .deleteRange(pendingLinkCommand.range)
          .run()
      }

      setPendingLinkCommand(null)
      setLinkHref('')
      setLinkText('')
    }

    const handleLinkDialogOpenChange = (open: boolean) => {
      if (open) return

      closeLinkDialog({ deleteTrigger: true })
    }

    const handleLinkDialogSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (!pendingLinkCommand) return

      const href = normalizeLinkHref(linkHref)

      if (!href) return

      const text = linkText.trim() || href

      pendingLinkCommand.editor
        .chain()
        .focus()
        .deleteRange(pendingLinkCommand.range)
        .insertContent(createLinkedTextContent(text, href))
        .run()

      closeLinkDialog()
    }

    if (!editor) {
      return <div className='mx-auto h-[50dvh] max-w-3xl animate-pulse rounded-lg bg-muted' />
    }

    return (
      <div className='min-h-0 bg-background'>
        <EditorContent editor={editor} />
        <Dialog
          open={Boolean(pendingLinkCommand)}
          onOpenChange={handleLinkDialogOpenChange}
        >
          <DialogContent showCloseButton={false}>
            <form
              className='grid gap-4'
              onSubmit={handleLinkDialogSubmit}
            >
              <DialogHeader>
                <DialogTitle>插入链接</DialogTitle>
                <DialogDescription>
                  添加链接地址和展示文本。
                </DialogDescription>
              </DialogHeader>
              <div className='grid gap-3'>
                <label className='grid gap-1.5 text-sm font-medium'>
                  链接地址
                  <Input
                    autoFocus
                    onChange={(event) => setLinkHref(event.currentTarget.value)}
                    placeholder='https://example.com'
                    value={linkHref}
                  />
                </label>
                <label className='grid gap-1.5 text-sm font-medium'>
                  展示文本
                  <Input
                    onChange={(event) => setLinkText(event.currentTarget.value)}
                    placeholder='默认使用链接地址'
                    value={linkText}
                  />
                </label>
              </div>
              <DialogFooter className='mx-0 mb-0 border-t-0 bg-transparent p-0 pt-1'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => closeLinkDialog({ deleteTrigger: true })}
                >
                  取消
                </Button>
                <Button
                  type='submit'
                  disabled={!linkHref.trim()}
                >
                  插入
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    )
  }
)

const SlashCommandList = forwardRef<SlashCommandListHandle, SlashCommandListProps>(
  function SlashCommandList({ command, items }, ref) {
    const [selectedIndex, setSelectedIndex] = useState(0)

    useEffect(() => {
      setSelectedIndex(0)
    }, [items])

    useImperativeHandle(
      ref,
      () => ({
        onKeyDown: ({ event }) => {
          if (event.key === 'ArrowUp') {
            setSelectedIndex((index) =>
              items.length ? (index + items.length - 1) % items.length : 0
            )
            return true
          }

          if (event.key === 'ArrowDown') {
            setSelectedIndex((index) =>
              items.length ? (index + 1) % items.length : 0
            )
            return true
          }

          if (event.key === 'Enter') {
            const item = items[selectedIndex]

            if (item) {
              command(item)
            }

            return true
          }

          return false
        }
      }),
      [command, items, selectedIndex]
    )

    return (
      <div className='max-h-96 w-72 overflow-x-hidden overflow-y-auto overscroll-contain rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-xl shadow-foreground/10'>
        {items.length ? (
          items.map((item, index) => {
            const Icon = item.icon

            return (
              <button
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors',
                  index === selectedIndex && 'bg-muted text-foreground'
                )}
                key={item.label}
                onClick={() => command(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                type='button'
              >
                <span className='flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background'>
                  <Icon className='size-4' />
                </span>
                <span className='min-w-0'>
                  <span className='block truncate font-medium'>{item.label}</span>
                  <span className='block truncate text-xs text-muted-foreground'>
                    {item.description}
                  </span>
                </span>
              </button>
            )
          })
        ) : (
          <div className='px-3 py-2 text-sm text-muted-foreground'>
            没有匹配的命令
          </div>
        )}
      </div>
    )
  }
)
