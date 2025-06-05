"use server"

import { createClient } from "@/lib/supabase/server"

interface DeleteResumeResponse {
  success: boolean
  error?: string
}

/**
 * Deletes a resume from both the database and Supabase storage.
 * Only allows deletion if the resume belongs to the authenticated user.
 * If the file doesn't exist in storage, only the database entry will be deleted.
 */
export async function deleteResume(id: string): Promise<DeleteResumeResponse> {
  console.log("[deleteResume] Starting deletion process", { resumeId: id })

  if (!id) {
    console.error("[deleteResume] Invalid parameters:", { id })
    return { success: false, error: "Missing resume ID" }
  }

  try {
    const supabase = createClient()
    console.log("[deleteResume] Supabase client created")

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("[deleteResume] Authentication failed:", {
        error: authError,
        userId: user?.id,
      })
      return { success: false, error: "Authentication failed" }
    }

    console.log("[deleteResume] User authenticated", { userId: user.id })

    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("file_path")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (resumeError) {
      if (resumeError.code === "PGRST116") {
        console.error("[deleteResume] Resume not found or unauthorized:", {
          resumeId: id,
          userId: user.id,
        })
        return { success: false, error: "Resume not found or unauthorized" }
      }

      console.error("[deleteResume] Failed to fetch resume:", {
        error: resumeError,
        resumeId: id,
        userId: user.id,
      })
      return { success: false, error: "Failed to fetch resume" }
    }

    // If there's a file path, try to delete the file
    if (resume.file_path) {
      console.log("[deleteResume] Attempting storage deletion", {
        filePath: resume.file_path,
      })

      const { error: storageError } = await supabase.storage
        .from("resumes")
        .remove([resume.file_path])

      if (storageError) {
        // Log the error but continue with database deletion
        console.warn("[deleteResume] Storage deletion failed (continuing):", {
          error: storageError,
          filePath: resume.file_path,
          resumeId: id,
        })
      } else {
        console.log("[deleteResume] Storage deletion successful")
      }
    }

    // Delete from database
    console.log("[deleteResume] Deleting database record")
    const { error: dbError } = await supabase
      .from("resumes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (dbError) {
      console.error("[deleteResume] Database deletion failed:", {
        error: dbError,
        resumeId: id,
        userId: user.id,
      })
      return { success: false, error: "Failed to delete resume from database" }
    }

    console.log("[deleteResume] Deletion completed successfully", {
      resumeId: id,
      userId: user.id,
    })
    return { success: true }
  } catch (err) {
    console.error("[deleteResume] Unexpected deletion error:", {
      error: err,
      resumeId: id,
    })
    return { success: false, error: "Unexpected error during deletion" }
  }
}
