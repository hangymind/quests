"use client";
import { useEffect, useState } from "react";
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
export function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]),
    [roles, setRoles] = useState<Role[]>([]),
    [editingRoleId, setEditingRoleId] = useState<string | null>(null),
    [roleName, setRoleName] = useState(""),
    [roleError, setRoleError] = useState("");
  async function load() {
    setUsers(await (await fetch("/api/admin/users")).json());
    setRoles(await (await fetch("/api/admin/role-groups")).json());
  }
  useEffect(() => {
    load();
  }, []);
  async function toggle(u: User) {
    const r = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: u.id, isActive: !u.isActive }),
    });
    if (!r.ok) alert((await r.json()).error);
    load();
  }

  function beginRename(role: Role) {
    setEditingRoleId(role.id);
    setRoleName(role.name);
    setRoleError("");
  }

  async function renameRole(role: Role) {
    const name = roleName.trim();
    if (!name) return setRoleError("身份组名称不能为空");

    const response = await fetch("/api/admin/role-groups", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: role.id, name }),
    });
    const result = await response.json();
    if (!response.ok) return setRoleError(result.error || "重命名失败");

    setEditingRoleId(null);
    setRoleError("");
    await load();
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
                  <button className="btn" onClick={() => toggle(u)}>
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
                  <button className="btn btn-primary" onClick={() => renameRole(r)}>
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
    </div>
  );
}
