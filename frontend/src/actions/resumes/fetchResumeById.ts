"use server"

import type { Resume } from "@/types/resume"

import { ResumeError } from "@/lib/errors/resumeError"
import { createClient } from "@/lib/supabase/server"

/**
 * Fetches a single resume by its ID
 * @param id - The unique identifier of the resume
 * @returns Promise resolving to the resume data
 * @throws {ResumeError} When the resume cannot be fetched or doesn't exist
 */
export async function fetchResumeById(id: string): Promise<Resume> {
  try {
    if (!id) {
      throw new ResumeError("No resume ID provided")
    }

    const supabase = createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new ResumeError("Failed to fetch user", authError)
    }

    const { data, error: resumeError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (resumeError) {
      console.error("Database error fetching resume:", resumeError)
      throw new ResumeError("Failed to fetch resume", resumeError)
    }

    if (!data) {
      throw new ResumeError(`Resume with ID ${id} not found`)
    }

    // Type guard to ensure data matches Resume interface
    if (!isValidResume(data)) {
      throw new ResumeError("Invalid resume data structure")
    }

    return data
  } catch (error) {
    // Handle any unexpected errors
    console.error("Error in fetchResumeById:", error)
    throw error instanceof ResumeError
      ? error
      : new ResumeError(
          "Unexpected error while fetching resume",
          error as Error
        )
  }
}

/**
 * Type guard to validate the resume data structure
 */
function isValidResume(data: any): data is Resume {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof data.id === "string" &&
    typeof data.title === "string" &&
    typeof data.created_at === "string" &&
    typeof data.updated_at === "string" &&
    typeof data.status === "string" &&
    typeof data.user_id === "string" &&
    typeof data.content === "object"
  )
}
