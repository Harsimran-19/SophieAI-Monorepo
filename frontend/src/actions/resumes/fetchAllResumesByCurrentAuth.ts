"use server"

import type { Resume } from "@/types/resume"

import { createClient } from "@/lib/supabase/server"

class ResumeError extends Error {
  constructor(
    message: string,
    public cause?: Error
  ) {
    super(message)
    this.name = "ResumeError"
  }
}

/**
 * Fetches all resumes for a specific user from the database
 * @returns Promise resolving to an array of resumes
 * @throws {ResumeError} When the resumes cannot be fetched or user is invalid
 */
export async function fetchAllResumesByCurrentAuth(): Promise<Resume[]> {
  try {
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
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (resumeError) {
      console.error("Database error fetching resumes:", resumeError)
      throw new ResumeError("Failed to fetch resumes", resumeError)
    }

    if (!data) {
      return [] // Return empty array if no resumes found
    }

    if (!Array.isArray(data)) {
      console.error("Invalid data structure received:", data)
      throw new ResumeError("Invalid resumes data structure")
    }

    // Filter out invalid resume entries and log them
    const validResumes = data.filter((item): item is Resume => {
      const isValid = isValidResume(item)
      if (!isValid) {
        console.warn("Invalid resume data found:", item)
      }

      return isValid
    })

    return validResumes
  } catch (error) {
    console.error("Error in fetchAllResumes:", error)
    throw error instanceof ResumeError
      ? error
      : new ResumeError(
          "Unexpected error while fetching resumes",
          error as Error
        )
  }
}

/**
 * Type guard to validate the resume data structure
 * @param data - The data to validate
 * @returns boolean indicating if the data is a valid Resume
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
