# API 说明

所有请求和响应默认使用 JSON。错误响应结构为 `{ "error": "可读错误信息" }`。

## 认证

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/auth/register` | `{ username, password }`；首个账号成为超级管理员 |
| POST | `/api/auth/login` | 登录并写入 HttpOnly Cookie |
| POST | `/api/auth/logout` | 清除会话并跳转登录页 |

## 问卷

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET/POST | `/api/surveys` | 列表或创建问卷 |
| GET/PATCH/DELETE | `/api/surveys/[id]` | 读取、更新或删除自己的问卷 |
| POST | `/api/surveys/[id]/status` | `{ status: "ACTIVE|PAUSED|STOPPED" }` |
| POST/PUT | `/api/surveys/[id]/questions` | 新增问题或批量保存问题 |
| DELETE | `/api/surveys/[id]/questions/[questionId]` | 删除问题 |
| GET | `/api/surveys/[id]/analytics` | 汇总、趋势和题目分析 |
| GET | `/api/surveys/[id]/export` | 下载 UTF-8 BOM CSV |

## 公开填写

`GET /api/public/surveys/[slug]` 只返回填写所需内容，并记录一次访问。`POST /api/public/surveys/[slug]/responses` 接受 `{ answers, deviceId }`，服务端执行状态、时间、登录、必填与重复提交校验。

常见状态码：`400` 数据无效，`401` 未登录，`403` 无权限，`404` 不存在，`409` 状态冲突或重复提交，`423` 问卷不可填写。

## 管理

`GET/PATCH /api/admin/users` 用于列出、启用/停用用户和更新身份组；`GET/POST /api/admin/role-groups` 用于查看与创建身份组。接口均要求对应管理权限。
