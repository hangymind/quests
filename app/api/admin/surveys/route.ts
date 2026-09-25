import { NextResponse } from "next/server";
import { getSessionUser, isSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user || !isSuperAdmin(user))
    return NextResponse.json({ error: "仅超级管理员可以管理全部问卷" }, { status: 403 });

  const surveys = await prisma.survey.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      updatedAt: true,
      owner: { select: { id: true, username: true } },
      _count: { select: { questions: true, responses: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(surveys);
}
