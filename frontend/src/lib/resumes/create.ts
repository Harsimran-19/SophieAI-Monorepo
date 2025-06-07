import type { ResumeData } from "@/types/resume-content"

import { createClient } from "@/lib/supabase/client"

const DEFAULT_RESUME_CONTENT: ResumeData = {
  personalInfo: {
    name: "",
    email: "",
    phone: "",
    location: "",
    website: "",
  },
  objective: "",
  experience: [],
  education: [],
  projects: [],
  skills: "",
}

interface CreateResumeResult {
  data: {
    id: string
    content: ResumeData
    created_at: string
    updated_at: string
  } | null
  error: Error | null
}

export async function createResume(
  userId: string
): Promise<CreateResumeResult> {
  const supabase = createClient()

  try {
    // Input validation
    if (!userId?.trim()) {
      return {
        data: null,
        error: new Error("User ID is required"),
      }
    }

    // Create resume with default content
    const { data: resume, error: dbError } = await supabase
      .from("resumes")
      .insert({
        user_id: userId,
        title: "Untitled Resume",
        content: DEFAULT_RESUME_CONTENT,
        status: "Draft",
      })
      .select("id, content, created_at, updated_at")
      .single()

    // Handle database error
    if (dbError) {
      console.error("Database error:", dbError)
      return {
        data: null,
        error: new Error("Failed to create resume"),
      }
    }

    return {
      data: resume,
      error: null,
    }
  } catch (err) {
    // Log unexpected errors
    console.error("Unexpected error in createResume:", err)
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Failed to create resume"),
    }
  }
}
