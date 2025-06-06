"use server"

import { ResumeError } from "@/lib/errors/resumeError"
import { createClient } from "@/lib/supabase/server"

interface SignedUrlResponse {
  signedUrl: string
  expiresAt: Date
  fileType: "pdf" | "docx"
}

/**
 * Generate a signed download URL for a resume stored in Supabase Storage.
 *
 * @param pathOrId - Either a full path (userId/filename) or just the resume ID
 * @param fileType - Type of file to download ("pdf" or "docx")
 * @returns Promise resolving to a signed URL (valid for 60 seconds) and its expiration time
 * @throws {ResumeError} When the download URL cannot be generated or the file doesn't exist
 */
export async function downloadResume(
  pathOrId: string,
  fileType: "pdf" | "docx" = "pdf"
): Promise<SignedUrlResponse> {
  try {
    // Input validation
    if (!pathOrId) {
      throw new ResumeError("No path or ID provided for resume download")
    }

    const supabase = createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new ResumeError("Failed to fetch user", authError as Error  )
    }

    let finalPath: string

    // Check if input is already a full path or just an ID
    if (pathOrId.includes("/")) {
      // It's a full path, validate it
      if (!pathOrId.match(/^[\w-]+\/[\w.-]+$/)) {
        throw new ResumeError(
          "Invalid file path format. Expected format: 'userId/filename'"
        )
      }
      finalPath = `${pathOrId}.${fileType}`
    } else {
      // It's just an ID, construct the path
      // First, verify the resume exists and belongs to the user
      const { data: resume, error: resumeError } = await supabase
        .from("resumes")
        .select("id")
        .eq("id", pathOrId)
        .eq("user_id", user.id)
        .single()

      if (resumeError || !resume) {
        throw new ResumeError("Resume not found or access denied")
      }

      finalPath = `${user.id}/${pathOrId}.${fileType}`
    }

    // Generate signed URL
    const { data, error } = await supabase.storage
      .from("resumes")
      .createSignedUrl(finalPath, 60) // 60 seconds expiry

    if (error) {
      // Check if the error is due to file not found
      if (error.message?.toLowerCase().includes("not found")) {
        throw new ResumeError(`File not found: ${finalPath}`)
      }
      throw new ResumeError("Failed to generate download link", error)
    }

    if (!data?.signedUrl) {
      throw new ResumeError("No signed URL generated")
    }

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + 60 * 1000) // 60 seconds from now

    return {
      signedUrl: data.signedUrl,
      expiresAt,
      fileType,
    }
  } catch (error) {
    throw error instanceof ResumeError
      ? error
      : new ResumeError(
          "Unexpected error while generating download URL",
          error as Error
        )
  }
}
