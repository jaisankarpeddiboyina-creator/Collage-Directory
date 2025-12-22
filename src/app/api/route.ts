import { NextResponse } from "next/server";
import { getColleges } from "@/lib/supabase";

export async function GET() {
  try {
    const colleges = await getColleges();

    return NextResponse.json({
      success: true,
      data: colleges,
      count: colleges.length,
    });
  } catch (error) {
    console.error("API error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch colleges" },
      { status: 500 }
    );
  }
}
