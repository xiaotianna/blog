'use client'

import { cn } from '@/lib/utils'
import { Extension, type Range } from '@tiptap/core'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import { Markdown } from '@tiptap/markdown'
import { PluginKey } from '@tiptap/pm/state'
import { EditorContent, ReactRenderer, useEditor, type Editor } from '@tiptap/react'
import Suggestion, {
  type SuggestionKeyDownProps,
  type SuggestionProps
} from '@tiptap/suggestion'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Braces,
  Code2,
  Heading1,
  Heading2,
  Italic,
  List,
  ListChecks,
  ListOrdered,
  Quote,
  type LucideIcon
} from 'lucide-react'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState
} from 'react'

import { createMdxComponentBlock, protectMdxForRichText, restoreMdxFromRichText } from './mdx-content'
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

const slashCommandPluginKey = new PluginKey('slash-command')

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
    icon: Quote,
    label: '引用',
    searchTerms: ['quote', 'blockquote', 'yinyong'],
    description: '引用块',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run()
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
    icon: ListChecks,
    label: '任务列表',
    searchTerms: ['task', 'todo', 'check', 'renwu'],
    description: '待办事项',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleTaskList().run()
  },
  {
    icon: Code2,
    label: '代码块',
    searchTerms: ['code', 'block', 'daima'],
    description: '插入代码块',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
  },
  {
    icon: Braces,
    label: 'MDX 组件块',
    searchTerms: ['mdx', 'component', 'zujian'],
    description: '插入 MDX 组件',
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(`\n\n${createMdxComponentBlock()}\n\n`, {
          contentType: 'markdown'
        })
        .run()
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
              unmount = props.mount(component.element)
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

export const RichTextEditor = forwardRef<EditorCommandHandle, RichTextEditorProps>(
  function RichTextEditor({ content, onChange }, ref) {
    const protectedContent = useMemo(() => protectMdxForRichText(content), [content])
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          codeBlock: false
        }),
        RichTextCodeBlock,
        Table.configure({
          resizable: true
        }),
        TableRow,
        TableHeader,
        TableCell,
        TaskList,
        TaskItem.configure({
          nested: true
        }),
        SlashCommand,
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
            'article-content rich-editor-content mx-auto min-h-[calc(100dvh-11rem)] w-full max-w-3xl px-5 py-12 outline-none'
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

      const current = restoreMdxFromRichText(
        (editor as MarkdownEditor).getMarkdown()
      )

      if (current !== content) {
        editor.commands.setContent(protectedContent, { contentType: 'markdown' })
      }
    }, [content, editor, protectedContent])

    if (!editor) {
      return <div className='mx-auto h-[50dvh] max-w-3xl animate-pulse rounded-lg bg-muted' />
    }

    return (
      <div className='min-h-0 bg-background'>
        <EditorContent editor={editor} />
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
      <div className='w-72 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-xl shadow-foreground/10'>
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
