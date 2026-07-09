'use client'

import { Extension } from '@tiptap/core'
import { type Node as ProseMirrorNode } from '@tiptap/pm/model'
import {
  NodeSelection,
  Plugin,
  PluginKey,
  TextSelection,
  type Transaction
} from '@tiptap/pm/state'
import {
  Decoration,
  DecorationSet,
  type EditorView
} from '@tiptap/pm/view'

type BlockControlsState = {
  draggingPos: number | null
  hoveredPos: number | null
}

type BlockControlsMeta = Partial<BlockControlsState>

const blockControlsPluginKey = new PluginKey<BlockControlsState>(
  'richTextBlockControls'
)

const blockControlsHeight = 28
const blockControlsWidth = 60
const blockControlsGap = 8

function isValidNodePos(doc: ProseMirrorNode, pos: number | null) {
  return typeof pos === 'number' && pos >= 0 && pos < doc.content.size
}

function getNodeAt(doc: ProseMirrorNode, pos: number | null) {
  if (!isValidNodePos(doc, pos)) return null

  return doc.nodeAt(pos)
}

function mapNodePos(doc: ProseMirrorNode, pos: number | null, tr: Transaction) {
  if (pos === null) return null

  const mapped = tr.mapping.mapResult(pos, -1)

  if (mapped.deleted || !isValidNodePos(doc, mapped.pos)) {
    return null
  }

  return mapped.pos
}

function sanitizeMetaPos(doc: ProseMirrorNode, pos: number | null | undefined) {
  return isValidNodePos(doc, pos) ? pos : null
}

function sanitizeMeta(doc: ProseMirrorNode, meta: unknown): BlockControlsMeta {
  if (!meta || typeof meta !== 'object') return {}

  const nextMeta = meta as BlockControlsMeta

  return {
    ...(Object.hasOwn(nextMeta, 'draggingPos') && {
      draggingPos: sanitizeMetaPos(doc, nextMeta.draggingPos)
    }),
    ...(Object.hasOwn(nextMeta, 'hoveredPos') && {
      hoveredPos: sanitizeMetaPos(doc, nextMeta.hoveredPos)
    })
  }
}

function getTopLevelBlockPos(doc: ProseMirrorNode, pos: number) {
  const safePos = Math.max(0, Math.min(pos, doc.content.size))
  const $pos = doc.resolve(safePos)

  if ($pos.depth > 0) {
    return $pos.before(1)
  }

  const child = doc.childBefore(safePos)

  if (child.node?.isBlock) {
    return child.offset
  }

  return doc.childCount ? 0 : null
}

function getSelectionBlockPos(doc: ProseMirrorNode, pos: number) {
  const blockPos = getTopLevelBlockPos(doc, pos)
  const node = getNodeAt(doc, blockPos)

  return node?.isBlock ? blockPos : null
}

function getEventBlockPos(view: EditorView, event: MouseEvent | DragEvent) {
  const controls = (event.target as Element | null)?.closest(
    '[data-rich-editor-block-pos]'
  )
  const controlsPos = controls?.getAttribute('data-rich-editor-block-pos')

  if (controlsPos) {
    return Number(controlsPos)
  }

  const result = view.posAtCoords({
    left: event.clientX,
    top: event.clientY
  })

  if (!result) return null

  return getSelectionBlockPos(view.state.doc, result.pos)
}

function updateHoveredPos(view: EditorView, hoveredPos: number | null) {
  const state = blockControlsPluginKey.getState(view.state)

  if (state?.hoveredPos === hoveredPos) return

  view.dispatch(
    view.state.tr.setMeta(blockControlsPluginKey, { hoveredPos })
  )
}

function insertSlashCommandAfterBlock(view: EditorView, pos: number) {
  const { state } = view
  const node = getNodeAt(state.doc, pos)
  const paragraph = state.schema.nodes.paragraph

  if (!node || !paragraph) return

  const insertPos = pos + node.nodeSize
  const tr = state.tr
    .insert(insertPos, paragraph.create())
    .insertText('/', insertPos + 1)
    .scrollIntoView()

  tr.setSelection(TextSelection.create(tr.doc, insertPos + 2))
  view.dispatch(tr)
  view.focus()
}

function moveBlock(view: EditorView, fromPos: number, insertPos: number) {
  const { state } = view
  const node = getNodeAt(state.doc, fromPos)

  if (!node?.isBlock) return false

  const fromEnd = fromPos + node.nodeSize

  if (insertPos >= fromPos && insertPos <= fromEnd) {
    return false
  }

  const nextInsertPos = insertPos > fromPos ? insertPos - node.nodeSize : insertPos

  if (nextInsertPos === fromPos) {
    return false
  }

  const tr = state.tr
    .delete(fromPos, fromEnd)
    .insert(nextInsertPos, node)
    .setMeta(blockControlsPluginKey, {
      draggingPos: null,
      hoveredPos: nextInsertPos
    })
    .scrollIntoView()

  tr.setSelection(NodeSelection.create(tr.doc, nextInsertPos))
  view.dispatch(tr)
  view.focus()

  return true
}

function getDropInsertPos(view: EditorView, event: DragEvent) {
  const targetPos = getEventBlockPos(view, event)

  if (targetPos === null) return null

  const node = getNodeAt(view.state.doc, targetPos)

  if (!node?.isBlock) return null

  const nodeDom = view.nodeDOM(targetPos)

  if (!(nodeDom instanceof HTMLElement)) {
    return targetPos
  }

  const rect = nodeDom.getBoundingClientRect()
  const shouldDropAfter = event.clientY > rect.top + rect.height / 2

  return shouldDropAfter ? targetPos + node.nodeSize : targetPos
}

