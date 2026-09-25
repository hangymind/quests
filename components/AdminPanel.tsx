"use client";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./ToastProvider";
type User = {
  id: string;
  username: string;
  isActive: boolean;
  roles: { role: { name: string } }[];
  _count: { surveys: number };
};
type Role = {
  id: string;
  name: string;
  description: string | null;
  canRename: boolean;
  _count: { users: number };
};
type ManagedSurvey = {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
  owner: { id: string; username: string };
  _count: { questions: number; responses: number };
};
export function AdminPanel({ canManageAllSurveys }: { canManageAllSurveys: boolean }) {
  const { notify } = useToast();
  const [users, setUsers] = useState<User[]>([]),
    [roles, setRoles] = useState<Role[]>([]),
    [surveys, setSurveys] = useState<ManagedSurvey[]>([]),
    [editingRoleId, setEditingRoleId] = useState<string | null>(null),
    [roleName, setRoleName] = useState(""),
    [roleError, setRoleError] = useState(""),
    [deletingSurvey, setDeletingSurvey] = useState<ManagedSurvey | null>(null),
    [busy, setBusy] = useState(false);

  async function load() {
    try {
      const [usersResponse, rolesResponse, surveysResponse] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/role-groups"),
        canManageAllSurveys ? fetch("/api/admin/surveys") : null,
      ]);
      if (!usersResponse.ok || !rolesResponse.ok || (surveysResponse && !surveysResponse.ok))
        throw new Error("管理数据加载失败");
      const [nextUsers, nextRoles, nextSurveys] = await Promise.all([
        usersResponse.json(),
        rolesResponse.json(),
        surveysResponse ? surveysResponse.json() : Promise.resolve([]),
      ]);
      setUsers(nextUsers);
      setRoles(nextRoles);
      setSurveys(nextSurveys);
    } catch {
      notify("管理数据加载失败，请刷新重试", "error");
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function toggle(u: User) {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id, isActive: !u.isActive }),
      });
      const result = await response.json();
      if (!response.ok) return notify(result.error || "用户状态更新失败", "error");
      notify(u.isActive ? "用户已停用" : "用户已启用", "success");
      await load();
    } catch {
      notify("无法连接服务器", "error");
    } finally {
      setBusy(false);
    }
  }

  function beginRename(role: Role) {
    setEditingRoleId(role.id);
    setRoleName(role.name);
    setRoleError("");
  }

  async function renameRole(role: Role) {
    const name = roleName.trim();
    if (!name) return setRoleError("身份组名称不能为空");

    setBusy(true);
    try {
      const response = await fetch("/api/admin/role-groups", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: role.id, name }),
      });
      const result = await response.json();
      if (!response.ok) return setRoleError(result.error || "重命名失败");

      setEditingRoleId(null);
      setRoleError("");
      notify("身份组名称已更新，权限保持不变", "success");
      await load();
    } catch {
      setRoleError("无法连接服务器");
    } finally {
      setBusy(false);
    }
  }

  async function deleteSurvey() {
    if (!deletingSurvey) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/surveys/${deletingSurvey.id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) return notify(result.error || "问卷删除失败", "error");
      setDeletingSurvey(null);
      notify("用户问卷已删除", "success");
      await load();
    } catch {
      notify("无法连接服务器", "error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-grid">
      <section className="card">
        <div className="panel-pad">
          <h2>用户</h2>
          <p className="muted">管理账号状态和身份组。</p>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>用户名</th>
              <th>身份组</th>
              <th>问卷</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <strong>{u.username}</strong>
                </td>
                <td>{u.roles.map((r) => r.role.name).join("、") || "普通用户"}</td>
                <td>{u._count.surveys}</td>
                <td>
                  <button className="btn" disabled={busy} onClick={() => toggle(u)}>
                    {u.isActive ? "启用" : "禁用"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="card panel-pad">
        <h2>身份组</h2>
        {roles.map((r) => (
          <div className="role-row" key={r.id}>
            <div className="role-details">
              {editingRoleId === r.id ? (
                <div className="role-editor">
                  <input
                    className="input"
                    value={roleName}
                    maxLength={30}
                    autoFocus
                    aria-label="身份组名称"
                    onChange={(event) => setRoleName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") renameRole(r);
                      if (event.key === "Escape") setEditingRoleId(null);
                    }}
                  />
                  <button className="btn btn-primary" disabled={busy} onClick={() => renameRole(r)}>
                    保存
                  </button>
                  <button className="btn" onClick={() => setEditingRoleId(null)}>
                    取消
                  </button>
                </div>
              ) : (
                <div className="role-name-line">
                  <strong>{r.name}</strong>
                  {r.canRename && (
                    <button className="rename-role" onClick={() => beginRename(r)}>
                      重命名
                    </button>
                  )}
                </div>
              )}
              {editingRoleId === r.id && roleError && (
                <div className="role-error" role="alert">
                  {roleError}
                </div>
              )}
              <p>{r.description || "未填写说明"}</p>
            </div>
            <span className="badge">{r._count.users} 人</span>
          </div>
        ))}
      </section>
      {canManageAllSurveys && (
        <section className="card admin-surveys">
          <div className="panel-pad admin-survey-head">
            <div>
              <h2>全部问卷</h2>
              <p className="muted">超级管理员可以检查并删除任意用户创建的问卷。</p>
            </div>
            <span className="badge">{surveys.length} 份</span>
          </div>
          <div className="admin-survey-list">
            {surveys.length === 0 ? (
              <div className="empty">当前没有问卷</div>
            ) : (
              surveys.map((survey) => (
                <div className="admin-survey-row" key={survey.id}>
                  <div className="survey-title">
                    <strong>{survey.title}</strong>
                    <span>/q/{survey.slug}</span>
                  </div>
                  <div>
                    <strong>{survey.owner.username}</strong>
                    <span className="row-hint">创建者</span>
                  </div>
                  <div className="muted">
                    {survey._count.questions} 题 · {survey._count.responses} 份答卷
                  </div>
                  <span className={`badge ${survey.status.toLowerCase()}`}>{survey.status}</span>
                  <button className="btn btn-danger" onClick={() => setDeletingSurvey(survey)}>
                    删除
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      )}
      <ConfirmDialog
        open={Boolean(deletingSurvey)}
        title="删除用户问卷？"
        description={
          deletingSurvey
            ? `将永久删除 ${deletingSurvey.owner.username} 的“${deletingSurvey.title}”及全部答卷。`
            : ""
        }
        loading={busy}
        onCancel={() => setDeletingSurvey(null)}
        onConfirm={deleteSurvey}
      />
    </div>
  );
}
