import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// get the clash data by slug
export async function GET(req: NextRequest, { params }: { params: { slug: string } }    ) {
  const { slug } = await params;

  const { data, error } = await supabase
    .from("clashes")
    .select("*")
    .eq("slug", slug);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0]);
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }    ) {
  // any user can vote
  // user can only add choose 1 option not both
  // user can only vote once
  // user can only vote if the clash is active
  // user can only vote if the clash is not expired
  // user can only vote if the clash is not deleted

  // get the slug from the url
  const { slug } = await params;
  console.log(slug);


  const { option, clash_id, device_fingerprint, user_agent } = await req.json();

  const { data, error } = await supabase.from("votes").insert({
    option_index: option,
    clash_id: clash_id,
    device_fingerprint: device_fingerprint,
    user_agent: user_agent,
  });

  // duplucate device_fingerprint in error , handle it saying , you have already voted
  if (error && error.code === "23505") {
    return NextResponse.json(
      { error: "You have already voted" },
      { status: 400 }
    );
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Vote received" });
}
