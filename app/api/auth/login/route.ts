import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const user = typeof username === "string" ? await prisma.user.findUnique({ where: { username } }) : null;
    if (!user || !user.isActive || typeof password !== "string" || !(await bcrypt.compare(password, user.passwordHash))) return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json({ error: "数据库暂时不可用，请联系管理员" }, { status: 503 });
  }
}
