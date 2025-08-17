import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

interface ViewData {
  device_fingerprint: string;
  referrer: string;
}

interface VoteData {
  option_index: number;
  created_at: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clashId: string }> }
) {
  const { clashId } = await params;
  if (!clashId) {
    return NextResponse.json({ error: "Clash ID is required" }, { status: 400 });
  }

  // Get total views, unique views, and referrers
  const { data: viewsData, error: viewsError } = await supabase
    .from("track_clash_views")
    .select("device_fingerprint, referrer")
    .eq("clash_id", clashId);

  if (viewsError) {
    return NextResponse.json({ error: viewsError.message }, { status: 500 });
  }

  const totalViews = viewsData.length;
  const uniqueViews = new Set(viewsData.map((v: ViewData) => v.device_fingerprint)).size;

  // Top referrers
  const referrerCount: Record<string, number> = {};
  viewsData.forEach((v: ViewData) => {
    const ref = v.referrer || "(direct)";
    referrerCount[ref] = (referrerCount[ref] || 0) + 1;
  });
  const topReferrers = Object.entries(referrerCount)
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Get total votes and vote counts per option
  const { data: votesData, error: votesError } = await supabase
    .from("votes")
    .select("option_index, created_at")
    .eq("clash_id", clashId);

  if (votesError) {
    return NextResponse.json({ error: votesError.message }, { status: 500 });
  }

  const totalVotes = votesData.length;
  const optionCounts: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0 };
  votesData.forEach((vote: VoteData) => {
    const idx = vote.option_index;
    if (optionCounts[idx]) {
      optionCounts[idx]++;
    } else if ([1,2,3,4].includes(idx)) {
      optionCounts[idx] = 1;
    }
  });

  // Option percentages
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
    .filter(([, count]) => count === maxVotes && maxVotes > 0)
    .map(([option]) => Number(option));

  // Time series for votes (votes per day)
  const votesTimeSeriesMap: Record<string, number> = {};
  votesData.forEach((vote: VoteData) => {
    const date = new Date(vote.created_at).toISOString().slice(0, 10); // YYYY-MM-DD
    votesTimeSeriesMap[date] = (votesTimeSeriesMap[date] || 0) + 1;
  });
  const votesTimeSeries = Object.entries(votesTimeSeriesMap)
    .map(([date, votes]) => ({ date, votes }))
    .sort((a, b) => a.date.localeCompare(b.date));

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