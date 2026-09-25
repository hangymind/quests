# 架构说明

## 模块

- `app/(auth)`：登录与注册；首个注册用户自动获得超级管理员身份组。
- `app/(console)`：受保护的控制台、编辑器、统计和管理后台。
- `app/q/[slug]`：公开问卷填写页。
- `app/api`：认证、问卷、答卷、统计、导出和管理 API。
- `lib/auth.ts`：签名会话 Cookie 与权限判断。
- `prisma/schema.prisma`：用户、RBAC、问卷、题目、逻辑、答卷和事件模型。

## 安全边界

密码使用 bcrypt（cost 12）保存。会话 Cookie 设置 `HttpOnly`、`SameSite=Lax`，生产环境启用 `Secure`。控制台数据全部按当前用户所有权过滤，管理接口额外检查权限。IP 和设备标识经过带服务端密钥的 SHA-256 哈希后保存。

Nginx 必须覆盖 `X-Forwarded-For`，不可直接信任客户端提交的 IP 请求头。`SESSION_SECRET` 至少使用 32 字节随机值。

## 问卷状态

`DRAFT -> ACTIVE -> PAUSED -> ACTIVE`，任何进行中或暂停问卷都可以进入 `STOPPED`。停止是终态，避免误开启已正式结束的调查。

## 数据流

公开页面读取 `/api/public/surveys/[slug]`，浏览器将未提交答案暂存到 `localStorage`。提交时服务端重新验证问卷状态、时间、必填题及重复提交限制，在单次数据库写入中建立答卷和答案。统计接口只向问卷所有者返回聚合及答卷明细。

## 扩展建议

小体量部署无需 Redis 或消息队列。答卷达到百万级后，可增加异步统计表、对象存储和限流服务。公开接口上线前建议在 Nginx 增加每 IP 请求速率限制。
