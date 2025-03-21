'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronRight, FiChevronDown, FiFolder, FiFile } from 'react-icons/fi';

type FileNode = {
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  path: string;
};

type FileTreeProps = {
  structure: FileNode | null;
  onFileSelect: (path: string) => void;
};

type FileTreeNodeProps = {
  node: FileNode;
  onFileSelect: (path: string) => void;
  level?: number;
};

const FileTreeNode = ({ node, onFileSelect, level = 0 }: FileTreeNodeProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    if (node.type === 'directory') {
      setIsOpen(!isOpen);
    }
  };

  const handleFileClick = () => {
    if (node.type === 'file') {
      onFileSelect(node.path);
    }
  };

  return (
    <div className="select-none">
      <motion.div
        className={`flex items-center py-1 px-2 rounded hover:bg-gray-700 cursor-pointer ${node.type === 'file' ? 'hover:text-blue-400' : ''}`}
        style={{ paddingLeft: `${level * 1.5}rem` }}
        onClick={node.type === 'file' ? handleFileClick : toggleOpen}
      >
        <span className="mr-2">
          {node.type === 'directory' ? (
            isOpen ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />
          ) : null}
        </span>
        <span className="mr-2">
          {node.type === 'directory' ? (
            isOpen ? <FiFolder className="w-4 h-4 text-yellow-400" /> : <FiFolder className="w-4 h-4 text-yellow-400" />
          ) : (
            <FiFile className="w-4 h-4" />
          )}
        </span>
        <span className="truncate">{node.name}</span>
      </motion.div>
      {node.type === 'directory' && isOpen && node.children && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          {node.children.map((child, index) => (
            <FileTreeNode
              key={`${child.path}-${index}`}
              node={child}
              onFileSelect={onFileSelect}
              level={level + 1}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
};

const sortNodes = (nodes: FileNode[]): FileNode[] => {
  const sortedNodes = nodes.sort((a, b) => {
    // 文件夹优先
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1;
    }
    // 同类型按字母排序
    return a.name.localeCompare(b.name);
  });

  // 递归处理子目录
  sortedNodes.forEach(node => {
    if (node.type === 'directory' && node.children) {
      node.children = sortNodes(node.children);
    }
  });

  return sortedNodes;
};

export function FileTree({ structure, onFileSelect }: FileTreeProps) {
  if (!structure) return null;
  if (structure.children) {
    structure.children = sortNodes(structure.children);
  }
  return (
    <div className="pl-2">
      {structure.children?.map((child, index) => (
        <FileTreeNode
          key={`${child.path}-${index}`}
          node={child}
          onFileSelect={onFileSelect}
        />
      ))}
    </div>
  );
}