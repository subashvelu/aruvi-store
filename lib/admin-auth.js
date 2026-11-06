import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_COOKIE = "aruvi-admin-session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

// Admin is disabled (fails closed) unless BOTH variables are set.
// There is deliberately no default password.
export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_ACCESS_KEY && process.env.ADMIN_SESSION_SECRET);
}

function sign(payload) {
  return crypto.createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(payload).digest("base64url");
}

// Constant-time comparison (hashing first makes the lengths equal).
export function keysMatch(input, expected) {
  const a = crypto.createHash("sha256").update(String(input)).digest();
  const b = crypto.createHash("sha256").update(String(expected)).digest();
  return crypto.timingSafeEqual(a, b);
}

// The cookie holds a signed, expiring token, never the password itself.
export function createSessionToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_TTL_SECONDS * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token) {
  if (!isAdminConfigured() || typeof token !== "string") return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

export async function isAdminSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

// Use at the top of an API route handler:
//   const denied = await requireAdmin(); if (denied) return denied;
export async function requireAdmin() {
  if (await isAdminSession()) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
