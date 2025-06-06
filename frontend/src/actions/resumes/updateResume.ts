"use server"

import type { Resume } from "@/types/resume"

import { createClient } from "@/lib/supabase/server"

interface UpdateResumeResult {
  data: Resume | null
  error: {
    message: string
    code?: string
  } | null
}

export async function updateResume(
  resume: Partial<Resume>
): Promise<UpdateResumeResult> {
  const supabase = createClient()

  try {
    // Input validation
    if (!resume.id?.trim()) {
      return {
        data: null,
        error: {
          message: "Resume ID is required",
          code: "MISSING_ID",
        },
      }
    }

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        data: null,
        error: {
          message: "Authentication failed. Please log in.",
          code: "AUTH_ERROR",
        },
      }
    }

    // Prepare update data with timestamp
    const updateData = {
      ...resume,
      updated_at: new Date().toISOString(),
    }

    // Update resume
    const { data: updatedResume, error: dbError } = await supabase
      .from("resumes")
      .update(updateData)
      .eq("id", resume.id)
      .eq("user_id", user.id)
      .select()
      .single()

    // Handle database error
    if (dbError) {
      return {
        data: null,
        error: {
          message: "Failed to update resume",
          code: "DB_ERROR",
        },
      }
    }

    // Validate response
    if (!updatedResume) {
      return {
        data: null,
        error: {
          message: "No resume found with the provided ID",
          code: "NOT_FOUND",
        },
      }
    }

    return {
      data: updatedResume,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: {
        message: err instanceof Error ? err.message : "Failed to update resume",
        code: "UNKNOWN_ERROR",
      },
    }
  }
}
