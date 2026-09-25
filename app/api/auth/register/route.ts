import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { DEFAULT_PERMISSIONS, SUPER_ADMIN_PERMISSIONS } from "@/lib/permissions";

const schema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(24)
    .regex(/^[\p{L}\p{N}_-]+$/u),
  password: z.string().min(8).max(72),
});
export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json({ error: "用户名需为 3-24 位，密码至少 8 位" }, { status: 400 });
    const [existingUser, userCount, passwordHash] = await Promise.all([
      prisma.user.findUnique({ where: { username: parsed.data.username }, select: { id: true } }),
      prisma.user.count(),
      bcrypt.hash(parsed.data.password, 12),
    ]);
    if (existingUser) return NextResponse.json({ error: "用户名已存在" }, { status: 409 });

    const user = await prisma.$transaction(async (tx) => {
      if (userCount !== 0)
        return tx.user.create({ data: { username: parsed.data.username, passwordHash } });

      await tx.permission.createMany({ data: [...DEFAULT_PERMISSIONS], skipDuplicates: true });
      const permissions = await tx.permission.findMany({
        where: { key: { in: [...SUPER_ADMIN_PERMISSIONS] } },
        select: { id: true },
      });
      const role = await tx.role.upsert({
        where: { name: "超级管理员" },
        update: {},
        create: { name: "超级管理员", description: "拥有全部平台权限" },
      });
      await tx.rolePermission.createMany({
        data: permissions.map(({ id }) => ({ roleId: role.id, permissionId: id })),
        skipDuplicates: true,
      });
      return tx.user.create({
        data: {
          username: parsed.data.username,
          passwordHash,
          isSuperAdmin: true,
          roles: { create: { roleId: role.id } },
        },
      });
    });
    await createSession(user.id, request);
    return NextResponse.json({ ok: true, redirect: "/dashboard" });
  } catch (error) {
    console.error("Registration failed", error);
    return NextResponse.json({ error: "数据库暂时不可用，请联系管理员" }, { status: 503 });
  }
}
