import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { clash_id, device_fingerprint, user_agent, referrer } = await req.json();

  const { error } = await supabase
    .from("track_clash_views")
    .insert({
      clash_id,
      device_fingerprint,
      user_agent,
      referrer: referrer,
      
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
} 