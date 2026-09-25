import { NextResponse } from "next/server";
import { getSessionUser, isSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || !isSuperAdmin(user))
    return NextResponse.json({ error: "仅超级管理员可以删除其他用户的问卷" }, { status: 403 });

  const { id } = await params;
  const survey = await prisma.survey.findUnique({ where: { id }, select: { id: true } });
  if (!survey) return NextResponse.json({ error: "问卷不存在" }, { status: 404 });

  await prisma.survey.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
