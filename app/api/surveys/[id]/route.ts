import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const item = await prisma.survey.findFirst({
    where: { id, ownerId: user.id },
    include: { questions: { orderBy: { order: "asc" } }, rules: true },
  });
  return item
    ? NextResponse.json(item)
    : NextResponse.json({ error: "问卷不存在" }, { status: 404 });
}
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.survey.findFirst({ where: { id, ownerId: user.id } });
  if (!existing) return NextResponse.json({ error: "无权访问" }, { status: 404 });
  const body = await request.json();
  const allowed = [
    "title",
    "description",
    "allowAnonymous",
    "requireLogin",
    "restrictDevice",
    "restrictIp",
    "maxSubmissions",
    "showProgress",
    "showQuestionNumber",
    "startsAt",
    "endsAt",
  ] as const;
  const data: Record<string, unknown> = {};
  for (const key of allowed) if (key in body) data[key] = body[key];
  if (data.startsAt) data.startsAt = new Date(data.startsAt as string);
  if (data.endsAt) data.endsAt = new Date(data.endsAt as string);
  return NextResponse.json(await prisma.survey.update({ where: { id }, data }));
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const found = await prisma.survey.findFirst({ where: { id, ownerId: user.id } });
  if (!found) return NextResponse.json({ error: "无权访问" }, { status: 404 });
  await prisma.survey.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
