## P0 必做

- [] og

## P1 重要

- [ ] 搜索功能接真实数据
  - 现状：搜索弹窗使用固定 `SEARCH_ITEMS`，输入框没有真实查询和跳转逻辑。
  - 参考：`frontend/components/header-search-dialog.tsx`

- tag页面

- [ ] 确认首页分类区是否接真实目录数据
  - 现状：首页个人信息/技能/链接偏静态配置；分类区需要确认是否从 Go API 获取真实目录，否则应改成真实内容入口。
  - 参考：`frontend/app/(home)/page.tsx`、`frontend/features/home/categories.tsx`

- 导入外部的文章（飞书、掘金、csdn），以及图片转移