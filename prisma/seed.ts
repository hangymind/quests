import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_PERMISSIONS } from "../lib/permissions";

const prisma = new PrismaClient();

async function main() {
  for (const { key, description } of DEFAULT_PERMISSIONS)
    await prisma.permission.upsert({
      where: { key },
      update: { description },
      create: { key, description },
    });
  const admin = await prisma.role.upsert({
    where: { name: "超级管理员" },
    update: {},
    create: { name: "超级管理员", description: "拥有全部平台权限" },
  });
  const rows = await prisma.permission.findMany();
  for (const permission of rows)
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: admin.id, permissionId: permission.id } },
      update: {},
      create: { roleId: admin.id, permissionId: permission.id },
    });
  const user = await prisma.user.findUnique({ where: { username: "demo" } });
  if (!user) {
    const created = await prisma.user.create({
      data: {
        username: "demo",
        passwordHash: await bcrypt.hash("demo1234", 12),
        isSuperAdmin: true,
        roles: { create: { roleId: admin.id } },
      },
    });
    await prisma.survey.create({
      data: {
        slug: "team-pulse",
        title: "团队季度脉搏",
        description: "一个用于演示的轻量问卷。",
        status: "ACTIVE",
        ownerId: created.id,
        questions: {
          create: [
            {
              order: 1,
              type: "SINGLE_CHOICE",
              title: "你对本季度的整体感受是？",
              required: true,
              config: { options: ["非常满意", "满意", "一般", "需要改进"] },
            },
            {
              order: 2,
              type: "RATING",
              title: "你愿意向朋友推荐这里吗？",
              required: true,
              config: { min: 1, max: 5 },
            },
            {
              order: 3,
              type: "TEXTAREA",
              title: "还有什么想告诉我们？",
              required: false,
              config: { maxLength: 500 },
            },
          ],
        },
      },
    });
  }
}

main().finally(() => prisma.$disconnect());
