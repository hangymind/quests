import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser, hasPermission } from "@/lib/auth";
import { Icons } from "@/components/Icons";
import { ToastProvider } from "@/components/ToastProvider";
import "./console.css";
export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const admin = hasPermission(user, "admin:users");
  const roleNames = user.isSuperAdmin
    ? `超级管理员 · ${user.roles.map(({ role }) => role.name).join("、") || "系统管理组"}`
    : user.roles.map(({ role }) => role.name).join("、") || "成员";
  return (
    <div className="console-shell">
      <aside className="sidebar">
        <Link href="/dashboard" className="side-brand">
          iQuest
        </Link>
        <nav className="nav">
          <Link href="/dashboard">
            <Icons.Home />
            <span>工作台</span>
          </Link>
          <Link href="/surveys">
            <Icons.Form />
            <span>我的问卷</span>
          </Link>
          {admin && (
            <Link href="/admin">
              <Icons.Users />
              <span>用户与权限</span>
            </Link>
          )}
          <Link href="/surveys">
            <Icons.Chart />
            <span>数据统计</span>
          </Link>
        </nav>
        <div className="side-user">
          <strong>{user.username}</strong>
          <span>{roleNames}</span>
          <form action="/api/auth/logout" method="post">
            <button className="btn logout">
              <span>退出登录</span>
            </button>
          </form>
          <div className="side-copyright">© iw46Team 2026</div>
        </div>
      </aside>
      <main className="console-main">
        <header className="topbar">
          <div>
            <strong>问卷工作空间</strong>
            <br />
            <span>私有部署数据自持</span>
          </div>
          <span>{new Intl.DateTimeFormat("zh-CN", { dateStyle: "long" }).format(new Date())}</span>
        </header>
        <ToastProvider>{children}</ToastProvider>
      </main>
    </div>
  );
}
