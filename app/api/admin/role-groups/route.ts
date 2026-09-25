import { NextResponse } from "next/server";
import { getSessionUser, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user || !hasPermission(user, "admin:roles")) return NextResponse.json({ error: "无权限" }, { status: 403 });
  return NextResponse.json(await prisma.role.findMany({ include: { permissions: { include: { permission: true } }, _count: { select: { users: true } } } }));
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || !hasPermission(user, "admin:roles")) return NextResponse.json({ error: "无权限" }, { status: 403 });
  const { name, description, permissionIds = [] } = await request.json();
  if (!name) return NextResponse.json({ error: "名称不能为空" }, { status: 400 });
  const role = await prisma.role.create({ data: { name, description, permissions: { create: permissionIds.map((permissionId: string) => ({ permissionId })) } } });
  return NextResponse.json(role, { status: 201 });
}
