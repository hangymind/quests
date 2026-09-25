import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

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
    if (await prisma.user.findUnique({ where: { username: parsed.data.username } }))
      return NextResponse.json({ error: "用户名已存在" }, { status: 409 });
    const count = await prisma.user.count();
    let roleId: string | undefined;
    if (count === 0) {
      const role = await prisma.role.upsert({
        where: { name: "超级管理员" },
        update: {},
        create: { name: "超级管理员", description: "拥有全部平台权限" },
      });
      roleId = role.id;
    }
    const user = await prisma.user.create({
      data: {
        username: parsed.data.username,
        passwordHash: await bcrypt.hash(parsed.data.password, 12),
        roles: roleId ? { create: { roleId } } : undefined,
      },
    });
    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Registration failed", error);
    return NextResponse.json({ error: "数据库暂时不可用，请联系管理员" }, { status: 503 });
  }
}
