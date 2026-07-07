## Frontend 项目规范

本目录是 Next.js 前端项目。进入本目录工作前，必须同时读取根目录 `AGENTS.md` 和本文件。

## 操作约束

- 不要自动执行 `dev`、`build` 相关命令，除非用户主动要求
- 不要自动执行任何 `git` 命令，除非用户主动要求
- 不要自动运行测试、lint、类型检查或格式化命令，除非用户主动要求

## 认证与接口边界

项目采用以下认证边界：

```txt
Browser
  -> Cookie
  -> Next.js Server Components / Server Actions / Route Handlers
  -> Authorization Header
  -> Go API
```

### 浏览器与 Next.js

- 浏览器与 Next.js 之间使用 Cookie 维护登录态
- 登录 token 不得存入 `localStorage`、`sessionStorage`、IndexedDB 或普通可读 Cookie
- 登录成功后，由 Next.js 在 Server Action 或 Route Handler 中设置 `HttpOnly` Cookie
- Cookie 应默认使用 `httpOnly: true`、`secure: true`、`sameSite: "lax"` 或更严格配置、`path: "/"`
- 生产环境优先使用 `__Host-` 前缀的 Cookie 名称，例如 `__Host-access_token`
- 前端 Client Component 不应读取、拼接或传递认证 token

### Next.js 与 Go API

- Next.js 服务端读取 Cookie 中的 token
- Next.js 调用 Go API 时，通过 Header 携带认证信息，例如 `Authorization: Bearer <token>`
- Go API 不直接面向浏览器暴露认证接口
- 不要让浏览器直接请求 Go API 并手动携带 token
- Go API 返回的 token 只能在 Next.js 服务端处理，不得返回给 Client Component

## 推荐实现方式

### 登录

- 登录表单优先提交到 Server Action
- Server Action 调用 Go 登录接口
- Go 返回 token 后，Server Action 写入 `HttpOnly` Cookie
- 登录完成后通过 `redirect` 跳转或返回结构化错误信息

### SSR 数据读取

- 页面数据优先在 Server Component 中读取
- Server Component 通过统一的服务端 API client 调用 Go API
- 服务端 API client 负责从 `cookies()` 读取 token 并注入 `Authorization` Header
- 不在 Client Component 中直接请求需要认证的 Go API

### 提交操作

- 创建、更新、删除、点赞、收藏、发布等 mutation 优先使用 Server Actions
- Server Action 内部读取 Cookie、调用 Go API、处理错误，并按需执行 `revalidatePath`、`revalidateTag` 或 `redirect`
- 如需点击触发，可以让小型 Client Component 调用 Server Action；业务 token 仍只在服务端处理

## 权限与按钮渲染

- 允许用户未登录访问公开页面
- 是否展示登录后按钮、管理按钮、编辑按钮等，应尽量在 Server Component 中基于服务端用户态判断
- 不要先把按钮渲染到客户端，再仅靠客户端状态隐藏
- 不要把权限判断所需的敏感字段、角色 token 或完整用户权限表暴露给客户端
- Client Component 只能接收已经脱敏、最小化的展示状态，例如 `canEdit: boolean`
- 即使按钮未渲染，所有 Server Actions、Route Handlers 和 Go API 仍必须重新校验权限

示例原则：

```tsx
// Server Component
export default async function Page() {
  const user = await getCurrentUser()

  return (
    <main>
      {user?.canCreatePost ? <CreatePostButton /> : null}
    </main>
  )
}
```

## proxy.ts 使用边界

不要把全局 `proxy.ts` 作为默认认证、权限按钮渲染或 Go API Header 注入中心。

### 适合使用 proxy.ts 的场景

- 粗粒度路由保护，例如后台页面未登录时重定向到登录页
- 多语言、租户、AB 实验等请求级路由分流
- 添加通用安全响应头
- 非业务细节的轻量请求预处理

### 不适合使用 proxy.ts 的场景

- 判断页面内按钮是否渲染
- 细粒度业务权限判断
- 替代 Server Component 的用户态读取
- 替代统一服务端 API client 给 Go API 注入 Header
- 处理复杂 token 刷新、错误恢复或业务状态编排

原因：

- 当前产品允许无 token 用户访问公开页面，不适合在全局入口强制拦截
- 按钮是否渲染属于页面 UI 和业务权限，应在服务端渲染阶段决定
- 全局 proxy 容易形成隐藏耦合，使认证逻辑分散且难以追踪

推荐做法：

- 使用统一的 `server-only` API client 处理 Go API 请求和 Header 注入
- 使用 Server Component 决定公开页面中的登录态 UI
- 仅在确实需要保护整个路由段时使用 `proxy.ts`

## 安全要求

- 所有服务端入口都必须重新校验权限，包括 Server Actions、Route Handlers 和 Go API
- 不信任客户端传入的用户 ID、角色、权限、价格、作者 ID 等敏感字段
- Cookie 删除、刷新和续期只在 Server Action 或 Route Handler 中处理
- token 过期时优先在 Next.js 服务端处理刷新或清理 Cookie
- 对公开接口、上传、Webhook、SSE、WebSocket 等例外场景，需要单独说明暴露原因、鉴权方式和限流策略
