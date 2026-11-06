import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabase-server";
import { requireAdmin } from "../../../lib/admin-auth";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const result = await supabaseAdmin.from("users").select("*").order("created_at", { ascending: false });

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ users: result.data || [] });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to load users." }, { status: 500 });
  }
}
