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

* `feat`：新增功能
* `fix`：修复问题
* `docs`：文档更新
* `style`：格式调整
* `refactor`：代码重构
* `perf`：性能优化
* `test`：测试相关
* `chore`：配置、依赖、脚本等杂项
* `build`：构建相关
* `ci`：CI/CD 相关

### 规则

* 使用中文提交信息
* `subject` 简短明确，不超过 72 个字符
* 不以句号结尾
* 禁止使用 `update`、`fix bug`、`test`、`wip` 等无意义描述
* 一次提交只包含一类变更
