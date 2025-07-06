import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { clashId: string } }
) {
  const { clashId } = params;
  if (!clashId) {
    return NextResponse.json({ error: "Clash ID is required" }, { status: 400 });
  }

  // Fetch the clash to get the number of options
  const { data: clashData, error: clashError } = await supabase
    .from("clashes")
    .select("options")
    .eq("id", clashId)
    .single();

  if (clashError || !clashData) {
    return NextResponse.json({ error: clashError?.message || "Clash not found" }, { status: 404 });
  }

  const numOptions = Array.isArray(clashData.options) ? clashData.options.length : 2;

  // Get total views, unique views, and referrers
  const { data: viewsData, error: viewsError } = await supabase
    .from("track_clash_views")
    .select("device_fingerprint, referrer")
    .eq("clash_id", clashId);

  if (viewsError) {
    return NextResponse.json({ error: viewsError.message }, { status: 500 });
  }

  const totalViews = viewsData.length;
  const uniqueViews = new Set(viewsData.map((v: any) => v.device_fingerprint)).size;

  // Top referrers
  const referrerCount: Record<string, number> = {};
  viewsData.forEach((v: any) => {
    const ref = v.referrer || "(direct)";
    referrerCount[ref] = (referrerCount[ref] || 0) + 1;
  });
  const topReferrers = Object.entries(referrerCount)
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Get total votes and vote counts per option (0-based)
  const { data: votesData, error: votesError } = await supabase
    .from("votes")
    .select("option_index, created_at")
    .eq("clash_id", clashId);

  if (votesError) {
    return NextResponse.json({ error: votesError.message }, { status: 500 });
  }

  // Dynamically create optionCounts
  const optionCounts: Record<string, number> = {};
  for (let i = 0; i < numOptions; i++) {
    optionCounts[i] = 0;
  }
  votesData.forEach((vote: any) => {
    const idx = String(vote.option_index);
    if (optionCounts[idx] !== undefined) {
      optionCounts[idx]++;
    }
  });

  // Option percentages
  const totalVotes = votesData.length;
  const optionPercentages: Record<string, number> = {};
  if (totalVotes > 0) {
    Object.entries(optionCounts).forEach(([option, count]) => {
      if (count > 0) {
        optionPercentages[option] = Math.round((count / totalVotes) * 100);
      }
    });
  }

  // Determine winning option(s)
  const maxVotes = Math.max(...Object.values(optionCounts));
  const winningOption = Object.entries(optionCounts)
    .filter(([_, count]) => count === maxVotes && maxVotes > 0)
    .map(([option]) => Number(option));

  // Time series for votes (group by hour only)
  const votesTimeSeriesMap: Record<string, number> = {};
  votesData.forEach((vote: any) => {
    const date = new Date(vote.created_at);
    const hour = date.toISOString().slice(0, 13); // YYYY-MM-DDTHH
    const datetime = hour.replace("T", " ") + ":00"; // YYYY-MM-DD HH:00
    votesTimeSeriesMap[datetime] = (votesTimeSeriesMap[datetime] || 0) + 1;
  });
  const votesTimeSeries: { datetime: string; votes: number }[] = Object.entries(votesTimeSeriesMap)
    .map(([datetime, votes]) => ({ datetime, votes }))
    .sort((a, b) => a.datetime.localeCompare(b.datetime));

  return NextResponse.json({
    clashId,
    totalViews,
    uniqueViews,
    totalVotes,
    optionCounts,
    optionPercentages,
    winningOption: winningOption.length === 1 ? winningOption[0] : winningOption,
    votesTimeSeries,
    topReferrers,
  });
}
