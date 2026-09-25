# 澄问 Quest

澄问是一个适合个人与小团队私有部署的全栈问卷平台。它提供用户名密码认证、问卷编辑与发布、公开填写、访问限制、实时统计、CSV 导出及基础 RBAC 管理。

## 技术栈

- Next.js 15、React 19、TypeScript
- Prisma 6、PostgreSQL
- HttpOnly Cookie 会话、bcrypt 密码哈希
- 原生 CSS 响应式界面

## 本地运行

```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

打开 `http://localhost:3000`。种子账号为 `demo / demo1234`，仅用于本地体验，生产环境必须删除或修改。也可以不执行 seed，首个注册账号会成为超级管理员。

## 常用命令

```bash
npm run dev
npm run build
npm start
npx prisma studio
npx prisma migrate deploy
```

详细资料见 [架构](docs/ARCHITECTURE.md)、[API](docs/API.md)、[管理员指南](docs/ADMIN_GUIDE.md) 与 [宝塔部署](docs/DEPLOYMENT_BAOTA.md)。
