import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getSessionUser, hasPermission, isSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user || !hasPermission(user, "admin:roles"))
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  const roles = await prisma.role.findMany({
    include: {
      permissions: { include: { permission: true } },
      _count: { select: { users: true } },
    },
  });
  const ownRoleIds = new Set(user.roles.map(({ role }) => role.id));
  const canRenameOwnRoles = isSuperAdmin(user);
  return NextResponse.json(
    roles.map((role) => ({
      ...role,
      canRename: canRenameOwnRoles && ownRoleIds.has(role.id),
    })),
  );
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || !hasPermission(user, "admin:roles"))
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  const { name, description, permissionIds = [] } = await request.json();
  if (!name) return NextResponse.json({ error: "名称不能为空" }, { status: 400 });
  const role = await prisma.role.create({
    data: {
      name,
      description,
      permissions: { create: permissionIds.map((permissionId: string) => ({ permissionId })) },
    },
  });
  return NextResponse.json(role, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user || !isSuperAdmin(user))
    return NextResponse.json({ error: "仅超级管理员可以重命名自己的身份组" }, { status: 403 });

  const { id, name } = (await request.json()) as { id?: string; name?: string };
  const normalizedName = name?.trim();
  if (!id || !normalizedName || normalizedName.length > 30)
    return NextResponse.json({ error: "身份组名称需为 1-30 个字符" }, { status: 400 });

  if (!user.roles.some(({ role }) => role.id === id))
    return NextResponse.json({ error: "只能重命名自己所属的身份组" }, { status: 403 });

  try {
    const role = await prisma.role.update({ where: { id }, data: { name: normalizedName } });
    return NextResponse.json(role);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
      return NextResponse.json({ error: "该身份组名称已存在" }, { status: 409 });
    throw error;
  }
}
