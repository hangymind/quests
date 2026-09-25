"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
export function SurveyActions({ id, status, slug }: { id: string; status: string; slug: string }) {
  const router = useRouter();
  async function state(next: string) {
    const r = await fetch(`/api/surveys/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!r.ok) alert((await r.json()).error);
    router.refresh();
  }
  return (
    <div className="survey-actions">
      <Link className="btn" href={`/surveys/${id}/analytics`}>
        统计
      </Link>
      <Link className="btn" href={`/surveys/${id}/edit`}>
        编辑
      </Link>
      {status === "ACTIVE" && (
        <button className="btn" onClick={() => state("PAUSED")}>
          暂停
        </button>
      )}
      {status === "PAUSED" && (
        <button className="btn btn-primary" onClick={() => state("ACTIVE")}>
          继续
        </button>
      )}
      {status === "DRAFT" && (
        <button className="btn btn-primary" onClick={() => state("ACTIVE")}>
          发布
        </button>
      )}
      {status !== "DRAFT" && (
        <Link className="btn btn-primary" href={`/q/${slug}`} target="_blank">
          打开
        </Link>
      )}
    </div>
  );
}
