import { NextResponse } from 'next/server';
import simpleGit from 'simple-git';
import fs from 'fs';
import path from 'path';
import os from 'os';

const git = simpleGit();

// 生成目录结构
async function generateStructure(dir: string, basePath = '') {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const structure: any = [];

  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;

    const relativePath = path.join(basePath, entry.name);
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const children = await generateStructure(fullPath, relativePath);
      structure.push({
        name: entry.name,
        type: 'directory',
        path: relativePath,
        children
      });
    } else {
      structure.push({
        name: entry.name,
        type: 'file',
        path: relativePath
      });
    }
  }

  return structure;
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 });
    }

    // 创建临时目录
    const tempDir = path.join(os.tmpdir(), 'git-preview-' + Date.now());
    await fs.promises.mkdir(tempDir, { recursive: true });

    // 克隆仓库
    await git.clone(url, tempDir, ['--depth', '1']); // 添加超时和重试机制

    // 生成目录结构
    const structure = {
      name: 'project-root',
      type: 'directory',
      path: '/',
      children: await generateStructure(tempDir)
    };

    // 清理临时目录
    await fs.promises.rm(tempDir, { recursive: true, force: true });

    return NextResponse.json(structure);
  } catch (error) {
    console.error('Error processing repository:', error);
    return NextResponse.json({ 
  error: (error as any).message.includes('timeout') ? '连接超时，请检查网络或重试' : '仓库克隆失败',
  code: (error as any).message.includes('ECONNREFUSED') ? 'NETWORK_ERROR' : 'GIT_ERROR'
 }, { status: 500 });
  }
}