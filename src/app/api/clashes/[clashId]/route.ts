import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// get clash
export async function GET(
  request: NextRequest,
  { params }: { params: { clashId: string } }
) {
  try {
    if (!params.clashId) {
      return NextResponse.json(
        { error: "Clash ID is required" },
        { status: 400 }
      );
    }
    const { clashId } = await params;

    const session = await auth();
    const { data, error } = await supabase
      .from("clashes")
      .select("*")
      .eq("id", clashId)
      .eq("user_id", session?.user?.id);
    if (error) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// update clash

export async function PUT(
  request: NextRequest,
  { params }: { params: { clashId: string } }
) {
  try {
    if (!params.clashId) {
      return NextResponse.json(
        { error: "Clash ID is required" },
        { status: 400 }
      );
    }
    const { clashId } = await params;
    const session = await auth();
    const body = await request.json();
    const { data, error } = await supabase
      .from("clashes")
      .update(body)
      .eq("id", clashId)
      .eq("user_id", session?.user?.id);

    if (error) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { clashId: string } }
) {
  try {
    if (!params.clashId) {
      return NextResponse.json(
        { error: "Clash ID is required" },
        { status: 400 }
      );
    }
    const { clashId } = await params;
    const session = await auth();
    const { data, error } = await supabase
      .from("clashes")
      .delete()
      .eq("id", clashId)
      .eq("user_id", session?.user?.id);
    if (error) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
