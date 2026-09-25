import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const COOKIE = "quest_session";
const secret = () => process.env.SESSION_SECRET || "dev-only-change-this-secret";

function sign(value: string) {
  return crypto.createHmac("sha256", secret()).update(value).digest("base64url");
}

export async function createSession(userId: string) {
  const expires = Date.now() + 1000 * 60 * 60 * 24 * 14;
  const payload = Buffer.from(JSON.stringify({ userId, expires })).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getSessionUser() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, signature] = raw.split(".");
  if (!payload || !signature || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(sign(payload)))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { userId: string; expires: number };
    if (data.expires < Date.now()) return null;
    return prisma.user.findFirst({ where: { id: data.userId, isActive: true }, include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } } });
  } catch { return null; }
}

export function hasPermission(user: NonNullable<Awaited<ReturnType<typeof getSessionUser>>>, permission: string) {
  return user.roles.some(({ role }) => role.name === "超级管理员" || role.permissions.some((item) => item.permission.key === permission));
}
