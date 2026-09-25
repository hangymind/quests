import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { hashIdentifier, isAnswerEmpty } from "@/lib/survey";
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const survey = await prisma.survey.findUnique({ where: { slug }, include: { questions: true } });
  if (!survey || survey.status !== "ACTIVE")
    return NextResponse.json({ error: "问卷当前不可提交" }, { status: 423 });
  const now = new Date();
  if ((survey.startsAt && survey.startsAt > now) || (survey.endsAt && survey.endsAt < now))
    return NextResponse.json({ error: "当前不在填写时间内" }, { status: 423 });
  const user = await getSessionUser();
  if ((survey.requireLogin || !survey.allowAnonymous) && !user)
    return NextResponse.json({ error: "该问卷要求登录后填写" }, { status: 401 });
  const body = await request.json();
  const answers = body.answers as Record<string, unknown>;
  for (const q of survey.questions)
    if (q.required && isAnswerEmpty(answers?.[q.id]))
      return NextResponse.json({ error: `请回答：${q.title}` }, { status: 400 });
  const ip = (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const device = typeof body.deviceId === "string" ? body.deviceId : "unknown";
  const ipHash = hashIdentifier(ip),
    deviceHash = hashIdentifier(device);
  const where = { surveyId: survey.id, status: "COMPLETED" };
  const [ipSubmissions, deviceSubmissions] = await Promise.all([
    survey.restrictIp
      ? prisma.surveyResponse.count({ where: { ...where, ipHash } })
      : Promise.resolve(0),
    survey.restrictDevice
      ? prisma.surveyResponse.count({ where: { ...where, deviceHash } })
      : Promise.resolve(0),
  ]);

  if (survey.restrictIp && ipSubmissions >= survey.maxSubmissions)
    return NextResponse.json({ error: "该网络已达到提交次数上限" }, { status: 409 });
  if (survey.restrictDevice && deviceSubmissions >= survey.maxSubmissions)
    return NextResponse.json({ error: "该设备已达到提交次数上限" }, { status: 409 });

  const valid = new Set(survey.questions.map((q) => q.id));
  await prisma.$transaction([
    prisma.surveyResponse.create({
      data: {
        surveyId: survey.id,
        respondentId: user?.id,
        ipHash,
        deviceHash,
        completedAt: new Date(),
        answers: {
          create: Object.entries(answers || {})
            .filter(([id]) => valid.has(id))
            .map(([questionId, value]) => ({ questionId, value: value as object })),
        },
      },
    }),
    prisma.surveyEvent.create({ data: { surveyId: survey.id, type: "COMPLETE" } }),
  ]);

  return NextResponse.json({ ok: true }, { status: 201 });
}
