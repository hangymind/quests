"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./ToastProvider";

export function SurveyActions({
  id,
  title,
  status,
  slug,
}: {
  id: string;
  title: string;
  status: string;
  slug: string;
}) {
  const router = useRouter();
  const { notify } = useToast();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  async function state(next: string) {
    setLoading(true);
    try {
      const response = await fetch(`/api/surveys/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const result = await response.json();
      if (!response.ok) return notify(result.error || "状态更新失败", "error");
      notify("问卷状态已更新", "success");
      router.refresh();
    } catch {
      notify("无法连接服务器", "error");
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    setLoading(true);
    try {
      const response = await fetch(`/api/surveys/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) return notify(result.error || "删除失败", "error");
      setConfirmingDelete(false);
      notify("问卷已删除", "success");
      router.refresh();
    } catch {
      notify("无法连接服务器", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="survey-actions">
        <Link className="btn" href={`/surveys/${id}/analytics`}>
          统计
        </Link>
        <Link className="btn" href={`/surveys/${id}/edit`}>
          编辑
        </Link>
        <button className="btn btn-danger" onClick={() => setConfirmingDelete(true)}>
          删除
        </button>
        {status === "ACTIVE" && (
          <button className="btn" disabled={loading} onClick={() => state("PAUSED")}>
            暂停
          </button>
        )}
        {status === "PAUSED" && (
          <button className="btn btn-primary" disabled={loading} onClick={() => state("ACTIVE")}>
            继续
          </button>
        )}
        {status === "DRAFT" && (
          <button className="btn btn-primary" disabled={loading} onClick={() => state("ACTIVE")}>
            发布
          </button>
        )}
        {status !== "DRAFT" && (
          <Link className="btn btn-primary" href={`/q/${slug}`} target="_blank">
            打开
          </Link>
        )}
      </div>
      <ConfirmDialog
        open={confirmingDelete}
        title="删除问卷？"
        description={`“${title}”及其全部答卷和统计数据将被永久删除。`}
        loading={loading}
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={remove}
      />
    </>
  );
}
