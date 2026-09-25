export const DEFAULT_PERMISSIONS = [
  { key: "survey:create", description: "创建问卷" },
  { key: "survey:edit", description: "编辑问卷" },
  { key: "survey:publish", description: "发布问卷" },
  { key: "survey:analytics", description: "查看统计" },
  { key: "survey:export", description: "导出数据" },
  { key: "admin:users", description: "管理用户" },
  { key: "admin:roles", description: "管理身份组" },
] as const;

export const SUPER_ADMIN_PERMISSIONS = DEFAULT_PERMISSIONS.map(({ key }) => key);
