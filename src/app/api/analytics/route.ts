import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = (session?.user as any)?.userId;
  if (!userId) {
    return NextResponse.json({ error: "User ID not found in session" }, { status: 401 });
  }

  // Get all clashes by user
  const { data: clashes, error: clashesError } = await supabase
    .from("clashes")
    .select("id, title")
    .eq("user_id", userId);

  if (clashesError) {
    return NextResponse.json({ error: clashesError.message }, { status: 500 });
  }

  const clashIds = clashes.map((c: any) => c.id);
  if (clashIds.length === 0) {
    return NextResponse.json({
      totalClashesCreated: 0,
      totalVotes: 0,
      totalViews: 0,
      topClash: null,
    });
  }

  // Get total votes per clash
  const { data: votesData, error: votesError } = await supabase
    .from("votes")
    .select("clash_id")
    .in("clash_id", clashIds);

  if (votesError) {
    return NextResponse.json({ error: votesError.message }, { status: 500 });
  }

  // Get total views per clash
  const { data: viewsData, error: viewsError } = await supabase
    .from("track_clash_views")
    .select("clash_id")
    .in("clash_id", clashIds);

  if (viewsError) {
    return NextResponse.json({ error: viewsError.message }, { status: 500 });
  }

  // Aggregate votes and views per clash
  const votesCountByClash: Record<string, number> = {};
  votesData.forEach((v: any) => {
    votesCountByClash[v.clash_id] = (votesCountByClash[v.clash_id] || 0) + 1;
  });

  const viewsCountByClash: Record<string, number> = {};
  viewsData.forEach((v: any) => {
    viewsCountByClash[v.clash_id] = (viewsCountByClash[v.clash_id] || 0) + 1;
  });

  // Find top clash by votes
  let topClashId: string | null = null;
  let maxVotes = 0;
  for (const id of clashIds) {
    if ((votesCountByClash[id] || 0) > maxVotes) {
      maxVotes = votesCountByClash[id];
      topClashId = id;
    }
  }
  const topClash = topClashId
    ? {
        id: topClashId,
        title: clashes.find((c: any) => c.id === topClashId)?.title,
        votes: votesCountByClash[topClashId] || 0,
        views: viewsCountByClash[topClashId] || 0,
      }
    : null;

  return NextResponse.json({
    totalClashesCreated: clashIds.length,
    totalVotes: votesData.length,
    totalViews: viewsData.length,
    topClash,
  });
} 