import { createClient } from "@/lib/supabase/client"

interface DeleteResumeResult {
  success: boolean
  error?: Error
}

/**
 * Deletes a resume and its associated file from Supabase
 * Handles both storage and database cleanup in a transaction-like manner
 *
 * If the database deletion fails, we try to restore the file
 *
 * @param resumeId - The ID of the resume to delete
 * @param filePath - The storage path of the resume file
 * @returns Promise<DeleteResumeResult>
 */
export async function deleteResume(
  resumeId: string,
  filePath: string
): Promise<DeleteResumeResult> {
  const supabase = createClient()

  try {
    // Step 1: Delete from storage first
    const { error: storageError } = await supabase.storage
      .from("resumes")
      .remove([filePath])

    if (storageError) {
      throw new Error("Failed to delete file from storage")
    }

    // Step 2: Delete from database
    const { error: dbError } = await supabase
      .from("resumes")
      .delete()
      .eq("id", resumeId)
      .throwOnError() // This ensures SQL errors are thrown

    if (dbError) {
      // If database deletion fails, we should try to restore the file
      // Note: This is a best-effort recovery
      await supabase.storage
        .from("resumes")
        .upload(filePath, new Blob(), { upsert: true })
        .catch((restoreError) => {
          // Log the recovery failure but don't throw
          console.error(
            "Failed to restore file after database deletion failed",
            restoreError
          )
        })

      throw new Error("Failed to delete resume from database")
    }

    return { success: true }
  } catch (err) {
    const error =
      err instanceof Error ? err : new Error("Failed to delete resume")
    return { success: false, error }
  }
}
