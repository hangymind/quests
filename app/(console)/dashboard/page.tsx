import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateSurvey } from "@/components/CreateSurvey";
import { SurveyActions } from "@/components/SurveyActions";
import "../extras.css";
const labels: Record<string, string> = {
  DRAFT: "草稿",
  ACTIVE: "进行中",
  PAUSED: "已暂停",
  STOPPED: "已停止",
};
export default async function Dashboard() {
  const user = (await getSessionUser())!;
  const surveys = await prisma.survey.findMany({
    where: { ownerId: user.id },
    include: { _count: { select: { responses: true, questions: true } } },
    orderBy: { updatedAt: "desc" },
  });
  const responses = surveys.reduce((n, s) => n + s._count.responses, 0);
  return (
    <div className="content">
      <div className="page-head">
        <div>
          <span className="eyebrow">Overview</span>
          <h1>下午好，{user.username}</h1>
          <p>今天你玩原神了吗?</p>
        </div>
        <CreateSurvey />
      </div>
      <section className="metric-grid">
        <div className="metric card">
          <small>全部问卷</small>
          <b>{surveys.length}</b>
          <div className="trend">你的调查资产</div>
        </div>
        <div className="metric card">
          <small>进行中</small>
          <b>{surveys.filter((s) => s.status === "ACTIVE").length}</b>
          <div className="trend">正在收集数据</div>
        </div>
        <div className="metric card">
          <small>有效答卷</small>
          <b>{responses}</b>
          <div className="trend">累计完成提交</div>
        </div>
        <div className="metric card">
          <small>平均答卷</small>
          <b>{surveys.length ? Math.round(responses / surveys.length) : 0}</b>
          <div className="trend">每份问卷</div>
        </div>
      </section>
      <div className="section-head">
        <h2>最近问卷</h2>
        <Link className="muted" href="/surveys">
          查看全部 →
        </Link>
      </div>
      <div className="survey-list card">
        {surveys.length === 0 ? (
          <div className="empty">
            <strong>还没有问卷</strong>
            <p>创建第一份问卷。</p>
          </div>
        ) : (
          surveys.slice(0, 6).map((s) => (
            <div className="survey-row" key={s.id}>
              <div className="survey-title">
                <strong>{s.title}</strong>
                <span>
                  /q/{s.slug} · {s._count.questions} 个问题
                </span>
              </div>
              <div>
                <span className={`badge ${s.status.toLowerCase()}`}>{labels[s.status]}</span>
              </div>
              <div className="muted">{s._count.responses} 份答卷</div>
              <div className="muted">{s.updatedAt.toLocaleDateString("zh-CN")}</div>
              <SurveyActions id={s.id} status={s.status} slug={s.slug} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
