# 小T1an's Blog

## 项目描述

一个用于记录个人经历、技术实践、编程知识与生活思考的全栈个人博客。

项目采用前后端分层架构：Next.js 负责页面渲染、用户交互以及 BFF/SSR，Go 服务负责文章、分类、标签、搜索和认证等核心业务。系统支持文章的创建与编辑、分类与标签管理、全文搜索，以及从飞书、掘金、CSDN 或 HTML/Markdown 内容导入文章。

## 技术栈

### 前端

- Next.js 16（App Router、Server Components、Server Actions）
- React 19、TypeScript 5
- Tailwind CSS 4、Radix UI、shadcn
- Tiptap 富文本编辑器、React Markdown、Shiki
- Motion、Lucide React、Iconify

### 后端

- Go 1.25
- Gin
- GORM
- JWT 身份认证
- PostgreSQL 15
- Redis 7.4

### 工程与部署

- pnpm
- Docker、Docker Compose
- Nginx

## Docker 部署

进入项目根目录，复制环境变量文件并根据实际环境修改配置：

```bash
cp .env.example .env
vim .env
```

启动全部服务：

```bash
docker compose up -d
```

更新时，在项目根目录拉取最新代码，然后重新构建并启动服务：

```bash
git pull
docker compose up -d --build
```

## 本地开发

### 环境要求

- Node.js 20+
- pnpm 10+
- Go 1.25+
- PostgreSQL 15
- Redis 7.4

### 1. 启动基础服务

确保 PostgreSQL 和 Redis 已启动，并根据实际环境修改 `backend/config.yml` 中的数据库及 Redis 连接信息。

在 `backend` 目录下启动 Docker：

```bash
cd backend
docker compose up -d
```

也可以在项目根目录使用 Docker Compose 启动 PostgreSQL 和 Redis：

```bash
docker compose up -d db redis
```

> 需要注意的是：使用根目录的 `docker-compose.yml` 启动的数据库和redis路径不同，根目录启动是在 `/` 根路径

### 2. 启动后端

打开一个终端，在项目根目录执行：

```bash
cd backend
go mod download
go run .
```

后端服务默认运行在 `http://localhost:8000`。

### 3. 启动前端

再打开一个终端，在项目根目录执行：

```bash
cd frontend
pnpm install
pnpm dev
```

前端默认通过 `http://localhost:3000` 访问，并在服务端请求 `http://localhost:8000` 的 Go API。
