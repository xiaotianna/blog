## P0 必做

- [x] 补全标签功能
  - 现状：后端已有 `TagEntity`，文章 DTO 也接收 `tagIds`，但缺少 tag 路由、控制器、服务、DAO 和前端标签选择/创建入口。
  - 参考：`backend/entities/tag_entity.go`、`backend/dto/article_dto.go`

- [x] 实现文章标签持久化
  - 现状：`UpdateArticleRequest.TagIDs` 未在 `ArticleService.Update` 中更新多对多关系。
  - 参考：`backend/services/article_service.go`

- [] 移动端文章预览页面（编辑器）
- [] og

## P1 重要

- [ ] 完善发布流程
  - 现状：已有 `publish/private/draft` 状态和 `PublishedAt` 字段，但状态切换时未看到写入或清空发布时间的逻辑。
  - 参考：`backend/entities/article_entity.go`、`backend/services/article_service.go`

- [ ] 搜索功能接真实数据
  - 现状：搜索弹窗使用固定 `SEARCH_ITEMS`，输入框没有真实查询和跳转逻辑。
  - 参考：`frontend/components/header-search-dialog.tsx`

- [ ] 完善公开文章详情页展示
  - 现状：`/post/[...slug]` 只渲染正文，标题、摘要、封面、发布日期、标签没有在页面内容中展示。
  - 参考：`frontend/app/(home)/post/[...slug]/page.tsx`

- [ ] 确认首页分类区是否接真实目录数据
  - 现状：首页个人信息/技能/链接偏静态配置；分类区需要确认是否从 Go API 获取真实目录，否则应改成真实内容入口。
  - 参考：`frontend/app/(home)/page.tsx`、`frontend/features/home/categories.tsx`
