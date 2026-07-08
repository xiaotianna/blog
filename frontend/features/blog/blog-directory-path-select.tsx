'use client'

import { Cascader, type CascaderNode } from '@/components/cascader'
import { useMemo } from 'react'

import {
  ROOT_DIRECTORY_PATH,
  type BlogDirectoryPathOption
} from './blog-directory-paths'

type BlogDirectoryPathSelectProps = {
  allowRoot?: boolean
  className?: string
  description?: string
  id: string
  label: string
  name: string
  onChange: (value: string) => void
  options: BlogDirectoryPathOption[]
  placeholder?: string
  required?: boolean
  value: string
}

export function BlogDirectoryPathSelect({
  allowRoot = false,
  className,
  description,
  id,
  label,
  name,
  onChange,
  options,
  placeholder = '请选择目录路径',
  required = false,
  value
}: BlogDirectoryPathSelectProps) {
  const cascaderOptions = useMemo(
    () => getDirectoryCascaderOptions(options, allowRoot),
    [allowRoot, options]
  )

  return (
    <div className={className}>
      <label
        className='mb-2 block text-sm font-medium'
        htmlFor={id}
        onClick={(event) => event.preventDefault()}
      >
        {label}
      </label>
      <input
        name={name}
        required={required}
        type='hidden'
        value={value}
      />
      <Cascader
        emptyChildText='当前目录暂无子目录'
        emptyRootText='暂无可选目录'
        id={id}
        onValueChange={(nextValue) => {
          onChange(nextValue ?? (allowRoot ? ROOT_DIRECTORY_PATH : ''))
        }}
        options={cascaderOptions}
        placeholder={placeholder}
        searchPlaceholder='搜索目录'
        triggerClassName='h-10 rounded-lg'
        value={value || null}
      />
      {description ? (
        <p className='mt-1.5 text-xs text-muted-foreground'>{description}</p>
      ) : null}
    </div>
  )
}

function getDirectoryCascaderOptions(
  options: BlogDirectoryPathOption[],
  allowRoot: boolean
) {
  const nodesByPath = new Map<string, CascaderNode>()

  for (const option of options) {
    nodesByPath.set(option.path, {
      children: [],
      label: option.label,
      value: option.path
    })
  }

  const rootNodes: CascaderNode[] = []

  for (const option of options) {
    const node = nodesByPath.get(option.path)
    if (!node) {
      continue
    }

    const parentPath = getParentDirectoryPath(option.path)
    const parentNode = parentPath ? nodesByPath.get(parentPath) : undefined

    if (parentNode) {
      parentNode.children = [...(parentNode.children ?? []), node]
    } else {
      rootNodes.push(node)
    }
  }

  sortDirectoryNodes(rootNodes)

  if (!allowRoot) {
    return rootNodes
  }

  return [
    {
      children: rootNodes,
      label: '根目录',
      value: ROOT_DIRECTORY_PATH
    }
  ]
}

function getParentDirectoryPath(path: string) {
  const segments = path.split('/').filter(Boolean)

  if (segments.length <= 1) {
    return ''
  }

  return segments.slice(0, -1).join('/')
}

function sortDirectoryNodes(nodes: CascaderNode[]) {
  nodes.sort((first, second) => first.value.localeCompare(second.value))

  for (const node of nodes) {
    if (node.children?.length) {
      sortDirectoryNodes(node.children)
    }
  }
}
