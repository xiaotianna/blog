## 项目操作约束

- 不要自动执行 `dev`、`build` 相关命令，除非用户主动要求
- 不要自动执行任何 `git` 命令，除非用户主动要求

## 多项目规范读取

- 根目录 `AGENTS.md` 提供仓库通用规范
- 如果前端、后端或其他子项目目录下存在自己的 `AGENTS.md`，进入对应子项目工作前必须读取并遵守该子项目规范
- 子项目规范可以补充更具体的技术约束；与根目录规范冲突时，优先遵守更具体的子项目规范，但不得违反用户明确指令
- 涉及前后端联动时，需要同时参考根目录规范和对应前端/后端子项目规范

## 前后端接口与渲染规范

项目后端主要使用 Go，前端使用 Next.js。默认采用 Next.js 作为 BFF/SSR 层，尽量减少 Go 接口直接暴露给浏览器。

### 总体架构

```txt
Browser
  -> Next.js 页面 / Server Components / Server Actions / Route Handlers
  -> Go API
  -> DB / Redis / MQ / 第三方服务
```

### 默认原则

- Go API 默认只面向 Next.js 服务端调用，不直接暴露给浏览器
- 浏览器默认只访问 Next.js 页面、Server Actions 或必要的 Route Handlers
- API 地址、内部 token、服务间鉴权密钥等敏感信息只能放在服务端环境变量中，不得进入客户端 bundle
- 环境变量只有明确需要暴露给浏览器时才使用 `NEXT_PUBLIC_` 前缀
- 能用 Server Component/SSR 完成的数据读取，不在 Client Component 中直接请求 Go API
- 能用 Server Action 完成的提交操作，不额外新增公开 API
- Client Component 只承担必要的交互状态、事件绑定和浏览器 API 调用，不承载核心业务鉴权与数据访问逻辑

### 数据读取

- 页面级、详情页、列表页等首屏数据优先在 Server Component 中请求 Go API
- 需要每次请求实时计算的数据，使用 SSR/动态渲染
- 可缓存的数据应结合 Next.js 的缓存、`revalidatePath`、`revalidateTag` 等机制处理刷新
- 不要为了前端方便，把内部 Go 查询接口直接转成公开浏览器接口

### 提交与点击操作

- 表单提交优先使用 Server Actions，例如创建、更新、删除、登录后资料修改等
- 按钮点击类 mutation 也优先通过 Server Actions 在 Next.js 服务端提交到 Go API
- 如需 `onClick` 触发提交，可以在 Client Component 中调用从 `"use server"` 文件导出的 Server Action
- Server Action 内部负责参数校验、读取 cookie/session、调用 Go API、处理错误和触发缓存刷新
- 提交完成后的页面更新优先使用 `revalidatePath`、`revalidateTag`、`redirect` 或返回结构化状态

### Route Handler 使用边界

仅在以下场景优先考虑 Next.js Route Handler：

- 文件上传、下载、回调、Webhook 等需要明确 HTTP endpoint 的场景
- WebSocket、SSE、长轮询或需要特殊响应流的场景
- 第三方服务必须回调公网地址的场景
- 移动端、外部系统或非 Next.js 客户端也需要调用的接口
- 前端需要稳定 JSON endpoint，且 Server Action 不适合表达该交互

即使使用 Route Handler，也应优先让 Route Handler 转发或编排 Go API，而不是让浏览器直接访问 Go API。

### 安全与鉴权

- 浏览器不得持有 Go 内部服务 token
- 用户身份优先通过 HttpOnly Cookie / Session 在 Next.js 服务端读取
- Next.js 调用 Go API 时，应在服务端补充服务间鉴权信息
- 所有 mutation 必须在服务端重新校验权限，不能信任客户端传入的用户身份、角色或价格等敏感字段
- Server Actions 和 Route Handlers 都要进行输入校验、错误处理和权限检查

### 例外原则

只有在明确有收益时才直接暴露浏览器接口，例如：

- 公开内容 API 本身就是产品能力
- 大文件直传对象存储且使用短期签名 URL
- 实时通信协议必须由浏览器直连
- 第三方 SDK 要求浏览器直接请求指定接口

出现例外时，需要说明暴露原因、鉴权方式、限流策略和可见数据范围。

## Git Commit Message 约束

提交信息必须使用以下格式：

```bash
<type>: <subject>
```

示例：

```bash
feat: add login page
fix: resolve token expiration issue
docs: update usage guide
```

### type 允许值

- `feat`：新增功能
- `fix`：修复问题
- `docs`：文档更新
- `style`：格式调整
- `refactor`：代码重构
- `perf`：性能优化
- `test`：测试相关
- `chore`：配置、依赖、脚本等杂项
- `build`：构建相关
- `ci`：CI/CD 相关

### 规则

- 使用中文提交信息
- `subject` 简短明确，不超过 72 个字符
- 不以句号结尾
- 禁止使用 `update`、`fix bug`、`test`、`wip` 等无意义描述
- 一次提交只包含一类变更

## Go项目约束

- 不要编写、运行一切的测试文件或指令，除非用户主动要求
