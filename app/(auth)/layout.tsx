import "./auth.css";
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-shell">
      <section className="auth-visual">
        <img src="/assets/wife.jpg" alt="海与冰面上的幻想人物插画" />
        <div className="auth-brand">iQuest</div>
        <div className="auth-caption">
          <span className="eyebrow" style={{ color: "#d8f5ff" }}>
            Private survey workspace
          </span>
          <h2>
            欢迎后背，
            <br />
            这条消息怎么在这里。
          </h2>
          <p>创建、发布并理解你的自定义调查。</p>
        </div>
      </section>
      <section className="auth-panel">
        {children}
        <footer className="auth-copyright">© iw46Team 2026</footer>
      </section>
    </main>
  );
}
