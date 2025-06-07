"use server"

import type { ResumeData } from "@/types/resume-content"

import { createClient } from "@/lib/supabase/server"

export const DEFAULT_RESUME_CONTENT: ResumeData = {
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
  error: string | null
}

/**
 * Securely creates a new resume for the currently authenticated user
 */
export async function createResume(): Promise<CreateResumeResult> {
  const supabase = createClient()

  // Get the authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      data: null,
      error: "Authentication failed. Please log in.",
    }
  }

  try {
    const { data, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: "Untitled Resume",
        content: DEFAULT_RESUME_CONTENT,
        status: "Draft",
      })
      .select("id, content, created_at, updated_at")
      .single()

    if (error) {
      console.error("Database error:", error)
      return { data: null, error: "Failed to create resume" }
    }

    return { data, error: null }
  } catch (err) {
    console.error("Unexpected error in createResume:", err)
    return {
      data: null,
      error: "Unexpected error while creating resume",
    }
  }
}
