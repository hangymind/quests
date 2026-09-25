import { redirect } from "next/navigation";
import { getSessionUser, hasPermission, isSuperAdmin } from "@/lib/auth";
import { AdminPanel } from "@/components/AdminPanel";
import "../extras.css";
export default async function Admin() {
  const user = (await getSessionUser())!;
  if (!hasPermission(user, "admin:users")) redirect("/dashboard");
  return (
    <div className="content">
      <div className="page-head">
        <div>
          <span className="eyebrow">Administration</span>
          <h1>用户与权限</h1>
          <p>控制谁可以创建、发布、查看和导出数据。</p>
        </div>
      </div>
      <AdminPanel canManageAllSurveys={isSuperAdmin(user)} />
    </div>
  );
}
