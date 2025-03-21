import { NextResponse } from 'next/server';
import simpleGit from 'simple-git';
import fs from 'fs';
import path from 'path';
import os from 'os';

const git = simpleGit();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    const repoUrl = searchParams.get('repoUrl');

    if (!filePath || !repoUrl) {
      return NextResponse.json({ error: 'Path and repoUrl parameters are required' }, { status: 400 });
    }

    // 创建临时目录
    const tempDir = path.join(os.tmpdir(), 'git-preview-content-' + Date.now());
    await fs.promises.mkdir(tempDir, { recursive: true });

    try {
      // 克隆仓库
      await git.clone(repoUrl, tempDir, ['--depth', '1']);

      // 读取文件内容
      const normalizedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
      const fullPath = path.join(tempDir, normalizedPath);
      console.log('Attempting to read file:', fullPath);
      const content = await fs.promises.readFile(fullPath, 'utf-8');

      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    } finally {
      // 清理临时目录
      await fs.promises.rm(tempDir, { recursive: true, force: true });
    }
  } catch (error) {
    console.error('Error fetching file content:', error);
    return NextResponse.json({ error: 'Failed to fetch file content' }, { status: 500 });
  }
}