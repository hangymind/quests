import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const COOKIE = "quest_session";
const secret = () => process.env.SESSION_SECRET || "dev-only-change-this-secret";

function sign(value: string) {
  return crypto.createHmac("sha256", secret()).update(value).digest("base64url");
}

function isSecureRequest(request: Request) {
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0].trim();
  return forwardedProto ? forwardedProto === "https" : new URL(request.url).protocol === "https:";
}

export async function createSession(userId: string, request: Request) {
  const expires = Date.now() + 1000 * 60 * 60 * 24 * 14;
  const payload = Buffer.from(JSON.stringify({ userId, expires })).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(request),
    path: "/",
    expires,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getSessionUser() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  try {
    const [payload, signature] = raw.split(".");
    if (!payload || !signature) return null;
    const actualSignature = Buffer.from(signature);
    const expectedSignature = Buffer.from(sign(payload));
    if (
      actualSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(actualSignature, expectedSignature)
    )
      return null;

    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      userId: string;
      expires: number;
    };
    if (data.expires < Date.now()) return null;
    return prisma.user.findFirst({
      where: { id: data.userId, isActive: true },
      select: {
        id: true,
        username: true,
        isSuperAdmin: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                permissions: { select: { permission: { select: { key: true } } } },
              },
            },
          },
        },
      },
    });
  } catch {
    return null;
  }
}

export function hasPermission(
  user: NonNullable<Awaited<ReturnType<typeof getSessionUser>>>,
  permission: string,
) {
  return (
    user.isSuperAdmin ||
    user.roles.some(({ role }) =>
      role.permissions.some((item) => item.permission.key === permission),
    )
  );
}

export function isSuperAdmin(user: NonNullable<Awaited<ReturnType<typeof getSessionUser>>>) {
  return user.isSuperAdmin;
}
