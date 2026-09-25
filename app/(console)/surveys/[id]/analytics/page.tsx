import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AnalyticsView } from "@/components/AnalyticsView";
import "./analytics.css";
export default async function Analytics({ params }: { params: Promise<{ id: string }> }) {
  const user = (await getSessionUser())!;
  const { id } = await params;
  const survey = await prisma.survey.findFirst({ where: { id, ownerId: user.id } });
  if (!survey) notFound();
  return (
    <div className="content">
      <div className="page-head">
        <div>
          <span className="eyebrow">Analytics</span>
          <h1>{survey.title}</h1>
          <p>调查进行期间也会持续更新。</p>
        </div>
        <div className="toolbar">
          <Link className="btn" href={`/surveys/${id}/edit`}>
            编辑问卷
          </Link>
          <a className="btn btn-primary" href={`/api/surveys/${id}/export`}>
            导出 CSV
          </a>
        </div>
      </div>
      <AnalyticsView id={id} />
    </div>
  );
}
