"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
  isAdminConfigured,
  keysMatch,
} from "../../lib/admin-auth";

export async function authenticateAdmin(previousState, formData) {
  if (!isAdminConfigured()) {
    return { error: "Admin access is not configured on the server." };
  }

  const accessKey = formData.get("accessKey");

  if (typeof accessKey !== "string" || !keysMatch(accessKey.trim(), process.env.ADMIN_ACCESS_KEY)) {
    // Small delay slows down brute-force guessing.
    await new Promise((resolve) => setTimeout(resolve, 750));
    return { error: "The admin access key is incorrect." };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  redirect("/admin");
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  redirect("/");
}
