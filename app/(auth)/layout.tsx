import "./auth.css";
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="auth-shell"><section className="auth-visual"><img src="/assets/wife.jpg" alt="海与冰面上的幻想人物插画"/><div className="auth-brand"><span className="brand-mark">澄</span>澄问</div><div className="auth-caption"><span className="eyebrow" style={{color:"#d8f5ff"}}>Private survey workspace</span><h2>让每一次提问，<br/>都得到清晰的回应。</h2><p>创建、发布并理解你的调查，不受商业化信息干扰。</p></div></section><section className="auth-panel">{children}</section></main>;
}
