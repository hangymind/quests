"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
type Q = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  required: boolean;
  config: { options?: string[]; min?: number; max?: number };
};
type S = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  showProgress: boolean;
  showQuestionNumber: boolean;
  questions: Q[];
  rules: {
    sourceQuestionId: string;
    targetQuestionId: string;
    operator: string;
    value: unknown;
    action: string;
  }[];
};

function createDeviceId() {
  if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID();

  if (typeof globalThis.crypto?.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  return `legacy-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function PublicSurvey() {
  const { slug } = useParams<{ slug: string }>();
  const [survey, setSurvey] = useState<S | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    fetch(`/api/public/surveys/${slug}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        setSurvey(d);
        const saved = localStorage.getItem(`quest:${slug}`);
        if (saved) setAnswers(JSON.parse(saved));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);
  useEffect(() => {
    if (survey) localStorage.setItem(`quest:${slug}`, JSON.stringify(answers));
  }, [answers, slug, survey]);
  const answered = useMemo(
    () =>
      Object.values(answers).filter((v) => v !== "" && v != null && (!Array.isArray(v) || v.length))
        .length,
    [answers],
  );
  function set(id: string, v: unknown) {
    setAnswers((a) => ({ ...a, [id]: v }));
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      let deviceId = localStorage.getItem("quest-device");
      if (!deviceId) {
        deviceId = createDeviceId();
        localStorage.setItem("quest-device", deviceId);
      }

      const response = await fetch(`/api/public/surveys/${slug}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, deviceId }),
      });
      const responseText = await response.text();
      let result: { error?: string } = {};
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        result = {};
      }
      if (!response.ok) return setError(result.error || "提交失败，请稍后重试");

      localStorage.removeItem(`quest:${slug}`);
      setDone(true);
    } catch {
      setError("无法连接服务器，请检查网络后重试");
    } finally {
      setSubmitting(false);
    }
  }
  if (loading) return <State symbol="…" title="正在加载问卷" text="请稍候。" />;
  if (error && !survey) return <State symbol="!" title="暂时无法填写" text={error} />;
  if (done)
    return <State symbol="✓" title="提交成功" text="你的回答已经被安全记录。感谢认真填写。" />;
  if (!survey) return null;
  return (
    <main className="public-shell">
      {survey.showProgress && (
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${survey.questions.length ? (answered / survey.questions.length) * 100 : 0}%`,
            }}
          />
        </div>
      )}
      <div className="public-top">
        <div className="public-brand">iQuest</div>
        <span className="muted">
          {answered} / {survey.questions.length}
        </span>
      </div>
      <article className="public-paper">
        <header className="public-cover">
          <span className="eyebrow">Survey</span>
          <h1>{survey.title}</h1>
          {survey.description && <p>{survey.description}</p>}
        </header>
        <form className="public-form" onSubmit={submit}>
          {survey.questions.map((q, i) => (
            <section className="public-question" key={q.id}>
              <h2>
                {survey.showQuestionNumber && `${i + 1}. `}
                {q.title}
                {q.required && <span className="required"> *</span>}
              </h2>
              {q.description && <div className="hint">{q.description}</div>}
              <Question q={q} value={answers[q.id]} set={(v) => set(q.id, v)} />
            </section>
          ))}
          {error && <div className="auth-error">{error}</div>}
          <div className="submit-area">
            <span className="muted">提交前请确认你的回答</span>
            <button className="btn btn-primary" disabled={submitting}>
              {submitting && <span className="spinner" />}
              {submitting ? "提交中" : "提交问卷"}
            </button>
          </div>
        </form>
      </article>
      <footer className="public-copyright">© iw46Team 2026</footer>
    </main>
  );
}
function State({ symbol, title, text }: { symbol: string; title: string; text: string }) {
  return (
    <main className="public-shell">
      <div className="public-state">
        <div className="symbol">{symbol}</div>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </main>
  );
}
function Question({ q, value, set }: { q: Q; value: unknown; set: (v: unknown) => void }) {
  if (q.type === "TEXTAREA")
    return (
      <textarea
        className="input"
        value={String(value || "")}
        onChange={(e) => set(e.target.value)}
        rows={4}
      />
    );
  if (q.type === "TEXT" || q.type === "NUMBER" || q.type === "DATE")
    return (
      <input
        className="input"
        type={q.type === "NUMBER" ? "number" : q.type === "DATE" ? "date" : "text"}
        value={String(value || "")}
        onChange={(e) => set(e.target.value)}
      />
    );
  if (q.type === "SELECT")
    return (
      <select className="input" value={String(value || "")} onChange={(e) => set(e.target.value)}>
        <option value="">请选择</option>
        {q.config.options?.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    );
  if (q.type === "RATING") {
    const min = q.config.min || 1,
      max = q.config.max || 5;
    return (
      <div className="rating">
        {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((n) => (
          <button
            type="button"
            className={value === n ? "active" : ""}
            key={n}
            onClick={() => set(n)}
          >
            {n}
          </button>
        ))}
      </div>
    );
  }
  const multiple = q.type === "MULTIPLE_CHOICE";
  return (
    <div>
      {q.config.options?.map((o) => (
        <label className="choice" key={o}>
          <input
            type={multiple ? "checkbox" : "radio"}
            name={q.id}
            checked={multiple ? Array.isArray(value) && value.includes(o) : value === o}
            onChange={(e) =>
              multiple
                ? set(
                    e.target.checked
                      ? [...(Array.isArray(value) ? value : []), o]
                      : Array.isArray(value)
                        ? value.filter((v) => v !== o)
                        : [],
                  )
                : set(o)
            }
          />
          <span>{o}</span>
        </label>
      ))}
    </div>
  );
}
