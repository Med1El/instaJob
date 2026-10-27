import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
export async function PATCH(request: NextRequest) {
  // Verify the caller is an admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json() as { userId: string; status: string };

  if (!body.userId || !["active", "inactive", "pending"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Use service client to bypass RLS for the update
  const service = await createServiceClient();
  const { error } = await service
    .from("users")
    .update({ status: body.status })
    .eq("id", body.userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
