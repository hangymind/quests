# 宝塔 Ubuntu 部署指南

本文使用 Nginx + PM2 + PostgreSQL，不依赖 Docker。示例域名为 `survey.example.com`，项目目录为 `/www/wwwroot/quest`。

## 1. 安装运行环境

在宝塔“软件商店”安装 Nginx，并安装 Node.js 20 LTS。通过终端安装 PostgreSQL 与 PM2：

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo npm install -g pm2
```

## 2. 创建数据库

```bash
sudo -u postgres psql
CREATE USER quest WITH PASSWORD '替换为强密码';
CREATE DATABASE quest OWNER quest ENCODING 'UTF8';
\q
```

## 3. 上传与配置

将项目上传到 `/www/wwwroot/quest`，在目录中创建 `.env.production`：

```dotenv
DATABASE_URL="postgresql://quest:数据库密码@127.0.0.1:5432/quest?schema=public"
SESSION_SECRET="使用 openssl rand -base64 48 生成"
NEXT_PUBLIC_APP_URL="https://survey.example.com"
NODE_ENV="production"
```

确保该文件权限为 `600`，且不要提交到 Git。

## 4. 安装、迁移与构建

```bash
cd /www/wwwroot/quest
npm ci
npx prisma migrate deploy
npm run build
```

生产环境不建议运行演示 seed。访问注册页创建第一个超级管理员。

## 5. PM2 启动

```bash
cd /www/wwwroot/quest
pm2 start npm --name quest -- start -- -p 3000
pm2 save
pm2 startup
```

执行 `pm2 startup` 输出的命令以启用开机启动。日志通过 `pm2 logs quest` 查看，轮转可安装 `pm2-logrotate`。

## 6. 宝塔 Nginx 反向代理

创建站点 `survey.example.com`，添加反向代理到 `http://127.0.0.1:3000`。自定义配置确认包含：

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

在宝塔 SSL 面板申请 Let's Encrypt 证书，开启强制 HTTPS。防火墙只开放 80/443，PostgreSQL 和 3000 端口不对公网开放。

## 7. 更新

```bash
cd /www/wwwroot/quest
git pull
npm ci
npx prisma migrate deploy
npm run build
pm2 reload quest
```

更新前先备份数据库。若构建失败，不要重载当前 PM2 进程。

## 8. 备份与恢复

```bash
sudo -u postgres pg_dump -Fc quest > /www/backup/quest-$(date +%F).dump
sudo -u postgres pg_restore --clean --if-exists -d quest /www/backup/quest-2026-01-01.dump
```

在宝塔计划任务中每天执行备份，并设置异地副本与保留周期。恢复会覆盖现有数据库，必须先在测试库验证备份可用性。

## 9. 排障

- `pm2 status`：确认应用在线。
- `pm2 logs quest --lines 100`：查看应用错误。
- `sudo -u postgres psql -d quest`：检查数据库连接。
- `nginx -t`：验证 Nginx 配置。
- 502 通常表示 PM2 未运行、端口错误或构建未完成。
