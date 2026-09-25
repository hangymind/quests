import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
const csv = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return new Response("未登录", { status: 401 });
  const { id } = await params;
  const survey = await prisma.survey.findFirst({
    where: { id, ownerId: user.id },
    include: {
      questions: { orderBy: { order: "asc" } },
      responses: { include: { answers: true }, orderBy: { completedAt: "desc" } },
    },
  });
  if (!survey) return new Response("无权访问", { status: 404 });
  const header = ["答卷ID", "提交时间", ...survey.questions.map((q) => q.title)].map(csv).join(",");
  const rows = survey.responses.map((r) => {
    const map = new Map(r.answers.map((a) => [a.questionId, a.value]));
    return [
      csv(r.id),
      csv(r.completedAt?.toISOString()),
      ...survey.questions.map((q) =>
        csv(
          Array.isArray(map.get(q.id)) ? (map.get(q.id) as unknown[]).join(" | ") : map.get(q.id),
        ),
      ),
    ].join(",");
  });
  return new Response("\uFEFF" + [header, ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${survey.slug}-responses.csv"`,
    },
  });
}
