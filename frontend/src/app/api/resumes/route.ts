import { NextResponse } from "next/server"

import { getResumes } from "@/data/resumes"

import { createClient } from "@/lib/supabase/server"

export async function GET() {
  // Step 1: Create Supabase client from server context
  const supabase = createClient()

  // Step 2: Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Step 3: Handle unauthenticated users
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Step 4: Fetch resumes for this user
  try {
    const resumes = await getResumes(user.id)
    return NextResponse.json(resumes)
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch resumes",
      },
      { status: 500 }
    )
  }
}