function createBlockControls(view: EditorView, getPos: () => number | undefined) {
  const pos = getPos()
  const root = document.createElement('span')
  const addButton = document.createElement('button')
  const dragButton = document.createElement('button')

  root.className = 'rich-editor-block-controls'
  root.contentEditable = 'false'
  root.dataset.richEditorBlockPos = String(pos ?? '')

  if (typeof pos === 'number') {
    positionBlockControls(root, view, pos)
  }

  addButton.className = 'rich-editor-block-control-button'
  addButton.type = 'button'
  addButton.setAttribute('aria-label', '插入内容')
  addButton.textContent = '+'
  addButton.addEventListener('mousedown', (event) => {
    event.preventDefault()
  })
  addButton.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()

    const nextPos = getPos()

    if (typeof nextPos === 'number') {
      insertSlashCommandAfterBlock(view, nextPos)
    }
  })

  dragButton.className =
    'rich-editor-block-control-button rich-editor-block-drag-button'
  dragButton.draggable = true
  dragButton.type = 'button'
  dragButton.setAttribute('aria-label', '拖动内容块')
  dragButton.textContent = '⠿'
  dragButton.addEventListener('mousedown', (event) => {
    event.stopPropagation()

    const nextPos = getPos()

    if (typeof nextPos === 'number') {
      view.dispatch(
        view.state.tr
          .setSelection(NodeSelection.create(view.state.doc, nextPos))
          .setMeta(blockControlsPluginKey, { hoveredPos: nextPos })
      )
    }
  })
  dragButton.addEventListener('dragstart', (event) => {
    const nextPos = getPos()

    if (typeof nextPos !== 'number') return

    event.dataTransfer?.setData('text/plain', 'block')
    event.dataTransfer?.setDragImage(root, 12, 12)

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
    }

    view.dispatch(
      view.state.tr.setMeta(blockControlsPluginKey, {
        draggingPos: nextPos,
        hoveredPos: nextPos
      })
    )
  })
  dragButton.addEventListener('dragend', () => {
    view.dispatch(
      view.state.tr.setMeta(blockControlsPluginKey, { draggingPos: null })
    )
  })

  root.append(addButton, dragButton)

  return root
}

function positionBlockControls(root: HTMLElement, view: EditorView, pos: number) {
  if (!isValidNodePos(view.state.doc, pos)) return

  const nodeDom = view.nodeDOM(pos)

  if (!(nodeDom instanceof HTMLElement)) return

  const editorRect = view.dom.getBoundingClientRect()
  const nodeRect = nodeDom.getBoundingClientRect()
  const alignedBandHeight = nodeDom.classList.contains('rich-code-block')
    ? 48
    : Math.min(nodeRect.height, blockControlsHeight)
  const top =
    nodeRect.top -
    editorRect.top +
    Math.max(0, (alignedBandHeight - blockControlsHeight) / 2)
  const left =
    nodeRect.left - editorRect.left - blockControlsWidth - blockControlsGap

  root.style.left = `${left}px`
  root.style.top = `${top}px`
}

function createDecorations(viewState: EditorView['state']) {
  const pluginState = blockControlsPluginKey.getState(viewState)
  const activePos = getSelectionBlockPos(viewState.doc, viewState.selection.from)
  const pos = pluginState?.hoveredPos ?? activePos
  const node = getNodeAt(viewState.doc, pos)

  if (pos === null || !node?.isBlock) {
    return DecorationSet.empty
  }

  return DecorationSet.create(viewState.doc, [
    Decoration.widget(pos, createBlockControls, {
      key: `rich-editor-block-controls-${pos}`,
      side: -1,
      stopEvent: (event) =>
        event.target instanceof Element &&
        Boolean(event.target.closest('.rich-editor-block-controls'))
    })
  ])
}

export const RichTextBlockControls = Extension.create({
  name: 'richTextBlockControls',

  addProseMirrorPlugins() {
    return [
      new Plugin<BlockControlsState>({
        key: blockControlsPluginKey,
        state: {
          init: () => ({
            draggingPos: null,
            hoveredPos: null
          }),
          apply: (tr, value) => {
            const nextValue = tr.docChanged
              ? {
                  draggingPos: mapNodePos(tr.doc, value.draggingPos, tr),
                  hoveredPos: mapNodePos(tr.doc, value.hoveredPos, tr)
                }
              : value

            return {
              ...nextValue,
              ...sanitizeMeta(tr.doc, tr.getMeta(blockControlsPluginKey))
            }
          }
        },
        props: {
          decorations: createDecorations,
          handleDOMEvents: {
            dragover: (view, event) => {
              const state = blockControlsPluginKey.getState(view.state)

              if (typeof state?.draggingPos !== 'number') return false

              event.preventDefault()

              if (event.dataTransfer) {
                event.dataTransfer.dropEffect = 'move'
              }

              return true
            },
            drop: (view, event) => {
              const state = blockControlsPluginKey.getState(view.state)

              if (typeof state?.draggingPos !== 'number') return false

              event.preventDefault()

              const insertPos = getDropInsertPos(view, event)

              if (insertPos === null) return true

              moveBlock(view, state.draggingPos, insertPos)

              return true
            },
            mouseleave: (view) => {
              updateHoveredPos(view, null)

              return false
            },
            mousemove: (view, event) => {
              updateHoveredPos(view, getEventBlockPos(view, event))

              return false
            }
          }
        }
      })
    ]
  }
})
