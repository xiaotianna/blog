'use client';

import { useEffect } from 'react';
import Prism from 'prismjs';
import '@/styles/github-theme.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-bash';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import 'prismjs/plugins/line-numbers/prism-line-numbers';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

const getLanguageFromPath = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase();
  const languageMap: { [key: string]: string } = {
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    css: 'css',
    json: 'json',
    md: 'markdown',
    py: 'python',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    go: 'go',
    rs: 'rust',
    yml: 'yaml',
    yaml: 'yaml',
    sh: 'bash',
    bash: 'bash'
  };
  return languageMap[ext || ''] || 'plaintext';
};

export { getLanguageFromPath };

export function CodeBlock({ code, language, showLineNumbers = true }: CodeBlockProps) {
  useEffect(() => {
    Prism.highlightAll();
  }, [code, language]);

  const languageClass = language ? `language-${language}` : '';
  const lineNumbersClass = showLineNumbers ? 'line-numbers' : '';

  return (
    <pre className={`${languageClass} ${lineNumbersClass} rounded-md text-sm font-mono p-4`}>
      <code className={languageClass}>{code}</code>
    </pre>
  );
}