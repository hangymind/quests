import { NextResponse } from "next/server";
import { SurveyStatus } from "@prisma/client";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canTransition } from "@/lib/survey";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const survey = await prisma.survey.findFirst({
    where: { id, ownerId: user.id },
    include: { _count: { select: { questions: true } } },
  });
  if (!survey) return NextResponse.json({ error: "无权访问" }, { status: 404 });
  const { status } = (await request.json()) as { status: SurveyStatus };
  if (!Object.values(SurveyStatus).includes(status) || !canTransition(survey.status, status))
    return NextResponse.json({ error: "不允许的状态变更" }, { status: 409 });
  if (status === SurveyStatus.ACTIVE && survey._count.questions === 0)
    return NextResponse.json({ error: "至少添加一个问题后才能发布" }, { status: 400 });
  return NextResponse.json(await prisma.survey.update({ where: { id }, data: { status } }));
}
