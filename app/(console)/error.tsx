"use client";

import { useEffect } from "react";

export default function ConsoleError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <div className="content">
      <section className="error-panel card">
        <span className="error-code">APPLICATION ERROR</span>
        <h1>页面暂时无法加载</h1>
        <p>请求未能完成。你可以重新加载当前模块，未保存的其他页面内容不会受到影响。</p>
        <button className="btn btn-primary" onClick={reset}>
          重新加载
        </button>
      </section>
    </div>
  );
}
