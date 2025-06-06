import type { Resume } from "@/types/resume"

import { createClient } from "@/lib/supabase/client"

interface UpdateResumeResult {
  data: Resume | null
  error: Error | null
}

export async function updateResume(
  resume: Partial<Resume> & { id: string }
): Promise<UpdateResumeResult> {
  const supabase = createClient()

  try {
    // Input validation
    if (!resume.id?.trim()) {
      return {
        data: null,
        error: new Error("Resume ID is required"),
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
      .select()
      .single()

    // Handle database error
    if (dbError) {
      console.error("Database error:", dbError)
      return {
        data: null,
        error: new Error("Failed to update resume"),
      }
    }

    // Validate response
    if (!updatedResume) {
      return {
        data: null,
        error: new Error("No resume found with the provided ID"),
      }
    }

    return {
      data: updatedResume,
      error: null,
    }
  } catch (err) {
    // Log unexpected errors
    console.error("Unexpected error in updateResume:", err)
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Failed to update resume"),
    }
  }
}
