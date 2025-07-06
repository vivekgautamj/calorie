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
    const { clashId } = params;
    const session = await auth();
    const userId = (session?.user as any)?.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 401 }
      );
    }
    const { data, error } = await supabase
      .from("clashes")
      .select("*")
      .eq("id", clashId)
      .eq("user_id", userId)
      .single();
    if (error) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
    if (!data) {
      return NextResponse.json(
        { error: "Clash not found or not authorized" },
        { status: 404 }
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
    const { clashId } = params;
    const session = await auth();
    const userId = (session?.user as any)?.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 401 }
      );
    }
    const body = await request.json();
    const { data, error } = await supabase
      .from("clashes")
      .update(body)
      .eq("id", clashId)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
    if (!data) {
      return NextResponse.json(
        { error: "Clash not found or not authorized" },
        { status: 404 }
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
    const { clashId } = params;
    const session = await auth();
    const userId = (session?.user as any)?.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 401 }
      );
    }
    const { data, error } = await supabase
      .from("clashes")
      .delete()
      .eq("id", clashId)
      .eq("user_id", userId)
      .select();
    if (error) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Clash not found or not authorized" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Clash deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
