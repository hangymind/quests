# iQuest

iQuest 是一个适合个人与小团队私有部署的全栈问卷平台。它提供用户名密码认证、问卷编辑与发布、公开填写、访问限制、实时统计、CSV 导出及基础 RBAC 管理。

## 技术栈

- Next.js 15、React 19、TypeScript
- Prisma 6、MySQL 8
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
npm run format
npm run format:check
npx tsc --noEmit
npx prisma studio
npx prisma migrate deploy
```

提交代码前建议依次执行 `npm run format:check` 和 `npx tsc --noEmit`。项目使用 Prettier
统一 TypeScript、TSX、CSS、JSON 与 Markdown 的换行和缩进，默认行宽为 100 字符。

详细资料见 [架构](docs/ARCHITECTURE.md)、[API](docs/API.md)、[管理员指南](docs/ADMIN_GUIDE.md) 与 [宝塔部署](docs/DEPLOYMENT_BAOTA.md)。
