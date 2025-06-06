import { NextResponse } from "next/server"

import { searchResumes } from "@/data/resumes"

import { createClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || ""
  const sort = searchParams.get("sort") || "created_at"
  const asc = searchParams.get("asc") === "true"
  const limit = Number(searchParams.get("limit")) || 20

  try {
    const results = await searchResumes(user.id, q, { sort, asc, limit })
    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to search resumes",
      },
      { status: 500 }
    )
  }
}
