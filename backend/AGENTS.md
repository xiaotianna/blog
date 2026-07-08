## DTO 校验文案规范

- 后端 DTO 字段使用 `binding` 校验参数时，必须同步添加 `message` tag 提供自定义错误文案
- `message` tag 的格式必须与 `binding` 中的校验规则一一对应，格式为 `规则=错误文案`，多个规则用英文分号 `;` 分隔
- 示例：

```go
type LoginRequest struct {
	Phone    string `json:"phone" binding:"required,cn_mobile" message:"required=手机号不能为空;cn_mobile=手机号不合法"`
	Password string `json:"password" binding:"required" message:"required=密码不能为空"`
}
```

- 新增自定义校验规则时，需要在 `utils/validate` 中注册校验逻辑，并在 DTO 的 `message` tag 中提供对应规则的错误文案
